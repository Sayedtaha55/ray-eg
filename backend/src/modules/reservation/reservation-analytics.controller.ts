import { Controller, Get, Query, UseGuards, Request, BadRequestException, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { ReservationAnalyticsService, ReservationStats, ReservationTrend } from './reservation-analytics.service';

function parseOptionalDate(value: any): Date | undefined {
  if (!value) return undefined;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

@Controller('reservations/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('merchant', 'admin')
export class ReservationAnalyticsController {
  constructor(
    @Inject(ReservationAnalyticsService) private readonly analyticsService: ReservationAnalyticsService,
  ) {}

  @Get('stats')
  async getStats(
    @Query('shopId') shopId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any,
  ) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const targetShopId = role === 'ADMIN' ? shopId : shopIdFromToken;
    
    if (!targetShopId) {
      throw new BadRequestException('shopId مطلوب');
    }

    return this.analyticsService.getStats(
      targetShopId,
      parseOptionalDate(startDate),
      parseOptionalDate(endDate)
    );
  }

  @Get('trends')
  async getTrends(
    @Query('shopId') shopId: string,
    @Query('days') days?: string,
    @Request() req?: any,
  ) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const targetShopId = role === 'ADMIN' ? shopId : shopIdFromToken;
    
    if (!targetShopId) {
      throw new BadRequestException('shopId مطلوب');
    }

    const daysNum = days ? Math.floor(Number(days)) : 30;
    return this.analyticsService.getTrends(targetShopId, daysNum);
  }

  @Get('hourly-distribution')
  async getHourlyDistribution(
    @Query('shopId') shopId: string,
    @Query('date') date?: string,
    @Request() req?: any,
  ) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const targetShopId = role === 'ADMIN' ? shopId : shopIdFromToken;
    
    if (!targetShopId) {
      throw new BadRequestException('shopId مطلوب');
    }

    return this.analyticsService.getHourlyDistribution(targetShopId, parseOptionalDate(date));
  }
}