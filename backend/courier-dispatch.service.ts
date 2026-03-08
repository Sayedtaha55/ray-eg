import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

@Injectable()
export class CourierDispatchService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private readonly NEVER_EXPIRES_AT = new Date('2999-01-01T00:00:00.000Z');

  async dispatchForOrder(orderId: string) {
    const id = String(orderId || '').trim();
    if (!id) return null;

    const now = new Date();

    const existingPending = await (this.prisma as any).orderCourierOffer.count({
      where: { orderId: id, status: 'PENDING' as any } as any,
    });
    if (existingPending > 0) return null;

    const order = await this.prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        courierId: true,
        status: true,
        shop: { select: { id: true, latitude: true, longitude: true } },
      } as any,
    });

    if (!order) return null;
    if (order.courierId) return null;

    const status = String(order.status || '').toUpperCase();
    if (status === 'DELIVERED' || status === 'CANCELLED' || status === 'REFUNDED') return null;

    const shopLat = Number((order as any)?.shop?.latitude);
    const shopLng = Number((order as any)?.shop?.longitude);
    const hasShopCoords = Number.isFinite(shopLat) && Number.isFinite(shopLng);
    if (!hasShopCoords) return null;

    const cutoff = new Date(now.getTime() - 2 * 60 * 1000);

    const candidates = await (this.prisma as any).user.findMany({
      where: {
        role: 'COURIER' as any,
        isActive: true,
        courierState: {
          is: {
            isAvailable: true,
            lastSeenAt: { gte: cutoff } as any,
            lastLat: { not: null } as any,
            lastLng: { not: null } as any,
          },
        },
      } as any,
      select: {
        id: true,
        courierState: { select: { lastLat: true, lastLng: true } },
      },
      take: 50,
    });

    const ranked = candidates
      .map((c) => {
        const lat = Number((c as any)?.courierState?.lastLat);
        const lng = Number((c as any)?.courierState?.lastLng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const meters = haversineMeters({ lat, lng }, { lat: shopLat, lng: shopLng });
        return { courierId: String(c.id), meters };
      })
      .filter(Boolean) as Array<{ courierId: string; meters: number }>;

    ranked.sort((a, b) => a.meters - b.meters);
    const top = ranked.slice(0, 3);
    if (top.length === 0) return null;

    await this.prisma.$transaction(async (tx) => {
      for (const [idx, t] of top.entries()) {
        await (tx as any).orderCourierOffer.upsert({
          where: { orderId_courierId: { orderId: id, courierId: t.courierId } } as any,
          create: {
            orderId: id,
            courierId: t.courierId,
            rank: idx + 1,
            status: 'PENDING' as any,
            expiresAt: this.NEVER_EXPIRES_AT,
          },
          update: {
            rank: idx + 1,
            status: 'PENDING' as any,
            expiresAt: this.NEVER_EXPIRES_AT,
            respondedAt: null,
          },
        });
      }
    });

    return { ok: true, offers: top.map((t) => t.courierId) };
  }

  async dispatchUnassignedOrders(limit = 20) {
    const now = new Date();

    const orders = await this.prisma.order.findMany({
      where: {
        courierId: null,
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] as any } as any,
      } as any,
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(Math.floor(limit), 1), 50),
      select: { id: true },
    });

    for (const o of orders) {
      try {
        await this.dispatchForOrder(String(o.id));
      } catch {
      }
    }

    return { ok: true, count: orders.length };
  }
}
