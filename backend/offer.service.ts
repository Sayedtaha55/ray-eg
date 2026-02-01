import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class OfferService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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

  async listActive(input?: { take?: number; skip?: number; shopId?: string; productId?: string }) {
    const now = new Date();
    const takeRaw = typeof input?.take === 'number' && Number.isFinite(input.take) ? input.take : undefined;
    const skipRaw = typeof input?.skip === 'number' && Number.isFinite(input.skip) ? input.skip : undefined;
    const shopId = typeof input?.shopId === 'string' ? input.shopId.trim() : '';
    const productId = typeof input?.productId === 'string' ? input.productId.trim() : '';
    const take = typeof takeRaw === 'number' ? Math.min(100, Math.max(1, Math.floor(takeRaw))) : undefined;
    const skip = typeof skipRaw === 'number' ? Math.max(0, Math.floor(skipRaw)) : undefined;

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
    return offers.map((o) => ({
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
      imageUrl: o.imageUrl || o.product?.imageUrl || '',
      category: 'RETAIL',
      expiresIn: o.expiresAt.toISOString(),
      created_at: o.createdAt.toISOString(),
    }));
  }

  async getActiveById(id: string) {
    const offerId = String(id || '').trim();
    if (!offerId) throw new BadRequestException('id مطلوب');

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

    return {
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
      imageUrl: offer.imageUrl || offer.product?.imageUrl || '',
      category: 'RETAIL',
      expiresIn: offer.expiresAt.toISOString(),
      created_at: offer.createdAt.toISOString(),
    };
  }

  async create(input: {
    shopId: string;
    productId?: string | null;
    productIds?: string[] | null;
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

      return this.prisma.offer.create({
        data: {
          shopId,
          productId: null,
          title,
          description: input?.description ? String(input.description) : null,
          discount,
          oldPrice,
          newPrice,
          imageUrl: input?.imageUrl ? String(input.imageUrl) : null,
          expiresAt,
          isActive: true,
        },
      });
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, shopId, isActive: true },
      select: { id: true, name: true, price: true, imageUrl: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('المنتج غير صالح لهذا المتجر');
    }

    return this.prisma.$transaction(async (tx) => {
      const created: any[] = [];

      for (const p of products) {
        const effectiveTitle = products.length > 1 ? `${title} - ${String(p.name || '').trim()}` : title;
        const oldPrice = Number(p.price);
        if (Number.isNaN(oldPrice) || oldPrice < 0) throw new BadRequestException('oldPrice غير صحيح');

        const computedNewPrice = hasPricingMode
          ? this.computeNewPrice({ mode: pricingMode, value: pricingValue, oldPrice })
          : Number(input?.newPrice);

        const newPrice = Math.round(Number(computedNewPrice) * 100) / 100;
        if (Number.isNaN(newPrice) || newPrice < 0 || newPrice > oldPrice) {
          throw new BadRequestException('newPrice غير صحيح');
        }

        const discount = this.computeDiscountPercent(oldPrice, newPrice);

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
            oldPrice,
            newPrice,
            imageUrl: input?.imageUrl ? String(input.imageUrl) : (p.imageUrl ? String(p.imageUrl) : null),
            expiresAt,
            isActive: true,
          },
        });

        created.push(row);
      }

      return created;
    });
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

    return this.prisma.offer.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
