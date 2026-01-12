import { Controller, Get } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('db-test')
export class DatabaseTestController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async testDatabase() {
    try {
      // Test basic database connection
      const result = await this.prisma.$queryRaw`SELECT 1 as test`;

      const safeResult = JSON.parse(
        JSON.stringify(result, (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
      );
      
      return {
        status: 'ok',
        database: 'connected',
        result: safeResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
