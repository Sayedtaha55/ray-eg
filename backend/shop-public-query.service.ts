import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { MonitoringService } from './monitoring/monitoring.service';

@Injectable()
export class ShopPublicQueryService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(MonitoringService) private readonly monitoring: MonitoringService,
  ) {}

  private dedupeProductsById(items: any[]) {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const p of Array.isArray(items) ? items : []) {
      const id = p?.id != null ? String(p.id).trim() : '';
      if (!id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(p);
    }
    return out;
  }

  private isImageMapCategory(value: any) {
    const normalized = String(value || '').trim().toUpperCase();
    return normalized === '__IMAGE_MAP__' || normalized.includes('IMAGE_MAP');
  }

  private normalizeProductNameKey(value: any) {
    return String(value || '').trim().toLowerCase();
  }

  private stripPublicDisabledShop(shop: any) {
    if (!shop || typeof shop !== 'object') return shop;
    if ((shop as any)?.publicDisabled !== true) return shop;

    return {
      ...(shop as any),
      products: [],
      offers: [],
      gallery: [],
    };
  }

  async getShopBySlug(slug: string) {
    const startTime = Date.now();

    try {
      const raw = String(slug || '').trim();
      const isProbablyUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
      const isProbablyCuid = /^c[a-z0-9]{20,}$/i.test(raw);
      const shouldTryIdLookup = isProbablyUuid || isProbablyCuid;

      try {
        const cachedShop = await this.redis.getShopBySlug(slug);
        if (cachedShop) {
          if ((cachedShop as any)?.isActive === false) {
            return null;
          }

          const normalizedCached = this.stripPublicDisabledShop(cachedShop);
          if (normalizedCached && Array.isArray((normalizedCached as any).products)) {
            const sid = (normalizedCached as any)?.id ? String((normalizedCached as any).id).trim() : '';

          // ⚡ Bolt: Fetch linked hotspots and label keys concurrently to minimize latency on cache hits.
          const [linkedIds, labelKeys] = await Promise.all([
            (this.prisma as any).shopImageHotspot
              .findMany({
                where: { productId: { not: null }, map: { shopId: sid } },
                select: { productId: true },
              })
              .then((rows: any) =>
                new Set(
                  (Array.isArray(rows) ? rows : [])
                    .map((r: any) => (r?.productId != null ? String(r.productId).trim() : ''))
                    .filter(Boolean),
                ),
              )
              .catch(() => new Set<string>()),
            (this.prisma as any).shopImageHotspot
              .findMany({
                where: { map: { shopId: sid, isActive: true } },
                select: { label: true },
              })
              .then((rows: any) =>
                new Set(
                  (Array.isArray(rows) ? rows : [])
                    .map((r: any) => this.normalizeProductNameKey((r as any)?.label))
                    .filter(Boolean),
                ),
              )
              .catch(() => new Set<string>()),
          ]);

            const deduped = this.dedupeProductsById((normalizedCached as any).products);
            (normalizedCached as any).products = deduped.filter((p: any) => {
              const id = p?.id != null ? String(p.id).trim() : '';
              if (id && linkedIds.has(id)) return false;
              if (this.isImageMapCategory((p as any)?.category)) return false;
              const nameKey = this.normalizeProductNameKey((p as any)?.name);
              if (nameKey && labelKeys.has(nameKey)) return false;
              return true;
            });
          }
          const owner = (cachedShop as any)?.owner;
          if (owner && ((owner as any)?.isActive === false || Boolean((owner as any)?.deactivatedAt))) {
            return null;
          }
          const duration = Date.now() - startTime;
          this.monitoring.trackCache('getShopBySlug', `shop:slug:${slug}`, true, duration);
          this.monitoring.trackPerformance('getShopBySlug_cached', duration);
          return normalizedCached;
        }
        this.monitoring.trackCache('getShopBySlug', `shop:slug:${slug}`, false, Date.now() - startTime);
      } catch {
      }

      const include = {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            deactivatedAt: true,
          },
        },
        products: {
          where: {
            isActive: true,
            NOT: [
              { category: '__IMAGE_MAP__' },
              { category: { contains: 'IMAGE_MAP' } },
              { category: '__DUPLICATE__AUTO__' },
            ],
          },
          take: 10,
          include: {
            furnitureMeta: {
              select: {
                unit: true,
                lengthCm: true,
                widthCm: true,
                heightCm: true,
              },
            },
          },
        },
        offers: {
          where: { isActive: true },
          take: 5,
        },
        gallery: {
          take: 6,
        },
      };

      const shopBySlug = await this.prisma.shop.findUnique({
        where: { slug: raw },
        include,
      });

      const shop = shopBySlug
        ? shopBySlug
        : shouldTryIdLookup
          ? await this.prisma.shop.findUnique({
              where: { id: raw },
              include,
            })
          : null;

      if ((shop as any)?.isActive === false) {
        return null;
      }

      const normalizedShop = this.stripPublicDisabledShop(shop);

      if (normalizedShop && Array.isArray((normalizedShop as any).products)) {
        const sid = (normalizedShop as any)?.id ? String((normalizedShop as any).id).trim() : '';

        // ⚡ Bolt: Fetch linked hotspots and label keys concurrently to minimize latency.
        const [linkedIds, labelKeys] = await Promise.all([
          (this.prisma as any).shopImageHotspot
            .findMany({
              where: { productId: { not: null }, map: { shopId: sid } },
              select: { productId: true },
            })
            .then((rows: any) =>
              new Set(
                (Array.isArray(rows) ? rows : [])
                  .map((r: any) => (r?.productId != null ? String(r.productId).trim() : ''))
                  .filter(Boolean),
              ),
            )
            .catch(() => new Set<string>()),
          (this.prisma as any).shopImageHotspot
            .findMany({
              where: { map: { shopId: sid, isActive: true } },
              select: { label: true },
            })
            .then((rows: any) =>
              new Set(
                (Array.isArray(rows) ? rows : [])
                  .map((r: any) => this.normalizeProductNameKey((r as any)?.label))
                  .filter(Boolean),
              ),
            )
            .catch(() => new Set<string>()),
        ]);

        const deduped = this.dedupeProductsById((normalizedShop as any).products);
        (normalizedShop as any).products = deduped.filter((p: any) => {
          const id = p?.id != null ? String(p.id).trim() : '';
          if (id && linkedIds.has(id)) return false;
          if (this.isImageMapCategory((p as any)?.category)) return false;
          const nameKey = this.normalizeProductNameKey((p as any)?.name);
          if (nameKey && labelKeys.has(nameKey)) return false;
          return true;
        });
      }

      const owner = (shop as any)?.owner;
      if (owner && ((owner as any)?.isActive === false || Boolean((owner as any)?.deactivatedAt))) {
        return null;
      }

      if (normalizedShop) {
        try {
          await this.redis.cacheShop((normalizedShop as any).id, normalizedShop as any, 3600);
        } catch {
        }
      }

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findUnique', 'shops', duration, true);
      this.monitoring.trackPerformance('getShopBySlug_database', duration);

      return normalizedShop;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findUnique', 'shops', duration, false);
      throw error;
    }
  }
}
