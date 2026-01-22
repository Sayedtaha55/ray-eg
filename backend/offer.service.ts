import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class OfferService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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
    title: string;
    description?: string | null;
    discount: number;
    oldPrice: number;
    newPrice: number;
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

    const discount = Number(input?.discount);
    if (Number.isNaN(discount) || discount < 0 || discount > 100) {
      throw new BadRequestException('discount غير صحيح');
    }

    const oldPrice = Number(input?.oldPrice);
    const newPrice = Number(input?.newPrice);
    if (Number.isNaN(oldPrice) || oldPrice < 0) throw new BadRequestException('oldPrice غير صحيح');
    if (Number.isNaN(newPrice) || newPrice < 0) throw new BadRequestException('newPrice غير صحيح');

    const expiresAt = (() => {
      if (!input?.expiresAt) {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d;
      }
      const d = new Date(input.expiresAt as any);
      if (Number.isNaN(d.getTime())) {
        const fallback = new Date();
        fallback.setDate(fallback.getDate() + 7);
        return fallback;
      }
      return d;
    })();

    const productId = input?.productId ? String(input.productId).trim() : null;

    if (productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, shopId: true, isActive: true },
      });
      if (!product || !product.isActive || product.shopId !== shopId) {
        throw new BadRequestException('المنتج غير صالح لهذا المتجر');
      }
    }

    return this.prisma.offer.create({
      data: {
        shopId,
        productId,
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
