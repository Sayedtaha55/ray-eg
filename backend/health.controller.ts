import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    const env = String(process.env.NODE_ENV || 'development').toLowerCase();
    const base = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };

    if (env === 'production') {
      return base;
    }

    return {
      ...base,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
