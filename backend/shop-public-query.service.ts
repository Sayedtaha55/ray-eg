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
          where: { isActive: true },
          take: 10,
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
