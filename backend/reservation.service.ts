import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class ReservationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  private normalizeVariantSelection(raw: any): { typeId: string; sizeId: string } | null {
    if (!raw || typeof raw !== 'object') return null;
    const obj: any = raw as any;
    const typeId = String(obj?.typeId || obj?.variantId || obj?.type || obj?.variant || '').trim();
    const sizeId = String(obj?.sizeId || obj?.size || '').trim();
    if (!typeId || !sizeId) return null;
    return { typeId, sizeId };
  }

  private computeMenuVariantForProduct(menuVariantsRaw: any, selectionRaw: any) {
    const selection = this.normalizeVariantSelection(selectionRaw);
    const defs = Array.isArray(menuVariantsRaw) ? (menuVariantsRaw as any[]) : [];
    if (defs.length === 0) {
      if (selection) {
        throw new BadRequestException('اختيار النوع/الحجم غير متاح');
      }
      return { normalized: null as any, price: null as any };
    }
    if (!selection) {
      throw new BadRequestException('يرجى اختيار النوع والحجم');
    }

    const type = defs.find((t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === selection.typeId);
    if (!type) {
      throw new BadRequestException('النوع المختار غير متاح');
    }
    const sizes = Array.isArray((type as any)?.sizes) ? (type as any).sizes : [];
    const size = sizes.find((s: any) => String(s?.id || s?.sizeId || '').trim() === selection.sizeId);
    if (!size) {
      throw new BadRequestException('الحجم المختار غير متاح');
    }

    const priceRaw = typeof (size as any)?.price === 'number' ? (size as any).price : Number((size as any)?.price || 0);
    const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : 0;

    return {
      normalized: {
        typeId: selection.typeId,
        typeName: String((type as any)?.name || (type as any)?.label || '').trim() || selection.typeId,
        sizeId: selection.sizeId,
        sizeLabel: String((size as any)?.label || (size as any)?.name || '').trim() || selection.sizeId,
        price,
      },
      price,
    };
  }

  private normalizeItemAddons(raw: any): Array<{ optionId: string; variantId: string }> {
    const list = Array.isArray(raw) ? raw : [];
    const normalized = list
      .map((a: any) => ({
        optionId: String(a?.optionId || a?.id || '').trim(),
        variantId: String(a?.variantId || '').trim(),
      }))
      .filter((a: any) => a.optionId && a.variantId);

    normalized.sort((a, b) => {
      const ak = `${a.optionId}:${a.variantId}`;
      const bk = `${b.optionId}:${b.variantId}`;
      return ak.localeCompare(bk);
    });

    return normalized;
  }

  private computeAddonsForDefinition(addonsDefRaw: any, selected: Array<{ optionId: string; variantId: string }>) {
    const addonsDef = Array.isArray(addonsDefRaw) ? (addonsDefRaw as any[]) : [];
    const optionIndex = new Map<string, { name: string; imageUrl?: string; variants: Map<string, { label: string; price: number }> }>();

    for (const group of addonsDef) {
      const options = Array.isArray((group as any)?.options) ? (group as any).options : [];
      for (const opt of options) {
        const optionId = String(opt?.id || opt?.optionId || '').trim();
        if (!optionId) continue;

        const variantsArr = Array.isArray(opt?.variants) ? opt.variants : [];
        const variantsMap = new Map<string, { label: string; price: number }>();
        for (const v of variantsArr) {
          const variantId = String(v?.id || v?.variantId || '').trim();
          if (!variantId) continue;
          const label = String(v?.label || v?.name || '').trim() || variantId;
          const price = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
          variantsMap.set(variantId, { label, price: Number.isFinite(price) ? price : 0 });
        }

        optionIndex.set(optionId, {
          name: String(opt?.name || opt?.title || '').trim() || optionId,
          imageUrl: typeof opt?.imageUrl === 'string' ? opt.imageUrl : (typeof opt?.image_url === 'string' ? opt.image_url : undefined),
          variants: variantsMap,
        });
      }
    }

    const normalized: any[] = [];
    let total = 0;
    for (const sel of selected || []) {
      const entry = optionIndex.get(sel.optionId);
      if (!entry) {
        throw new BadRequestException('إضافة غير متاحة');
      }
      const variant = entry.variants.get(sel.variantId);
      if (!variant) {
        throw new BadRequestException('حجم/اختيار الإضافة غير متاح');
      }
      normalized.push({
        optionId: sel.optionId,
        optionName: entry.name,
        optionImage: entry.imageUrl || null,
        variantId: sel.variantId,
        variantLabel: variant.label,
        price: variant.price,
      });
      total += Number(variant.price) || 0;
    }

    return { normalized, total };
  }

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
    addons?: any;
    variantSelection?: any;
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
    const selectedAddons = this.normalizeItemAddons((input as any)?.addons);

    if (!itemId) throw new BadRequestException('itemId مطلوب');
    if (!itemName) throw new BadRequestException('itemName مطلوب');
    if (!shopId) throw new BadRequestException('shopId مطلوب');
    if (!shopName) throw new BadRequestException('shopName مطلوب');
    if (!customerName) throw new BadRequestException('customerName مطلوب');
    if (!customerPhone) throw new BadRequestException('customerPhone مطلوب');
    if (Number.isNaN(itemPrice) || itemPrice < 0) throw new BadRequestException('itemPrice غير صحيح');

    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true, category: true, addons: true } as any,
    });
    if (!shop) throw new NotFoundException('المتجر غير موجود');

    const isRestaurant = String((shop as any)?.category || '').toUpperCase() === 'RESTAURANT';

    const product = await this.prisma.product.findFirst({
      where: { id: itemId, shopId, isActive: true },
    });
    if (!product) throw new NotFoundException('المنتج غير موجود');

    const menuVariant = isRestaurant
      ? this.computeMenuVariantForProduct((product as any)?.menuVariants, (input as any)?.variantSelection)
      : { normalized: null as any, price: null as any };

    let basePrice = typeof menuVariant?.price === 'number'
      ? menuVariant.price
      : (typeof (product as any)?.price === 'number' ? (product as any).price : Number((product as any)?.price || 0));
    try {
      const offer = await this.prisma.offer.findFirst({
        where: {
          shopId,
          isActive: true,
          productId: itemId as any,
          expiresAt: { gt: new Date() } as any,
        } as any,
        select: { newPrice: true } as any,
      });
      const oPrice = typeof (offer as any)?.newPrice === 'number' ? (offer as any).newPrice : Number((offer as any)?.newPrice || NaN);
      if (typeof menuVariant?.price !== 'number' && Number.isFinite(oPrice) && oPrice >= 0) {
        basePrice = oPrice;
      }
    } catch {
    }

    const addonsSource = isRestaurant ? (shop as any)?.addons : (product as any)?.addons;
    const addonsComputed = this.computeAddonsForDefinition(addonsSource, selectedAddons);
    const finalPrice = (Number(basePrice) || 0) + (Number(addonsComputed.total) || 0);

    const created = await this.prisma.reservation.create({
      data: {
        itemId,
        itemName,
        itemImage,
        itemPrice: finalPrice,
        extras: addonsComputed.normalized,
        variantSelection: menuVariant?.normalized || null,
        shopId,
        shopName,
        customerName,
        customerPhone,
        status: 'PENDING' as any,
      } as any,
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
            itemPrice: finalPrice,
            extras: addonsComputed.normalized,
            variantSelection: menuVariant?.normalized || null,
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
      addons: (input as any)?.addons,
      variantSelection: (input as any)?.variantSelection ?? (input as any)?.variant_selection,
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
