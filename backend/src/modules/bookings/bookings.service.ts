import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  private normalizePhone(input: any) {
    const raw = String(input ?? '').trim().replace(/\s+/g, '');
    if (!raw) return '';
    if (raw.length > 32) return '__INVALID__';
    if (!/^\+?[0-9]{6,32}$/.test(raw)) return '__INVALID__';
    return raw;
  }

  private assertSmallJsonPayload(value: any, label: string) {
    if (typeof value === 'undefined') return;
    try {
      const s = JSON.stringify(value);
      if (s.length > 20_000) {
        throw new BadRequestException(`${label} كبير جداً`);
      }
    } catch {
      throw new BadRequestException(`${label} غير صالح`);
    }
  }

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
    if (s === 'COMPLETED') return 'COMPLETED';
    if (s === 'CANCELLED' || s === 'CANCELED' || s === 'EXPIRED') return 'CANCELLED';
    if (s === 'CONFIRMED') return 'CONFIRMED';
    return 'PENDING';
  }

  async create(input: {
    shopId: string;
    customerName: string;
    customerPhone: string;
    itemId?: string;
    itemName?: string;
    itemImage?: string | null;
    itemPrice?: number | null;
    startAt?: Date | null;
    endAt?: Date | null;
    resourceId?: string | null;
    notes?: string | null;
    metadata?: any;
  }) {
    const shopId = String(input?.shopId || '').trim();
    const customerName = String(input?.customerName || '').trim();
    const customerPhone = this.normalizePhone(input?.customerPhone);

    if (!shopId) throw new BadRequestException('shopId مطلوب');
    if (!customerName) throw new BadRequestException('customerName مطلوب');
    if (customerName.length > 120) throw new BadRequestException('customerName طويل جداً');
    if (customerPhone === '__INVALID__') throw new BadRequestException('customerPhone غير صحيح');
    if (!customerPhone) throw new BadRequestException('customerPhone مطلوب');

    const notes = input?.notes != null ? String(input.notes) : null;
    if (notes && notes.length > 2000) throw new BadRequestException('notes طويل جداً');

    this.assertSmallJsonPayload((input as any)?.metadata, 'metadata');

    const shop = await this.prisma.shop.findUnique({ where: { id: shopId }, select: { id: true } });
    if (!shop) throw new NotFoundException('المتجر غير موجود');

    const itemPriceRaw = input?.itemPrice == null ? null : Number(input.itemPrice);
    const itemPrice = itemPriceRaw == null ? null : (Number.isFinite(itemPriceRaw) ? itemPriceRaw : null);

    return (this.prisma as any).booking.create({
      data: {
        shopId,
        customerName,
        customerPhone,
        status: 'PENDING',
        itemId: input?.itemId ? String(input.itemId) : null,
        itemName: input?.itemName ? String(input.itemName) : null,
        itemImage: input?.itemImage ? String(input.itemImage) : null,
        itemPrice,
        startAt: input?.startAt ?? null,
        endAt: input?.endAt ?? null,
        resourceId: input?.resourceId ? String(input.resourceId) : null,
        notes: notes || null,
        metadata: (input as any)?.metadata ?? null,
      },
    });
  }

  async createForUser(userId: string, input: {
    shopId: string;
    itemId: string;
    itemName: string;
    itemImage?: string | null;
    itemPrice: number;
    addons?: any;
    variantSelection?: any;
  }) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');

    const user = await this.prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, name: true, phone: true },
    });
    if (!user) throw new BadRequestException('غير مصرح');

    const customerPhone = this.normalizePhone(user.phone);
    if (!customerPhone) {
      throw new BadRequestException('يرجى إضافة رقم هاتف لحسابك لإتمام الحجز');
    }
    if (customerPhone === '__INVALID__') {
      throw new BadRequestException('يرجى إضافة رقم هاتف صحيح لحسابك لإتمام الحجز');
    }

    const shopId = String(input?.shopId || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    const itemId = String(input?.itemId || '').trim();
    const itemName = String(input?.itemName || '').trim();
    if (!itemId) throw new BadRequestException('itemId مطلوب');
    if (!itemName) throw new BadRequestException('itemName مطلوب');
    if (itemName.length > 160) throw new BadRequestException('itemName طويل جداً');

    return this.create({
      shopId,
      customerName: String(user.name || '').trim().slice(0, 120) || 'عميل',
      customerPhone,
      itemId,
      itemName,
      itemImage: input?.itemImage,
      itemPrice: input?.itemPrice,
      metadata: {
        addons: (input as any)?.addons ?? null,
        variantSelection: (input as any)?.variantSelection ?? (input as any)?.variant_selection ?? null,
      },
    });
  }

  async listByShop(shopId: string, paging?: { page?: number; limit?: number }) {
    const id = String(shopId || '').trim();
    if (!id) throw new BadRequestException('shopId مطلوب');

    const pagination = this.getPagination(paging);
    return (this.prisma as any).booking.findMany({
      where: { shopId: id },
      orderBy: { createdAt: 'desc' },
      ...(pagination ? pagination : {}),
    });
  }

  async listByUserId(userId: string, paging?: { page?: number; limit?: number }) {
    const id = String(userId || '').trim();
    if (!id) throw new BadRequestException('userId مطلوب');

    const user = await this.prisma.user.findUnique({ where: { id }, select: { phone: true } });
    const phone = String(user?.phone || '').trim();
    if (!phone) return [];

    const pagination = this.getPagination(paging);
    return (this.prisma as any).booking.findMany({
      where: { customerPhone: phone },
      orderBy: { createdAt: 'desc' },
      ...(pagination ? pagination : {}),
    });
  }

  async updateStatus(id: string, status: string, actor: { role: string; shopId?: string }) {
    const bookingId = String(id || '').trim();
    if (!bookingId) throw new BadRequestException('id مطلوب');

    const existing = await (this.prisma as any).booking.findUnique({
      where: { id: bookingId },
      select: { id: true, shopId: true, status: true },
    });

    if (!existing) throw new NotFoundException('الحجز غير موجود');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && actor?.shopId !== existing.shopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const normalized = this.normalizeStatus(status);

    if (normalized === 'COMPLETED' || normalized === 'CANCELLED' || normalized === 'CONFIRMED') {
      return (this.prisma as any).booking.update({
        where: { id: bookingId },
        data: { status: normalized },
      });
    }

    throw new BadRequestException('حالة غير مدعومة');
  }
}
