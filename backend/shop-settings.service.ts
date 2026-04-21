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
      publicDisabled?: boolean;
      deliveryDisabled?: boolean;
      dashboardMode?: string;
      enabledModules?: any;
      receiptTheme?: {
        shopName?: string;
        phone?: string;
        city?: string;
        address?: string;
        logoDataUrl?: string;
        footerNote?: string;
        vatRatePercent?: number;
      } | null;
      notificationSoundId?: string | null;
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

      const prevEnabledModules = (() => {
        const raw = (prevLayout as any)?.enabledModules;
        if (!Array.isArray(raw)) return [] as string[];
        return raw.map((x: any) => String(x || '').trim()).filter(Boolean);
      })();

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

      const nextEnabledModules = dashboardCfg?.enabledModules
        ? dashboardCfg.enabledModules.map((x: any) => String(x || '').trim()).filter(Boolean)
        : null;

      const removedModules = (() => {
        if (!hasDashboardUpdate) return [] as string[];
        if (!Array.isArray(prevEnabledModules)) return [] as string[];
        if (!Array.isArray(nextEnabledModules)) return [] as string[];
        const prev = new Set(prevEnabledModules.map(String));
        const next = new Set(nextEnabledModules.map(String));
        const removed: string[] = [];
        for (const id of prev) {
          if (!next.has(id)) removed.push(id);
        }
        return removed;
      })();

      const cleanupRemovedModuleData = async (moduleId: string) => {
        const id = String(moduleId || '').trim().toLowerCase();
        if (!id) return;
        const p: any = this.prisma as any;

        if (id === 'invoice') {
          if (p?.accountingInvoice?.deleteMany) {
            await p.accountingInvoice.deleteMany({ where: { shopId } });
          } else if (p?.AccountingInvoice?.deleteMany) {
            await p.AccountingInvoice.deleteMany({ where: { shopId } });
          }
          return;
        }

        if (id === 'reservations') {
          if (p?.reservation?.deleteMany) {
            await p.reservation.deleteMany({ where: { shopId } });
          } else if (p?.Reservation?.deleteMany) {
            await p.Reservation.deleteMany({ where: { shopId } });
          }
          return;
        }

        if (id === 'gallery') {
          if (p?.shopGallery?.deleteMany) {
            await p.shopGallery.deleteMany({ where: { shopId } });
          } else if (p?.ShopGallery?.deleteMany) {
            await p.ShopGallery.deleteMany({ where: { shopId } });
          }
          return;
        }

        if (id === 'customers') {
          if (p?.customer?.deleteMany) {
            await p.customer.deleteMany({ where: { shopId } });
          } else if (p?.Customer?.deleteMany) {
            await p.Customer.deleteMany({ where: { shopId } });
          }
          return;
        }

        // Booking tables exist in prisma schema but module may not be exposed as a dashboard tab.
        if (id === 'bookings') {
          if (p?.booking?.deleteMany) {
            await p.booking.deleteMany({ where: { shopId } });
          } else if (p?.Booking?.deleteMany) {
            await p.Booking.deleteMany({ where: { shopId } });
          }
          if (p?.bookingResource?.deleteMany) {
            await p.bookingResource.deleteMany({ where: { shopId } });
          } else if (p?.BookingResource?.deleteMany) {
            await p.BookingResource.deleteMany({ where: { shopId } });
          }
          return;
        }
      };

      if (removedModules.length > 0) {
        try {
          // Best effort cleanup to align with UI warning.
          // Use a transaction when available.
          const tx = (this.prisma as any)?.$transaction;
          if (typeof tx === 'function') {
            await (this.prisma as any).$transaction(async () => {
              for (const m of removedModules) {
                await cleanupRemovedModuleData(m);
              }
            });
          } else {
            for (const m of removedModules) {
              await cleanupRemovedModuleData(m);
            }
          }
        } catch {
          // ignore cleanup errors; module will still be removed from enabledModules
        }
      }

      const nextLayout = {
        ...prevLayout,
        ...(dashboardCfg ? { dashboardMode: dashboardCfg.dashboardMode, enabledModules: dashboardCfg.enabledModules } : {}),
        ...(typeof input.whatsapp === 'undefined' ? {} : { whatsapp: input.whatsapp }),
        ...(typeof input.customDomain === 'undefined' ? {} : { customDomain: input.customDomain }),
        ...(typeof input.deliveryFee === 'undefined' ? {} : { deliveryFee: input.deliveryFee }),
        ...(typeof input.receiptTheme === 'undefined'
          ? {}
          : {
              receiptTheme:
                input.receiptTheme === null
                  ? null
                  : (() => {
                      const t = (input.receiptTheme as any) || {};
                      const vatRaw = (t as any)?.vatRatePercent;
                      const vat = typeof vatRaw === 'number' ? vatRaw : Number(vatRaw);
                      const vatRatePercent = Number.isFinite(vat) ? Math.min(100, Math.max(0, vat)) : 0;
                      return {
                        shopName: typeof t.shopName === 'string' ? t.shopName : undefined,
                        phone: typeof t.phone === 'string' ? t.phone : undefined,
                        city: typeof t.city === 'string' ? t.city : undefined,
                        address: typeof t.address === 'string' ? t.address : undefined,
                        logoDataUrl: typeof t.logoDataUrl === 'string' ? t.logoDataUrl : undefined,
                        footerNote: typeof t.footerNote === 'string' ? t.footerNote : undefined,
                        vatRatePercent,
                      };
                    })(),
            }),
        ...(typeof input.notificationSoundId === 'undefined'
          ? {}
          : {
              notificationSoundId:
                input.notificationSoundId === null
                  ? null
                  : String(input.notificationSoundId || '').trim() || null,
            }),
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
          ...(typeof input.publicDisabled === 'undefined' ? {} : { publicDisabled: input.publicDisabled }),
          ...(typeof input.deliveryDisabled === 'undefined' ? {} : { deliveryDisabled: input.deliveryDisabled }),
          ...(typeof input.addons === 'undefined' ? {} : { addons: input.addons as any }),
          layoutConfig: nextLayout as any,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          category: true,
          governorate: true,
          city: true,
          address: true,
          addressDetailed: true,
          displayAddress: true,
          mapLabel: true,
          latitude: true,
          longitude: true,
          locationSource: true,
          locationAccuracy: true,
          locationUpdatedAt: true,
          phone: true,
          email: true,
          openingHours: true,
          logoUrl: true,
          bannerUrl: true,
          status: true,
          pageDesign: true,
          theme: true,
          customColors: true,
          customFonts: true,
          layoutConfig: true,
          followers: true,
          visitors: true,
          rating: true,
          isActive: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
          addons: true,
          publicDisabled: true,
          deliveryDisabled: true,
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
