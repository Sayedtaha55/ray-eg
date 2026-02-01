import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class ReservationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  private readonly RESERVATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

  private getPagination(paging?: { page?: number; limit?: number }) {
    const page = typeof paging?.page === 'number' ? paging.page : undefined;
    const limit = typeof paging?.limit === 'number' ? paging.limit : undefined;
    if (page == null && limit == null) return null;

    const safeLimitRaw = limit == null ? 20 : limit;
    const safeLimit = Math.min(Math.max(Math.floor(safeLimitRaw), 1), 100);
    const safePage = Math.max(Math.floor(page == null ? 1 : page), 1);
    const skip = (safePage - 1) * safeLimit;

    return { take: safeLimit, skip };
  }

  private normalizeStatus(status?: string) {
    const s = String(status || '').trim().toUpperCase();
    if (s === 'COMPLETED' || s === 'COMPLETEDRESERVATION') return 'COMPLETED';
    if (s === 'CANCELLED' || s === 'CANCELED' || s === 'EXPIRED') return 'CANCELLED';
    if (s === 'CONFIRMED') return 'CONFIRMED';
    return 'PENDING';
  }

  private async expireStaleReservations(extraWhere: any) {
    const cutoff = new Date(Date.now() - this.RESERVATION_EXPIRY_MS);

    try {
      await this.prisma.reservation.updateMany({
        where: {
          ...(extraWhere || {}),
          status: { in: ['PENDING', 'CONFIRMED'] as any },
          createdAt: { lt: cutoff },
        },
        data: { status: 'CANCELLED' as any },
      });
    } catch {
      // ignore
    }
  }

  async create(input: {
    itemId: string;
    itemName: string;
    itemImage?: string | null;
    itemPrice: number;
    shopId: string;
    shopName: string;
    customerName: string;
    customerPhone: string;
  }) {
    const itemId = String(input?.itemId || '').trim();
    const itemName = String(input?.itemName || '').trim();
    const shopId = String(input?.shopId || '').trim();
    const shopName = String(input?.shopName || '').trim();
    const customerName = String(input?.customerName || '').trim();
    const customerPhone = String(input?.customerPhone || '').trim();
    const itemImage = input?.itemImage ? String(input.itemImage) : null;
    const itemPrice = Number(input?.itemPrice);

    if (!itemId) throw new BadRequestException('itemId مطلوب');
    if (!itemName) throw new BadRequestException('itemName مطلوب');
    if (!shopId) throw new BadRequestException('shopId مطلوب');
    if (!shopName) throw new BadRequestException('shopName مطلوب');
    if (!customerName) throw new BadRequestException('customerName مطلوب');
    if (!customerPhone) throw new BadRequestException('customerPhone مطلوب');
    if (Number.isNaN(itemPrice) || itemPrice < 0) throw new BadRequestException('itemPrice غير صحيح');

    const shop = await this.prisma.shop.findUnique({ where: { id: shopId }, select: { id: true } });
    if (!shop) throw new NotFoundException('المتجر غير موجود');

    const created = await this.prisma.reservation.create({
      data: {
        itemId,
        itemName,
        itemImage,
        itemPrice,
        shopId,
        shopName,
        customerName,
        customerPhone,
        status: 'PENDING' as any,
      },
    });

    try {
      await this.prisma.notification.create({
        data: {
          shopId,
          title: 'حجز جديد',
          content: `تم استلام حجز جديد: ${itemName} - ${customerName}`,
          type: 'RESERVATION',
          isRead: false,
          metadata: {
            reservationId: created.id,
            itemId,
            itemName,
            customerName,
            customerPhone,
            itemPrice,
          },
        } as any,
      });
    } catch {
      // ignore
    }

    return created;
  }

  async createForUser(userId: string, input: {
    itemId: string;
    itemName: string;
    itemImage?: string | null;
    itemPrice: number;
    shopId: string;
  }) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');

    const user = await this.prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, name: true, phone: true },
    });
    if (!user) throw new BadRequestException('غير مصرح');

    const customerPhone = String(user.phone || '').trim();
    if (!customerPhone) {
      throw new BadRequestException('يرجى إضافة رقم هاتف لحسابك لإتمام الحجز');
    }

    const shopId = String(input?.shopId || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true, name: true },
    });
    if (!shop) throw new NotFoundException('المتجر غير موجود');

    return this.create({
      itemId: input?.itemId,
      itemName: input?.itemName,
      itemImage: input?.itemImage,
      itemPrice: input?.itemPrice,
      shopId: shop.id,
      shopName: shop.name,
      customerName: user.name,
      customerPhone,
    });
  }

  async listByShop(shopId: string, paging?: { page?: number; limit?: number }) {
    const id = String(shopId || '').trim();
    if (!id) throw new BadRequestException('shopId مطلوب');

    await this.expireStaleReservations({ shopId: id });

    const pagination = this.getPagination(paging);
    return this.prisma.reservation.findMany({
      where: { shopId: id },
      orderBy: { createdAt: 'desc' },
      ...(pagination ? pagination : {}),
    });
  }

  async listByUserId(userId: string, paging?: { page?: number; limit?: number }) {
    const id = String(userId || '').trim();
    if (!id) throw new BadRequestException('userId مطلوب');

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { phone: true },
    });

    const phone = String(user?.phone || '').trim();
    if (!phone) throw new BadRequestException('رقم الهاتف غير متوفر لهذا الحساب');

    return this.listByCustomerPhone(phone, paging);
  }

  async listByCustomerPhone(customerPhone: string, paging?: { page?: number; limit?: number }) {
    const phone = String(customerPhone || '').trim();
    if (!phone) throw new BadRequestException('customerPhone مطلوب');

    await this.expireStaleReservations({ customerPhone: phone });

    const pagination = this.getPagination(paging);
    return this.prisma.reservation.findMany({
      where: { customerPhone: phone },
      orderBy: { createdAt: 'desc' },
      ...(pagination ? pagination : {}),
    });
  }

  async updateStatus(id: string, status: string, actor: { role: string; shopId?: string }) {
    const reservationId = String(id || '').trim();
    if (!reservationId) throw new BadRequestException('id مطلوب');

    const existing = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { id: true, shopId: true, status: true, createdAt: true },
    });

    if (!existing) throw new NotFoundException('الحجز غير موجود');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && actor?.shopId !== existing.shopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const normalized = this.normalizeStatus(status);

    const current = this.normalizeStatus(String((existing as any)?.status || ''));
    const cutoff = new Date(Date.now() - this.RESERVATION_EXPIRY_MS);
    const isStale =
      (current === 'PENDING' || current === 'CONFIRMED') &&
      new Date((existing as any).createdAt || 0).getTime() < cutoff.getTime();

    if (isStale) {
      await this.prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'CANCELLED' as any },
      });
      if (normalized === 'COMPLETED') {
        throw new BadRequestException('انتهت صلاحية الحجز');
      }
      return this.prisma.reservation.findUnique({ where: { id: reservationId } });
    }

    if (current === 'COMPLETED' || current === 'CANCELLED') {
      throw new BadRequestException('لا يمكن تعديل حالة هذا الحجز');
    }

    if (normalized === 'COMPLETED' || normalized === 'CANCELLED' || normalized === 'CONFIRMED') {
      return this.prisma.reservation.update({
        where: { id: reservationId },
        data: { status: normalized as any },
      });
    }

    throw new BadRequestException('حالة غير مدعومة');
  }
}
