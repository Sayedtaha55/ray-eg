import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { MonitoringService } from './monitoring/monitoring.service';
import { ShopMediaService } from './shop-media.service';
import { ShopModulesService } from './shop-modules.service';

@Injectable()
export class ShopSettingsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(MonitoringService) private readonly monitoring: MonitoringService,
    @Inject(ShopMediaService) private readonly shopMedia: ShopMediaService,
    @Inject(ShopModulesService) private readonly shopModules: ShopModulesService,
  ) {}

  async updateShopSettings(
    shopId: string,
    input: {
      name?: string;
      description?: string | null;
      category?: string;
      governorate?: string;
      city?: string;
      addressDetailed?: string | null;
      displayAddress?: string | null;
      mapLabel?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      locationSource?: string | null;
      locationAccuracy?: number | null;
      locationUpdatedAt?: Date | null;
      phone?: string;
      email?: string | null;
      openingHours?: string | null;
      logoUrl?: string | null;
      bannerUrl?: string | null;
      paymentConfig?: { merchantId?: string; publicKey?: string } | null;
      whatsapp?: string | null;
      customDomain?: string | null;
      addons?: any[] | null;
      deliveryFee?: number | null;
      isActive?: boolean;
      dashboardMode?: string;
      enabledModules?: any;
    },
  ) {
    const startTime = Date.now();

    const prismaAny = this.prisma as any;
    const shopDelegate = prismaAny?.shop ?? prismaAny?.Shop;
    if (!this.prisma || !shopDelegate) {
      try {
        // eslint-disable-next-line no-console
        console.error('[ShopSettingsService.updateShopSettings] prisma missing shop delegate', {
          hasPrisma: Boolean(this.prisma),
          keys: prismaAny ? Object.keys(prismaAny).slice(0, 50) : [],
        });
      } catch {
      }
      throw new BadRequestException('Prisma غير متاح أو shop model غير موجود');
    }

    try {
      const current = await shopDelegate.findUnique({
        where: { id: shopId },
        select: { id: true, slug: true, layoutConfig: true, category: true },
      });

      const logoDataUrl = typeof input.logoUrl === 'string' ? input.logoUrl : '';
      const bannerDataUrl = typeof input.bannerUrl === 'string' ? input.bannerUrl : '';

      const persistedLogo = logoDataUrl.startsWith('data:')
        ? await this.shopMedia.persistShopImageFromDataUrl({ shopId, kind: 'logo', dataUrl: logoDataUrl })
        : null;
      const persistedBanner = bannerDataUrl.startsWith('data:')
        ? await this.shopMedia.persistShopImageFromDataUrl({ shopId, kind: 'banner', dataUrl: bannerDataUrl })
        : null;

      const prevLayout = (current?.layoutConfig as any) || {};

      const normalizeDashboardConfigUpdate = (next: { category?: any; dashboardMode?: any; enabledModules?: any }) => {
        const allowedModules = this.shopModules.getAllowedDashboardModules();
        const core = this.shopModules.getCoreDashboardModules();
        const allowedForCategory = this.shopModules.getAllowedDashboardModulesForCategory(next.category);

        const requestedMode = String(next.dashboardMode || '').trim().toLowerCase();
        const mode = requestedMode === 'showcase' || requestedMode === 'manage' ? requestedMode : undefined;

        const requested = Array.isArray(next.enabledModules)
          ? next.enabledModules.map((x: any) => String(x || '').trim()).filter(Boolean)
          : [];

        const filtered = requested.filter((id: string) => allowedModules.has(id) && allowedForCategory.has(id));
        const merged = Array.from(new Set([...filtered, ...core]));

        const safeMode = (mode || ((): 'showcase' | 'manage' => {
          const cat = String(next.category || '').trim().toUpperCase();
          const manageByDefault = cat === 'RESTAURANT' || cat === 'FOOD' || cat === 'RETAIL' || cat === 'HEALTH';
          return manageByDefault ? 'manage' : 'showcase';
        })());

        let enabled = merged;

        const salesOn = enabled.includes('sales');
        if (!salesOn) {
          enabled = enabled.filter((id) => id !== 'customers' && id !== 'reports');
        }

        if (safeMode === 'showcase') {
          const disallowed = new Set(['sales', 'customers', 'reports']);
          enabled = enabled.filter((id) => !disallowed.has(id));
          return { dashboardMode: 'showcase', enabledModules: enabled };
        }

        return { dashboardMode: 'manage', enabledModules: enabled };
      };

      const hasDashboardUpdate = typeof input.dashboardMode !== 'undefined' || typeof input.enabledModules !== 'undefined';

      const dashboardCfg = hasDashboardUpdate
        ? normalizeDashboardConfigUpdate({
            category: typeof input.category === 'undefined' ? (current as any)?.category : input.category,
            dashboardMode: input.dashboardMode,
            enabledModules: input.enabledModules,
          })
        : null;

      const nextLayout = {
        ...prevLayout,
        ...(dashboardCfg ? { dashboardMode: dashboardCfg.dashboardMode, enabledModules: dashboardCfg.enabledModules } : {}),
        ...(typeof input.whatsapp === 'undefined' ? {} : { whatsapp: input.whatsapp }),
        ...(typeof input.customDomain === 'undefined' ? {} : { customDomain: input.customDomain }),
        ...(typeof input.deliveryFee === 'undefined' ? {} : { deliveryFee: input.deliveryFee }),
        ...(typeof input.paymentConfig === 'undefined'
          ? {}
          : {
              paymentConfig: input.paymentConfig
                ? {
                    merchantId: String((input.paymentConfig as any)?.merchantId || '').trim(),
                    publicKey: String((input.paymentConfig as any)?.publicKey || '').trim(),
                  }
                : null,
            }),
        ...(persistedLogo?.thumbUrl ? { logoThumbUrl: persistedLogo.thumbUrl } : {}),
        ...(persistedBanner?.thumbUrl ? { bannerThumbUrl: persistedBanner.thumbUrl } : {}),
        ...(persistedBanner?.mdUrl ? { bannerMediumUrl: persistedBanner.mdUrl } : {}),
      };

      const updated = await shopDelegate.update({
        where: { id: shopId },
        data: {
          ...(typeof input.name === 'undefined' ? {} : { name: input.name }),
          ...(typeof input.description === 'undefined' ? {} : { description: input.description || null }),
          ...(typeof input.category === 'undefined' ? {} : { category: input.category as any }),
          ...(typeof input.governorate === 'undefined' ? {} : { governorate: input.governorate }),
          ...(typeof input.city === 'undefined' ? {} : { city: input.city }),
          ...(typeof input.addressDetailed === 'undefined' ? {} : { addressDetailed: input.addressDetailed }),
          ...(typeof input.displayAddress === 'undefined' ? {} : { displayAddress: input.displayAddress }),
          ...(typeof input.mapLabel === 'undefined' ? {} : { mapLabel: input.mapLabel }),
          ...(typeof input.latitude === 'undefined' ? {} : { latitude: input.latitude }),
          ...(typeof input.longitude === 'undefined' ? {} : { longitude: input.longitude }),
          ...(typeof input.locationSource === 'undefined' ? {} : { locationSource: input.locationSource }),
          ...(typeof input.locationAccuracy === 'undefined' ? {} : { locationAccuracy: input.locationAccuracy }),
          ...(typeof input.locationUpdatedAt === 'undefined' ? {} : { locationUpdatedAt: input.locationUpdatedAt }),
          ...(typeof input.phone === 'undefined' ? {} : { phone: input.phone }),
          ...(typeof input.email === 'undefined' ? {} : { email: input.email }),
          ...(typeof input.openingHours === 'undefined' ? {} : { openingHours: input.openingHours }),
          ...(typeof input.logoUrl === 'undefined'
            ? {}
            : { logoUrl: persistedLogo?.optUrl ? persistedLogo.optUrl : input.logoUrl }),
          ...(typeof input.bannerUrl === 'undefined'
            ? {}
            : { bannerUrl: persistedBanner?.optUrl ? persistedBanner.optUrl : input.bannerUrl }),
          ...(typeof input.isActive === 'undefined' ? {} : { isActive: input.isActive }),
          ...(typeof input.addons === 'undefined' ? {} : { addons: input.addons as any }),
          layoutConfig: nextLayout as any,
        },
      });

      try {
        await this.redis?.invalidateShopCache?.(updated.id, updated.slug);
      } catch {
      }

      const duration = Date.now() - startTime;
      this.monitoring?.trackDatabase?.('update', 'shops', duration, true);
      this.monitoring?.trackPerformance?.('updateShopSettings_database', duration);

      return updated;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring?.trackDatabase?.('update', 'shops', duration, false);
      if (error instanceof BadRequestException) throw error;
      throw error;
    }
  }
}
