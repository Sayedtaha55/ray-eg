import { Injectable, Inject, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@common/prisma/prisma.service';

type Actor = { role?: string; shopId?: string };

@Injectable()
export class CartEventService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  private assertCanAccessShop(targetShopId: string, actor: Actor) {
    const role = String(actor?.role || '').toUpperCase();
    if (role === 'ADMIN') return;
    if (!actor?.shopId || String(actor.shopId) !== String(targetShopId)) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }
  }

  async track(input: {
    shopId: string;
    productId: string;
    event: string;
    userId?: string;
    sessionId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    quantity?: number;
    unitPrice?: number;
    currency?: string;
    metadata?: any;
  }) {
    const shopId = String(input.shopId || '').trim();
    const productId = String(input.productId || '').trim();
    const event = String(input.event || '').trim().toLowerCase();

    if (!shopId) throw new BadRequestException('shopId مطلوب');
    if (!productId) throw new BadRequestException('productId مطلوب');

    const validEvents = ['add_to_cart', 'checkout_started', 'payment_completed', 'abandoned'];
    if (!validEvents.includes(event)) {
      throw new BadRequestException(`event يجب أن يكون أحد: ${validEvents.join(', ')}`);
    }

    return this.prisma.cartEvent.create({
      data: {
        shopId,
        productId,
        event,
        userId: input.userId || null,
        sessionId: input.sessionId || null,
        customerName: input.customerName || null,
        customerEmail: input.customerEmail || null,
        customerPhone: input.customerPhone || null,
        quantity: input.quantity || 1,
        unitPrice: input.unitPrice || 0,
        currency: input.currency || 'EGP',
        metadata: input.metadata || undefined,
      },
    });
  }

  async listAbandoned(
    shopId: string,
    actor: Actor,
    opts?: { from?: Date; to?: Date; page?: number; limit?: number },
  ) {
    this.assertCanAccessShop(shopId, actor);

    const where: any = {
      shopId,
      event: { in: ['add_to_cart', 'abandoned'] },
    };

    if (opts?.from || opts?.to) {
      where.createdAt = {};
      if (opts.from) where.createdAt.gte = opts.from;
      if (opts.to) where.createdAt.lte = opts.to;
    }

    const page = Math.max(1, opts?.page || 1);
    const limit = Math.min(100, Math.max(1, opts?.limit || 50));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.cartEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.cartEvent.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getStats(shopId: string, actor: Actor, opts?: { from?: Date; to?: Date }) {
    this.assertCanAccessShop(shopId, actor);

    const dateFilter: any = {};
    if (opts?.from || opts?.to) {
      if (opts.from) dateFilter.gte = opts.from;
      if (opts.to) dateFilter.lte = opts.to;
    }

    const baseWhere: any = { shopId };
    if (Object.keys(dateFilter).length > 0) {
      baseWhere.createdAt = dateFilter;
    }

    const [addedToCart, checkoutStarted, paymentCompleted, abandoned, recovered] = await Promise.all([
      this.prisma.cartEvent.count({ where: { ...baseWhere, event: 'add_to_cart' } }),
      this.prisma.cartEvent.count({ where: { ...baseWhere, event: 'checkout_started' } }),
      this.prisma.cartEvent.count({ where: { ...baseWhere, event: 'payment_completed' } }),
      this.prisma.cartEvent.count({ where: { ...baseWhere, event: 'abandoned' } }),
      this.prisma.cartEvent.count({ where: { ...baseWhere, isRecovered: true } }),
    ]);

    const abandonmentRate = addedToCart > 0 ? ((abandoned / addedToCart) * 100).toFixed(1) : '0';
    const recoveryRate = abandoned > 0 ? ((recovered / abandoned) * 100).toFixed(1) : '0';

    return {
      addedToCart,
      checkoutStarted,
      paymentCompleted,
      abandoned,
      recovered,
      abandonmentRate: Number(abandonmentRate),
      recoveryRate: Number(recoveryRate),
    };
  }

  async markRecovered(id: string, actor: Actor) {
    const cartEvent = await this.prisma.cartEvent.findUnique({ where: { id } });
    if (!cartEvent) throw new BadRequestException('CartEvent غير موجود');
    this.assertCanAccessShop(cartEvent.shopId, actor);

    return this.prisma.cartEvent.update({
      where: { id },
      data: { isRecovered: true, recoveredAt: new Date() },
    });
  }

  @Cron('0 * * * *')
  async autoMarkAbandoned(olderThanHours = 2) {
    try {
      const result = await this._autoMarkAbandoned(olderThanHours);
      if (result.marked > 0) {
        Logger.log(`[CartEvent] Auto-marked ${result.marked} abandoned cart events`, 'CartEventService');
      }
    } catch (err) {
      Logger.warn(`[CartEvent] autoMarkAbandoned failed: ${(err as any)?.message}`, 'CartEventService');
    }
  }

  private async _autoMarkAbandoned(olderThanHours = 2) {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    const unreconciled = await this.prisma.cartEvent.findMany({
      where: {
        event: 'add_to_cart',
        createdAt: { lte: cutoff },
        isRecovered: false,
        id: {
          notIn: (await this.prisma.cartEvent.findMany({
            where: {
              event: { in: ['checkout_started', 'payment_completed'] },
              createdAt: { gte: cutoff },
            },
            select: { sessionId: true },
          })).filter(e => e.sessionId).map(e => e.sessionId!),
        },
      },
      select: { id: true, sessionId: true, shopId: true, productId: true, userId: true,
        customerName: true, customerEmail: true, customerPhone: true,
        quantity: true, unitPrice: true, currency: true, metadata: true },
    });

    const sessionIdsWithCheckout = new Set(
      (await this.prisma.cartEvent.findMany({
        where: {
          event: { in: ['checkout_started', 'payment_completed'] },
        },
        select: { sessionId: true },
      }))
        .filter(e => e.sessionId)
        .map(e => e.sessionId!)
    );

    const toAbandon = unreconciled.filter(e => {
      if (e.sessionId && sessionIdsWithCheckout.has(e.sessionId)) return false;
      return true;
    });

    if (toAbandon.length === 0) return { marked: 0 };

    const result = await this.prisma.cartEvent.createMany({
      data: toAbandon.map(e => ({
        shopId: e.shopId,
        productId: e.productId,
        event: 'abandoned',
        userId: e.userId,
        sessionId: e.sessionId,
        customerName: e.customerName,
        customerEmail: e.customerEmail,
        customerPhone: e.customerPhone,
        quantity: e.quantity,
        unitPrice: e.unitPrice,
        currency: e.currency,
        metadata: e.metadata,
      })),
    });

    return { marked: result.count };
  }
}
