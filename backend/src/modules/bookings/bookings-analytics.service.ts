import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export interface BookingTrend {
  date: string;
  count: number;
  revenue: number;
}

export interface TopService {
  serviceId: string;
  serviceName: string;
  count: number;
  revenue: number;
}

@Injectable()
export class BookingsAnalyticsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  /**
   * Get booking statistics for a shop
   */
  async getStats(shopId: string, startDate?: Date, endDate?: Date): Promise<BookingStats> {
    const sid = String(shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');

    const where: any = { shopId: sid };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const bookings = await (this.prisma as any).booking.findMany({
      where,
      select: {
        status: true,
        totalAmount: true,
      },
    });

    const stats: BookingStats = {
      total: bookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      revenue: 0,
    };

    for (const booking of bookings) {
      const status = String(booking.status || '').toUpperCase();
      if (status === 'PENDING') stats.pending++;
      else if (status === 'CONFIRMED') stats.confirmed++;
      else if (status === 'COMPLETED') {
        stats.completed++;
        stats.revenue += Number(booking.totalAmount) || 0;
      }
      else if (status === 'CANCELLED') stats.cancelled++;
    }

    return stats;
  }

  /**
   * Get booking trends over time
   */
  async getTrends(shopId: string, days: number = 30): Promise<BookingTrend[]> {
    const sid = String(shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');

    const daysNum = Math.min(Math.max(Math.floor(days), 1), 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const bookings = await (this.prisma as any).booking.findMany({
      where: {
        shopId: sid,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        status: true,
        totalAmount: true,
      },
    });

    // Group by date
    const trendsMap = new Map<string, { count: number; revenue: number }>();
    
    for (let i = 0; i < daysNum; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().split('T')[0];
      trendsMap.set(dateKey, { count: 0, revenue: 0 });
    }

    for (const booking of bookings) {
      const dateKey = new Date(booking.createdAt).toISOString().split('T')[0];
      const existing = trendsMap.get(dateKey);
      if (existing) {
        existing.count++;
        if (String(booking.status || '').toUpperCase() === 'COMPLETED') {
          existing.revenue += Number(booking.totalAmount) || 0;
        }
      }
    }

    const trends: BookingTrend[] = [];
    trendsMap.forEach((value, key) => {
      trends.push({
        date: key,
        count: value.count,
        revenue: value.revenue,
      });
    });

    return trends.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get top services by bookings
   */
  async getTopServices(shopId: string, limit: number = 10): Promise<TopService[]> {
    const sid = String(shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');

    const limitNum = Math.min(Math.max(Math.floor(limit), 1), 100);

    const bookings = await (this.prisma as any).booking.findMany({
      where: { shopId: sid },
      select: {
        serviceId: true,
        service: { select: { name: true, nameAr: true } },
        status: true,
        totalAmount: true,
      },
    });

    const serviceMap = new Map<string, { name: string; count: number; revenue: number }>();

    for (const booking of bookings) {
      const serviceId = String(booking.serviceId || '');
      if (!serviceId) continue;

      const serviceName = booking.service?.nameAr || booking.service?.name || serviceId;
      const existing = serviceMap.get(serviceId) || { name: serviceName, count: 0, revenue: 0 };
      
      existing.count++;
      if (String(booking.status || '').toUpperCase() === 'COMPLETED') {
        existing.revenue += Number(booking.totalAmount) || 0;
      }
      
      serviceMap.set(serviceId, existing);
    }

    const topServices: TopService[] = [];
    serviceMap.forEach((value, key) => {
      topServices.push({
        serviceId: key,
        serviceName: value.name,
        count: value.count,
        revenue: value.revenue,
      });
    });

    return topServices
      .sort((a, b) => b.count - a.count)
      .slice(0, limitNum);
  }

  /**
   * Get hourly distribution of bookings
   */
  async getHourlyDistribution(shopId: string, date?: Date): Promise<Array<{ hour: number; count: number }>> {
    const sid = String(shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');

    const where: any = { shopId: sid };
    
    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.createdAt = { gte: startOfDay, lte: endOfDay };
    }

    const bookings = await (this.prisma as any).booking.findMany({
      where,
      select: { createdAt: true },
    });

    const hourlyMap = new Map<number, number>();
    for (let h = 0; h < 24; h++) {
      hourlyMap.set(h, 0);
    }

    for (const booking of bookings) {
      const hour = new Date(booking.createdAt).getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    }

    const distribution: Array<{ hour: number; count: number }> = [];
    hourlyMap.forEach((count, hour) => {
      distribution.push({ hour, count });
    });

    return distribution.sort((a, b) => a.hour - b.hour);
  }

  /**
   * Get customer booking history
   */
  async getCustomerHistory(shopId: string, customerPhone: string): Promise<any[]> {
    const sid = String(shopId || '').trim();
    const phone = String(customerPhone || '').trim();
    
    if (!sid) throw new BadRequestException('shopId مطلوب');
    if (!phone) throw new BadRequestException('customerPhone مطلوب');

    const bookings = await (this.prisma as any).booking.findMany({
      where: {
        shopId: sid,
        customerPhone: phone,
      },
      include: {
        service: { select: { name: true, nameAr: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return bookings;
  }
}