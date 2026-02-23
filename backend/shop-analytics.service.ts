import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { MonitoringService } from './monitoring/monitoring.service';

@Injectable()
export class ShopAnalyticsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(MonitoringService) private readonly monitoring: MonitoringService,
  ) {}

  async getShopAnalytics(shopId: string, range?: { from?: Date; to?: Date }) {
    const startTime = Date.now();
    const from = range?.from;
    const to = range?.to;
    const cacheKey = `shop:${shopId}:analytics:${from ? from.toISOString() : 'null'}:${to ? to.toISOString() : 'null'}`;

    try {
      // Try to get from cache first (cache for 5 minutes)
      try {
        const cachedAnalytics = await this.redis.get(cacheKey);
        if (cachedAnalytics) {
          const duration = Date.now() - startTime;
          this.monitoring.trackCache('getShopAnalytics', cacheKey, true, duration);
          this.monitoring.trackPerformance('getShopAnalytics_cached', duration);
          return cachedAnalytics;
        }
        this.monitoring.trackCache('getShopAnalytics', cacheKey, false, Date.now() - startTime);
      } catch {
      }

      const now = new Date();
      const effectiveTo = to && !Number.isNaN(to.getTime()) ? to : now;
      const effectiveFrom =
        from && !Number.isNaN(from.getTime()) ? from : new Date(effectiveTo.getTime() - 30 * 24 * 60 * 60 * 1000);

      const shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        select: { id: true, visitors: true, followers: true },
      });

      // Postgres schema does not have Visit table; use shop.visitors as a coarse metric.
      const visitCountInRange = Number((shop as any)?.visitors || 0);

      const successfulOrderStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
      const ordersInRange = await this.prisma.order.findMany({
        where: {
          shopId,
          status: { in: successfulOrderStatuses as any },
          createdAt: {
            gte: effectiveFrom,
            lte: effectiveTo,
          },
        },
        select: { id: true, userId: true, total: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      const reservationsInRange = await (this.prisma as any).reservation.findMany({
        where: {
          shopId,
          status: 'COMPLETED' as any,
          createdAt: {
            gte: effectiveFrom,
            lte: effectiveTo,
          },
        },
        select: { id: true, customerPhone: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      const totalRevenue =
        ordersInRange.reduce((sum, o) => sum + (Number((o as any).total) || 0), 0) +
        reservationsInRange.reduce((sum, r) => sum + 0, 0);
      const totalOrders = ordersInRange.length + reservationsInRange.length;
      const userIds = new Set<string>();
      for (const o of ordersInRange) userIds.add(String(o.userId));
      for (const r of reservationsInRange) userIds.add(String((r as any).customerPhone || ''));
      userIds.delete('');
      const totalUsers = userIds.size;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      const todayOrders = ordersInRange.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= todayStart.getTime() && t < todayEnd.getTime();
      });

      const todayReservations = reservationsInRange.filter((r) => {
        const t = new Date(r.createdAt).getTime();
        return t >= todayStart.getTime() && t < todayEnd.getTime();
      });

      const salesCountToday = todayOrders.length + todayReservations.length;
      const revenueToday =
        todayOrders.reduce((sum, o) => sum + (Number((o as any).total) || 0), 0) +
        todayReservations.reduce((sum, r) => sum + 0, 0);

      // Last 7 days chart (within available range)
      const chartFrom = new Date(effectiveTo);
      chartFrom.setHours(0, 0, 0, 0);
      chartFrom.setDate(chartFrom.getDate() - 6);

      const chartBuckets: Record<string, number> = {};
      for (let i = 0; i < 7; i += 1) {
        const d = new Date(chartFrom);
        d.setDate(chartFrom.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        chartBuckets[key] = 0;
      }

      for (const o of ordersInRange) {
        const dt = new Date(o.createdAt);
        const key = dt.toISOString().slice(0, 10);
        if (typeof chartBuckets[key] === 'number') {
          chartBuckets[key] += Number((o as any).total) || 0;
        }
      }

      for (const r of reservationsInRange) {
        const dt = new Date((r as any).createdAt);
        const key = dt.toISOString().slice(0, 10);
        if (typeof chartBuckets[key] === 'number') {
          chartBuckets[key] += 0;
        }
      }

      const chartData = Object.keys(chartBuckets)
        .sort()
        .map((key) => {
          const d = new Date(key);
          return {
            name: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
            sales: Math.round(chartBuckets[key]),
          };
        });

      const result = {
        totalRevenue,
        totalOrders,
        totalUsers,
        visitorsCount: visitCountInRange, // Use accurate count from Visit table
        followersCount: Number((shop as any)?.followers || 0),
        salesCountToday,
        revenueToday,
        chartData,
      };

      // Cache analytics for 5 minutes
      try {
        await this.redis.set(cacheKey, result, 300);
      } catch {
      }

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findMany', 'orders', duration, true);
      this.monitoring.trackPerformance('getShopAnalytics_database', duration);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findMany', 'shop_analytics', duration, false);
      throw error;
    }
  }
}
