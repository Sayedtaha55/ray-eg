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
          const owner = (cachedShop as any)?.owner;
          if (owner && ((owner as any)?.isActive === false || Boolean((owner as any)?.deactivatedAt))) {
            return null;
          }
          const duration = Date.now() - startTime;
          this.monitoring.trackCache('getShopBySlug', `shop:slug:${slug}`, true, duration);
          this.monitoring.trackPerformance('getShopBySlug_cached', duration);
          return cachedShop;
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

      const owner = (shop as any)?.owner;
      if (owner && ((owner as any)?.isActive === false || Boolean((owner as any)?.deactivatedAt))) {
        return null;
      }

      if (shop) {
        try {
          await this.redis.cacheShop((shop as any).id, shop as any, 3600);
        } catch {
        }
      }

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findUnique', 'shops', duration, true);
      this.monitoring.trackPerformance('getShopBySlug_database', duration);

      return shop;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findUnique', 'shops', duration, false);
      throw error;
    }
  }
}
