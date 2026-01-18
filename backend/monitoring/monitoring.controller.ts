import { Controller, Get, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MonitoringService } from './monitoring.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(@Inject(MonitoringService) private readonly monitoring: MonitoringService) {}

  @Get('health')
  async getHealth() {
    try {
      return await this.monitoring.getHealthStatus();
    } catch (error) {
      console.error('Health check error:', error);
      const env = String(process.env.NODE_ENV || 'development').toLowerCase();
      return {
        status: 'unhealthy',
        error: env === 'production' ? 'Internal error' : error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getMetrics() {
    try {
      return this.monitoring.getMetrics();
    } catch (error) {
      console.error('Metrics error:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('alerts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAlerts() {
    try {
      return {
        active: this.monitoring.getAlerts(false),
        resolved: this.monitoring.getAlerts(true),
      };
    } catch (error) {
      console.error('Alerts error:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getDashboard() {
    try {
      return await this.monitoring.getDashboardData();
    } catch (error) {
      console.error('Dashboard error:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
