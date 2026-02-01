import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class CustomersService {
  private readonly statusOverrides = new Map<string, string>();
  private readonly convertedCustomers = new Map<string, any>();

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
          itemPrice: true,
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
        status: this.statusOverrides.get(userId) || 'active',
      };

      base.orders = Number(base.orders || 0) + 1;
      base.totalSpent = Number(base.totalSpent || 0) + Number((o as any).total || 0);

      if (!base.phone && user?.phone) base.phone = user.phone;

      customersById.set(userId, base);
    }

    for (const r of reservations || []) {
      const phone = String((r as any)?.customerPhone || '').trim();
      if (!phone) continue;

      const user = usersByPhone.get(phone);
      const resolvedId = String(user?.id || '').trim();
      const customerId = resolvedId || `phone:${phone}`;

      const existing = customersById.get(customerId);
      const base = existing || {
        id: customerId,
        name: String(user?.name || (r as any)?.customerName || 'عميل'),
        email: user?.email || null,
        phone,
        orders: 0,
        totalSpent: 0,
        status: this.statusOverrides.get(customerId) || 'active',
      };

      if (!base.name && (r as any)?.customerName) base.name = (r as any).customerName;

      base.orders = Number(base.orders || 0) + 1;
      base.totalSpent = Number(base.totalSpent || 0) + Number((r as any)?.itemPrice || 0);

      customersById.set(customerId, base);
    }

    for (const c of this.convertedCustomers.values()) {
      if (String(c?.shopId || '').trim() !== sid) continue;
      const id = String(c?.id || '').trim();
      if (!id) continue;

      const existing = customersById.get(id);
      if (existing) {
        customersById.set(id, {
          ...existing,
          status: this.statusOverrides.get(id) || existing?.status || c?.status || 'active',
        });
        continue;
      }

      customersById.set(id, {
        id,
        name: c?.name || 'عميل',
        email: c?.email || null,
        phone: c?.phone || null,
        orders: Number(c?.orders || 0),
        totalSpent: Number(c?.totalSpent || 0),
        status: this.statusOverrides.get(id) || c?.status || 'active',
      });
    }

    return Array.from(customersById.values()).sort((a, b) => Number(b.totalSpent || 0) - Number(a.totalSpent || 0));
  }

  async updateCustomerStatus(customerId: string, status: string) {
    const cid = String(customerId || '').trim();
    const st = String(status || '').trim().toLowerCase();

    if (!cid) return { id: cid, status: 'active' };

    const normalized = st === 'blocked' ? 'blocked' : 'active';
    this.statusOverrides.set(cid, normalized);

    const existing = this.convertedCustomers.get(cid);
    if (existing) {
      this.convertedCustomers.set(cid, { ...existing, status: normalized });
    }

    return { id: cid, status: normalized };
  }

  async sendCustomerPromotion(_customerId: string, _shopId: string) {
    return { success: true };
  }

  async convertReservationToCustomer(payload: any) {
    const shopId = String(payload?.shopId || '').trim();
    const name = String(payload?.customerName || payload?.name || '').trim();
    const phone = String(payload?.customerPhone || payload?.phone || '').trim();
    const email = String(payload?.customerEmail || payload?.email || '').trim();

    const id = (payload?.customerId ? String(payload.customerId) : '') || `${Date.now()}`;

    const customer = {
      id,
      shopId,
      name: name || 'عميل',
      phone: phone || null,
      email: email || null,
      orders: 1,
      totalSpent: Number(payload?.firstPurchaseAmount || 0),
      status: this.statusOverrides.get(id) || 'active',
    };

    this.convertedCustomers.set(id, customer);

    return customer;
  }
}
