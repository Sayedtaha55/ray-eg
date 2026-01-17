import { Controller, Get, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { PrismaService } from './prisma/prisma.service';

@Controller('db-test')
export class DatabaseTestController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
