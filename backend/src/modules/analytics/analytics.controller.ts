import { Controller, Get, UseGuards, Inject, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { AnalyticsService } from '@modules/analytics/analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(@Inject(AnalyticsService) private readonly analyticsService: AnalyticsService) {}

  @Get('system')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getSystemAnalytics() {
    return this.analyticsService.getSystemAnalytics();
  }

  @Get('system/timeseries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getSystemTimeseries(@Query('days') days: string) {
    return this.analyticsService.getSystemTimeseries(days);
  }

  @Get('system/activity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getSystemActivity(@Query('limit') limit: string) {
    return this.analyticsService.getSystemActivity(limit);
  }
}
