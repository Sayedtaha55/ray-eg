import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

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

  async updateCustomerStatus(customerId: string, status: string) {
    const cid = String(customerId || '').trim();
    const st = String(status || '').trim().toLowerCase();

    if (!cid) return { id: cid, status: 'active' };

    const normalized = st === 'blocked' ? 'blocked' : 'active';
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
