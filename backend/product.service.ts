import { Injectable, Inject, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

@Injectable()
export class ProductService {
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

  async getById(id: string) {
    if (!id) {
      throw new BadRequestException('id مطلوب');
    }
    try {
      const cached = await this.redis.getProduct(id);
      if (cached) return cached;
    } catch {
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('لم يتم العثور على المنتج');
    }

    try {
      await this.redis.cacheProduct(id, product, 300);
    } catch {
    }
    return product;
  }

  async listByShop(shopId: string, paging?: { page?: number; limit?: number }) {
    if (!shopId) {
      throw new BadRequestException('shopId مطلوب');
    }
    const pagination = this.getPagination(paging);
    const cacheKey = this.getListCacheKey('products:shop', {
      shopId,
      page: paging?.page,
      limit: paging?.limit,
    });
    try {
      const cached = await this.redis.get<any[]>(cacheKey);
      if (cached) return cached;
    } catch {
    }

    const products = await this.prisma.product.findMany({
      where: { shopId, isActive: true },
      orderBy: { createdAt: 'desc' },
      ...(pagination ? pagination : {}),
    });

    try {
      await this.redis.set(cacheKey, products, 120);
    } catch {
    }

    return products;
  }

  async listByShopForManage(
    shopId: string,
    paging: { page?: number; limit?: number } | undefined,
    actor: { role: string; shopId?: string },
  ) {
    if (!shopId) {
      throw new BadRequestException('shopId مطلوب');
    }

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && actor?.shopId !== shopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const pagination = this.getPagination(paging);
    return this.prisma.product.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      ...(pagination ? pagination : {}),
    });
  }

  async listAllActive(paging?: { page?: number; limit?: number }) {
    const pagination = this.getPagination(paging);
    const cacheKey = this.getListCacheKey('products:all', {
      page: paging?.page,
      limit: paging?.limit,
    });
    try {
      const cached = await this.redis.get<any[]>(cacheKey);
      if (cached) return cached;
    } catch {
    }

    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      ...(pagination ? pagination : {}),
    });

    try {
      await this.redis.set(cacheKey, products, 60);
    } catch {
    }

    return products;
  }

  async create(input: {
    shopId: string;
    name: string;
    price: number;
    stock?: number;
    category?: string;
    imageUrl?: string | null;
    description?: string | null;
    trackStock?: boolean;
    images?: any;
    colors?: any;
    sizes?: any;
  }) {
    const shop = await this.prisma.shop.findUnique({ where: { id: input.shopId }, select: { id: true, slug: true, category: true } });
    if (!shop) {
      throw new NotFoundException('لم يتم العثور على المتجر');
    }

    const shopCategory = String((shop as any)?.category || '').toUpperCase();
    const defaultTrackStock = shopCategory === 'RESTAURANT' ? false : true;
    const resolvedTrackStock = shopCategory === 'RESTAURANT'
      ? false
      : (typeof input.trackStock === 'boolean' ? input.trackStock : defaultTrackStock);

    const created = await this.prisma.product.create({
      data: {
        shopId: input.shopId,
        name: input.name,
        price: input.price,
        stock: input.stock ?? 0,
        trackStock: resolvedTrackStock,
        category: input.category || 'عام',
        imageUrl: input.imageUrl || null,
        images: typeof input.images === 'undefined' ? undefined : input.images,
        colors: typeof input.colors === 'undefined' ? undefined : input.colors,
        sizes: typeof input.sizes === 'undefined' ? undefined : input.sizes,
        description: input.description || null,
        isActive: true,
      } as any,
    });

    try {
      await this.redis.invalidateProductCache(created.id);
      await this.redis.invalidatePattern('products:*');
    } catch {
    }
    if (shop) {
      try {
        await this.redis.invalidateShopCache(shop.id, shop.slug);
      } catch {
      }
    }

    return created;
  }

  async updateStock(productId: string, stock: number, actor: { role: string; shopId?: string }) {
    if (!productId) throw new BadRequestException('id مطلوب');
    if (typeof stock !== 'number' || Number.isNaN(stock) || stock < 0) {
      throw new BadRequestException('stock غير صحيح');
    }

    const existing = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true },
    });

    if (!existing) throw new NotFoundException('لم يتم العثور على المنتج');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && actor?.shopId !== existing.shopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { stock },
    });

    const shop = await this.prisma.shop.findUnique({ where: { id: existing.shopId }, select: { id: true, slug: true } });
    try {
      await this.redis.invalidateProductCache(productId);
      await this.redis.invalidatePattern('products:*');
    } catch {
    }
    if (shop) {
      try {
        await this.redis.invalidateShopCache(shop.id, shop.slug);
      } catch {
      }
    }

    return updated;
  }

  async update(productId: string, data: {
    name?: string;
    price?: number;
    stock?: number;
    category?: string;
    imageUrl?: string;
    description?: string;
    trackStock?: boolean;
    images?: any;
    colors?: any;
    sizes?: any;
    isActive?: boolean;
  }, actor: { role: string; shopId?: string }) {
    if (!productId) throw new BadRequestException('id مطلوب');

    const existing = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true },
    });

    if (!existing) throw new NotFoundException('لم يتم العثور على المنتج');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && actor?.shopId !== existing.shopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    // Build update data with only provided fields
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.trackStock !== undefined) updateData.trackStock = data.trackStock;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.colors !== undefined) updateData.colors = data.colors;
    if (data.sizes !== undefined) updateData.sizes = data.sizes;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    const shop = await this.prisma.shop.findUnique({ where: { id: existing.shopId }, select: { id: true, slug: true } });
    // await this.redis.invalidateProductCache(productId);
    try {
      await this.redis.invalidateProductCache(productId);
      await this.redis.invalidatePattern('products:*');
    } catch {
    }
    if (shop) {
      // await this.redis.invalidateShopCache(shop.id, shop.slug);
      try {
        await this.redis.invalidateShopCache(shop.id, shop.slug);
      } catch {
      }
    }

    return updated;
  }

  async delete(productId: string, actor: { role: string; shopId?: string }) {
    if (!productId) throw new BadRequestException('id مطلوب');

    const existing = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true },
    });

    if (!existing) throw new NotFoundException('لم يتم العثور على المنتج');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && actor?.shopId !== existing.shopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const deleted = await this.prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    const shop = await this.prisma.shop.findUnique({ where: { id: existing.shopId }, select: { id: true, slug: true } });
    // await this.redis.invalidateProductCache(productId);
    try {
      await this.redis.invalidateProductCache(productId);
      await this.redis.invalidatePattern('products:*');
    } catch {
    }
    if (shop) {
      // await this.redis.invalidateShopCache(shop.id, shop.slug);
      try {
        await this.redis.invalidateShopCache(shop.id, shop.slug);
      } catch {
      }
    }

    return deleted;
  }
}
