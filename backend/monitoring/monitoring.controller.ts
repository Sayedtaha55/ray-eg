import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoring: MonitoringService) {}

  @Get('health')
  async getHealth() {
    return this.monitoring.getHealthStatus();
  }

  @Get('metrics')
  getMetrics() {
    return this.monitoring.getMetrics();
  }

  @Get('alerts')
  getAlerts() {
    return {
      active: this.monitoring.getAlerts(false),
      resolved: this.monitoring.getAlerts(true),
    };
  }

  @Get('dashboard')
  getDashboard() {
    return this.monitoring.getDashboardData();
  }
}
