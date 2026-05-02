import { Module, forwardRef } from '@nestjs/common';
import { ShopController } from '@modules/shop/shop.controller';
import { ShopService } from '@modules/shop/shop.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { RedisModule } from '@common/redis/redis.module';
import { RedisService } from '@common/redis/redis.service';
import { MonitoringModule } from '@common/monitoring/monitoring.module';
import { MonitoringService } from '@common/monitoring/monitoring.service';
import { MediaModule } from '@modules/media/media.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { EmailModule } from '@modules/email/email.module';
import { EmailService } from '@modules/email/email.service';
import { AuthModule } from '@modules/auth/auth.module';
import { MediaCompressionService } from '@modules/media/media-compression.service';
import { ShopModulesService } from './shop-modules.service';
import { ShopSlugService } from './shop-slug.service';
import { ShopSitemapService } from './shop-sitemap.service';
import { ShopMediaService } from './shop-media.service';
import { ShopSettingsService } from './shop-settings.service';
import { ShopPublicQueryService } from './shop-public-query.service';
import { ShopAnalyticsService } from './shop-analytics.service';

const shopImportsRaw = String(process.env.SHOP_IMPORTS || '').trim().toLowerCase();
const shopImports = new Set(
  shopImportsRaw
    ? shopImportsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [],
);
const includeAllShopImports = shopImports.size === 0;
const isShopImportsOverride = shopImportsRaw.length > 0;

@Module({
  imports: [
    PrismaModule,
    ...(includeAllShopImports || shopImports.has('redis') ? [RedisModule] : []),
    ...(includeAllShopImports || shopImports.has('media') ? [MediaModule] : []),
    ...(includeAllShopImports || shopImports.has('notification') ? [forwardRef(() => NotificationModule)] : []),
    ...(includeAllShopImports || shopImports.has('email') ? [EmailModule] : []),
    forwardRef(() => AuthModule),
    ...(includeAllShopImports || shopImports.has('monitoring') ? [MonitoringModule] : []),
  ],
  controllers: [ShopController],
  providers: [
    ShopService,
    ShopModulesService,
    ShopSlugService,
    ShopSitemapService,
    ShopMediaService,
    ShopSettingsService,
    ShopPublicQueryService,
    ShopAnalyticsService,
    ...(!includeAllShopImports && isShopImportsOverride && !shopImports.has('monitoring')
      ? [
          {
            provide: MonitoringService,
            useValue: {
              trackPerformance: () => undefined,
              trackDatabase: () => undefined,
              logBusiness: () => undefined,
              addHealthCheck: () => undefined,
            },
          },
        ]
      : []),
    ...(!includeAllShopImports && isShopImportsOverride && !shopImports.has('redis')
      ? [
          {
            provide: RedisService,
            useValue: {
              set: async () => undefined,
              get: async () => null,
              del: async () => undefined,
              exists: async () => false,
              expire: async () => undefined,
              invalidatePattern: async () => undefined,
              getMultiple: async (keys: string[]) => keys.map(() => null),
              setMultiple: async () => undefined,
              cacheShop: async () => undefined,
              getShop: async () => null,
              getShopBySlug: async () => null,
              cacheShopsList: async () => undefined,
              getShopsList: async () => null,
              cacheProduct: async () => undefined,
              getProduct: async () => null,
              invalidateShopCache: async () => undefined,
              invalidateProductCache: async () => undefined,
              incrementCounter: async () => 0,
              getCounter: async () => 0,
              ping: async () => false,
            },
          },
        ]
      : []),
    ...(!includeAllShopImports && isShopImportsOverride && !shopImports.has('email')
      ? [
          {
            provide: EmailService,
            useValue: {
              sendMail: async () => ({ ok: false, skipped: true }),
            },
          },
        ]
      : []),
    ...(!includeAllShopImports && isShopImportsOverride && !shopImports.has('media')
      ? [
          {
            provide: MediaCompressionService,
            useValue: {
              ensureDir: () => undefined,
              writeWebpVariants: async () => ({}),
              optimizeVideoMp4: async () => {
                throw new Error('MediaCompressionService disabled by SHOP_IMPORTS');
              },
              optimizeVideoWebm: async () => {
                throw new Error('MediaCompressionService disabled by SHOP_IMPORTS');
              },
              generateVideoThumbnailWebp: async () => {
                throw new Error('MediaCompressionService disabled by SHOP_IMPORTS');
              },
              getVideoDuration: async () => null,
            },
          },
        ]
      : []),
  ],
  exports: [ShopService],
})
export class ShopModule {}
