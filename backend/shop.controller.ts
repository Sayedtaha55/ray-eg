import { Controller, Get, Post, Param, Body, Patch, UseGuards, Request, ForbiddenException, Query, BadRequestException, NotFoundException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { randomBytes } from 'crypto';
import { CreateShopDto } from './create-shop.dto';

 const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
 const bannerUploadMaxMbRaw = String(process.env.BANNER_UPLOAD_MAX_MB || (isProd ? '30' : '80')).trim();
 const bannerUploadMaxMb = Math.max(1, Number(bannerUploadMaxMbRaw) || (isProd ? 30 : 80));
 const bannerUploadMaxBytes = Math.floor(bannerUploadMaxMb * 1024 * 1024);

@Controller('api/v1/shops')
export class ShopController {
  constructor(@Inject(ShopService) private readonly shopService: ShopService) {}

  @Get('/sitemap')
  async getSitemap() {
    const sitemap = await this.shopService.generateSitemap();
    return sitemap;
  }

  private parseOptionalInt(value: any) {
    if (typeof value === 'undefined' || value === null) return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async createShop(@Request() req, @Body() createShopDto: CreateShopDto) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found');
    }

    return this.shopService.createShop(createShopDto, userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async getMyShop(@Request() req) {
    const shopId = req.user?.shopId;
    if (!shopId) {
      throw new NotFoundException('لا يوجد متجر مرتبط بهذا الحساب');
    }
    const shop = await this.shopService.getShopById(shopId);
    if (!shop) {
      throw new NotFoundException('لم يتم العثور على المتجر');
    }
    return shop;
  }

  @Post('me/module-upgrade-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async createMyModuleUpgradeRequest(@Request() req, @Body() body: any) {
    const shopId = String(req.user?.shopId || '').trim();
    if (!shopId) {
      throw new NotFoundException('لا يوجد متجر مرتبط بهذا الحساب');
    }

    const userId = req.user?.id ? String(req.user.id).trim() : null;

    return this.shopService.createModuleUpgradeRequest({
      shopId,
      requestedModules: body?.requestedModules,
      requestedByUserId: userId,
    });
  }

  @Get('me/module-upgrade-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async listMyModuleUpgradeRequests(@Request() req) {
    const shopId = String(req.user?.shopId || '').trim();
    if (!shopId) {
      throw new NotFoundException('لا يوجد متجر مرتبط بهذا الحساب');
    }

    return this.shopService.listModuleUpgradeRequestsForShop(shopId, { role: req.user?.role, shopId });
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async updateMyShop(@Request() req, @Body() body: any) {
    const userRole = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const shopIdFromBody = typeof body?.shopId === 'string' ? body.shopId : undefined;

    const targetShopId = userRole === 'ADMIN' ? shopIdFromBody : shopIdFromToken;

    if (!targetShopId) {
      throw new NotFoundException('لا يوجد متجر مرتبط بهذا الحساب');
    }

    const latitude = (() => {
      if (typeof body?.latitude === 'undefined') return undefined;
      if (body.latitude === null) return null;
      const v = Number(body.latitude);
      if (Number.isNaN(v) || v < -90 || v > 90) return undefined;
      return v;
    })();

    const longitude = (() => {
      if (typeof body?.longitude === 'undefined') return undefined;
      if (body.longitude === null) return null;
      const v = Number(body.longitude);
      if (Number.isNaN(v) || v < -180 || v > 180) return undefined;
      return v;
    })();

    const isActive = (() => {
      if (typeof body?.isActive === 'undefined') return undefined;
      if (typeof body?.isActive === 'boolean') return body.isActive;
      const raw = String(body.isActive).trim().toLowerCase();
      if (raw === 'true') return true;
      if (raw === 'false') return false;
      return undefined;
    })();

    const locationAccuracy = (() => {
      if (typeof body?.locationAccuracy === 'undefined') return undefined;
      if (body.locationAccuracy === null) return null;
      const v = Number(body.locationAccuracy);
      if (Number.isNaN(v) || v < 0) return undefined;
      return v;
    })();

    const locationSource = (() => {
      if (typeof body?.locationSource === 'undefined') return undefined;
      if (body.locationSource === null) return null;
      const v = String(body.locationSource || '').trim().toLowerCase();
      return v ? v : undefined;
    })();

    const displayAddress = (() => {
      if (typeof body?.displayAddress === 'undefined') return undefined;
      if (body.displayAddress === null) return null;
      const v = String(body.displayAddress || '').trim();
      return v ? v : null;
    })();

    const mapLabel = (() => {
      if (typeof body?.mapLabel === 'undefined') return undefined;
      if (body.mapLabel === null) return null;
      const v = String(body.mapLabel || '').trim();
      return v ? v : null;
    })();

    const paymentConfig = (() => {
      if (typeof body?.paymentConfig === 'undefined') return undefined;
      if (body.paymentConfig === null) return null;
      if (!body.paymentConfig || typeof body.paymentConfig !== 'object') return undefined;

      const merchantIdRaw = (body.paymentConfig as any)?.merchantId;
      const publicKeyRaw = (body.paymentConfig as any)?.publicKey;

      const merchantId = typeof merchantIdRaw === 'string' ? merchantIdRaw : merchantIdRaw == null ? '' : String(merchantIdRaw);
      const publicKey = typeof publicKeyRaw === 'string' ? publicKeyRaw : publicKeyRaw == null ? '' : String(publicKeyRaw);

      return {
        merchantId: merchantId.trim(),
        publicKey: publicKey.trim(),
      };
    })();

    const addons = (() => {
      if (typeof body?.addons === 'undefined') return undefined;
      if (body.addons === null) return null;
      if (!Array.isArray(body.addons)) return undefined;
      return body.addons;
    })();

    const enabledModules = (() => {
      if (typeof body?.enabledModules === 'undefined') return undefined;
      if (body.enabledModules === null) return null;
      if (!Array.isArray(body.enabledModules)) return undefined;
      return body.enabledModules;
    })();

    const dashboardMode = (() => {
      if (typeof body?.dashboardMode === 'undefined') return undefined;
      if (body.dashboardMode === null) return null;
      const v = String(body.dashboardMode || '').trim();
      return v ? v : undefined;
    })();

    const shouldTouchLocationMeta =
      typeof body?.latitude !== 'undefined' ||
      typeof body?.longitude !== 'undefined' ||
      typeof body?.locationAccuracy !== 'undefined' ||
      typeof body?.locationSource !== 'undefined';

    const locationUpdatedAt = (() => {
      if (typeof body?.locationUpdatedAt === 'undefined') {
        return shouldTouchLocationMeta ? new Date() : undefined;
      }
      if (body.locationUpdatedAt === null) return null;
      const v = new Date(String(body.locationUpdatedAt));
      if (Number.isNaN(v.getTime())) return undefined;
      return v;
    })();

    try {
      return await this.shopService.updateShopSettings(targetShopId, {
        name: typeof body?.name === 'string' ? body.name : undefined,
        description: typeof body?.description === 'string' ? body.description : undefined,
        category: typeof body?.category === 'string' ? body.category : undefined,
        governorate: typeof body?.governorate === 'string' ? body.governorate : undefined,
        city: typeof body?.city === 'string' ? body.city : undefined,
        addressDetailed: typeof body?.addressDetailed === 'string' ? body.addressDetailed : undefined,
        displayAddress,
        mapLabel,
        latitude,
        longitude,
        locationSource,
        locationAccuracy,
        locationUpdatedAt,
        phone: typeof body?.phone === 'string' ? body.phone : undefined,
        email: typeof body?.email === 'string' ? body.email : undefined,
        openingHours: typeof body?.openingHours === 'string' ? body.openingHours : undefined,
        logoUrl: typeof body?.logoUrl === 'string' ? body.logoUrl : undefined,
        bannerUrl: typeof body?.bannerUrl === 'string' ? body.bannerUrl : undefined,
        whatsapp: typeof body?.whatsapp === 'string' ? body.whatsapp : undefined,
        customDomain: typeof body?.customDomain === 'string' ? body.customDomain : undefined,
        paymentConfig,
        addons,
        isActive,
        enabledModules,
        dashboardMode: typeof dashboardMode === 'string' ? dashboardMode : undefined,
        deliveryFee:
          userRole === 'ADMIN' && (typeof body?.deliveryFee === 'number' || typeof body?.deliveryFee === 'string')
            ? ((): number | null => {
                const v = Number(body.deliveryFee);
                if (Number.isNaN(v) || v < 0) return null;
                return v;
              })()
            : undefined,
      });
    } catch (e: any) {
      const nodeEnv = String(process.env.NODE_ENV || '').toLowerCase();
      const isDev = nodeEnv !== 'production';
      const host = String(req?.headers?.host || '').toLowerCase();
      const isLocalHost = host.includes('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0');

      if (isDev || isLocalHost) {
        try {
          // eslint-disable-next-line no-console
          console.error('[ShopController.updateMyShop] failed', e?.stack || e);
        } catch {
        }
        const name = e?.name ? String(e.name) : '';
        const code = e?.code ? String(e.code) : '';
        const msg = e?.message ? String(e.message) : 'Internal error';
        const meta = [name, code].filter(Boolean).join(' ');
        throw new BadRequestException(meta ? `${meta}: ${msg}` : msg);
      }

      throw e;
    }
  }

  @Post('me/banner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  @UseInterceptors(
    FileInterceptor('banner', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = './uploads/tmp';
          try {
            fs.mkdirSync(dest, { recursive: true });
          } catch {
          }
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const randomName = randomBytes(16).toString('hex');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: bannerUploadMaxBytes,
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/avif',
          'video/mp4',
          'video/webm',
          'video/quicktime',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Unsupported file type') as any, false);
        }
      },
    }),
  )
  async uploadMyBanner(@Request() req, @UploadedFile() file: any, @Body() body: any) {
    const userRole = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const shopIdFromBody = typeof body?.shopId === 'string' ? body.shopId : undefined;
    const targetShopId = userRole === 'ADMIN' ? shopIdFromBody : shopIdFromToken;

    if (!targetShopId) {
      throw new NotFoundException('لا يوجد متجر مرتبط بهذا الحساب');
    }

    return this.shopService.updateShopBannerFromUpload(targetShopId, file);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminList(@Query('status') status: string = 'ALL') {
    const normalized = String(status || 'ALL').toUpperCase();
    const allowed = new Set(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ALL']);
    if (!allowed.has(normalized)) {
      throw new BadRequestException('قيمة status غير صحيحة');
    }
    return this.shopService.getShopsByStatus(normalized as any);
  }

  @Post('admin/upgrade-dashboard-config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminUpgradeDashboardConfig(@Body() body: { shopIds?: string[]; dryRun?: boolean }) {
    const shopIds = Array.isArray(body?.shopIds) ? body.shopIds : undefined;
    const dryRun = Boolean(body?.dryRun);
    return this.shopService.adminUpgradeDashboardConfig({ shopIds, dryRun });
  }

  @Post('admin/:id/reset-visitors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminResetVisitors(@Param('id') id: string) {
    return this.shopService.adminResetShopVisitors(id);
  }

  @Get('admin/module-upgrade-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminListModuleUpgradeRequests(
    @Query('status') status: string,
    @Query('shopId') shopId: string,
    @Query('take') take: string,
    @Query('skip') skip: string,
  ) {
    return this.shopService.adminListModuleUpgradeRequests({
      status: typeof status === 'string' ? status : undefined,
      shopId: typeof shopId === 'string' ? String(shopId).trim() || undefined : undefined,
      take: this.parseOptionalInt(take),
      skip: this.parseOptionalInt(skip),
    });
  }

  @Post('admin/module-upgrade-requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminApproveModuleUpgradeRequest(@Param('id') id: string, @Request() req) {
    const adminId = req.user?.id ? String(req.user.id).trim() : null;
    return this.shopService.adminApproveModuleUpgradeRequest(id, adminId);
  }

  @Post('admin/module-upgrade-requests/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminRejectModuleUpgradeRequest(@Param('id') id: string, @Body() body: any, @Request() req) {
    const adminId = req.user?.id ? String(req.user.id).trim() : null;
    return this.shopService.adminRejectModuleUpgradeRequest(id, { note: body?.note }, adminId);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminGetById(@Param('id') id: string) {
    const shop = await this.shopService.getShopById(id);
    if (!shop) {
      throw new NotFoundException('لم يتم العثور على المتجر');
    }
    return shop;
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async adminUpdateStatus(
    @Param('id') id: string,
    @Body() body: { status?: string; action?: string },
  ) {
    const incoming = (body?.status || body?.action || '').toString().trim();
    if (!incoming) {
      throw new BadRequestException('status مطلوب');
    }

    const normalized = incoming.toUpperCase();
    const mapped =
      normalized === 'APPROVED' || normalized === 'APPROVE' || normalized === 'APPROVEDSHOP'
        ? 'APPROVED'
        : normalized === 'REJECTED' || normalized === 'REJECT'
          ? 'REJECTED'
          : normalized === 'PENDING'
            ? 'PENDING'
            : normalized === 'SUSPENDED' || normalized === 'SUSPEND'
              ? 'SUSPENDED'
              : null;

    if (!mapped) {
      throw new BadRequestException('قيمة status غير صحيحة');
    }

    return this.shopService.updateShopStatus(id, mapped as any);
  }

  @Get()
  async findAll(
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('category') category: string,
    @Query('governorate') governorate: string,
    @Query('search') search: string,
  ) {
    return this.shopService.getAllShops({
      take: this.parseOptionalInt(take),
      skip: this.parseOptionalInt(skip),
      category: typeof category === 'string' ? String(category).trim() : undefined,
      governorate: typeof governorate === 'string' ? String(governorate).trim() : undefined,
      search: typeof search === 'string' ? String(search).trim() : undefined,
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const shop = await this.shopService.getShopBySlug(slug);
    if (!shop) {
      throw new NotFoundException('لم يتم العثور على المتجر');
    }
    if ((shop as any)?.isActive === false) {
      throw new NotFoundException('لم يتم العثور على المتجر');
    }
    const status = String((shop as any)?.status || '').toUpperCase();
    if (status !== 'APPROVED' && status !== 'SUSPENDED') {
      throw new NotFoundException('لم يتم العثور على المتجر');
    }
    // تسجيل زيارة (Analytics)
    return shop;
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const shop = await this.shopService.getShopById(id);
    if (!shop) {
      throw new NotFoundException('لم يتم العثور على المتجر');
    }
    if ((shop as any)?.isActive === false) {
      throw new NotFoundException('لم يتم العثور على المتجر');
    }
    const status = String((shop as any)?.status || '').toUpperCase();
    if (status !== 'APPROVED' && status !== 'SUSPENDED') {
      throw new NotFoundException('لم يتم العثور على المتجر');
    }
    return shop;
  }

  @Post(':id/visit')
  async trackVisit(@Param('id') id: string, @Request() req) {
    const shopId = String(id || '').trim();
    if (!shopId) {
      throw new BadRequestException('id مطلوب');
    }
    
    // Get IP hash and user agent for unique visit tracking
    const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const ipHash = Buffer.from(ip).toString('base64'); // Simple hash for privacy
    const userAgent = req.headers['user-agent'] || null;
    const referer = req.headers['referer'] || null;
    
    const result = await this.shopService.incrementVisitors(shopId, ipHash, userAgent, referer, req.path);
    return { ok: true, recorded: result.recorded };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async follow(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.shopService.followShop(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  @Patch(':id/design')
  async updateDesign(@Param('id') id: string, @Body() designConfig: any, @Request() req) {
    const role = String(req.user?.role || '').toUpperCase();
    if (role !== 'ADMIN' && req.user.shopId !== id) {
      throw new ForbiddenException('ليس لديك صلاحية لتعديل هذا المتجر');
    }
    return this.shopService.updateShopDesign(id, designConfig);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async getAnalytics(@Param('id') id: string, @Query('from') from: string, @Query('to') to: string, @Request() req) {
    const role = String(req.user?.role || '').toUpperCase();
    if (role !== 'ADMIN' && req.user.shopId !== id) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }
    const fromDate = from ? new Date(String(from)) : undefined;
    const toDate = to ? new Date(String(to)) : undefined;
    return this.shopService.getShopAnalytics(id, {
      from: fromDate && !Number.isNaN(fromDate.getTime()) ? fromDate : undefined,
      to: toDate && !Number.isNaN(toDate.getTime()) ? toDate : undefined,
    });
  }
}
