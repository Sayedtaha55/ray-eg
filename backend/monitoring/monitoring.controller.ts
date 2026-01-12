import { Controller, Get } from '@nestjs/common';
import { Inject } from '@nestjs/common';
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
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('metrics')
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
