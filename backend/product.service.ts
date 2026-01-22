import { Injectable, Inject, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
// import { RedisService } from './redis/redis.service';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    // @Inject(RedisService) private readonly redis: RedisService,
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

  async getById(id: string) {
    if (!id) {
      throw new BadRequestException('id مطلوب');
    }
    // const cached = await this.redis.getProduct(id);
    // if (cached) return cached;

    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('لم يتم العثور على المنتج');
    }

    // await this.redis.cacheProduct(id, product, 3600);
    return product;
  }

  async listByShop(shopId: string, paging?: { page?: number; limit?: number }) {
    if (!shopId) {
      throw new BadRequestException('shopId مطلوب');
    }
    const pagination = this.getPagination(paging);
    return this.prisma.product.findMany({
      where: { shopId, isActive: true },
      orderBy: { createdAt: 'desc' },
      ...(pagination ? pagination : {}),
    });
  }

  async listAllActive(paging?: { page?: number; limit?: number }) {
    const pagination = this.getPagination(paging);
    return this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      ...(pagination ? pagination : {}),
    });
  }

  async create(input: { shopId: string; name: string; price: number; stock?: number; category?: string; imageUrl?: string | null; description?: string | null }) {
    const created = await this.prisma.product.create({
      data: {
        shopId: input.shopId,
        name: input.name,
        price: input.price,
        stock: input.stock ?? 0,
        category: input.category || 'عام',
        imageUrl: input.imageUrl || null,
        description: input.description || null,
        isActive: true,
      },
    });

    const shop = await this.prisma.shop.findUnique({ where: { id: input.shopId }, select: { id: true, slug: true } });
    // await this.redis.invalidateProductCache(created.id);
    if (shop) {
      // await this.redis.invalidateShopCache(shop.id, shop.slug);
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
    // await this.redis.invalidateProductCache(productId);
    if (shop) {
      // await this.redis.invalidateShopCache(shop.id, shop.slug);
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
    if (shop) {
      // await this.redis.invalidateShopCache(shop.id, shop.slug);
    }

    return deleted;
  }
}
