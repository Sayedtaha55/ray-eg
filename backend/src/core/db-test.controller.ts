import { Controller, Get, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { PrismaService } from '@common/prisma/prisma.service';

@Controller('db-test')
export class DatabaseTestController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async testDatabase() {
    const env = String(process.env.NODE_ENV || '').toLowerCase();
    if (env === 'production') {
      return { status: 'disabled', message: 'Database test endpoint is disabled in production' };
    }
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
