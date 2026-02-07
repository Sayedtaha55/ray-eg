import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class CourierService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getMyState(userId: string) {
    const id = String(userId || '').trim();
    if (!id) throw new BadRequestException('غير مصرح');

    const state = await (this.prisma as any).courierState.findUnique({
      where: { userId: id },
    });

    return state || {
      userId: id,
      isAvailable: false,
      lastLat: null,
      lastLng: null,
      accuracy: null,
      lastSeenAt: null,
    };
  }

  async updateMyState(userId: string, input: { isAvailable?: boolean; lat?: number; lng?: number; accuracy?: number }) {
    const id = String(userId || '').trim();
    if (!id) throw new BadRequestException('غير مصرح');

    const data: any = {};

    if (typeof input?.isAvailable === 'boolean') {
      data.isAvailable = input.isAvailable;
    }

    const latRaw = typeof input?.lat === 'number' ? input.lat : Number((input as any)?.lat);
    const lngRaw = typeof input?.lng === 'number' ? input.lng : Number((input as any)?.lng);
    if (Number.isFinite(latRaw) && Number.isFinite(lngRaw)) {
      data.lastLat = latRaw;
      data.lastLng = lngRaw;
      const accRaw = typeof input?.accuracy === 'number' ? input.accuracy : Number((input as any)?.accuracy);
      if (Number.isFinite(accRaw) && accRaw >= 0) {
        data.accuracy = accRaw;
      }
      data.lastSeenAt = new Date();
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('لا توجد بيانات للتحديث');
    }

    return (this.prisma as any).courierState.upsert({
      where: { userId: id },
      create: {
        userId: id,
        isAvailable: data.isAvailable ?? false,
        lastLat: data.lastLat ?? null,
        lastLng: data.lastLng ?? null,
        accuracy: data.accuracy ?? null,
        lastSeenAt: data.lastSeenAt ?? null,
      },
      update: data,
    });
  }

  async listMyOffers(userId: string) {
    const id = String(userId || '').trim();
    if (!id) throw new BadRequestException('غير مصرح');

    const now = new Date();
    return (this.prisma as any).orderCourierOffer.findMany({
      where: { courierId: id, status: 'PENDING' as any, expiresAt: { gt: now } as any } as any,
      orderBy: [{ rank: 'asc' }, { createdAt: 'desc' }],
      include: {
        order: {
          include: {
            items: { include: { product: true } },
            shop: true,
            user: true,
          },
        },
      },
    });
  }

  private async assertCanTakeOrder(courierId: string, order: { id: string; shopId: string; userId: string }) {
    const activeOrders = await this.prisma.order.findMany({
      where: {
        courierId,
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] as any } as any,
      } as any,
      select: { id: true, shopId: true, userId: true },
      take: 10,
    });

    if (activeOrders.length === 0) return;

    const sameCustomer = activeOrders.some((o) => String(o.userId) === String(order.userId));
    const sameShop = activeOrders.some((o) => String(o.shopId) === String(order.shopId));

    if (!sameCustomer && !sameShop) {
      throw new ForbiddenException('لديك طلب قيد التنفيذ بالفعل');
    }

    if (activeOrders.length >= 3) {
      throw new ForbiddenException('تم الوصول للحد الأقصى من الطلبات');
    }
  }

  async acceptOffer(userId: string, offerId: string) {
    const courierId = String(userId || '').trim();
    const id = String(offerId || '').trim();
    if (!courierId) throw new BadRequestException('غير مصرح');
    if (!id) throw new BadRequestException('id مطلوب');

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const offer = await (tx as any).orderCourierOffer.findUnique({
        where: { id },
        include: {
          order: { select: { id: true, courierId: true, status: true, shopId: true, userId: true } },
        },
      });

      if (!offer) throw new BadRequestException('العرض غير موجود');
      if (String(offer.courierId) !== courierId) throw new ForbiddenException('صلاحيات غير كافية');
      if (String(offer.status || '').toUpperCase() !== 'PENDING') throw new BadRequestException('العرض غير صالح');
      if (offer.expiresAt && offer.expiresAt.getTime() <= now.getTime()) {
        await (tx as any).orderCourierOffer.update({ where: { id }, data: { status: 'EXPIRED' as any } });
        throw new BadRequestException('انتهت صلاحية العرض');
      }

      const order = offer.order;
      if (!order) throw new BadRequestException('الطلب غير موجود');
      if (order.courierId) throw new BadRequestException('تم إسناد الطلب بالفعل');

      const orderStatus = String(order.status || '').toUpperCase();
      if (orderStatus === 'DELIVERED' || orderStatus === 'CANCELLED' || orderStatus === 'REFUNDED') {
        throw new BadRequestException('الطلب غير متاح');
      }

      await this.assertCanTakeOrder(courierId, { id: String(order.id), shopId: String(order.shopId), userId: String(order.userId) });

      await tx.order.update({
        where: { id: String(order.id) },
        data: { courierId } as any,
      });

      await (tx as any).orderCourierOffer.update({
        where: { id },
        data: { status: 'ACCEPTED' as any, respondedAt: now },
      });

      await (tx as any).orderCourierOffer.updateMany({
        where: { orderId: String(order.id), id: { not: id }, status: 'PENDING' as any } as any,
        data: { status: 'REJECTED' as any, respondedAt: now },
      });

      const updated = await tx.order.findUnique({
        where: { id: String(order.id) },
        include: {
          items: { include: { product: true } },
          shop: true,
          user: true,
        } as any,
      });

      return updated;
    });
  }

  async rejectOffer(userId: string, offerId: string) {
    const courierId = String(userId || '').trim();
    const id = String(offerId || '').trim();
    if (!courierId) throw new BadRequestException('غير مصرح');
    if (!id) throw new BadRequestException('id مطلوب');

    const offer = await (this.prisma as any).orderCourierOffer.findUnique({
      where: { id },
      select: { id: true, courierId: true, status: true },
    });

    if (!offer) throw new BadRequestException('العرض غير موجود');
    if (String(offer.courierId) !== courierId) throw new ForbiddenException('صلاحيات غير كافية');

    const status = String(offer.status || '').toUpperCase();
    if (status !== 'PENDING') {
      return offer;
    }

    return (this.prisma as any).orderCourierOffer.update({
      where: { id },
      data: { status: 'REJECTED' as any, respondedAt: new Date() },
    });
  }
}
