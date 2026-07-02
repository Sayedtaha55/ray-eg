import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';

export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export interface ReservationTrend {
  date: string;
  count: number;
  revenue: number;
}

@Injectable()
export class ReservationAnalyticsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  /**
   * Get reservation statistics for a shop
   */
  async getStats(shopId: string, startDate?: Date, endDate?: Date): Promise<ReservationStats> {
    const sid = String(shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');

    const where: any = { shopId: sid };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const reservations = await this.prisma.reservation.findMany({
      where,
      select: {
        status: true,
        itemPrice: true,
      },
    });

    const stats: ReservationStats = {
      total: reservations.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      revenue: 0,
    };

    for (const res of reservations) {
      const status = String(res.status || '').toUpperCase();
      if (status === 'PENDING') stats.pending++;
      else if (status === 'CONFIRMED') stats.confirmed++;
      else if (status === 'COMPLETED') {
        stats.completed++;
        stats.revenue += Number(res.itemPrice) || 0;
      }
      else if (status === 'CANCELLED') stats.cancelled++;
    }

    return stats;
  }

  /**
   * Get reservation trends over time
   */
  async getTrends(shopId: string, days: number = 30): Promise<ReservationTrend[]> {
    const sid = String(shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');

    const daysNum = Math.min(Math.max(Math.floor(days), 1), 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        shopId: sid,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        status: true,
        itemPrice: true,
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

    for (const res of reservations) {
      const dateKey = new Date(res.createdAt).toISOString().split('T')[0];
      const existing = trendsMap.get(dateKey);
      if (existing) {
        existing.count++;
        if (String(res.status || '').toUpperCase() === 'COMPLETED') {
          existing.revenue += Number(res.itemPrice) || 0;
        }
      }
    }

    const trends: ReservationTrend[] = [];
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
   * Get hourly distribution of reservations
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

    const reservations = await this.prisma.reservation.findMany({
      where,
      select: { createdAt: true },
    });

    const hourlyMap = new Map<number, number>();
    for (let h = 0; h < 24; h++) {
      hourlyMap.set(h, 0);
    }

    for (const res of reservations) {
      const hour = new Date(res.createdAt).getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    }

    const distribution: Array<{ hour: number; count: number }> = [];
    hourlyMap.forEach((count, hour) => {
      distribution.push({ hour, count });
    });

    return distribution.sort((a, b) => a.hour - b.hour);
  }
}