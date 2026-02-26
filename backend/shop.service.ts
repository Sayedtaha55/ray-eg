import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { MonitoringService } from './monitoring/monitoring.service';
import { MediaCompressionService } from './media-compression.service';
import { EmailService } from './email.service';
import { CreateShopDto, ShopCategory } from './create-shop.dto';
import { ShopSettingsService } from './shop-settings.service';
import { ShopPublicQueryService } from './shop-public-query.service';
import { createHash } from 'crypto';
import { ShopMediaService } from './shop-media.service';
import { ShopAnalyticsService } from './shop-analytics.service';

@Injectable()
export class ShopService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(MonitoringService) private readonly monitoring: MonitoringService,
    @Inject(MediaCompressionService) private readonly media: MediaCompressionService,
    @Inject(EmailService) private readonly email: EmailService,
    @Inject(ShopSettingsService) private readonly shopSettings: ShopSettingsService,
    @Inject(ShopPublicQueryService) private readonly shopPublicQuery: ShopPublicQueryService,
    @Inject(ShopMediaService) private readonly shopMedia: ShopMediaService,
    @Inject(ShopAnalyticsService) private readonly shopAnalytics: ShopAnalyticsService,
  ) {}

  private get upgradeRequests() {
    return (this.prisma as any).shopModuleUpgradeRequest as any;
  }

  private getAllowedDashboardModules() {
    return new Set([
      'overview',
      'products',
      'promotions',
      'builder',
      'settings',
      'gallery',
      'reservations',
      'invoice',
      'sales',
      'customers',
      'reports',
      'pos',
    ]);
  }

  private getCoreDashboardModules() {
    return ['overview', 'products', 'promotions', 'builder', 'settings'];
  }

  private getAllowedDashboardModulesForCategory(categoryRaw: any) {
    const cat = String(categoryRaw || '').trim().toUpperCase();
    const core = this.getCoreDashboardModules();
    const always = new Set<string>(core);
    always.add('gallery');
    always.add('reservations');

    const add = (...ids: string[]) => {
      for (const id of ids) always.add(id);
    };

    // Keep this mapping aligned with frontend ACTIVITY_CONFIGS.
    if (cat === 'RESTAURANT') {
      add('reservations', 'sales', 'customers', 'reports', 'pos', 'invoice');
      return always;
    }
    if (cat === 'SERVICE') {
      add('reservations', 'sales', 'customers', 'reports', 'pos', 'invoice');
      return always;
    }
    if (cat === 'FASHION') {
      add('sales', 'customers', 'reports', 'pos', 'invoice');
      return always;
    }
    if (cat === 'RETAIL' || cat === 'ELECTRONICS' || cat === 'HEALTH' || cat === 'FOOD') {
      add('sales', 'customers', 'reports', 'pos', 'invoice');
      return always;
    }

    // Default: be permissive for unknown/new categories to support future activities.
    // Keep this aligned with frontend ACTIVITY_CONFIGS, but don't block merchants by default.
    add('sales', 'customers', 'reports', 'pos', 'invoice');
    return always;
  }

  private normalizeRequestedModules(raw: any) {
    const list = Array.isArray(raw) ? raw : [];
    const allowed = this.getAllowedDashboardModules();
    const core = this.getCoreDashboardModules();
    const normalized = list
      .map((x) => String(x || '').trim())
      .filter(Boolean)
      .filter((id) => allowed.has(id));
    return Array.from(new Set(normalized));
  }

  private getDefaultDashboardConfigForCategory(categoryRaw: any) {
    const cat = String(categoryRaw || '').trim().toUpperCase();
    const core = ['overview', 'products', 'promotions', 'builder', 'settings'];
    const manageByDefault =
      cat === 'RESTAURANT' ||
      cat === 'FOOD' ||
      cat === 'RETAIL' ||
      cat === 'HEALTH';

    return {
      dashboardMode: manageByDefault ? 'manage' : 'showcase',
      enabledModules: core,
    };
  }

  async createModuleUpgradeRequest(input: {
    shopId: string;
    requestedModules: any;
    requestedByUserId?: string | null;
  }) {
    const shopId = String(input?.shopId || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    const requestedByUserId = input?.requestedByUserId ? String(input.requestedByUserId).trim() : null;

    const requestedModules = this.normalizeRequestedModules(input?.requestedModules);
    if (requestedModules.length === 0) throw new BadRequestException('requestedModules مطلوب');

    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true, slug: true, category: true, layoutConfig: true },
    });
    if (!shop) throw new NotFoundException('المتجر غير موجود');

    const allowedForCategory = this.getAllowedDashboardModulesForCategory((shop as any)?.category);
    const requestedAllowed = requestedModules.filter((m) => allowedForCategory.has(m));
    if (requestedAllowed.length === 0) {
      throw new BadRequestException('الأزرار المطلوبة غير متاحة لهذا النشاط');
    }

    const prevLayout = (shop.layoutConfig as any) || {};
    const prevEnabled = Array.isArray(prevLayout?.enabledModules)
      ? prevLayout.enabledModules.map((x: any) => String(x || '').trim()).filter(Boolean)
      : [];
    const enabledSet = new Set(prevEnabled);
    const pendingModules = requestedAllowed.filter((m) => !enabledSet.has(m));
    if (pendingModules.length === 0) throw new BadRequestException('كل الأزرار المطلوبة مفعلة بالفعل');

    const existingPending = await this.upgradeRequests.findFirst({
      where: { shopId, status: 'PENDING' as any },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (existingPending?.id) {
      return this.upgradeRequests.update({
        where: { id: existingPending.id },
        data: {
          requestedModules: pendingModules as any,
          ...(typeof requestedByUserId === 'string' ? { requestedByUserId } : {}),
        },
      });
    }

    return this.upgradeRequests.create({
      data: {
        shopId,
        requestedModules: pendingModules as any,
        ...(typeof requestedByUserId === 'string' ? { requestedByUserId } : {}),
      },
    });
  }

  async listModuleUpgradeRequestsForShop(shopIdRaw: string, actor: { role: string; shopId?: string }) {
    const shopId = String(shopIdRaw || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && String(actor?.shopId || '').trim() !== shopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    return this.upgradeRequests.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminListModuleUpgradeRequests(input?: {
    status?: string;
    shopId?: string;
    take?: number;
    skip?: number;
  }) {
    const statusRaw = String(input?.status || '').trim().toUpperCase();
    const allowedStatuses = new Set(['PENDING', 'APPROVED', 'REJECTED', 'CANCELED', 'ALL', '']);
    if (!allowedStatuses.has(statusRaw)) throw new BadRequestException('status غير صحيح');

    const shopId = typeof input?.shopId === 'string' ? String(input.shopId).trim() : '';
    const take = typeof input?.take === 'number' && Number.isFinite(input.take)
      ? Math.min(200, Math.max(1, Math.floor(input.take)))
      : 50;
    const skip = typeof input?.skip === 'number' && Number.isFinite(input.skip)
      ? Math.max(0, Math.floor(input.skip))
      : 0;

    return this.upgradeRequests.findMany({
      where: {
        ...(shopId ? { shopId } : {}),
        ...(statusRaw && statusRaw !== 'ALL' ? { status: statusRaw as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: {
        shop: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async adminApproveModuleUpgradeRequest(idRaw: string, adminIdRaw?: string | null) {
    const id = String(idRaw || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');

    const adminId = adminIdRaw ? String(adminIdRaw).trim() : '';

    const allowed = this.getAllowedDashboardModules();
    const core = this.getCoreDashboardModules();

    const updated = await this.prisma.$transaction(async (tx) => {
      const req = await (tx as any).shopModuleUpgradeRequest.findUnique({
        where: { id },
        select: {
          id: true,
          shopId: true,
          status: true,
          requestedModules: true,
          shop: { select: { id: true, slug: true, category: true, layoutConfig: true } },
        },
      });

      if (!req) throw new NotFoundException('الطلب غير موجود');
      if (String(req.status) !== 'PENDING') throw new BadRequestException('هذا الطلب ليس قيد المراجعة');

      const requested = Array.isArray(req.requestedModules)
        ? (req.requestedModules as any[]).map((x) => String(x || '').trim()).filter(Boolean)
        : [];
      const requestedFiltered = Array.from(new Set(requested.filter((m) => allowed.has(m))));
      if (requestedFiltered.length === 0) throw new BadRequestException('requestedModules غير صالح');

      const prevLayout = (req.shop?.layoutConfig as any) || {};
      const prevEnabled = Array.isArray(prevLayout?.enabledModules)
        ? prevLayout.enabledModules.map((x: any) => String(x || '').trim()).filter(Boolean)
        : [];

      const shopCategory = (req.shop as any)?.category;
      const allowedForCategory = this.getAllowedDashboardModulesForCategory(shopCategory);

      const mergedRequested = Array.from(new Set([...prevEnabled, ...requestedFiltered, ...core]));
      const nextEnabled = mergedRequested.filter((m) => allowed.has(m) && allowedForCategory.has(m));

      const nextLayout = {
        ...prevLayout,
        enabledModules: nextEnabled,
      };

      const shopUpdated = await tx.shop.update({
        where: { id: req.shopId },
        data: { layoutConfig: nextLayout as any },
        select: { id: true, slug: true, layoutConfig: true },
      });

      const reqUpdated = await (tx as any).shopModuleUpgradeRequest.update({
        where: { id: req.id },
        data: {
          status: 'APPROVED' as any,
          reviewedAt: new Date(),
          ...(adminId ? { reviewedByAdminId: adminId } : {}),
        },
      });

      return { shopUpdated, reqUpdated };
    });

    try {
      await this.redis.invalidateShopCache(updated.shopUpdated.id, updated.shopUpdated.slug);
    } catch {
    }

    return updated;
  }

  async adminRejectModuleUpgradeRequest(idRaw: string, input?: { note?: string | null }, adminIdRaw?: string | null) {
    const id = String(idRaw || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');

    const adminId = adminIdRaw ? String(adminIdRaw).trim() : '';
    const note = input?.note == null ? null : String(input.note).trim();

    const existing = await this.upgradeRequests.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) throw new NotFoundException('الطلب غير موجود');
    if (String(existing.status) !== 'PENDING') throw new BadRequestException('هذا الطلب ليس قيد المراجعة');

    return this.upgradeRequests.update({
      where: { id },
      data: {
        status: 'REJECTED' as any,
        note,
        reviewedAt: new Date(),
        ...(adminId ? { reviewedByAdminId: adminId } : {}),
      },
    });
  }

  async adminUpgradeDashboardConfig(input?: {
    shopIds?: string[];
    dryRun?: boolean;
  }) {
    const dryRun = Boolean(input?.dryRun);
    const shopIds = Array.isArray(input?.shopIds)
      ? input?.shopIds.map((id) => String(id || '').trim()).filter(Boolean)
      : [];

    const where = shopIds.length > 0 ? { id: { in: shopIds } } : {};

    const shops = await this.prisma.shop.findMany({
      where: where as any,
      select: { id: true, category: true, layoutConfig: true },
    });

    let updatedCount = 0;
    const details: Array<{ id: string; changed: boolean }> = [];

    for (const s of shops) {
      const prevLayout = (s?.layoutConfig && typeof s.layoutConfig === 'object') ? (s.layoutConfig as any) : {};
      const defaults = this.getDefaultDashboardConfigForCategory((s as any)?.category);

      const prevEnabled = Array.isArray(prevLayout?.enabledModules)
        ? prevLayout.enabledModules.map((x: any) => String(x || '').trim()).filter(Boolean)
        : [];
      const defaultEnabled = Array.isArray((defaults as any)?.enabledModules)
        ? (defaults as any).enabledModules.map((x: any) => String(x || '').trim()).filter(Boolean)
        : [];
      const nextEnabled = prevEnabled.length > 0 ? prevEnabled : defaultEnabled;

      const prevModeRaw = prevLayout?.dashboardMode;
      const prevMode = String(prevModeRaw || '').trim().toLowerCase();
      const hasValidMode = prevMode === 'showcase' || prevMode === 'manage';

      const nextLayout = {
        ...prevLayout,
        ...(prevEnabled.length > 0 ? {} : { enabledModules: nextEnabled }),
        dashboardMode: hasValidMode ? prevMode : String((defaults as any)?.dashboardMode || 'manage'),
      };

      const changed =
        JSON.stringify(prevLayout?.enabledModules || null) !== JSON.stringify(nextLayout.enabledModules || null) ||
        String(prevLayout?.dashboardMode || '') !== String(nextLayout.dashboardMode || '');

      details.push({ id: String((s as any)?.id || ''), changed });
      if (!changed) continue;
      updatedCount++;
      if (dryRun) continue;

      await this.prisma.shop.update({
        where: { id: String((s as any)?.id || '') },
        data: { layoutConfig: nextLayout as any },
      });
    }

    return {
      ok: true,
      dryRun,
      total: shops.length,
      updated: updatedCount,
      details,
    };
  }

  async updateShopBannerFromUpload(shopId: string, file: any) {
    return await this.shopMedia.updateShopBannerFromUpload(shopId, file);
  }

  async getShopById(id: string) {
    const startTime = Date.now();

    try {
      const shop = await this.prisma.shop.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findUnique', 'shops', duration, true);
      this.monitoring.trackPerformance('getShopById_database', duration);

      return shop;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findUnique', 'shops', duration, false);
      throw error;
    }
  }

  async adminResetShopVisitors(shopIdRaw: string) {
    const shopId = String(shopIdRaw || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true, slug: true },
    });
    if (!shop) throw new NotFoundException('المتجر غير موجود');

    await this.prisma.shop.update({
      where: { id: shopId },
      data: { visitors: 0 },
      select: { id: true },
    });

    try {
      await this.redis.del(`shop:${shopId}:visitors`);
      await this.redis.invalidatePattern(`shop:${shopId}:visit:*`);
    } catch {
    }

    try {
      await this.redis.invalidateShopCache(shopId, (shop as any).slug);
    } catch {
    }

    return { ok: true, shopId };
  }

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
    return await this.shopSettings.updateShopSettings(shopId, input);
  }

  async getShopsByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ALL' = 'ALL') {
    const startTime = Date.now();

    try {
      const shops = await this.prisma.shop.findMany({
        where: {
          ...(status === 'ALL' ? {} : { status: status as any }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findMany', 'shops', duration, true);
      this.monitoring.trackPerformance('getShopsByStatus_database', duration);

      return shops;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findMany', 'shops', duration, false);
      throw error;
    }
  }

  async getAllShops(input?: {
    take?: number;
    skip?: number;
    category?: string;
    governorate?: string;
    search?: string;
  }) {
    const startTime = Date.now();

    try {
      const takeRaw = typeof input?.take === 'number' && Number.isFinite(input.take) ? input.take : undefined;
      const skipRaw = typeof input?.skip === 'number' && Number.isFinite(input.skip) ? input.skip : undefined;
      const take = typeof takeRaw === 'number' ? Math.min(100, Math.max(1, Math.floor(takeRaw))) : undefined;
      const skip = typeof skipRaw === 'number' ? Math.max(0, Math.floor(skipRaw)) : undefined;

      const category = typeof input?.category === 'string' ? input.category.trim() : '';
      const governorate = typeof input?.governorate === 'string' ? input.governorate.trim() : '';
      const search = typeof input?.search === 'string' ? input.search.trim() : '';

      const cacheKey = 'shops:list';
      const useListCache = !category && !governorate && !search && typeof take !== 'number' && typeof skip !== 'number';
      if (useListCache) {
        try {
          const cached = await this.redis.getShopsList();
          if (cached) {
            const duration = Date.now() - startTime;
            this.monitoring.trackCache('getShopsList', cacheKey, true, duration);
            this.monitoring.trackPerformance('getAllShops_cached', duration);
            return (Array.isArray(cached) ? cached : []).filter((s: any) => (s as any)?.isActive !== false);
          }
          this.monitoring.trackCache('getShopsList', cacheKey, false, Date.now() - startTime);
        } catch {
        }
      }

      const shops = await this.prisma.shop.findMany({
        where: {
          isActive: true,
          status: 'APPROVED',
          owner: {
            isActive: true,
            deactivatedAt: null,
          } as any,
          ...(category ? { category: category as any } : {}),
          ...(governorate ? { governorate } : {}),
          ...(search
            ? {
                name: {
                  contains: search,
                },
              }
            : {}),
        },
        select: {
          id: true,
          slug: true,
          name: true,
          category: true,
          governorate: true,
          city: true,
          displayAddress: true,
          mapLabel: true,
          latitude: true,
          longitude: true,
          locationSource: true,
          locationAccuracy: true,
          locationUpdatedAt: true,
          visitors: true,
          isActive: true,
          status: true,
          logoUrl: true,
          bannerUrl: true,
          pageDesign: true,
          layoutConfig: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        ...(typeof take === 'number' ? { take } : {}),
        ...(typeof skip === 'number' ? { skip } : {}),
      });

      if (useListCache) {
        try {
          await this.redis.cacheShopsList(shops, 1800);
        } catch {
        }
      }

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findMany', 'shops', duration, true);
      this.monitoring.trackPerformance('getAllShops_database', duration);

      return shops;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findMany', 'shops', duration, false);
      throw error;
    }
  }

  async updateShopStatus(shopId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED') {
    const startTime = Date.now();

    try {
      const updated = await this.prisma.shop.update({
        where: { id: shopId },
        data: { status: status as any },
      });

      if (String(status).toUpperCase() === 'APPROVED') {
        try {
          const shop = await this.prisma.shop.findUnique({
            where: { id: updated.id },
            select: {
              id: true,
              name: true,
              email: true,
              owner: { select: { email: true, name: true } },
            },
          });

          const to = String((shop as any)?.email || (shop as any)?.owner?.email || '').trim();
          if (to) {
            await this.email.sendMail({
              to,
              subject: 'تمت الموافقة على متجرك في MNMKNK',
              text: `مرحباً ${(shop as any)?.owner?.name || ''}\n\nتمت الموافقة على متجرك "${(shop as any)?.name || ''}". يمكنك الآن تسجيل الدخول والدخول للوحة التحكم.`,
            });
          }
        } catch {
        }
      }

      await this.redis.invalidateShopCache(updated.id, updated.slug);

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('update', 'shops', duration, true);
      this.monitoring.trackPerformance('updateShopStatus_database', duration);

      return updated;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('update', 'shops', duration, false);
      throw error;
    }
  }

  async getShopBySlug(slug: string) {
    return await this.shopPublicQuery.getShopBySlug(slug);
  }

  async incrementVisitors(shopId: string, ipHash?: string, userAgent?: string, source?: string, path?: string) {
    const startTime = Date.now();

    try {
      // If Redis is available, de-duplicate visits to avoid inflating counts from rapid reloads / internal navigation.
      // Count at most once per visitor fingerprint per TTL window.
      try {
        const client = this.redis.getClient();
        if (client) {
          const ua = String(userAgent || '').trim().toLowerCase();
          const ip = String(ipHash || '').trim();
          const fp = createHash('sha256').update(`${ip}|${ua}`).digest('hex');
          const dedupeKey = `shop:${shopId}:visit:${fp}`;
          const ok = await this.redis.setIfNotExists(dedupeKey, '1', 60 * 30);
          if (!ok) {
            return { recorded: false, existing: true };
          }
        }
      } catch {
      }

      // Postgres schema does not have Visit table; keep a simple counter.
      await this.prisma.shop.update({
        where: { id: shopId },
        data: {
          visitors: {
            increment: 1,
          },
        },
      });

      // Update cache counter
      try {
        await this.redis.incrementCounter(`shop:${shopId}:visitors`);
      } catch {
      }

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('update', 'shops', duration, true);
      this.monitoring.trackPerformance('incrementVisitors', duration);

      return { recorded: true, existing: false };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('update', 'shops', duration, false);
      throw error;
    }
  }

  async toggleFollow(shopId: string, userId: string) {
    const startTime = Date.now();

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.shopFollower.findFirst({
          where: { shopId, userId },
          select: { id: true },
        });

        if (existing) {
          await tx.shopFollower.delete({ where: { id: existing.id } });

          let updatedShop = await tx.shop.update({
            where: { id: shopId },
            data: { followers: { decrement: 1 } },
            select: { id: true, slug: true, followers: true },
          });

          if (updatedShop.followers < 0) {
            updatedShop = await tx.shop.update({
              where: { id: shopId },
              data: { followers: 0 },
              select: { id: true, slug: true, followers: true },
            });
          }

          return { followed: false, shop: updatedShop };
        }

        await tx.shopFollower.create({ data: { shopId, userId } });

        try {
          const follower = await tx.user.findUnique({ where: { id: userId }, select: { name: true } });
          await tx.notification.create({
            data: {
              shopId,
              title: 'متابع جديد!',
              content: `${String(follower?.name || 'عميل')} بدأ يتابع متجرك`,
              type: 'NEW_FOLLOWER',
              isRead: false,
              metadata: { followerId: userId, followerName: follower?.name },
            } as any,
          });
        } catch {
        }

        const updatedShop = await tx.shop.update({
          where: { id: shopId },
          data: { followers: { increment: 1 } },
          select: { id: true, slug: true, followers: true },
        });

        return { followed: true, shop: updatedShop };
      });

      await this.redis.invalidateShopCache(result.shop.id, result.shop.slug);

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('transaction', 'shop_followers', duration, true);
      this.monitoring.trackPerformance('toggleFollow', duration);

      return { followed: result.followed, followers: result.shop.followers };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('transaction', 'shop_followers', duration, false);
      throw error;
    }
  }

  async followShop(shopId: string, userId: string) {
    const startTime = Date.now();

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.shopFollower.findFirst({
          where: { shopId, userId },
          select: { id: true },
        });

        if (existing) {
          const currentShop = await tx.shop.findUnique({
            where: { id: shopId },
            select: { followers: true },
          });
          return { followed: true, followers: currentShop?.followers ?? 0 };
        }

        await tx.shopFollower.create({ data: { shopId, userId } });

        try {
          const follower = await tx.user.findUnique({ where: { id: userId }, select: { name: true } });
          await tx.notification.create({
            data: {
              user: { connect: { id: userId } },
              title: 'متابع جديد!',
              content: `${String(follower?.name || 'عميل')} بدأ يتابع متجرك`,
              type: 'SYSTEM' as any,
              isRead: false,
            },
          });
        } catch {
        }

        const updatedShop = await tx.shop.update({
          where: { id: shopId },
          data: { followers: { increment: 1 } },
          select: { followers: true },
        });

        return { followed: true, followers: updatedShop.followers };
      });

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('transaction', 'shop_followers', duration, true);
      this.monitoring.trackPerformance('followShop', duration);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('transaction', 'shop_followers', duration, false);
      throw error;
    }
  }

  async updateShopDesign(shopId: string, designConfig: any) {
    const startTime = Date.now();

    try {
      const shopIdNormalized = String(shopId || '').trim();
      if (!shopIdNormalized) {
        throw new BadRequestException('shopId مطلوب');
      }

      if (!designConfig || typeof designConfig !== 'object' || Array.isArray(designConfig)) {
        throw new BadRequestException('designConfig يجب أن يكون Object');
      }

      // Prisma JSON fields cannot store `undefined`. Strip it (deep) to guarantee persistence.
      // This also ensures the payload is JSON-serializable.
      const safeDesignConfig = (() => {
        try {
          return JSON.parse(JSON.stringify(designConfig));
        } catch {
          throw new BadRequestException('designConfig غير صالح (غير قابل للتحويل إلى JSON)');
        }
      })();

      // Update database
      const updatedShop = await this.prisma.shop.update({
        where: { id: shopIdNormalized },
        data: {
          pageDesign: safeDesignConfig,
        },
      });

      // Invalidate cache for this shop
      await this.redis.invalidateShopCache(shopIdNormalized, (updatedShop as any).slug);

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('update', 'shops', duration, true);
      this.monitoring.trackPerformance('updateShopDesign', duration);

      return updatedShop;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('update', 'shops', duration, false);
      throw error;
    }
  }

  async getShopAnalytics(shopId: string, range?: { from?: Date; to?: Date }) {
    return await this.shopAnalytics.getShopAnalytics(shopId, range);
  }

  // Cache management methods
  async clearShopCache(shopId: string, slug?: string) {
    const startTime = Date.now();

    try {
      await this.redis.invalidateShopCache(shopId, slug);

      const duration = Date.now() - startTime;
      this.monitoring.trackCache('invalidateShopCache', `shop:${shopId}`, true, duration);
      this.monitoring.trackPerformance('clearShopCache', duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackCache('invalidateShopCache', `shop:${shopId}`, false, duration);
      throw error;
    }
  }

  async warmCache() {
    const startTime = Date.now();

    try {
      // Pre-populate cache with popular shops
      const popularShops = await this.prisma.shop.findMany({
        where: {
          isActive: true,
          status: 'APPROVED',
          visitors: { gte: 100 } // Popular shops
        },
        take: 20,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          _count: { select: { products: true, offers: true } },
        },
      });

      // Cache popular shops
      for (const shop of popularShops) {
        try {
          await this.redis.cacheShop(shop.id, shop, 3600);
        } catch {
        }
      }

      // Cache shops list
      try {
        await this.redis.cacheShopsList(popularShops, 1800);
      } catch {
      }

      const duration = Date.now() - startTime;
      this.monitoring.trackPerformance('warmCache', duration);
      this.monitoring.logBusiness('cache_warmed', { shopsCount: popularShops.length });

      return popularShops.length;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackPerformance('warmCache', duration);
      throw error;
    }
  }

  async generateSitemap(): Promise<string> {
    const baseUrl = process.env.FRONTEND_URL || 'https://mnmknk.com';

    const staticPages = [
      { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/shops`, changefreq: 'daily', priority: '0.8' },
      { loc: `${baseUrl}/restaurants`, changefreq: 'daily', priority: '0.8' },
      { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.5' },
    ];

    const shops = await this.prisma.shop.findMany({
      where: { status: 'APPROVED' },
      select: { slug: true, updatedAt: true },
    });

    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    });

    const shopUrls = shops.map(shop => ({
      loc: `${baseUrl}/shops/${shop.slug}`,
      lastmod: shop.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.9',
    }));

    const productUrls = products.map(product => ({
      loc: `${baseUrl}/products/${product.id}`,
      lastmod: product.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.7',
    }));

    const allUrls = [...staticPages, ...shopUrls, ...productUrls];

    const urlset = allUrls
      .map(url => {
        return `
    <url>
      <loc>${url.loc}</loc>
      ${'lastmod' in url ? `<lastmod>${(url as any).lastmod}</lastmod>` : ''}
      <changefreq>${url.changefreq}</changefreq>
      <priority>${url.priority}</priority>
    </url>`;
      })
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
  }

  async createShop(createShopDto: CreateShopDto, ownerId: string) {
    // Check if user already has a shop
    const existingShop = await this.prisma.shop.findUnique({
      where: { ownerId },
    });

    if (existingShop) {
      throw new BadRequestException('User already has a shop');
    }

    // Generate unique slug
    let slug = createShopDto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Ensure slug is unique
    let counter = 1;
    let uniqueSlug = slug;
    while (await this.prisma.shop.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const shop = await this.prisma.shop.create({
      data: {
        name: createShopDto.name,
        slug: uniqueSlug,
        description: createShopDto.description,
        category: (createShopDto.category || ShopCategory.RETAIL) as any,
        phone: createShopDto.phone,
        email: createShopDto.email,
        address: createShopDto.address,
        addressDetailed: createShopDto.addressDetailed,
        governorate: createShopDto.governorate,
        city: createShopDto.city,
        openingHours: createShopDto.openingHours,
        layoutConfig: this.getDefaultDashboardConfigForCategory(createShopDto.category) as any,
        owner: {
          connect: {
            id: ownerId,
          },
        },
        status: 'PENDING',
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Send notification email to admin
    try {
      // TODO: Implement email notification when email service is available
      // await this.emailService.sendNewShopNotification(shop);
    } catch (error) {
      // Log error but don't fail the creation
    }

    this.monitoring.logBusiness('shop_created', { 
      shopId: shop.id, 
      ownerId
    });

    return shop;
  }
}
