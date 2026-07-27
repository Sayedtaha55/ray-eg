import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { MonitoringService } from './monitoring.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(@Inject(MonitoringService) private readonly monitoring: MonitoringService) {}

  @Get('health')
  @Get('ready')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getHealth() {
    try {
      return await this.monitoring.getHealthStatus();
    } catch (error) {
      console.error('Health check error:', error);
      const env = String(process.env.NODE_ENV || 'development').toLowerCase();
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        status: 'unhealthy',
        error: env === 'production' ? 'Internal error' : errMsg,
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
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        error: errMsg,
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
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        error: errMsg,
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
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        error: errMsg,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('metrics/prometheus')
  async getPrometheusMetrics(@Res() res: Response) {
    try {
      const metrics = this.monitoring.getMetrics();
      const mem = metrics.memory || {};
      const uptime = metrics.uptime || 0;

      const lines: string[] = [
        '# HELP ray_app_uptime_seconds Application uptime in seconds',
        '# TYPE ray_app_uptime_seconds gauge',
        `ray_app_uptime_seconds ${uptime}`,
        '',
        '# HELP ray_app_memory_rss_mb Resident set size in MB',
        '# TYPE ray_app_memory_rss_mb gauge',
        `ray_app_memory_rss_mb ${mem.rss || 0}`,
        '',
        '# HELP ray_app_memory_heap_total_mb Total heap size in MB',
        '# TYPE ray_app_memory_heap_total_mb gauge',
        `ray_app_memory_heap_total_mb ${mem.heapTotal || 0}`,
        '',
        '# HELP ray_app_memory_heap_used_mb Used heap size in MB',
        '# TYPE ray_app_memory_heap_used_mb gauge',
        `ray_app_memory_heap_used_mb ${mem.heapUsed || 0}`,
        '',
        '# HELP ray_app_memory_external_mb External memory in MB',
        '# TYPE ray_app_memory_external_mb gauge',
        `ray_app_memory_external_mb ${mem.external || 0}`,
        '',
      ];

      for (const [key, value] of Object.entries(metrics)) {
        if (key.startsWith('performance:')) {
          const op = key.replace('performance:', '');
          if (value && typeof value === 'object') {
            lines.push(`# HELP ray_perf_${op}_duration_ms Average duration for ${op} in ms`);
            lines.push(`# TYPE ray_perf_${op}_duration_ms gauge`);
            lines.push(`ray_perf_${op}_duration_ms{op="${op}"} ${value.avgDuration || 0}`);
            lines.push(`ray_perf_${op}_count{op="${op}"} ${value.count || 0}`);
            lines.push('');
          }
        }
        if (key.startsWith('api:')) {
          const parts = key.split(':');
          const method = parts[1] || 'unknown';
          const endpoint = parts.slice(2).join(':') || 'unknown';
          if (value && typeof value === 'object') {
            lines.push(`# HELP ray_api_${method}_duration_ms Average duration for ${method} in ms`);
            lines.push(`# TYPE ray_api_${method}_duration_ms gauge`);
            lines.push(`ray_api_duration_ms{method="${method}",endpoint="${endpoint}"} ${value.avgDuration || 0}`);
            lines.push(`ray_api_count{method="${method}",endpoint="${endpoint}"} ${value.count || 0}`);
            lines.push(`ray_api_errors{method="${method}",endpoint="${endpoint}"} ${value.errors || 0}`);
            lines.push('');
          }
        }
        if (key.startsWith('cache:')) {
          const op = key.replace('cache:', '');
          if (value && typeof value === 'object') {
            lines.push(`# HELP ray_cache_${op}_hit_rate Cache hit rate for ${op}`);
            lines.push(`# TYPE ray_cache_${op}_hit_rate gauge`);
            lines.push(`ray_cache_hit_rate{op="${op}"} ${value.hitRate || 0}`);
            lines.push(`ray_cache_total{op="${op}"} ${value.totalRequests || 0}`);
            lines.push(`ray_cache_hits{op="${op}"} ${value.hits || 0}`);
            lines.push(`ray_cache_misses{op="${op}"} ${value.misses || 0}`);
            lines.push('');
          }
        }
      }

      res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(lines.join('\n'));
    } catch (error) {
      console.error('Prometheus metrics error:', error);
      res.status(500).send('# Error generating metrics\n');
    }
  }

  @Get('queue/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getQueueStats() {
    try {
      return await this.monitoring.getQueueStatsSafe();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        error: errMsg,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
