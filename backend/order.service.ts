import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

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

  private computeAddonsForProduct(product: any, selected: Array<{ optionId: string; variantId: string }>) {
    const addonsDef = Array.isArray((product as any)?.addons) ? ((product as any).addons as any[]) : [];
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

  private async createOrderStatusNotifications(params: {
    tx: any;
    shopId: string;
    userId: string;
    orderId: string;
    status: string;
  }) {
    const status = String(params.status || '').toUpperCase();
    const title = 'تحديث حالة الطلب';
    const content = `تم تحديث حالة طلبك إلى: ${status}`;

    try {
      await params.tx.notification.create({
        data: {
          shopId: params.shopId,
          userId: params.userId,
          orderId: params.orderId,
          title,
          content,
          type: 'ORDER_STATUS',
          isRead: false,
        },
      });
    } catch {
      // ignore
    }
  }

  private getDeliveryFeeFromShop(shop: any): number | null {
    const layout = (shop?.layoutConfig as any) || {};
    const raw = (layout as any)?.deliveryFee;
    const n = typeof raw === 'number' ? raw : raw == null ? NaN : Number(raw);
    if (Number.isNaN(n) || n < 0) return null;
    return n;
  }

  private stripDeliveryFeeFromNotes(notes: string) {
    const raw = String(notes || '');
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !l.toUpperCase().startsWith('DELIVERY_FEE:'));
    return lines.join('\n');
  }

  private withDeliveryFee(notes: any, fee: number | null) {
    const base = this.stripDeliveryFeeFromNotes(typeof notes === 'string' ? notes : '');
    if (fee == null) return base || null;
    const next = base ? `${base}\nDELIVERY_FEE:${fee}` : `DELIVERY_FEE:${fee}`;
    return next;
  }

  private normalizeStatus(status?: string) {
    const s = String(status || '').trim().toUpperCase();
    if (s === 'DELIVERED') return 'DELIVERED' as any;
    if (s === 'CONFIRMED') return 'CONFIRMED' as any;
    if (s === 'PREPARING') return 'PREPARING' as any;
    if (s === 'READY') return 'READY' as any;
    if (s === 'CANCELLED' || s === 'CANCELED') return 'CANCELLED' as any;
    if (s === 'REFUNDED') return 'REFUNDED' as any;
    return 'PENDING' as any;
  }

  async updateOrder(
    orderId: string,
    input: { status?: string; notes?: string },
    actor?: { role?: string; shopId?: string },
  ) {
    const id = String(orderId || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');

    const role = String(actor?.role || '').toUpperCase();
    const actorShopId = actor?.shopId ? String(actor.shopId) : undefined;

    const data: any = {};
    const nextStatus = typeof input?.status === 'string' && String(input.status).trim()
      ? this.normalizeStatus(input.status)
      : undefined;
    if (nextStatus) {
      data.status = nextStatus;
      if (String(nextStatus).toUpperCase() === 'DELIVERED') {
        data.deliveredAt = new Date();
      }
    }
    if (typeof input?.notes === 'string') {
      data.notes = String(input.notes);
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('لا توجد بيانات للتحديث');
    }

    const before = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true, userId: true, shopId: true },
    });
    if (!before) {
      throw new BadRequestException('الطلب غير موجود');
    }

    if (role === 'MERCHANT') {
      if (!actorShopId || actorShopId !== String(before.shopId)) {
        throw new ForbiddenException('صلاحيات غير كافية');
      }

      if (String(before.status || '').toUpperCase() === 'CANCELLED') {
        throw new ForbiddenException('لا يمكن تعديل طلب ملغي');
      }

      const beforeStatus = String(before.status || '').toUpperCase();
      if (String(nextStatus || '').toUpperCase() === 'CANCELLED') {
        if (beforeStatus === 'READY' || beforeStatus === 'DELIVERED') {
          throw new ForbiddenException('لا يمكن رفض طلب بعد أن يصبح جاهز أو تم توصيله');
        }
      }

      if (nextStatus) {
        const allowed = new Set(['CONFIRMED', 'PREPARING', 'CANCELLED']);
        if (!allowed.has(String(nextStatus).toUpperCase())) {
          throw new ForbiddenException('لا يمكن تحديث هذه الحالة');
        }
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const isCancelling = String(nextStatus || '').toUpperCase() === 'CANCELLED';

      if (isCancelling) {
        const res = await tx.order.updateMany({
          where: { id, status: { not: 'CANCELLED' as any } },
          data,
        });

        if (res.count === 1) {
          const items = await tx.orderItem.findMany({
            where: { orderId: id },
            select: { productId: true, quantity: true },
          });

          const productIds = Array.from(new Set((items || []).map((i) => String(i.productId || '').trim()).filter(Boolean)));
          const products = productIds.length
            ? await tx.product.findMany({ where: { id: { in: productIds } }, select: { id: true, trackStock: true } as any })
            : [];
          const tracked = new Set(
            (products || [])
              .filter((p: any) => (typeof p?.trackStock === 'boolean' ? p.trackStock : true))
              .map((p: any) => String(p.id)),
          );

          for (const item of items || []) {
            const pid = String(item.productId || '').trim();
            if (!pid || !tracked.has(pid)) continue;
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: Number(item.quantity || 0) } },
            });
          }
        }

        const found = await tx.order.findUnique({
          where: { id },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            shop: true,
            user: true,
            courier: { select: { id: true, name: true, email: true, phone: true, role: true } },
          },
        });
        if (!found) throw new BadRequestException('الطلب غير موجود');
        return found;
      }

      return tx.order.update({
        where: { id },
        data,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          shop: true,
          user: true,
          courier: { select: { id: true, name: true, email: true, phone: true, role: true } },
        },
      });
    });

    try {
      if (before?.userId && before?.shopId && before?.status !== updated?.status) {
        await this.createOrderStatusNotifications({
          tx: this.prisma,
          shopId: String(before.shopId),
          userId: String(before.userId),
          orderId: String(before.id),
          status: String(updated.status),
        });
      }
    } catch {
      // ignore
    }

    return updated;
  }

  async listByShop(
    shopId: string,
    actor: { role: string; shopId?: string },
    query?: { from?: Date; to?: Date },
    paging?: { page?: number; limit?: number },
  ) {
    const targetShopId = String(shopId || '').trim();
    if (!targetShopId) throw new BadRequestException('shopId مطلوب');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && actor?.shopId !== targetShopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const from = query?.from;
    const to = query?.to;

    const pagination = this.getPagination(paging);

    const orders = await this.prisma.order.findMany({
      where: {
        shopId: targetShopId,
        ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: { select: { id: true, name: true, email: true, phone: true } },
        courier: { select: { id: true, name: true, email: true, phone: true, role: true } },
      },
      ...(pagination ? pagination : {}),
    });

    return orders;
  }

  async listAllAdmin(query?: { shopId?: string; from?: Date; to?: Date }, paging?: { page?: number; limit?: number }) {
    const shopId = query?.shopId ? String(query.shopId).trim() : undefined;
    const from = query?.from;
    const to = query?.to;

    const pagination = this.getPagination(paging);

    return this.prisma.order.findMany({
      where: {
        ...(shopId ? { shopId } : {}),
        ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shop: true,
        user: true,
        courier: { select: { id: true, name: true, email: true, phone: true, role: true } },
      },
      ...(pagination ? pagination : {}),
    });
  }

  async createOrder(input: {
    shopId: string;
    userId: string;
    items: Array<{ productId?: string; id?: string; quantity: number; addons?: any }>;
    total?: number;
    paymentMethod?: string;
    notes?: string;
    status?: string;
  }, actor: { role: string; shopId?: string }) {
    const shopId = String(input?.shopId || '').trim();
    const userId = String(input?.userId || '').trim();

    if (!shopId) throw new BadRequestException('shopId مطلوب');
    if (!userId) throw new BadRequestException('غير مصرح');

    const role = String(actor?.role || '').toUpperCase();
    if (role === 'MERCHANT' && actor?.shopId !== shopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const items = Array.isArray(input?.items) ? input.items : [];
    if (items.length === 0) {
      throw new BadRequestException('items مطلوبة');
    }

    const normalizedItems = items.map((i) => ({
      productId: String(i.productId || i.id || '').trim(),
      quantity: Number(i.quantity),
      addons: this.normalizeItemAddons((i as any)?.addons),
    }));

    if (normalizedItems.some((i) => !i.productId)) {
      throw new BadRequestException('productId مطلوب');
    }

    if (normalizedItems.some((i) => Number.isNaN(i.quantity) || i.quantity <= 0)) {
      throw new BadRequestException('quantity غير صحيحة');
    }

    const status = this.normalizeStatus(input?.status);

    const productIds = Array.from(new Set(normalizedItems.map((i) => i.productId)));

    return this.prisma.$transaction(async (tx) => {
      const shop = await tx.shop.findUnique({
        where: { id: shopId },
        select: { id: true, layoutConfig: true },
      });
      const deliveryFee = this.getDeliveryFeeFromShop(shop);
      const safeNotes = this.withDeliveryFee(input?.notes, deliveryFee);

      const products = await tx.product.findMany({
        where: { id: { in: productIds }, shopId, isActive: true },
      });

      const offers = await tx.offer.findMany({
        where: {
          shopId,
          isActive: true,
          productId: { in: productIds } as any,
          expiresAt: { gt: new Date() } as any,
        } as any,
        select: { productId: true, newPrice: true } as any,
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('بعض المنتجات غير متاحة');
      }

      const byId: Record<string, any> = {};
      for (const p of products) byId[p.id] = p;

      const offerPriceByProductId: Record<string, number> = {};
      for (const o of offers || []) {
        const pid = String((o as any)?.productId || '').trim();
        const n = typeof (o as any)?.newPrice === 'number' ? (o as any).newPrice : Number((o as any)?.newPrice || 0);
        if (!pid) continue;
        if (!Number.isFinite(n) || n < 0) continue;
        offerPriceByProductId[pid] = n;
      }

      // Validate stock
      for (const item of normalizedItems) {
        const product = byId[item.productId];
        const trackStock = typeof product?.trackStock === 'boolean' ? product.trackStock : true;
        if (!trackStock) continue;
        const currentStock = typeof product?.stock === 'number' ? product.stock : Number(product?.stock || 0);
        if (currentStock < item.quantity) {
          throw new BadRequestException('المخزون غير كاف');
        }
      }

      // Update stock
      for (const item of normalizedItems) {
        const product = byId[item.productId];
        const trackStock = typeof product?.trackStock === 'boolean' ? product.trackStock : true;
        if (!trackStock) continue;
        const currentStock = typeof product?.stock === 'number' ? product.stock : Number(product?.stock || 0);
        const nextStock = Math.max(0, currentStock - item.quantity);
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: nextStock },
        });
      }

      const computedTotal = normalizedItems.reduce((sum, item) => {
        const product = byId[item.productId];
        const basePriceRaw = offerPriceByProductId[item.productId];
        const basePrice = typeof basePriceRaw === 'number'
          ? basePriceRaw
          : (typeof product?.price === 'number' ? product.price : Number(product?.price || 0));
        const { total: addonsTotal } = this.computeAddonsForProduct(product, (item as any).addons || []);
        const unit = (Number(basePrice) || 0) + (Number(addonsTotal) || 0);
        return sum + unit * item.quantity;
      }, 0);

      const total = computedTotal;

      const created = await tx.order.create({
        data: {
          shopId,
          userId,
          total,
          status,
          paymentMethod: input?.paymentMethod ? String(input.paymentMethod) : null,
          notes: safeNotes,
          items: {
            create: normalizedItems.map((item) => {
              const product = byId[item.productId];
              const basePriceRaw = offerPriceByProductId[item.productId];
              const basePrice = typeof basePriceRaw === 'number'
                ? basePriceRaw
                : (typeof product?.price === 'number' ? product.price : Number(product?.price || 0));
              const addons = this.computeAddonsForProduct(product, (item as any).addons || []);
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: (Number(basePrice) || 0) + (Number(addons.total) || 0),
                addons: addons.normalized,
              };
            }),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      try {
        await tx.notification.create({
          data: {
            shopId,
            title: 'طلب جديد',
            content: `تم إنشاء طلب جديد بقيمة ${Number(total || 0)} ج.م`,
            type: 'ORDER',
            isRead: false,
          },
        });
      } catch {
        // ignore
      }

      try {
        await tx.notification.create({
          data: {
            shopId,
            userId,
            orderId: created.id,
            title: 'تم استلام طلبك',
            content: `تم إنشاء طلبك بنجاح بقيمة ${Number(total || 0)} ج.م`,
            type: 'ORDER',
            isRead: false,
          },
        });
      } catch {
        // ignore
      }

      return created;
    });
  }

  async assignCourierToOrder(orderId: string, courierId: string) {
    const id = String(orderId || '').trim();
    const cId = String(courierId || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');
    if (!cId) throw new BadRequestException('courierId مطلوب');

    const courier = await this.prisma.user.findUnique({
      where: { id: cId },
      select: { id: true, role: true, isActive: true },
    });
    if (!courier || String(courier.role || '').toUpperCase() !== 'COURIER') {
      throw new BadRequestException('courierId غير صحيح');
    }
    if (courier.isActive === false) {
      throw new BadRequestException('حساب المندوب غير مفعل');
    }

    return this.prisma.order.update({
      where: { id },
      data: { courierId: courier.id },
      include: {
        items: { include: { product: true } },
        shop: true,
        user: true,
        courier: { select: { id: true, name: true, email: true, phone: true, role: true } },
      },
    });
  }

  async listMyCourierOrders(courierId: string, paging?: { page?: number; limit?: number }) {
    const cId = String(courierId || '').trim();
    if (!cId) throw new BadRequestException('غير مصرح');

    const pagination = this.getPagination(paging);
    return this.prisma.order.findMany({
      where: { courierId: cId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        shop: true,
        user: true,
      },
      ...(pagination ? pagination : {}),
    });
  }

  async updateCourierOrder(orderId: string, input: { status?: string; codCollected?: boolean }, actor: { userId: string }) {
    const id = String(orderId || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');
    const actorId = String(actor?.userId || '').trim();
    if (!actorId) throw new BadRequestException('غير مصرح');

    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, courierId: true },
    });
    if (!order) throw new BadRequestException('الطلب غير موجود');
    if (!order.courierId || order.courierId !== actorId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const data: any = {};
    if (typeof input?.status === 'string' && String(input.status).trim()) {
      const nextStatus = this.normalizeStatus(input.status);
      data.status = nextStatus;
      if (String(nextStatus).toUpperCase() === 'DELIVERED') {
        data.deliveredAt = new Date();
      }
    }
    if (input?.codCollected === true) {
      data.codCollectedAt = new Date();
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('لا توجد بيانات للتحديث');
    }

    const before = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true, userId: true, shopId: true },
    });

    const updated = await this.prisma.order.update({
      where: { id },
      data,
      include: {
        items: { include: { product: true } },
        shop: true,
        user: true,
      },
    });

    try {
      if (before?.userId && before?.shopId && before?.status !== updated?.status) {
        await this.createOrderStatusNotifications({
          tx: this.prisma,
          shopId: String(before.shopId),
          userId: String(before.userId),
          orderId: String(before.id),
          status: String(updated.status),
        });
      }
    } catch {
      // ignore
    }

    return updated;
  }
}
