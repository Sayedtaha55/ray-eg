import { Controller, Get, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { RedisService } from '@common/redis/redis.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@Controller()
export class HealthController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  @Get()
  async root() {
    return { status: 'ok' };
  }

  @Get('health')
  async getHealth() {
    const env = String(process.env.NODE_ENV || 'development').toLowerCase();
    const timestamp = new Date().toISOString();

    let dbOk = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }

    const status = dbOk ? 'ok' : 'unhealthy';

    if (env === 'production') {
      return { status, timestamp, db: dbOk ? 'ok' : 'down' };
    }

    return {
      status,
      timestamp,
      db: dbOk ? 'ok' : 'down',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('health/live')
  async live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('health/ready')
  async ready() {
    const timestamp = new Date().toISOString();

    const dbOk = await (async () => {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        return true;
      } catch {
        return false;
      }
    })();

    const redisOk = await (async () => {
      try {
        return await this.redis.ping();
      } catch {
        return false;
      }
    })();

    // Check Elasticsearch
    const elasticsearchOk = await (async () => {
      try {
        const esUrl = process.env.ELASTICSEARCH_URL;
        if (!esUrl) return 'disabled';
        const response = await fetch(`${esUrl}/_cluster/health`);
        return response.ok;
      } catch {
        return false;
      }
    })();

    const ready = dbOk && (redisOk || this.redis.getClient() === null) && (elasticsearchOk === true || elasticsearchOk === 'disabled');

    return {
      status: ready ? 'ok' : 'unhealthy',
      timestamp,
      checks: {
        db: dbOk ? 'ok' : 'down',
        redis: redisOk ? 'ok' : (this.redis.getClient() === null ? 'disabled' : 'down'),
        elasticsearch: elasticsearchOk === true ? 'ok' : (elasticsearchOk === 'disabled' ? 'disabled' : 'down'),
      },
    };
  }

  @Get('health/detailed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async detailed() {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();

    const dbOk = await (async () => {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        return true;
      } catch {
        return false;
      }
    })();

    const redisOk = await (async () => {
      try {
        return await this.redis.ping();
      } catch {
        return false;
      }
    })();

    const elasticsearchOk = await (async () => {
      try {
        const esUrl = process.env.ELASTICSEARCH_URL;
        if (!esUrl) return 'disabled';
        const response = await fetch(`${esUrl}/_cluster/health`);
        if (response.ok) {
          const data = await response.json();
          return { status: 'ok', cluster_name: data.cluster_name, number_of_nodes: data.number_of_nodes };
        }
        return false;
      } catch {
        return false;
      }
    })();

    return {
      status: (dbOk && (redisOk || this.redis.getClient() === null)) ? 'ok' : 'unhealthy',
      timestamp,
      uptime,
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memory.external / 1024 / 1024)}MB`,
      },
      cpu: {
        user: cpu.user / 1000000,
        system: cpu.system / 1000000,
      },
      checks: {
        db: dbOk ? 'ok' : 'down',
        redis: redisOk ? 'ok' : (this.redis.getClient() === null ? 'disabled' : 'down'),
        elasticsearch: elasticsearchOk,
      },
    };
  }
}
