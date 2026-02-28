import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CourierDispatchService } from './courier-dispatch.service';
import { RedisService } from './redis/redis.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(CourierDispatchService) private readonly courierDispatch: CourierDispatchService,
  ) {}

  async listReturnsForOrder(orderId: string, actor: { role?: string; shopId?: string; userId?: string }) {
    const id = String(orderId || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && role !== 'MERCHANT') {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, shopId: true },
    });
    if (!order) throw new BadRequestException('الطلب غير موجود');

    if (role === 'MERCHANT') {
      const actorShopId = actor?.shopId ? String(actor.shopId) : '';
      if (!actorShopId || actorShopId !== String(order.shopId)) {
        throw new ForbiddenException('صلاحيات غير كافية');
      }
    }

    return (this.prisma as any).orderReturn.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
            orderItem: { select: { id: true, quantity: true, price: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      } as any,
    } as any);
  }

  async createReturnForOrder(
    orderId: string,
    input: {
      returnToStock: boolean;
      reason?: string;
      items?: Array<{ orderItemId?: string; quantity?: number }>;
    },
    actor: { role?: string; shopId?: string; userId?: string },
  ) {
    const id = String(orderId || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');

    const role = String(actor?.role || '').toUpperCase();
    const actorShopId = actor?.shopId ? String(actor.shopId) : undefined;
    const actorUserId = actor?.userId ? String(actor.userId) : undefined;
    if (role !== 'ADMIN' && role !== 'MERCHANT') {
      throw new ForbiddenException('صلاحيات غير كافية');
    }
    if (!actorUserId) throw new ForbiddenException('غير مصرح');

    const returnToStock = input?.returnToStock === true;
    const reason = typeof input?.reason === 'string' ? String(input.reason).trim() : '';

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            productId: true,
            product: { select: { id: true, trackStock: true } },
          },
        },
      },
    } as any);
    if (!order) throw new BadRequestException('الطلب غير موجود');

    if (role === 'MERCHANT') {
      if (!actorShopId || actorShopId !== String((order as any).shopId)) {
        throw new ForbiddenException('صلاحيات غير كافية');
      }
    }

    if (String((order as any)?.status || '').toUpperCase() === 'CANCELLED') {
      throw new ForbiddenException('لا يمكن عمل مرتجع لطلب ملغي');
    }

    const orderItems = Array.isArray((order as any)?.items) ? ((order as any).items as any[]) : [];
    if (orderItems.length === 0) throw new BadRequestException('لا توجد أصناف داخل الطلب');

    const requestedItemsRaw = Array.isArray(input?.items) ? input.items : null;

    const requested = (() => {
      if (!requestedItemsRaw || requestedItemsRaw.length === 0) {
        return orderItems.map((it) => ({ orderItemId: String(it.id), quantity: Number(it.quantity || 0) }));
      }
      return requestedItemsRaw
        .map((r) => ({
          orderItemId: String(r?.orderItemId || '').trim(),
          quantity: Number(r?.quantity),
        }))
        .filter((r) => r.orderItemId && Number.isFinite(r.quantity) && r.quantity > 0);
    })();

    if (requested.length === 0) throw new BadRequestException('items مطلوبة');

    const byOrderItemId = new Map<string, any>();
    for (const it of orderItems) byOrderItemId.set(String(it.id), it);

    for (const r of requested) {
      if (!byOrderItemId.has(r.orderItemId)) {
        throw new BadRequestException('بعض الأصناف غير موجودة في الطلب');
      }
    }

    const existingReturnSums = await (this.prisma as any).orderReturnItem.groupBy({
      by: ['orderItemId'],
      where: { orderItem: { orderId: id } } as any,
      _sum: { quantity: true },
    } as any);

    const returnedQtyByOrderItemId = new Map<string, number>();
    for (const row of existingReturnSums || []) {
      const key = String((row as any)?.orderItemId || '').trim();
      const qty = Number((row as any)?._sum?.quantity || 0);
      if (!key) continue;
      returnedQtyByOrderItemId.set(key, Number.isFinite(qty) ? qty : 0);
    }

    const itemsPayload: Array<{ orderItemId: string; productId: string; quantity: number; unitPrice: number; lineTotal: number; trackStock: boolean }> = [];
    for (const r of requested) {
      const it = byOrderItemId.get(r.orderItemId);
      const soldQty = Number(it?.quantity || 0);
      const prevReturned = returnedQtyByOrderItemId.get(r.orderItemId) || 0;
      const remaining = Math.max(0, soldQty - prevReturned);
      const reqQty = Math.floor(Number(r.quantity || 0));
      if (reqQty <= 0) continue;
      if (reqQty > remaining) {
        throw new BadRequestException('كمية المرتجع أكبر من المتاح للمرتجع');
      }
      const unitPrice = Number(it?.price || 0);
      const lineTotal = (Number.isFinite(unitPrice) ? unitPrice : 0) * reqQty;
      itemsPayload.push({
        orderItemId: String(it.id),
        productId: String(it.productId),
        quantity: reqQty,
        unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
        lineTotal,
        trackStock: Boolean(it?.product?.trackStock),
      });
    }

    if (itemsPayload.length === 0) throw new BadRequestException('items مطلوبة');

    const totalAmount = itemsPayload.reduce((sum, it) => sum + (Number(it.lineTotal) || 0), 0);

    const created = await this.prisma.$transaction(async (tx) => {
      const ret = await (tx as any).orderReturn.create({
        data: {
          orderId: String((order as any).id),
          shopId: String((order as any).shopId),
          createdById: actorUserId,
          reason: reason || null,
          returnToStock,
          totalAmount,
          items: {
            create: itemsPayload.map((it) => ({
              orderItemId: it.orderItemId,
              productId: it.productId,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              lineTotal: it.lineTotal,
            })),
          },
        },
        include: {
          items: true,
        },
      } as any);

      if (returnToStock) {
        for (const it of itemsPayload) {
          if (!it.trackStock) continue;
          await tx.product.update({
            where: { id: it.productId },
            data: { stock: { increment: it.quantity } },
          });
        }
      }

      const afterSums = await (tx as any).orderReturnItem.groupBy({
        by: ['orderItemId'],
        where: { orderItem: { orderId: id } } as any,
        _sum: { quantity: true },
      } as any);

      let fullyReturned = true;
      for (const oi of orderItems) {
        const key = String(oi.id);
        const soldQty = Number(oi.quantity || 0);
        const returnedQty = Number((afterSums || []).find((r: any) => String(r?.orderItemId) === key)?._sum?.quantity || 0);
        if (returnedQty < soldQty) {
          fullyReturned = false;
          break;
        }
      }

      if (fullyReturned) {
        await tx.order.update({
          where: { id },
          data: { status: 'REFUNDED' as any },
        });
      }

      return ret;
    });

    try {
      await this.redis.invalidatePattern('orders:*');
    } catch {
    }

    return created;
  }

  private normalizeMenuVariantSelection(raw: any): { typeId: string; sizeId: string } | null {
    if (!raw || typeof raw !== 'object') return null;
    const obj: any = raw as any;
    const kind = String(obj?.kind || '').trim().toLowerCase();
    if (kind === 'fashion') return null;
    const typeId = String(obj?.typeId || obj?.variantId || obj?.type || obj?.variant || '').trim();
    const sizeId = String(obj?.sizeId || obj?.size || '').trim();
    if (!typeId || !sizeId) return null;
    return { typeId, sizeId };
  }

  private normalizePackSelection(raw: any): { kind: 'pack'; packId: string } | null {
    if (!raw || typeof raw !== 'object') return null;
    const obj: any = raw as any;
    const kind = String(obj?.kind || '').trim().toLowerCase();
    if (kind !== 'pack') return null;
    const packId = String(obj?.packId || obj?.id || '').trim();
    if (!packId) return null;
    return { kind: 'pack', packId };
  }

  private normalizeFashionSelection(raw: any): { kind: 'fashion'; colorName: string; colorValue: string; size: string } | null {
    if (!raw || typeof raw !== 'object') return null;
    const obj: any = raw as any;
    const kind = String(obj?.kind || '').trim().toLowerCase();
    if (kind !== 'fashion') return null;
    const colorName = String(obj?.colorName || obj?.color?.name || '').trim();
    const colorValue = String(obj?.colorValue || obj?.color?.value || '').trim();
    const size = String(obj?.size || '').trim();
    if (!colorValue || !size) return null;
    return { kind: 'fashion', colorName, colorValue, size };
  }

  private computeMenuVariantForProduct(menuVariantsRaw: any, selectionRaw: any) {
    const selection = this.normalizeMenuVariantSelection(selectionRaw);
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
      await this.prisma.notification.create({
        data: {
          shopId: params.shopId,
          userId: params.userId,
          orderId: params.orderId,
          title,
          content,
          type: 'ORDER' as any,
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
            ? await tx.product.findMany({ where: { id: { in: productIds } }, select: { id: true, stock: true } as any })
            : [];
          const tracked = new Set(
            (products || [])
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
      select: {
        id: true,
        total: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            addons: true,
            variantSelection: true,
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        user: { select: { id: true, name: true, email: true, phone: true } },
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

    const orders = await this.prisma.order.findMany({
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
      },
      ...(pagination ? pagination : {}),
    });

    return orders;
  }

  async getById(id: string) {
    if (!id) throw new BadRequestException('id مطلوب');
    const found = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shop: true,
        user: true,
      },
    });
    if (!found) throw new BadRequestException('الطلب غير موجود');
    return found;
  }

  async createOrder(input: {
    shopId: string;
    userId: string;
    items: Array<{ productId?: string; id?: string; quantity: number; addons?: any; variantSelection?: any; variant_selection?: any }>;
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

    const normalizedItems = items.map((i) => {
      const rawSel = (i as any)?.variantSelection ?? (i as any)?.variant_selection;
      return {
        productId: String(i.productId || i.id || '').trim(),
        quantity: Number(i.quantity),
        addons: this.normalizeItemAddons((i as any)?.addons),
        rawVariantSelection: rawSel,
        menuVariantSelection: this.normalizeMenuVariantSelection(rawSel),
        fashionSelection: this.normalizeFashionSelection(rawSel),
        packSelection: this.normalizePackSelection(rawSel),
      };
    });

    if (normalizedItems.some((i) => !i.productId)) {
      throw new BadRequestException('productId مطلوب');
    }

    if (normalizedItems.some((i) => Number.isNaN(i.quantity) || i.quantity <= 0)) {
      throw new BadRequestException('quantity غير صحيحة');
    }

    const status = this.normalizeStatus(input?.status);

    const productIds = Array.from(new Set(normalizedItems.map((i) => i.productId)));

    const created = await this.prisma.$transaction(async (tx) => {
      const shop = await tx.shop.findUnique({
        where: { id: shopId },
        select: { id: true, layoutConfig: true, category: true, addons: true } as any,
      });
      const isRestaurant = String((shop as any)?.category || '').toUpperCase() === 'RESTAURANT';
      const isFashion = String((shop as any)?.category || '').toUpperCase() === 'FASHION';
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
        select: { productId: true, newPrice: true, discount: true, variantPricing: true } as any,
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('بعض المنتجات غير متاحة');
      }

      const byId: Record<string, any> = {};
      for (const p of products) byId[p.id] = p;

      const offersByProductId: Record<string, { newPrice: number; discount: number; variantPricing?: any }> = {};
      for (const o of offers || []) {
        const pid = String((o as any)?.productId || '').trim();
        const n = typeof (o as any)?.newPrice === 'number' ? (o as any).newPrice : Number((o as any)?.newPrice || 0);
        const disc = typeof (o as any)?.discount === 'number' ? (o as any).discount : Number((o as any)?.discount);
        if (!pid) continue;
        if (!Number.isFinite(n) || n < 0) continue;
        offersByProductId[pid] = {
          newPrice: n,
          discount: Number.isFinite(disc) ? disc : 0,
          variantPricing: (o as any)?.variantPricing ?? (o as any)?.variant_pricing,
        };
      }

      const resolveVariantOfferPrice = (offerRaw: any, selection: any) => {
        const rows = Array.isArray(offerRaw?.variantPricing) ? offerRaw.variantPricing : [];
        if (rows.length === 0) return null;
        const typeId = String(selection?.typeId || selection?.variantId || selection?.type || selection?.variant || '').trim();
        const sizeId = String(selection?.sizeId || selection?.size || '').trim();
        if (!typeId || !sizeId) return null;
        const found = rows.find((r: any) => String(r?.typeId || r?.variantId || r?.type || r?.variant || '').trim() === typeId
          && String(r?.sizeId || r?.size || '').trim() === sizeId);
        const priceRaw = typeof found?.newPrice === 'number' ? found.newPrice : Number(found?.newPrice || NaN);
        if (!Number.isFinite(priceRaw) || priceRaw < 0) return null;
        return priceRaw;
      };

      if (isFashion) {
        for (const item of normalizedItems) {
          const product = byId[(item as any).productId];
          const allowedColors = Array.isArray((product as any)?.colors) ? ((product as any).colors as any[]) : [];
          const allowedSizes = Array.isArray((product as any)?.sizes) ? ((product as any).sizes as any[]) : [];

          const needsSelection = allowedColors.length > 0 && allowedSizes.length > 0;
          if (!needsSelection) {
            continue;
          }

          const sel = (item as any).fashionSelection;
          if (!sel) {
            throw new BadRequestException('يرجى اختيار اللون والمقاس');
          }

          const selectedColorValue = String(sel?.colorValue || '').trim();
          const selectedSize = String(sel?.size || '').trim();
          const hasColor = allowedColors.some((c: any) => String(c?.value || '').trim() === selectedColorValue);
          const hasSize = allowedSizes.some((s: any) => {
            if (typeof s === 'string') return String(s || '').trim() === selectedSize;
            if (s && typeof s === 'object') {
              const label = String((s as any)?.label || (s as any)?.name || (s as any)?.size || (s as any)?.id || '').trim();
              return label === selectedSize;
            }
            return false;
          });
          if (!hasColor || !hasSize) {
            throw new BadRequestException('اللون أو المقاس غير متاح');
          }
        }
      }

      const resolveFashionSizePrice = (product: any, fashionSelection: any) => {
        const selectedSize = String(fashionSelection?.size || '').trim();
        const allowedSizes = Array.isArray((product as any)?.sizes) ? ((product as any).sizes as any[]) : [];
        const found = allowedSizes.find((s: any) => {
          if (typeof s === 'string') return String(s || '').trim() === selectedSize;
          if (s && typeof s === 'object') {
            const label = String((s as any)?.label || (s as any)?.name || (s as any)?.size || (s as any)?.id || '').trim();
            return label === selectedSize;
          }
          return false;
        });
        if (found && typeof found === 'object') {
          const pRaw = typeof (found as any)?.price === 'number' ? (found as any).price : Number((found as any)?.price);
          const p = Number.isFinite(pRaw) && pRaw >= 0 ? pRaw : NaN;
          if (Number.isFinite(p)) return p;
        }
        const base = typeof (product as any)?.price === 'number' ? (product as any).price : Number((product as any)?.price || 0);
        return Number.isFinite(base) && base >= 0 ? base : 0;
      };

      const applyDiscountPercent = (price: number, discountPercent: any) => {
        const disc = typeof discountPercent === 'number' ? discountPercent : Number(discountPercent);
        if (!Number.isFinite(disc) || disc <= 0) return price;
        const next = price * (1 - disc / 100);
        return Math.round(next * 100) / 100;
      };

      const computeStockDelta = (product: any, item: any) => {
        const currentStock = typeof product?.stock === 'number' ? product.stock : Number(product?.stock || 0);
        const packsCountRaw = Number(item?.quantity);
        if (!Number.isFinite(packsCountRaw) || packsCountRaw <= 0) {
          throw new BadRequestException('quantity غير صحيحة');
        }
        const packsCount = Math.floor(packsCountRaw);
        if (packsCount !== packsCountRaw) {
          throw new BadRequestException('quantity غير صحيحة');
        }

        const packSel = (item as any)?.packSelection;
        if (packSel) {
          const defs = Array.isArray((product as any)?.packOptions) ? ((product as any).packOptions as any[]) : [];
          const def = defs.find((p: any) => String(p?.id || '').trim() === String(packSel.packId || '').trim());
          if (!def) {
            throw new BadRequestException('اختيار الباقة غير متاح');
          }
          const qtyRaw = typeof def?.qty === 'number' ? def.qty : Number(def?.qty || NaN);
          const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : NaN;
          if (!Number.isFinite(qty)) {
            throw new BadRequestException('اختيار الباقة غير متاح');
          }
          const delta = packsCount * qty;
          return { currentStock, delta, packsCount };
        }

        if (!Number.isInteger(item.quantity)) {
          return { currentStock, delta: 0, packsCount };
        }
        return { currentStock, delta: item.quantity, packsCount };
      };

      // Validate stock
      for (const item of normalizedItems) {
        const product = byId[item.productId];
        const trackStock = typeof product?.trackStock === 'boolean' ? product.trackStock : true;
        if (!trackStock) continue;
        const { currentStock, delta } = computeStockDelta(product, item);
        if (delta <= 0) continue;
        if (currentStock < delta) {
          throw new BadRequestException('المخزون غير كاف');
        }
      }

      // Update stock
      for (const item of normalizedItems) {
        const product = byId[item.productId];
        const trackStock = typeof product?.trackStock === 'boolean' ? product.trackStock : true;
        if (!trackStock) continue;
        const { currentStock, delta } = computeStockDelta(product, item);
        if (delta <= 0) continue;
        const nextStock = Math.max(0, currentStock - delta);
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: nextStock },
        });
      }

      const computedTotal = normalizedItems.reduce((sum, item) => {
        const product = byId[item.productId];
        const menuVariant = isRestaurant
          ? this.computeMenuVariantForProduct((product as any)?.menuVariants, (item as any)?.rawVariantSelection)
          : { normalized: null as any, price: null as any };
        const offerForProduct = offersByProductId[item.productId];
        const variantOfferPrice = typeof menuVariant?.price === 'number'
          ? resolveVariantOfferPrice(offerForProduct, (item as any)?.rawVariantSelection)
          : null;
        const resolvePackPrice = () => {
          const sel = (item as any)?.packSelection;
          if (!sel) return null;
          const defs = Array.isArray((product as any)?.packOptions) ? ((product as any).packOptions as any[]) : [];
          const def = defs.find((p: any) => String(p?.id || '').trim() === String(sel.packId || '').trim());
          if (!def) throw new BadRequestException('اختيار الباقة غير متاح');
          const priceRaw = typeof def?.price === 'number' ? def.price : Number(def?.price || NaN);
          if (!Number.isFinite(priceRaw) || priceRaw < 0) throw new BadRequestException('اختيار الباقة غير متاح');
          return priceRaw;
        };

        const packPrice = resolvePackPrice();
        const basePrice = typeof packPrice === 'number'
          ? packPrice
          : (typeof variantOfferPrice === 'number'
            ? variantOfferPrice
            : (typeof menuVariant?.price === 'number'
              ? menuVariant.price
              : (() => {
                if (isFashion && (item as any)?.fashionSelection) {
                  const raw = resolveFashionSizePrice(product, (item as any).fashionSelection);
                  const discounted = offerForProduct && typeof offerForProduct?.discount === 'number'
                    ? applyDiscountPercent(raw, offerForProduct.discount)
                    : raw;
                  if (offerForProduct && (typeof offerForProduct?.discount !== 'number' || offerForProduct.discount <= 0)) {
                    const n = typeof offerForProduct?.newPrice === 'number' ? offerForProduct.newPrice : NaN;
                    if (Number.isFinite(n) && n >= 0) return n;
                  }
                  return discounted;
                }
                return typeof offerForProduct?.newPrice === 'number'
                  ? offerForProduct.newPrice
                  : (typeof product?.price === 'number' ? product.price : Number(product?.price || 0));
              })()));
        const addonsSource = isRestaurant ? (shop as any)?.addons : (product as any)?.addons;
        const { total: addonsTotal } = this.computeAddonsForDefinition(addonsSource, (item as any).addons || []);
        const unit = (Number(basePrice) || 0) + (Number(addonsTotal) || 0);
        return sum + unit * item.quantity;
      }, 0);

      const total = computedTotal;

      const isCashierSale = (() => {
        const role = String(actor?.role || '').toUpperCase();
        // Merchant/Admin placing an order from POS should count as an immediate sale.
        return role === 'MERCHANT' || role === 'ADMIN';
      })();

      const effectiveStatus = isCashierSale ? ('DELIVERED' as any) : status;

      const created = await tx.order.create({
        data: {
          total: total,
          user: { connect: { id: userId } },
          shop: { connect: { id: shopId } },
          status: effectiveStatus,
          ...(String(effectiveStatus || '').toUpperCase() === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
          items: {
            create: normalizedItems.map((item) => {
              const product = byId[item.productId];
              const menuVariant = isRestaurant
                ? this.computeMenuVariantForProduct((product as any)?.menuVariants, (item as any)?.rawVariantSelection)
                : { normalized: null as any, price: null as any };
              const offerForProduct = offersByProductId[item.productId];
              const variantOfferPrice = typeof menuVariant?.price === 'number'
                ? resolveVariantOfferPrice(offerForProduct, (item as any)?.rawVariantSelection)
                : null;
              const resolvePackForRow = () => {
                const sel = (item as any)?.packSelection;
                if (!sel) return null;
                const defs = Array.isArray((product as any)?.packOptions) ? ((product as any).packOptions as any[]) : [];
                const def = defs.find((p: any) => String(p?.id || '').trim() === String(sel.packId || '').trim());
                if (!def) throw new BadRequestException('اختيار الباقة غير متاح');
                const qtyRaw = typeof def?.qty === 'number' ? def.qty : Number(def?.qty || NaN);
                const priceRaw = typeof def?.price === 'number' ? def.price : Number(def?.price || NaN);
                const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : NaN;
                const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : NaN;
                if (!Number.isFinite(qty) || !Number.isFinite(price)) throw new BadRequestException('اختيار الباقة غير متاح');
                const unit = String(def?.unit || (product as any)?.unit || '').trim() || null;
                const label = String(def?.label || def?.name || '').trim() || null;
                return { packId: String(def?.id || '').trim(), qty, unit, label, price };
              };

              const packRow = resolvePackForRow();
              const basePrice = packRow && typeof packRow.price === 'number'
                ? packRow.price
                : (typeof variantOfferPrice === 'number'
                  ? variantOfferPrice
                  : (typeof menuVariant?.price === 'number'
                    ? menuVariant.price
                    : (() => {
                      if (isFashion && (item as any)?.fashionSelection) {
                        const raw = resolveFashionSizePrice(product, (item as any).fashionSelection);
                        const discounted = offerForProduct && typeof offerForProduct?.discount === 'number'
                          ? applyDiscountPercent(raw, offerForProduct.discount)
                          : raw;
                        if (offerForProduct && (typeof offerForProduct?.discount !== 'number' || offerForProduct.discount <= 0)) {
                          const n = typeof offerForProduct?.newPrice === 'number' ? offerForProduct.newPrice : NaN;
                          if (Number.isFinite(n) && n >= 0) return n;
                        }
                        return discounted;
                      }
                      return typeof offerForProduct?.newPrice === 'number'
                        ? offerForProduct.newPrice
                        : (typeof product?.price === 'number' ? product.price : Number(product?.price || 0));
                    })()));
              const addonsSource = isRestaurant ? (shop as any)?.addons : (product as any)?.addons;
              const addons = this.computeAddonsForDefinition(addonsSource, (item as any).addons || []);
              const row: any = {
                productId: item.productId,
                quantity: item.quantity,
                price: (Number(basePrice) || 0) + (Number(addons.total) || 0),
                addons: addons.normalized,
                variantSelection: isRestaurant
                  ? (menuVariant?.normalized || null)
                  : (isFashion ? ((item as any)?.fashionSelection || null) : (packRow ? ({ kind: 'pack', ...packRow } as any) : null)),
              };
              return row;
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
            type: 'NEW_ORDER' as any,
            isRead: false,
          },
        });
      } catch {
        // ignore
      }

      try {
        await tx.notification.create({
          data: {
            userId,
            title: 'تم استلام طلبك',
            content: `تم إنشاء طلبك بنجاح بقيمة ${Number(total || 0)} ج.م`,
            type: 'ORDER_CONFIRMED' as any,
            isRead: false,
          },
        });
      } catch {
        // ignore
      }

      try {
        await this.createOrderStatusNotifications({
          tx,
          shopId: String(shopId),
          userId: String(userId),
          orderId: String(created?.id || ''),
          status: String(effectiveStatus || ''),
        });
      } catch {
        // ignore
      }

      return created;
    });

    try {
      await this.redis.invalidatePattern(`shop:${shopId}:analytics:*`);
    } catch {
      // ignore
    }

    this.courierDispatch.dispatchForOrder(String(created?.id || '')).catch(() => {});

    return created;
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

    const updated = await this.prisma.order.update({
      where: { id },
      data: { courierId: courier.id } as any,
      include: {
        items: { include: { product: true } },
        shop: true,
        user: true,
      },
    });

    try {
      await (this.prisma as any).orderCourierOffer.updateMany({
        where: { orderId: id, status: 'PENDING' as any } as any,
        data: { status: 'EXPIRED' as any, respondedAt: new Date() },
      });
    } catch {
    }

    return updated;
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
