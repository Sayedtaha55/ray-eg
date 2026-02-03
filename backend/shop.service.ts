import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { MonitoringService } from './monitoring/monitoring.service';
import { MediaCompressionService } from './media-compression.service';
import { EmailService } from './email.service';
import { CreateShopDto, ShopCategory } from './create-shop.dto';
import * as path from 'path';
import { randomBytes } from 'crypto';
import * as fs from 'fs';

@Injectable()
export class ShopService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
    @Inject(MonitoringService) private readonly monitoring: MonitoringService,
    @Inject(MediaCompressionService) private readonly media: MediaCompressionService,
    @Inject(EmailService) private readonly email: EmailService,
  ) {}

  private parseBase64DataUrl(dataUrl: string) {
    const raw = String(dataUrl || '');
    const m = raw.match(/^data:([^;]+);base64,(.+)$/i);
    if (!m) return null;
    const mime = String(m[1] || '').toLowerCase();
    const base64 = String(m[2] || '');
    return { mime, base64 };
  }

  private async persistShopImageFromDataUrl(params: {
    shopId: string;
    kind: 'logo' | 'banner';
    dataUrl: string;
  }) {
    const parsed = this.parseBase64DataUrl(params.dataUrl);
    if (!parsed) return null;
    if (!parsed.mime.startsWith('image/')) {
      throw new BadRequestException('Unsupported media type');
    }

    let input: Buffer;
    try {
      input = Buffer.from(parsed.base64, 'base64');
    } catch {
      throw new BadRequestException('Invalid image data');
    }

    const outDir = path.resolve(process.cwd(), 'uploads', 'shops', params.shopId);
    this.media.ensureDir(outDir);

    const baseName = `${params.kind}-${Date.now()}-${randomBytes(6).toString('hex')}`;

    const variants =
      params.kind === 'logo'
        ? [
            { key: 'opt' as const, width: 512, height: 512, fit: 'inside' as const, quality: 82 },
            { key: 'thumb' as const, width: 160, height: 160, fit: 'cover' as const, quality: 75 },
          ]
        : [
            { key: 'opt' as const, width: 1600, height: 1600, fit: 'inside' as const, quality: 80 },
            { key: 'md' as const, width: 900, height: 900, fit: 'inside' as const, quality: 78 },
            { key: 'thumb' as const, width: 480, height: 270, fit: 'cover' as const, quality: 75 },
          ];

    const written = await this.media.writeWebpVariants({
      input,
      outDir,
      baseName,
      variants,
    });

    const urlBase = `/uploads/shops/${encodeURIComponent(params.shopId)}`;
    const optUrl = `${urlBase}/${baseName}-opt.webp`;
    const mdUrl = written.md ? `${urlBase}/${baseName}-md.webp` : null;
    const thumbUrl = written.thumb ? `${urlBase}/${baseName}-thumb.webp` : null;

    return { optUrl, mdUrl, thumbUrl };
  }

  async updateShopBannerFromUpload(shopId: string, file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const mime = String(file?.mimetype || '').toLowerCase();
    const isVideo = mime.startsWith('video/');
    const isImage = mime.startsWith('image/');

    if (!isVideo && !isImage) {
      try {
        if (file?.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch {
      }
      throw new BadRequestException('Unsupported media type');
    }

    const current = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true, pageDesign: true },
    });

    const outDir = path.resolve(process.cwd(), 'uploads', 'shops', shopId);
    this.media.ensureDir(outDir);

    const baseName = `banner-${Date.now()}-${randomBytes(6).toString('hex')}`;
    const urlBase = `/uploads/shops/${encodeURIComponent(shopId)}`;

    if (isVideo) {
      const outputFilename = `${baseName}-opt.mp4`;
      const outputPath = path.join(outDir, outputFilename);
      const posterFilename = `${baseName}-thumb.webp`;
      const posterPath = path.join(outDir, posterFilename);

      try {
        await this.media.optimizeVideoMp4(String(file.path), outputPath);
        await this.media.generateVideoThumbnailWebp(outputPath, posterPath);
      } catch {
        try {
          if (file?.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch {
        }
        throw new BadRequestException('Failed to process video');
      }

      try {
        if (file?.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch {
      }

      const bannerUrl = `${urlBase}/${outputFilename}`;
      const bannerPosterUrl = `${urlBase}/${posterFilename}`;

      const prevDesign = (current?.pageDesign as any) || {};
      const nextDesign = {
        ...prevDesign,
        bannerUrl,
        bannerPosterUrl,
      };

      await this.prisma.shop.update({
        where: { id: shopId },
        data: { pageDesign: nextDesign as any },
      });

      return { bannerUrl, bannerPosterUrl };
    }

    // image
    const outputFilename = `${baseName}-opt.webp`;
    const mediumFilename = `${baseName}-md.webp`;
    const thumbFilename = `${baseName}-thumb.webp`;

    try {
      const input = await fs.promises.readFile(String(file.path));
      await this.media.writeWebpVariants({
        input,
        outDir,
        baseName,
        variants: [
          { key: 'opt' as const, width: 1600, height: 1600, fit: 'inside' as const, quality: 80 },
          { key: 'md' as const, width: 900, height: 900, fit: 'inside' as const, quality: 78 },
          { key: 'thumb' as const, width: 480, height: 270, fit: 'cover' as const, quality: 75 },
        ],
      });
    } catch {
      try {
        if (file?.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch {
      }
      throw new BadRequestException('Failed to process image');
    }

    try {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch {
    }

    const bannerUrl = `${urlBase}/${outputFilename}`;
    const bannerPosterUrl = `${urlBase}/${thumbFilename}`;

    const prevDesign = (current?.pageDesign as any) || {};
    const nextDesign = {
      ...prevDesign,
      bannerUrl,
      bannerPosterUrl,
    };

    await this.prisma.shop.update({
      where: { id: shopId },
      data: { pageDesign: nextDesign as any },
    });

    return { bannerUrl, bannerPosterUrl, bannerMediumUrl: `${urlBase}/${mediumFilename}` };
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
    },
  ) {
    const startTime = Date.now();

    try {
      const current = await this.prisma.shop.findUnique({
        where: { id: shopId },
        select: { id: true, slug: true, layoutConfig: true },
      });

      const logoDataUrl = typeof input.logoUrl === 'string' ? input.logoUrl : '';
      const bannerDataUrl = typeof input.bannerUrl === 'string' ? input.bannerUrl : '';

      const persistedLogo = logoDataUrl.startsWith('data:')
        ? await this.persistShopImageFromDataUrl({ shopId, kind: 'logo', dataUrl: logoDataUrl })
        : null;
      const persistedBanner = bannerDataUrl.startsWith('data:')
        ? await this.persistShopImageFromDataUrl({ shopId, kind: 'banner', dataUrl: bannerDataUrl })
        : null;

      const prevLayout = (current?.layoutConfig as any) || {};
      const nextLayout = {
        ...prevLayout,
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

      const updated = await this.prisma.shop.update({
        where: { id: shopId },
        data: {
          ...(typeof input.name === 'undefined' ? {} : { name: input.name }),
          ...(typeof input.description === 'undefined' ? {} : { description: input.description }),
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

      await this.redis.invalidateShopCache(updated.id, updated.slug);

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('update', 'shops', duration, true);
      this.monitoring.trackPerformance('updateShopSettings_database', duration);

      return updated;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('update', 'shops', duration, false);
      throw error;
    }
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
            return cached;
          }
          this.monitoring.trackCache('getShopsList', cacheKey, false, Date.now() - startTime);
        } catch {
        }
      }

      const shops = await this.prisma.shop.findMany({
        where: {
          status: 'APPROVED',
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
          rating: true,
          followers: true,
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
    const startTime = Date.now();

    try {
      // Try to get from cache first
      try {
        const cachedShop = await this.redis.getShopBySlug(slug);
        if (cachedShop) {
          const duration = Date.now() - startTime;
          this.monitoring.trackCache('getShopBySlug', `shop:slug:${slug}`, true, duration);
          this.monitoring.trackPerformance('getShopBySlug_cached', duration);

          // Increment visitors counter asynchronously
          this.incrementVisitors(String((cachedShop as any).id)).catch(() => undefined);
          return cachedShop;
        }
        this.monitoring.trackCache('getShopBySlug', `shop:slug:${slug}`, false, Date.now() - startTime);
      } catch {
      }

      // If not in cache, fetch from database
      const include = {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
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
          where: { isActive: true },
          take: 6,
        },
        addons: true,
      };

      const shop = (await this.prisma.shop.findUnique({
        where: { slug },
        include,
      })) || (await this.prisma.shop.findUnique({
        where: { id: slug },
        include,
      }));

      if (shop) {
        // Cache the shop data for 1 hour
        try {
          await this.redis.cacheShop(shop.id, shop, 3600);
        } catch {
        }

        // Increment visitors
        await this.incrementVisitors(shop.id);
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

  async incrementVisitors(shopId: string) {
    const startTime = Date.now();

    try {
      // Update database
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

      return true;
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
        const existing = await tx.shopFollower.findUnique({
          where: {
            shopId_userId: {
              shopId,
              userId,
            },
          },
        });

        if (existing) {
          await tx.shopFollower.delete({
            where: {
              shopId_userId: {
                shopId,
                userId,
              },
            },
          });

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

        await tx.shopFollower.create({
          data: {
            shopId,
            userId,
          },
        });

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
        const existing = await tx.shopFollower.findUnique({
          where: {
            shopId_userId: {
              shopId,
              userId,
            },
          },
        });

        if (existing) {
          const currentShop = await tx.shop.findUnique({
            where: { id: shopId },
            select: { followers: true },
          });
          return { followed: true, followers: currentShop?.followers ?? 0 };
        }

        await tx.shopFollower.create({
          data: {
            shopId,
            userId,
          },
        });

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
      // Update database
      const updatedShop = await this.prisma.shop.update({
        where: { id: shopId },
        data: {
          pageDesign: designConfig,
        },
      });

      // Invalidate cache for this shop
      await this.redis.invalidateShopCache(shopId, (updatedShop as any).slug);

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
    const startTime = Date.now();
    const from = range?.from;
    const to = range?.to;
    const cacheKey = `shop:${shopId}:analytics:${from ? from.toISOString() : 'null'}:${to ? to.toISOString() : 'null'}`;

    try {
      // Try to get from cache first (cache for 5 minutes)
      try {
        const cachedAnalytics = await this.redis.get(cacheKey);
        if (cachedAnalytics) {
          const duration = Date.now() - startTime;
          this.monitoring.trackCache('getShopAnalytics', cacheKey, true, duration);
          this.monitoring.trackPerformance('getShopAnalytics_cached', duration);
          return cachedAnalytics;
        }
        this.monitoring.trackCache('getShopAnalytics', cacheKey, false, Date.now() - startTime);
      } catch {
      }

      const now = new Date();
      const effectiveTo = to && !Number.isNaN(to.getTime()) ? to : now;
      const effectiveFrom = from && !Number.isNaN(from.getTime()) ? from : new Date(effectiveTo.getTime() - 30 * 24 * 60 * 60 * 1000);

      const shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        select: { id: true, visitors: true, followers: true },
      });

      const successfulOrderStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
      const ordersInRange = await this.prisma.order.findMany({
        where: {
          shopId,
          status: { in: successfulOrderStatuses as any },
          createdAt: {
            gte: effectiveFrom,
            lte: effectiveTo,
          },
        },
        select: { id: true, userId: true, total: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      const reservationsInRange = await this.prisma.reservation.findMany({
        where: {
          shopId,
          status: 'COMPLETED' as any,
          createdAt: {
            gte: effectiveFrom,
            lte: effectiveTo,
          },
        },
        select: { id: true, customerPhone: true, itemPrice: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      const totalRevenue =
        ordersInRange.reduce((sum, o) => sum + (Number(o.total) || 0), 0) +
        reservationsInRange.reduce((sum, r) => sum + (Number((r as any).itemPrice) || 0), 0);
      const totalOrders = ordersInRange.length + reservationsInRange.length;
      const userIds = new Set<string>();
      for (const o of ordersInRange) userIds.add(String(o.userId));
      for (const r of reservationsInRange) userIds.add(String((r as any).customerPhone || ''));
      userIds.delete('');
      const totalUsers = userIds.size;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      const todayOrders = ordersInRange.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= todayStart.getTime() && t < todayEnd.getTime();
      });

      const todayReservations = reservationsInRange.filter((r) => {
        const t = new Date((r as any).createdAt).getTime();
        return t >= todayStart.getTime() && t < todayEnd.getTime();
      });

      const salesCountToday = todayOrders.length + todayReservations.length;
      const revenueToday =
        todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0) +
        todayReservations.reduce((sum, r) => sum + (Number((r as any).itemPrice) || 0), 0);

      // Last 7 days chart (within available range)
      const chartFrom = new Date(effectiveTo);
      chartFrom.setHours(0, 0, 0, 0);
      chartFrom.setDate(chartFrom.getDate() - 6);

      const chartBuckets: Record<string, number> = {};
      for (let i = 0; i < 7; i += 1) {
        const d = new Date(chartFrom);
        d.setDate(chartFrom.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        chartBuckets[key] = 0;
      }

      for (const o of ordersInRange) {
        const dt = new Date(o.createdAt);
        const key = dt.toISOString().slice(0, 10);
        if (typeof chartBuckets[key] === 'number') {
          chartBuckets[key] += Number(o.total) || 0;
        }
      }

      for (const r of reservationsInRange) {
        const dt = new Date((r as any).createdAt);
        const key = dt.toISOString().slice(0, 10);
        if (typeof chartBuckets[key] === 'number') {
          chartBuckets[key] += Number((r as any).itemPrice) || 0;
        }
      }

      const chartData = Object.keys(chartBuckets)
        .sort()
        .map((key) => {
          const d = new Date(key);
          return {
            name: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
            sales: Math.round(chartBuckets[key]),
          };
        });

      const result = {
        totalRevenue,
        totalOrders,
        totalUsers,
        visitorsCount: Number(shop?.visitors || 0),
        followersCount: Number(shop?.followers || 0),
        salesCountToday,
        revenueToday,
        chartData,
      };

      // Cache analytics for 5 minutes
      try {
        await this.redis.set(cacheKey, result, 300);
      } catch {
      }

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findMany', 'orders', duration, true);
      this.monitoring.trackPerformance('getShopAnalytics_database', duration);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findMany', 'shop_analytics', duration, false);
      throw error;
    }
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
