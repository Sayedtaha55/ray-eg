import { Controller, Get, Query, UseGuards, Request, BadRequestException, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { BookingsAnalyticsService, BookingStats, BookingTrend, TopService } from './bookings-analytics.service';

function parseOptionalDate(value: any): Date | undefined {
  if (!value) return undefined;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

@Controller('bookings/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('merchant', 'admin')
export class BookingsAnalyticsController {
  constructor(
    @Inject(BookingsAnalyticsService) private readonly analyticsService: BookingsAnalyticsService,
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

  @Get('top-services')
  async getTopServices(
    @Query('shopId') shopId: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const targetShopId = role === 'ADMIN' ? shopId : shopIdFromToken;
    
    if (!targetShopId) {
      throw new BadRequestException('shopId مطلوب');
    }

    const limitNum = limit ? Math.floor(Number(limit)) : 10;
    return this.analyticsService.getTopServices(targetShopId, limitNum);
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

  @Get('customer-history')
  async getCustomerHistory(
    @Query('shopId') shopId: string,
    @Query('customerPhone') customerPhone: string,
    @Request() req?: any,
  ) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const targetShopId = role === 'ADMIN' ? shopId : shopIdFromToken;
    
    if (!targetShopId) {
      throw new BadRequestException('shopId مطلوب');
    }

    return this.analyticsService.getCustomerHistory(targetShopId, customerPhone);
  }
}