import { Controller, Get } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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
}
