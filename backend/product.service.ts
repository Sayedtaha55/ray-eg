import { Injectable, Inject, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  private mapDbErrorToBadRequest(e: any) {
    const msg = e?.message ? String(e.message) : '';
    const lowered = msg.toLowerCase();
    if (
      lowered.includes('does not exist') ||
      lowered.includes('no such column') ||
      lowered.includes('no such table') ||
      lowered.includes('unknown column') ||
      lowered.includes('column') && lowered.includes('not') && lowered.includes('exist')
    ) {
      return new BadRequestException('قاعدة البيانات غير محدثة. شغّل migrations ثم أعد تشغيل السيرفر');
    }
    if (msg) {
      return new BadRequestException(msg);
    }
    return new BadRequestException('Database error');
  }

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

    const product = await (this.prisma.product as any).findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        trackStock: true,
        category: true,
        unit: true,
        imageUrl: true,
        images: true,
        description: true,
        isActive: true,
        shopId: true,
        colors: true,
        sizes: true,
        addons: true,
        menuVariants: true,
        packOptions: true,
        furnitureMeta: {
          select: {
            unit: true,
            lengthCm: true,
            widthCm: true,
            heightCm: true,
          }
        },
      },
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

    let products: any[];
    try {
      products = await (this.prisma.product as any).findMany({
        where: {
          shopId,
          isActive: true,
          NOT: [
            { category: '__IMAGE_MAP__' },
            { category: { contains: 'IMAGE_MAP', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          trackStock: true,
          category: true,
          unit: true,
          imageUrl: true,
          isActive: true,
          shopId: true,
          furnitureMeta: {
            select: {
              unit: true,
              lengthCm: true,
              widthCm: true,
              heightCm: true,
            }
          },
        },
        ...(pagination ? pagination : {}),
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[ProductService.listByShop] Prisma query failed', { shopId, error: e });
      throw this.mapDbErrorToBadRequest(e);
    }

    try {
      await this.redis.set(cacheKey, products, 600);
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
    try {
      return await (this.prisma.product as any).findMany({
        where: {
          shopId,
          NOT: [
            { category: '__IMAGE_MAP__' },
            { category: { contains: 'IMAGE_MAP', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          trackStock: true,
          category: true,
          unit: true,
          imageUrl: true,
          isActive: true,
          shopId: true,
          furnitureMeta: {
            select: {
              unit: true,
              lengthCm: true,
              widthCm: true,
              heightCm: true,
            }
          },
        },
        ...(pagination ? pagination : {}),
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[ProductService.listByShopForManage] Prisma query failed', { shopId, error: e });
      throw this.mapDbErrorToBadRequest(e);
    }
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

    let products: any[];
    try {
      products = await (this.prisma.product as any).findMany({
        where: {
          isActive: true,
          NOT: [
            { category: '__IMAGE_MAP__' },
            { category: { contains: 'IMAGE_MAP', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          trackStock: true,
          category: true,
          unit: true,
          imageUrl: true,
          isActive: true,
          shopId: true,
          furnitureMeta: {
            select: {
              unit: true,
              lengthCm: true,
              widthCm: true,
              heightCm: true,
            }
          },
        },
        ...(pagination ? pagination : {}),
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[ProductService.listAllActive] Prisma query failed', { error: e });
      throw this.mapDbErrorToBadRequest(e);
    }

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
    unit?: string;
    imageUrl?: string | null;
    description?: string | null;
    trackStock?: boolean;
    images?: any;
    colors?: any;
    sizes?: any;
    addons?: any;
    packOptions?: any;
    menuVariants?: any;
    isActive?: boolean;
    furnitureMeta?: { unit?: string; lengthCm?: number; widthCm?: number; heightCm?: number };
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

    const created = await (this.prisma as any).$transaction(async (tx: any) => {
      const p = await tx.product.create({
        data: {
          shopId: input.shopId,
          name: input.name,
          price: input.price,
          stock: input.stock ?? 0,
          trackStock: resolvedTrackStock,
          category: input.category || 'عام',
          unit: typeof input.unit === 'string' ? input.unit : undefined,
          packOptions: typeof input.packOptions === 'undefined' ? undefined : input.packOptions,
          imageUrl: input.imageUrl || null,
          images: typeof input.images === 'undefined' ? undefined : input.images,
          colors: typeof input.colors === 'undefined' ? undefined : input.colors,
          sizes: typeof input.sizes === 'undefined' ? undefined : input.sizes,
          addons: typeof input.addons === 'undefined' ? undefined : input.addons,
          menuVariants: typeof input.menuVariants === 'undefined' ? undefined : input.menuVariants,
          description: input.description || null,
          isActive: typeof input.isActive === 'boolean' ? input.isActive : true,
        } as any,
      });

      if (input.furnitureMeta && typeof input.furnitureMeta === 'object') {
        const unit = typeof input.furnitureMeta.unit === 'string' ? input.furnitureMeta.unit.trim() : undefined;
        const lengthCm = typeof input.furnitureMeta.lengthCm === 'number' ? input.furnitureMeta.lengthCm : undefined;
        const widthCm = typeof input.furnitureMeta.widthCm === 'number' ? input.furnitureMeta.widthCm : undefined;
        const heightCm = typeof input.furnitureMeta.heightCm === 'number' ? input.furnitureMeta.heightCm : undefined;
        await tx.productFurnitureMeta.create({
          data: {
            productId: p.id,
            unit: unit || null,
            lengthCm: typeof lengthCm === 'number' ? lengthCm : null,
            widthCm: typeof widthCm === 'number' ? widthCm : null,
            heightCm: typeof heightCm === 'number' ? heightCm : null,
          } as any,
        });
      }

      return await (tx.product as any).findUnique({
        where: { id: p.id },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          trackStock: true,
          category: true,
          unit: true,
          imageUrl: true,
          images: true,
          description: true,
          isActive: true,
          shopId: true,
          colors: true,
          sizes: true,
          addons: true,
          menuVariants: true,
          packOptions: true,
          furnitureMeta: {
            select: {
              unit: true,
              lengthCm: true,
              widthCm: true,
              heightCm: true,
            }
          },
        },
      });
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

  async importDrafts(
    shopId: string,
    items: Array<{
      name: string;
      price: number;
      stock?: number;
      category?: string;
      unit?: string;
      packOptions?: any;
      description?: string | null;
      colors?: any;
      sizes?: any;
      furnitureMeta?: { unit?: string; lengthCm?: number; widthCm?: number; heightCm?: number } | null;
    }>,
    actor: { role: string; shopId?: string },
  ) {
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && actor?.shopId !== shopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const normalized = (Array.isArray(items) ? items : [])
      .map((it) => {
        const name = String(it?.name || '').trim();
        const price = Number(it?.price);
        const stockRaw = typeof it?.stock === 'undefined' ? undefined : Number(it.stock);
        const stock = typeof stockRaw === 'number' && Number.isFinite(stockRaw) && stockRaw >= 0 ? Math.floor(stockRaw) : 0;
        const category = typeof it?.category === 'string' && it.category.trim() ? it.category.trim() : 'عام';
        const unit = typeof it?.unit === 'string' && it.unit.trim() ? it.unit.trim() : undefined;
        const packOptions = typeof (it as any)?.packOptions === 'undefined' ? undefined : (it as any).packOptions;
        const description = typeof it?.description === 'string' ? it.description : null;
        const colors = Array.isArray(it?.colors) ? it.colors : undefined;
        const sizes = Array.isArray(it?.sizes) ? it.sizes : undefined;

        const furnitureMetaRaw = typeof (it as any)?.furnitureMeta === 'undefined' ? undefined : (it as any).furnitureMeta;
        const furnitureMeta = (() => {
          if (typeof furnitureMetaRaw === 'undefined') return undefined;
          if (furnitureMetaRaw === null) return null;
          if (!furnitureMetaRaw || typeof furnitureMetaRaw !== 'object') return undefined;
          const u = typeof (furnitureMetaRaw as any)?.unit === 'string' ? String((furnitureMetaRaw as any).unit).trim() : undefined;
          const lengthCm = typeof (furnitureMetaRaw as any)?.lengthCm === 'number' ? (furnitureMetaRaw as any).lengthCm : undefined;
          const widthCm = typeof (furnitureMetaRaw as any)?.widthCm === 'number' ? (furnitureMetaRaw as any).widthCm : undefined;
          const heightCm = typeof (furnitureMetaRaw as any)?.heightCm === 'number' ? (furnitureMetaRaw as any).heightCm : undefined;

          const normalizeDim = (n: any) => {
            if (typeof n === 'undefined') return undefined;
            if (!Number.isFinite(n) || n <= 0) return '__INVALID__';
            return Math.round(Number(n) * 100) / 100;
          };

          const l = normalizeDim(lengthCm);
          const w = normalizeDim(widthCm);
          const h = normalizeDim(heightCm);
          if (l === '__INVALID__' || w === '__INVALID__' || h === '__INVALID__') return '__INVALID__';

          return {
            unit: u || undefined,
            lengthCm: typeof l === 'number' ? l : undefined,
            widthCm: typeof w === 'number' ? w : undefined,
            heightCm: typeof h === 'number' ? h : undefined,
          };
        })();

        if (furnitureMeta === '__INVALID__') return null;

        if (!name) return null;
        if (!Number.isFinite(price) || price < 0) return null;

        return { name, price, stock, category, unit, packOptions, description, colors, sizes, furnitureMeta };
      })
      .filter(Boolean) as Array<{ name: string; price: number; stock: number; category: string; unit?: string; packOptions?: any; description: string | null; colors?: any; sizes?: any; furnitureMeta?: { unit?: string; lengthCm?: number; widthCm?: number; heightCm?: number } | null }>;

    if (!normalized.length) {
      throw new BadRequestException('items مطلوبة');
    }

    let res: any;
    try {
      res = await (this.prisma as any).$transaction(async (tx: any) => {
        const created: any[] = [];
        const updated: any[] = [];

        for (const it of normalized) {
          const existing = await tx.product.findFirst({
            where: { shopId, name: it.name },
            select: { id: true, isActive: true },
          });

          if (!existing) {
            const c = await tx.product.create({
              data: {
                shopId,
                name: it.name,
                price: it.price,
                stock: it.stock,
                category: it.category,
                unit: typeof (it as any)?.unit === 'string' ? (it as any).unit : undefined,
                packOptions: typeof (it as any)?.packOptions === 'undefined' ? undefined : (it as any).packOptions,
                description: it.description,
                imageUrl: null,
                isActive: true,
                ...(it.colors !== undefined ? { colors: it.colors } : {}),
                ...(it.sizes !== undefined ? { sizes: it.sizes } : {}),
              },
            });

            if (it.furnitureMeta && typeof it.furnitureMeta === 'object') {
              const unit = typeof it.furnitureMeta.unit === 'string' ? it.furnitureMeta.unit.trim() : undefined;
              const lengthCm = typeof it.furnitureMeta.lengthCm === 'number' ? it.furnitureMeta.lengthCm : undefined;
              const widthCm = typeof it.furnitureMeta.widthCm === 'number' ? it.furnitureMeta.widthCm : undefined;
              const heightCm = typeof it.furnitureMeta.heightCm === 'number' ? it.furnitureMeta.heightCm : undefined;
              await tx.productFurnitureMeta.create({
                data: {
                  productId: c.id,
                  unit: unit || null,
                  lengthCm: typeof lengthCm === 'number' ? lengthCm : null,
                  widthCm: typeof widthCm === 'number' ? widthCm : null,
                  heightCm: typeof heightCm === 'number' ? heightCm : null,
                } as any,
              });
            }

            const resolved = await tx.product.findUnique({
              where: { id: c.id },
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                trackStock: true,
                category: true,
                unit: true,
                imageUrl: true,
                images: true,
                description: true,
                isActive: true,
                shopId: true,
                colors: true,
                sizes: true,
                addons: true,
                menuVariants: true,
                packOptions: true,
                furnitureMeta: {
                  select: {
                    unit: true,
                    lengthCm: true,
                    widthCm: true,
                    heightCm: true,
                  }
                },
              },
            });
            created.push(resolved || c);
            continue;
          }

          const u = await tx.product.update({
            where: { id: existing.id },
            data: {
              price: it.price,
              stock: it.stock,
              category: it.category,
              unit: typeof (it as any)?.unit === 'string' ? (it as any).unit : undefined,
              packOptions: typeof (it as any)?.packOptions === 'undefined' ? undefined : (it as any).packOptions,
              description: it.description,
              ...(it.colors !== undefined ? { colors: it.colors } : {}),
              ...(it.sizes !== undefined ? { sizes: it.sizes } : {}),
              ...(existing.isActive === false ? { isActive: true } : {}),
            },
          });

          if (it.furnitureMeta === null) {
            await tx.productFurnitureMeta.deleteMany({ where: { productId: existing.id } });
          } else if (typeof it.furnitureMeta !== 'undefined') {
            const unit = typeof it.furnitureMeta?.unit === 'string' ? it.furnitureMeta.unit.trim() : undefined;
            const lengthCm = typeof it.furnitureMeta?.lengthCm === 'number' ? it.furnitureMeta.lengthCm : undefined;
            const widthCm = typeof it.furnitureMeta?.widthCm === 'number' ? it.furnitureMeta.widthCm : undefined;
            const heightCm = typeof it.furnitureMeta?.heightCm === 'number' ? it.furnitureMeta.heightCm : undefined;
            await tx.productFurnitureMeta.upsert({
              where: { productId: existing.id },
              create: {
                productId: existing.id,
                unit: unit || null,
                lengthCm: typeof lengthCm === 'number' ? lengthCm : null,
                widthCm: typeof widthCm === 'number' ? widthCm : null,
                heightCm: typeof heightCm === 'number' ? heightCm : null,
              } as any,
              update: {
                unit: unit || null,
                lengthCm: typeof lengthCm === 'number' ? lengthCm : null,
                widthCm: typeof widthCm === 'number' ? widthCm : null,
                heightCm: typeof heightCm === 'number' ? heightCm : null,
              } as any,
            });
          }

          const resolved = await tx.product.findUnique({
            where: { id: existing.id },
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              trackStock: true,
              category: true,
              unit: true,
              imageUrl: true,
              images: true,
              description: true,
              isActive: true,
              shopId: true,
              colors: true,
              sizes: true,
              addons: true,
              menuVariants: true,
              packOptions: true,
              furnitureMeta: {
                select: {
                  unit: true,
                  lengthCm: true,
                  widthCm: true,
                  heightCm: true,
                }
              },
            },
          });
          updated.push(resolved);
        }

        return { created, updated };
      });
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'Database error';
      if (msg.toLowerCase().includes('column') || msg.toLowerCase().includes('does not exist')) {
        throw new BadRequestException('قاعدة البيانات غير محدثة. شغّل migrations ثم أعد تشغيل السيرفر');
      }
      throw new BadRequestException(msg);
    }

    try {
      await this.redis.invalidatePattern('products:*');
    } catch {
    }

    return res;
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
    unit?: string;
    imageUrl?: string;
    description?: string;
    trackStock?: boolean;
    images?: any;
    colors?: any;
    sizes?: any;
    addons?: any;
    packOptions?: any;
    menuVariants?: any;
    isActive?: boolean;
    furnitureMeta?: { unit?: string; lengthCm?: number; widthCm?: number; heightCm?: number } | null;
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
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.trackStock !== undefined) updateData.trackStock = data.trackStock;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.colors !== undefined) updateData.colors = data.colors;
    if (data.sizes !== undefined) updateData.sizes = data.sizes;
    if (data.addons !== undefined) updateData.addons = data.addons;
    if (data.packOptions !== undefined) updateData.packOptions = data.packOptions;
    if (data.menuVariants !== undefined) updateData.menuVariants = data.menuVariants;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await (this.prisma as any).$transaction(async (tx: any) => {
      await tx.product.update({
        where: { id: productId },
        data: updateData,
      });

      if (data.furnitureMeta === null) {
        await tx.productFurnitureMeta.deleteMany({ where: { productId } });
      } else if (typeof data.furnitureMeta !== 'undefined') {
        const unit = typeof data.furnitureMeta?.unit === 'string' ? data.furnitureMeta.unit.trim() : undefined;
        const lengthCm = typeof data.furnitureMeta?.lengthCm === 'number' ? data.furnitureMeta.lengthCm : undefined;
        const widthCm = typeof data.furnitureMeta?.widthCm === 'number' ? data.furnitureMeta.widthCm : undefined;
        const heightCm = typeof data.furnitureMeta?.heightCm === 'number' ? data.furnitureMeta.heightCm : undefined;
        await tx.productFurnitureMeta.upsert({
          where: { productId },
          create: {
            productId,
            unit: unit || null,
            lengthCm: typeof lengthCm === 'number' ? lengthCm : null,
            widthCm: typeof widthCm === 'number' ? widthCm : null,
            heightCm: typeof heightCm === 'number' ? heightCm : null,
          } as any,
          update: {
            unit: unit || null,
            lengthCm: typeof lengthCm === 'number' ? lengthCm : null,
            widthCm: typeof widthCm === 'number' ? widthCm : null,
            heightCm: typeof heightCm === 'number' ? heightCm : null,
          } as any,
        });
      }

      return await (tx.product as any).findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          trackStock: true,
          category: true,
          unit: true,
          imageUrl: true,
          images: true,
          description: true,
          isActive: true,
          shopId: true,
          colors: true,
          sizes: true,
          addons: true,
          menuVariants: true,
          packOptions: true,
          furnitureMeta: {
            select: {
              unit: true,
              lengthCm: true,
              widthCm: true,
              heightCm: true,
            }
          },
        },
      });
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

    let deleted: any;
    try {
      deleted = await this.prisma.product.delete({
        where: { id: productId },
      });
    } catch {
      deleted = await this.prisma.product.update({
        where: { id: productId },
        data: { isActive: false },
      });
    }

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
