import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getSystemAnalytics() {
    const successfulOrderStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
    const [totalUsers, totalShops, ordersAgg, reservationsAgg, totalVisitsAgg] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.shop.count(),
      this.prisma.order.aggregate({
        where: { status: { in: successfulOrderStatuses as any } },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      this.prisma.reservation.aggregate({
        where: { status: 'COMPLETED' as any },
        _count: { id: true },
        _sum: { guests: true }, // Reservation doesn't have price in schema, using guests for now or need to check
      }),
      // Get total unique visits across all shops from Visit table
      this.prisma.visit.count(),
    ]);

    const totalOrders = Number(ordersAgg?._count?.id || 0) + Number((reservationsAgg as any)?._count?.id || 0);
    const totalRevenue = Number(ordersAgg?._sum?.totalAmount || 0);
    const totalVisits = totalVisitsAgg;

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalShops,
      totalVisits,
      revenueGrowth: 0,
      orderGrowth: 0,
      customerGrowth: 0,
    };
  }

  async getSystemTimeseries(daysRaw: any) {
    const parsed = Number(daysRaw);
    const days = Number.isFinite(parsed) ? Math.floor(parsed) : 7;
    const safeDays = Math.min(Math.max(days, 1), 90);

    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (safeDays - 1));

    const buckets: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (let i = 0; i < safeDays; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { date: key, revenue: 0, orders: 0 };
    }

    const successfulOrderStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: successfulOrderStatuses as any },
        createdAt: {
          gte: start,
        },
      },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const reservations = await this.prisma.reservation.findMany({
      where: {
        status: 'COMPLETED' as any,
        createdAt: {
          gte: start,
        },
      },
      select: { guests: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    for (const o of orders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      const bucket = buckets[key];
      if (!bucket) continue;
      bucket.orders += 1;
      bucket.revenue += Number(o.totalAmount) || 0;
    }

    for (const r of reservations) {
      const key = new Date((r as any).createdAt).toISOString().slice(0, 10);
      const bucket = buckets[key];
      if (!bucket) continue;
      bucket.orders += 1;
      // bucket.revenue += Number((r as any).itemPrice) || 0;
    }

    return Object.keys(buckets)
      .sort()
      .map((k) => buckets[k]);
  }

  async getSystemActivity(limitRaw: any) {
    const parsed = Number(limitRaw);
    const limit = Number.isFinite(parsed) ? Math.floor(parsed) : 10;
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const [orders, shops, users] = await Promise.all([
      this.prisma.order.findMany({
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, totalAmount: true, status: true, createdAt: true },
      }),
      this.prisma.shop.findMany({
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, status: true, createdAt: true },
      }),
      this.prisma.user.findMany({
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, role: true, createdAt: true },
      }),
    ]);

    const events: any[] = [];

    for (const u of users || []) {
      const role = String((u as any)?.role || '').toUpperCase();
      const roleLabel = role === 'MERCHANT' ? 'تاجر' : role === 'COURIER' ? 'مندوب' : role === 'ADMIN' ? 'آدمن' : 'مستخدم';
      events.push({
        id: `user:${u.id}`,
        type: 'user',
        title: `تسجيل ${roleLabel} جديد: ${u.name}`,
        createdAt: u.createdAt,
        color: '#00E5FF',
      });
    }

    for (const s of shops || []) {
      const status = String((s as any)?.status || '').toUpperCase();
      const statusLabel = status === 'APPROVED' ? 'تمت الموافقة' : status === 'PENDING' ? 'طلب جديد' : status === 'REJECTED' ? 'مرفوض' : 'تحديث';
      events.push({
        id: `shop:${s.id}`,
        type: 'shop',
        title: `متجر: ${s.name} (${statusLabel})`,
        createdAt: s.createdAt,
        color: '#f59e0b',
      });
    }

    for (const o of orders || []) {
      const status = String((o as any)?.status || '').toUpperCase();
      const statusLabel = status === 'DELIVERED' ? 'تم التوصيل' : status === 'CANCELLED' ? 'ملغي' : status === 'CONFIRMED' ? 'مؤكد' : status === 'READY' ? 'جاهز' : status === 'PREPARING' ? 'قيد التجهيز' : 'طلب جديد';
      events.push({
        id: `order:${o.id}`,
        type: 'order',
        title: `طلب ${statusLabel} • ج.م ${Math.round(Number((o as any)?.totalAmount || 0))}`,
        createdAt: o.createdAt,
        color: '#10b981',
      });
    }

    return events
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, safeLimit)
      .map((e) => ({
        ...e,
        createdAt: (e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt)),
      }));
  }
}
