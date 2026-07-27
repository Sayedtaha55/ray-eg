import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async getShopCustomers(shopId: string) {
    const sid = String(shopId || '').trim();
    if (!sid) return [];

    const successfulOrderStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];

    const [orders, reservations] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          shopId: sid,
          status: { in: successfulOrderStatuses as any },
        },
        select: {
          userId: true,
          total: true,
        },
      }),
      this.prisma.reservation.findMany({
        where: { shopId: sid, status: 'COMPLETED' as any },
        select: {
          customerName: true,
          customerPhone: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const orderUserIds = Array.from(
      new Set(
        (orders || [])
          .map((o: any) => String(o?.userId || '').trim())
          .filter(Boolean),
      ),
    );

    const reservationPhones = Array.from(
      new Set(
        (reservations || [])
          .map((r: any) => String(r?.customerPhone || '').trim())
          .filter(Boolean),
      ),
    );

    const usersById = new Map<string, { id: string; name: string; email: string | null; phone: string | null }>();
    if (orderUserIds.length > 0) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: orderUserIds } },
        select: { id: true, name: true, email: true, phone: true },
      });
      for (const u of users || []) {
        const id = String((u as any)?.id || '').trim();
        if (!id) continue;
        usersById.set(id, {
          id,
          name: String((u as any).name || ''),
          email: ((u as any).email ?? null) as any,
          phone: ((u as any).phone ?? null) as any,
        });
      }
    }

    const usersByPhone = new Map<string, { id: string; name: string; email: string | null; phone: string | null }>();
    if (reservationPhones.length > 0) {
      const users = await this.prisma.user.findMany({
        where: { phone: { in: reservationPhones } },
        select: { id: true, name: true, email: true, phone: true },
      });
      for (const u of users || []) {
        const p = String((u as any)?.phone || '').trim();
        if (!p) continue;
        usersByPhone.set(p, {
          id: String((u as any).id),
          name: String((u as any).name || ''),
          email: ((u as any).email ?? null) as any,
          phone: ((u as any).phone ?? null) as any,
        });
      }
    }

    const customersById = new Map<string, any>();

    for (const o of orders || []) {
      const userId = String(o.userId || '').trim();
      if (!userId) continue;

      const user = usersById.get(userId);

      const existing = customersById.get(userId);
      const base = existing || {
        id: userId,
        name: user?.name || 'عميل',
        email: user?.email || null,
        phone: null,
        orders: 0,
        totalSpent: 0,
        status: 'active',
      };

      base.orders = Number(base.orders || 0) + 1;
      base.totalSpent = Number(base.totalSpent || 0) + Number((o as any).total || 0);

      if (!base.phone && user?.phone) base.phone = user.phone;

      customersById.set(userId, base);
    }

    for (const r of reservations || []) {
      const phone = String((r as any).customerPhone || '').trim();
      if (!phone) continue;

      const user = usersByPhone.get(phone);
      const resolvedId = String(user?.id || '').trim();
      const customerId = resolvedId || `phone:${phone}`;

      const existing = customersById.get(customerId);
      const base = existing || {
        id: customerId,
        name: String((r as any).customerName || '').trim() || user?.name || 'عميل',
        email: user?.email || null,
        phone,
        orders: 0,
        totalSpent: 0,
        status: 'active',
      };

      base.orders = Number(base.orders || 0) + 1;
      base.totalSpent = Number(base.totalSpent || 0) + Number((r as any).itemPrice || 0);

      customersById.set(customerId, base);
    }

    // Merge in persisted customers (created via POS / convert endpoint)
    try {
      const persisted = await (this.prisma as any).customer?.findMany?.({
        where: { shopId: sid },
        orderBy: { totalSpent: 'desc' },
      });
      const list = Array.isArray(persisted) ? persisted : [];
      for (const c of list) {
        const id = String((c as any)?.id || '').trim();
        if (!id) continue;
        const phone = (c as any)?.phone ? String((c as any).phone).trim() : null;
        const existing = customersById.get(id);
        const merged = {
          id,
          name: String((c as any)?.name || '').trim() || existing?.name || 'عميل',
          email: (c as any)?.email ?? existing?.email ?? null,
          phone: phone || existing?.phone || null,
          orders: Number((c as any)?.orders ?? existing?.orders ?? 0),
          totalSpent: Number((c as any)?.totalSpent ?? existing?.totalSpent ?? 0),
          status: String((c as any)?.status || existing?.status || 'active'),
        };
        customersById.set(id, merged);
      }
    } catch {
      // ignore
    }

    return Array.from(customersById.values()).sort((a, b) => Number(b.totalSpent || 0) - Number(a.totalSpent || 0));
  }

  async updateCustomerStatus(customerId: string, status: string, actor?: { role?: string; shopId?: string }) {
    const cid = String(customerId || '').trim();
    const st = String(status || '').trim().toLowerCase();

    if (!cid) return { id: cid, status: 'active' };

    const normalized = st === 'blocked' ? 'blocked' : 'active';

    const role = String(actor?.role || '').toUpperCase();
    const actorShopId = actor?.shopId ? String(actor.shopId).trim() : '';

    let existing: any = null;
    try {
      existing = await (this.prisma as any).customer?.findUnique?.({ where: { id: cid } });
    } catch {
      existing = null;
    }

    if (existing) {
      const ownerShopId = String((existing as any)?.shopId || '').trim();
      if (role !== 'ADMIN') {
        if (!actorShopId || !ownerShopId || actorShopId !== ownerShopId) {
          return { id: cid, status: String((existing as any)?.status || 'active') };
        }
      }
    }

    try {
      const updated = await (this.prisma as any).customer?.update?.({
        where: { id: cid },
        data: { status: normalized },
      });
      if (updated) {
        return { id: String((updated as any).id), status: String((updated as any).status || normalized) };
      }
    } catch {
      // ignore
    }

    return { id: cid, status: normalized };
  }

  async sendCustomerPromotion(_customerId: string, _shopId: string) {
    return { success: true };
  }

  async getCustomerAnalytics(shopId: string) {
    const sid = String(shopId || '').trim();
    if (!sid) return null;

    const successfulStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
    const now = new Date();
    const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const days60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const days90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const orders = await this.prisma.order.findMany({
      where: {
        shopId: sid,
        status: { in: successfulStatuses as any },
      },
      select: {
        id: true,
        userId: true,
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (orders.length === 0) {
      return {
        totalCustomers: 0,
        returningCustomers: 0,
        retentionRate: 0,
        avgVisitsPerCustomer: 0,
        topCustomers: [],
        churnedCustomers: [],
        atRiskCustomers: [],
        newCustomersThisMonth: 0,
      };
    }

    const customerMap = new Map<string, {
      userId: string;
      orderCount: number;
      totalSpent: number;
      firstOrderDate: Date;
      lastOrderDate: Date;
      orders: Date[];
    }>();

    for (const o of orders || []) {
      const uid = String(o.userId || '').trim();
      if (!uid) continue;
      const existing = customerMap.get(uid);
      const orderDate = new Date(o.createdAt);
      if (existing) {
        existing.orderCount++;
        existing.totalSpent += Number(o.total || 0);
        if (orderDate > existing.lastOrderDate) existing.lastOrderDate = orderDate;
        if (orderDate < existing.firstOrderDate) existing.firstOrderDate = orderDate;
        existing.orders.push(orderDate);
      } else {
        customerMap.set(uid, {
          userId: uid,
          orderCount: 1,
          totalSpent: Number(o.total || 0),
          firstOrderDate: orderDate,
          lastOrderDate: orderDate,
          orders: [orderDate],
        });
      }
    }

    const userIds = Array.from(customerMap.keys());
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, phone: true },
    });
    const userMap = new Map<string, any>();
    for (const u of users || []) {
      userMap.set(String(u.id), u);
    }

    const customerList = Array.from(customerMap.entries()).map(([uid, data]) => {
      const user = userMap.get(uid);
      return {
        id: uid,
        name: user?.name || 'عميل',
        email: user?.email || null,
        phone: user?.phone || null,
        orderCount: data.orderCount,
        totalSpent: data.totalSpent,
        firstOrderDate: data.firstOrderDate,
        lastOrderDate: data.lastOrderDate,
        lastVisitDays: Math.floor((now.getTime() - data.lastOrderDate.getTime()) / (24 * 60 * 60 * 1000)),
        isReturning: data.orderCount > 1,
        isNew: data.firstOrderDate >= days30,
        isChurned: data.lastOrderDate < days90,
        isAtRisk: data.lastOrderDate < days60 && data.lastOrderDate >= days90,
      };
    });

    const totalCustomers = customerList.length;
    const returningCustomers = customerList.filter((c) => c.isReturning).length;
    const retentionRate = totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0;
    const avgVisitsPerCustomer = totalCustomers > 0 ? Math.round((orders.length / totalCustomers) * 10) / 10 : 0;
    const newCustomersThisMonth = customerList.filter((c) => c.isNew).length;

    const topCustomers = customerList
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const churnedCustomers = customerList
      .filter((c) => c.isChurned)
      .sort((a, b) => a.lastVisitDays - b.lastVisitDays);

    const atRiskCustomers = customerList
      .filter((c) => c.isAtRisk)
      .sort((a, b) => a.lastVisitDays - b.lastVisitDays);

    return {
      totalCustomers,
      returningCustomers,
      retentionRate,
      avgVisitsPerCustomer,
      newCustomersThisMonth,
      topCustomers,
      churnedCustomers,
      atRiskCustomers,
    };
  }

  async getCustomerDetail(shopId: string, customerId: string) {
    const sid = String(shopId || '').trim();
    const cid = String(customerId || '').trim();
    if (!sid || !cid) return null;

    const successfulStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];

    const [orders, user] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          shopId: sid,
          userId: cid,
          status: { in: successfulStatuses as any },
        },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          paymentMethod: true,
          paymentStatus: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.findUnique({
        where: { id: cid },
        select: { id: true, name: true, email: true, phone: true, createdAt: true },
      }),
    ]);

    if (!user && orders.length === 0) return null;

    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const now = new Date();
    const lastOrder = orders[0] ? new Date(orders[0].createdAt) : null;
    const firstOrder = orders.length > 0 ? new Date(orders[orders.length - 1].createdAt) : null;
    const lastVisitDays = lastOrder ? Math.floor((now.getTime() - lastOrder.getTime()) / (24 * 60 * 60 * 1000)) : null;

    // Monthly spending timeline (last 6 months)
    const monthlySpending: { month: string; total: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthOrders = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= monthStart && d < monthEnd;
      });
      const monthTotal = monthOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      monthlySpending.push({
        month: monthStart.toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' }),
        total: monthTotal,
        count: monthOrders.length,
      });
    }

    // Favorite products from order items
    let favoriteProducts: { productId: string; name: string; count: number }[] = [];
    try {
      const orderIds = orders.map((o) => o.id);
      if (orderIds.length > 0) {
        const items = await this.prisma.orderItem.findMany({
          where: { orderId: { in: orderIds } },
          select: { productId: true, productName: true, quantity: true },
        });
        const productMap = new Map<string, { name: string; count: number }>();
        for (const item of items || []) {
          const pid = String(item.productId || '').trim();
          if (!pid) continue;
          const name = String((item as any).productName || 'منتج');
          const existing = productMap.get(pid);
          if (existing) {
            existing.count += Number(item.quantity || 1);
          } else {
            productMap.set(pid, { name, count: Number(item.quantity || 1) });
          }
        }
        favoriteProducts = Array.from(productMap.entries())
          .map(([pid, data]) => ({ productId: pid, name: data.name, count: data.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }
    } catch {
      // orderItem model might not have productName
    }

    return {
      customer: {
        id: cid,
        name: user?.name || 'عميل',
        email: user?.email || null,
        phone: user?.phone || null,
        joinedAt: user?.createdAt || firstOrder,
      },
      stats: {
        totalOrders: orders.length,
        totalSpent,
        avgOrderValue: orders.length > 0 ? Math.round((totalSpent / orders.length) * 100) / 100 : 0,
        lastOrderDate: lastOrder,
        firstOrderDate: firstOrder,
        lastVisitDays,
        isAtRisk: lastVisitDays !== null && lastVisitDays >= 60 && lastVisitDays < 90,
        isChurned: lastVisitDays !== null && lastVisitDays >= 90,
      },
      orders: orders.map((o) => ({
        id: o.id,
        total: Number(o.total || 0),
        status: String(o.status || ''),
        date: new Date(o.createdAt),
        paymentMethod: o.paymentMethod || null,
        paymentStatus: o.paymentStatus || null,
      })),
      monthlySpending,
      favoriteProducts,
    };
  }

  async convertReservationToCustomer(payload: any) {
    const shopId = String(payload?.shopId || '').trim();
    const name = String(payload?.name ?? payload?.customerName ?? '').trim();
    const phone = String(payload?.phone ?? payload?.customerPhone ?? '').trim();
    const email = String(payload?.email ?? payload?.customerEmail ?? '').trim();

    const amount = Number(payload?.firstPurchaseAmount || 0);
    const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;

    if (!shopId || !phone) {
      return {
        id: payload?.customerId ? String(payload.customerId) : `${Date.now()}`,
        shopId,
        name: name || 'عميل',
        phone: phone || null,
        email: email || null,
        orders: 1,
        totalSpent: safeAmount,
        status: 'active',
      };
    }

    const upserted = await (this.prisma as any).customer.upsert({
      where: { shopId_phone: { shopId, phone } },
      create: {
        shopId,
        name: name || 'عميل',
        phone,
        email: email || null,
        status: 'active',
        orders: 1,
        totalSpent: safeAmount,
        lastPurchaseAt: new Date(),
      },
      update: {
        name: name || undefined,
        email: email || undefined,
        orders: { increment: 1 },
        totalSpent: { increment: safeAmount },
        lastPurchaseAt: new Date(),
      },
    });

    return {
      id: String((upserted as any).id),
      name: String((upserted as any).name || 'عميل'),
      email: (upserted as any).email ?? null,
      phone: String((upserted as any).phone || ''),
      orders: Number((upserted as any).orders || 0),
      totalSpent: Number((upserted as any).totalSpent || 0),
      status: String((upserted as any).status || 'active'),
    };
  }
}
