import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

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

  async updateOrder(orderId: string, input: { status?: string; notes?: string }) {
    const id = String(orderId || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');

    const data: any = {};
    if (typeof input?.status === 'string' && String(input.status).trim()) {
      data.status = this.normalizeStatus(input.status);
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

    const updated = await this.prisma.order.update({
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
    items: Array<{ productId?: string; id?: string; quantity: number }>;
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

      if (products.length !== productIds.length) {
        throw new BadRequestException('بعض المنتجات غير متاحة');
      }

      const byId: Record<string, any> = {};
      for (const p of products) byId[p.id] = p;

      // Validate stock
      for (const item of normalizedItems) {
        const product = byId[item.productId];
        const currentStock = typeof product?.stock === 'number' ? product.stock : Number(product?.stock || 0);
        if (currentStock < item.quantity) {
          throw new BadRequestException('المخزون غير كاف');
        }
      }

      // Update stock
      for (const item of normalizedItems) {
        const product = byId[item.productId];
        const currentStock = typeof product?.stock === 'number' ? product.stock : Number(product?.stock || 0);
        const nextStock = Math.max(0, currentStock - item.quantity);
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: nextStock },
        });
      }

      const computedTotal = normalizedItems.reduce((sum, item) => {
        const product = byId[item.productId];
        const price = typeof product?.price === 'number' ? product.price : Number(product?.price || 0);
        return sum + price * item.quantity;
      }, 0);

      const total = typeof input.total === 'number' && !Number.isNaN(input.total) && input.total >= 0
        ? input.total
        : computedTotal;

      const created = await tx.order.create({
        data: {
          shopId,
          userId,
          total,
          status,
          paymentMethod: input?.paymentMethod ? String(input.paymentMethod) : null,
          notes: safeNotes,
          items: {
            create: normalizedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: typeof byId[item.productId]?.price === 'number' ? byId[item.productId].price : Number(byId[item.productId]?.price || 0),
            })),
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
