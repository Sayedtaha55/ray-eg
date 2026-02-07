import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

@Injectable()
export class OfferService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  private getListCacheKey(prefix: string, input: Record<string, any>) {
    const sorted = Object.keys(input)
      .sort()
      .reduce((acc: any, k) => {
        const v = (input as any)[k];
        if (typeof v === 'undefined' || v === null || v === '') return acc;
        acc[k] = v;
        return acc;
      }, {});
    return `${prefix}:${JSON.stringify(sorted)}`;
  }

  private resolveExpiresAt(raw: any) {
    if (!raw) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d;
    }
    const d = new Date(raw as any);
    if (Number.isNaN(d.getTime())) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 7);
      return fallback;
    }
    return d;
  }

  private computeNewPrice(input: { mode: string; value: number; oldPrice: number }) {
    const mode = String(input?.mode || '').toUpperCase();
    const oldPrice = Number(input?.oldPrice);
    const value = Number(input?.value);
    if (Number.isNaN(oldPrice) || oldPrice < 0) throw new BadRequestException('oldPrice غير صحيح');
    if (Number.isNaN(value) || value < 0) throw new BadRequestException('pricingValue غير صحيح');

    if (mode === 'AMOUNT') {
      const next = oldPrice - value;
      if (next < 0) throw new BadRequestException('pricingValue غير صحيح');
      return next;
    }
    if (mode === 'NEW_PRICE') {
      if (value > oldPrice) throw new BadRequestException('newPrice غير صحيح');
      return value;
    }
    // PERCENT default
    if (value > 100) throw new BadRequestException('discount غير صحيح');
    return oldPrice * (1 - value / 100);
  }

  private computeDiscountPercent(oldPrice: number, newPrice: number) {
    if (!oldPrice || oldPrice <= 0) return 0;
    const pct = (1 - newPrice / oldPrice) * 100;
    const rounded = Math.round(pct * 100) / 100;
    return Math.min(100, Math.max(0, rounded));
  }

  private normalizeMenuVariantPricing(menuVariantsRaw: any, raw: any) {
    const defs = Array.isArray(menuVariantsRaw) ? (menuVariantsRaw as any[]) : [];
    const index = new Map<string, { oldPrice: number }>();
    for (const t of defs) {
      const typeId = String(t?.id || t?.typeId || t?.variantId || '').trim();
      if (!typeId) continue;
      const sizes = Array.isArray((t as any)?.sizes) ? (t as any).sizes : [];
      for (const s of sizes) {
        const sizeId = String(s?.id || s?.sizeId || '').trim();
        if (!sizeId) continue;
        const oldPriceRaw = typeof (s as any)?.price === 'number' ? (s as any).price : Number((s as any)?.price || NaN);
        if (!Number.isFinite(oldPriceRaw) || oldPriceRaw < 0) continue;
        index.set(`${typeId}:${sizeId}`, { oldPrice: oldPriceRaw });
      }
    }

    const list = Array.isArray(raw) ? raw : [];
    const rows: Array<{ typeId: string; sizeId: string; newPrice: number }> = [];
    const seen = new Set<string>();
    let minOld = Number.POSITIVE_INFINITY;
    let minNew = Number.POSITIVE_INFINITY;

    for (const r of list) {
      const typeId = String((r as any)?.typeId || (r as any)?.variantId || (r as any)?.type || (r as any)?.variant || '').trim();
      const sizeId = String((r as any)?.sizeId || (r as any)?.size || '').trim();
      if (!typeId || !sizeId) continue;
      const key = `${typeId}:${sizeId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const entry = index.get(key);
      if (!entry) {
        throw new BadRequestException('الحجم المختار غير متاح');
      }

      const newPriceRaw = typeof (r as any)?.newPrice === 'number' ? (r as any).newPrice : Number((r as any)?.newPrice || NaN);
      const newPrice = Math.round(newPriceRaw * 100) / 100;
      if (!Number.isFinite(newPrice) || newPrice < 0 || newPrice > entry.oldPrice) {
        throw new BadRequestException('سعر العرض للحجم غير صحيح');
      }

      rows.push({ typeId, sizeId, newPrice });
      minOld = Math.min(minOld, entry.oldPrice);
      minNew = Math.min(minNew, newPrice);
    }

    if (rows.length === 0) return null;
    if (!Number.isFinite(minOld) || !Number.isFinite(minNew)) return null;

    return {
      rows,
      minOld,
      minNew,
    };
  }

  async listActive(input?: { take?: number; skip?: number; shopId?: string; productId?: string }) {
    const now = new Date();
    const takeRaw = typeof input?.take === 'number' && Number.isFinite(input.take) ? input.take : undefined;
    const skipRaw = typeof input?.skip === 'number' && Number.isFinite(input.skip) ? input.skip : undefined;
    const shopId = typeof input?.shopId === 'string' ? input.shopId.trim() : '';
    const productId = typeof input?.productId === 'string' ? input.productId.trim() : '';
    const take = typeof takeRaw === 'number' ? Math.min(100, Math.max(1, Math.floor(takeRaw))) : undefined;
    const skip = typeof skipRaw === 'number' ? Math.max(0, Math.floor(skipRaw)) : undefined;

    const cacheKey = this.getListCacheKey('offers:active', {
      take,
      skip,
      shopId: shopId || undefined,
      productId: productId || undefined,
    });
    try {
      const cached = await this.redis.get<any[]>(cacheKey);
      if (cached) return cached;
    } catch {
    }

    const offers = await this.prisma.offer.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: now },
        ...(shopId ? { shopId } : {}),
        ...(productId ? { productId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      ...(typeof take === 'number' ? { take } : {}),
      ...(typeof skip === 'number' ? { skip } : {}),
      include: {
        shop: { select: { id: true, name: true, logoUrl: true, slug: true } },
        product: { select: { id: true, name: true, price: true, imageUrl: true } },
      },
    });

    // Shape for existing UI (types.ts Offer)
    const shaped = offers.map((o) => ({
      id: o.id,
      shopId: o.shopId,
      productId: o.productId || (o.product ? o.product.id : ''),
      shopName: o.shop?.name || '',
      shopLogo: o.shop?.logoUrl || '',
      shopSlug: o.shop?.slug || '',
      title: o.title,
      description: o.description || '',
      discount: o.discount,
      oldPrice: o.oldPrice,
      newPrice: o.newPrice,
      variantPricing: (o as any)?.variantPricing ?? (o as any)?.variant_pricing,
      imageUrl: o.imageUrl || o.product?.imageUrl || '',
      category: 'RETAIL',
      expiresIn: o.expiresAt.toISOString(),
      created_at: o.createdAt.toISOString(),
    }));

    try {
      await this.redis.set(cacheKey, shaped, 60);
    } catch {
    }

    return shaped;
  }

  async getActiveById(id: string) {
    const offerId = String(id || '').trim();
    if (!offerId) throw new BadRequestException('id مطلوب');

    const cacheKey = `offer:${offerId}`;
    try {
      const cached = await this.redis.get<any>(cacheKey);
      if (cached) return cached;
    } catch {
    }

    const now = new Date();
    const offer = await this.prisma.offer.findFirst({
      where: {
        id: offerId,
        isActive: true,
        expiresAt: { gt: now },
      },
      include: {
        shop: { select: { id: true, name: true, logoUrl: true, slug: true } },
        product: { select: { id: true, name: true, price: true, imageUrl: true } },
      },
    });

    if (!offer) {
      throw new BadRequestException('العرض غير متاح');
    }

    const shaped = {
      id: offer.id,
      shopId: offer.shopId,
      productId: offer.productId || (offer.product ? offer.product.id : ''),
      shopName: offer.shop?.name || '',
      shopLogo: offer.shop?.logoUrl || '',
      shopSlug: offer.shop?.slug || '',
      title: offer.title,
      description: offer.description || '',
      discount: offer.discount,
      oldPrice: offer.oldPrice,
      newPrice: offer.newPrice,
      variantPricing: (offer as any)?.variantPricing ?? (offer as any)?.variant_pricing,
      imageUrl: offer.imageUrl || offer.product?.imageUrl || '',
      category: 'RETAIL',
      expiresIn: offer.expiresAt.toISOString(),
      created_at: offer.createdAt.toISOString(),
    };

    try {
      await this.redis.set(cacheKey, shaped, 300);
    } catch {
    }

    return shaped;
  }

  async create(input: {
    shopId: string;
    productId?: string | null;
    productIds?: string[] | null;
    variantPricing?: any;
    title: string;
    description?: string | null;
    discount?: number;
    oldPrice?: number;
    newPrice?: number;
    pricingMode?: string;
    pricingValue?: number;
    imageUrl?: string | null;
    expiresAt?: string | Date;
  }, actor: { role: string; shopId?: string }) {
    const shopId = String(input?.shopId || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && actor?.shopId !== shopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const title = String(input?.title || '').trim();
    if (!title) throw new BadRequestException('title مطلوب');

    const expiresAt = this.resolveExpiresAt(input?.expiresAt);

    const productId = input?.productId ? String(input.productId).trim() : '';
    const productIdsRaw = Array.isArray(input?.productIds) ? input.productIds : [];
    const productIds = Array.from(
      new Set(
        [productId, ...productIdsRaw]
          .map((p) => (typeof p === 'string' ? p.trim() : ''))
          .filter(Boolean),
      ),
    );

    const hasVariantPricing = typeof input?.variantPricing !== 'undefined' && input?.variantPricing !== null;
    if (hasVariantPricing && productIds.length !== 1) {
      throw new BadRequestException('variantPricing يتطلب اختيار منتج واحد');
    }

    const pricingMode = String(input?.pricingMode || 'PERCENT').toUpperCase();
    const pricingValue = typeof input?.pricingValue === 'number' ? input.pricingValue : Number(input?.pricingValue);
    const hasPricingMode = Boolean(input?.pricingMode) || typeof input?.pricingValue !== 'undefined';

    if (productIds.length === 0) {
      // fallback legacy path (admin could create shop-level offers)
      const discount = Number(input?.discount);
      if (Number.isNaN(discount) || discount < 0 || discount > 100) {
        throw new BadRequestException('discount غير صحيح');
      }

      const oldPrice = Number(input?.oldPrice);
      const newPrice = Number(input?.newPrice);
      if (Number.isNaN(oldPrice) || oldPrice < 0) throw new BadRequestException('oldPrice غير صحيح');
      if (Number.isNaN(newPrice) || newPrice < 0 || newPrice > oldPrice) throw new BadRequestException('newPrice غير صحيح');

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default

      const created = await this.prisma.offer.create({
        data: {
          shop: { connect: { id: shopId } },
          title,
          description: input?.description ? String(input.description) : null,
          discount,
          oldPrice,
          newPrice,
          imageUrl: input?.imageUrl ? String(input.imageUrl) : null,
          expiresAt,
          startDate,
          endDate,
          isActive: true,
        },
      });

      try {
        await this.redis.invalidatePattern('offers:active*');
        await this.redis.invalidatePattern('offer:*');
      } catch {
      }

      return created;
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, shopId, isActive: true },
      select: { id: true, name: true, price: true, imageUrl: true, menuVariants: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('المنتج غير صالح لهذا المتجر');
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    const created = await this.prisma.$transaction(async (tx) => {
      const created: any[] = [];

      for (const p of products) {
        const effectiveTitle = products.length > 1 ? `${title} - ${String(p.name || '').trim()}` : title;

        const variantPricing = hasVariantPricing
          ? this.normalizeMenuVariantPricing((p as any)?.menuVariants, (input as any)?.variantPricing)
          : null;

        const baseOldPrice = variantPricing ? Number(variantPricing.minOld) : Number(p.price);
        if (Number.isNaN(baseOldPrice) || baseOldPrice < 0) throw new BadRequestException('oldPrice غير صحيح');

        const computedNewPrice = variantPricing
          ? Number(variantPricing.minNew)
          : (hasPricingMode
            ? this.computeNewPrice({ mode: pricingMode, value: pricingValue, oldPrice: baseOldPrice })
            : Number(input?.newPrice));

        const newPrice = Math.round(Number(computedNewPrice) * 100) / 100;
        if (Number.isNaN(newPrice) || newPrice < 0 || newPrice > baseOldPrice) {
          throw new BadRequestException('newPrice غير صحيح');
        }

        const discount = this.computeDiscountPercent(baseOldPrice, newPrice);

        await tx.offer.updateMany({
          where: { shopId, productId: p.id, isActive: true },
          data: { isActive: false },
        });

        const row = await tx.offer.create({
          data: {
            shopId,
            productId: p.id,
            title: effectiveTitle,
            description: input?.description ? String(input.description) : null,
            discount,
            oldPrice: baseOldPrice,
            newPrice,
            expiresAt,
            startDate,
            endDate,
            isActive: true,
          },
        });

        created.push(row);
      }

      return created;
    });

    try {
      await this.redis.invalidatePattern('offers:active*');
      await this.redis.invalidatePattern('offer:*');
    } catch {
    }

    return created;
  }

  async deactivate(offerId: string, actor: { role: string; shopId?: string }) {
    const id = String(offerId || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');

    const existing = await this.prisma.offer.findUnique({
      where: { id },
      select: { id: true, shopId: true, isActive: true },
    });

    if (!existing) throw new BadRequestException('العرض غير موجود');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && actor?.shopId !== existing.shopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const updated = await this.prisma.offer.update({
      where: { id },
      data: { isActive: false },
    });

    try {
      await this.redis.del(`offer:${id}`);
      await this.redis.invalidatePattern('offers:active*');
    } catch {
    }

    return updated;
  }
}
