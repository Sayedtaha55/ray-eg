import { Controller, Get } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

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

    const ready = dbOk && (redisOk || this.redis.getClient() === null);

    return {
      status: ready ? 'ok' : 'unhealthy',
      timestamp,
      checks: {
        db: dbOk ? 'ok' : 'down',
        redis: redisOk ? 'ok' : (this.redis.getClient() === null ? 'disabled' : 'down'),
      },
    };
  }
}
