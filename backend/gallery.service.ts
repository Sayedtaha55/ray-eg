import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { MediaOptimizeService } from './media-optimize.service';
import { MediaStorageService } from './media-storage.service';

@Injectable()
export class GalleryService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MediaStorageService) private readonly mediaStorage: MediaStorageService,
    @Inject(MediaOptimizeService) private readonly mediaOptimize: MediaOptimizeService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  private readonly cacheEnabled = ['1', 'true', 'yes', 'on'].includes(
    String(process.env.GALLERY_CACHE_ENABLE || '').trim().toLowerCase(),
  );

  private getVariantUrls(imageUrl: string) {
    if (!imageUrl) {
      return { thumbUrl: imageUrl, mediumUrl: imageUrl };
    }

    const base = imageUrl.endsWith('-opt.webp')
      ? imageUrl.replace(/-opt\.webp$/, '')
      : imageUrl.replace(/\.webp$/, '');

    return {
      thumbUrl: `${base}-thumb.webp`,
      mediumUrl: `${base}-md.webp`,
    };
  }

  private extractKeyFromUrl(urlOrKey: string): string {
    const raw = String(urlOrKey || '').trim();
    if (!raw) return '';

    if (raw.startsWith('/uploads/')) {
      return raw.replace(/^\/uploads\//, '');
    }

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        const u = new URL(raw);
        return decodeURIComponent(String(u.pathname || '')).replace(/^\/+/, '');
      } catch {
        return '';
      }
    }

    return raw;
  }

  async uploadImage(userId: string, file: any, caption?: string, shopId?: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Get user's shop
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { shop: true }
    });

    if (!user) {
      throw new ForbiddenException('User does not have a shop');
    }

    let targetShopId = user.shop?.id;
    const role = String(user?.role || '').toUpperCase();
    if (!targetShopId && role === 'ADMIN' && shopId) {
      const targetShop = await this.prisma.shop.findUnique({ where: { id: shopId } });
      if (!targetShop) {
        throw new NotFoundException('Shop not found');
      }
      targetShopId = targetShop.id;
    }

    if (!targetShopId) {
      throw new ForbiddenException('User does not have a shop');
    }

    const maxImages = parseInt(process.env.GALLERY_MAX_IMAGES_PER_SHOP || '200', 10);
    const existingCount = await this.prisma.shopGallery.count({
      where: { shopId: targetShopId }
    });

    if (existingCount >= maxImages) {
      throw new BadRequestException(`Maximum ${maxImages} images allowed per gallery`);
    }

    const mime = String(file?.mimetype || '').toLowerCase().trim();
    const isVideo = mime.startsWith('video/');

    const purpose = 'gallery';

    let uploaded: { url: string; key: string };
    try {
      uploaded = await this.mediaStorage.upload({ file, shopId: targetShopId, purpose });
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Failed to upload media');
    }

    let optimized: any = null;
    try {
      optimized = await this.mediaOptimize.optimizeNow({ key: uploaded.key, mimeType: mime, purpose });
    } catch {
      optimized = null;
    }

    if (isVideo) {
      const url = String(optimized?.url || uploaded.url);
      const thumbUrl = String(optimized?.thumbUrl || '').trim() || null;

      const galleryItem = await this.prisma.shopGallery.create({
        data: {
          shopId: targetShopId,
          imageUrl: url,
          mediaType: 'VIDEO',
          thumbUrl,
          caption: caption || '',
          duration: null,
          fileSize: file?.size ? BigInt(file.size) : null,
          isHero: false,
        } as any,
      });

      // Invalidate cache
      try {
        if (this.cacheEnabled) {
          await this.redis.del(`gallery:${targetShopId}`);
        }
      } catch {
        // ignore
      }

      return {
        id: galleryItem.id,
        imageUrl: galleryItem.imageUrl,
        mediaType: (galleryItem as any).mediaType,
        thumbUrl: (galleryItem as any).thumbUrl,
        mediumUrl: (galleryItem as any).mediumUrl,
        caption: galleryItem.caption,
        createdAt: galleryItem.createdAt,
      };
    }

    const url = String(optimized?.url || uploaded.url);
    const thumbUrl = String(optimized?.thumbUrl || '').trim() || null;
    const mediumUrl = String(optimized?.mediumUrl || optimized?.mdUrl || '').trim() || null;

    const galleryImage = await this.prisma.shopGallery.create({
      data: {
        shopId: targetShopId,
        imageUrl: url,
        mediaType: 'IMAGE',
        thumbUrl,
        mediumUrl,
        caption: caption || '',
      } as any,
    });

    // Invalidate cache
    try {
      if (this.cacheEnabled) {
        await this.redis.del(`gallery:${targetShopId}`);
      }
    } catch {
      // ignore
    }

    return {
      id: galleryImage.id,
      imageUrl: galleryImage.imageUrl,
      mediaType: (galleryImage as any).mediaType,
      thumbUrl: (galleryImage as any).thumbUrl,
      mediumUrl: (galleryImage as any).mediumUrl,
      ...this.getVariantUrls(galleryImage.imageUrl),
      caption: galleryImage.caption,
      createdAt: galleryImage.createdAt,
    };
  }

  async getGalleryByShop(shopId: string) {
    const cacheKey = `gallery:${shopId}`;
    
    // Try cache first
    try {
      if (this.cacheEnabled) {
        const cached = await this.redis.get<any>(cacheKey);
        if (Array.isArray(cached)) {
          return cached;
        }
      }
    } catch {}

    let images: any[] = [];
    try {
      const selectFields: any = {
        id: true,
        imageUrl: true,
        mediaType: true,
        thumbUrl: true,
        mediumUrl: true,
        caption: true,
        createdAt: true,
      };

      images = await this.prisma.shopGallery.findMany({
        where: {
          shopId,
        },
        orderBy: { createdAt: 'desc' },
        select: selectFields,
      });
    } catch (err: any) {
      console.error('getGalleryByShop failed:', err);
      throw new BadRequestException(err?.message || 'Failed to load gallery');
    }

    const mapped = (images || []).map((img: any) => {
      const variants = this.getVariantUrls(img?.imageUrl);
      return {
        ...img,
        thumbUrl: img?.thumbUrl || variants.thumbUrl,
        mediumUrl: img?.mediumUrl || variants.mediumUrl,
      };
    });

    // Cache for 5 minutes
    try {
      if (this.cacheEnabled) {
        await this.redis.set(`gallery:${shopId}`, mapped, 300);
      }
    } catch {}

    return mapped;
  }

  async deleteImage(userId: string, imageId: string) {
    // Get user's shop
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { shop: true }
    });

    if (!user) {
      throw new ForbiddenException('User does not have a shop');
    }

    const role = String(user?.role || '').toUpperCase();
    const shopId = user.shop?.id;

    if (role !== 'ADMIN' && !shopId) {
      throw new ForbiddenException('User does not have a shop');
    }

    // Find the image
    const image = await this.prisma.shopGallery.findFirst({
      where: role === 'ADMIN'
        ? { id: imageId }
        : { id: imageId, shopId }
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const variants = this.getVariantUrls((image as any).imageUrl);
    const urlsToDelete = [
      (image as any).imageUrl,
      (image as any).mediumUrl || variants.mediumUrl,
      (image as any).thumbUrl || variants.thumbUrl,
    ];

    for (const u of urlsToDelete) {
      const key = this.extractKeyFromUrl(String(u || ''));
      if (!key) continue;
      try {
        await this.mediaStorage.deleteKey(key);
      } catch {
        // ignore
      }
    }

    // Delete from database
    await this.prisma.shopGallery.delete({
      where: { id: imageId }
    });

    // Invalidate cache
    try {
      if (this.cacheEnabled) {
        await this.redis.del(`gallery:${image.shopId}`);
      }
    } catch {
      // ignore
    }

    return { success: true };
  }

  async updateCaption(userId: string, imageId: string, caption: string) {
    // Get user's shop
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { shop: true }
    });

    if (!user) {
      throw new ForbiddenException('User does not have a shop');
    }

    const role = String(user?.role || '').toUpperCase();
    const shopId = user.shop?.id;

    if (role !== 'ADMIN' && !shopId) {
      throw new ForbiddenException('User does not have a shop');
    }

    if (role === 'ADMIN') {
      const existing = await this.prisma.shopGallery.findUnique({
        where: { id: imageId },
        select: { id: true, shopId: true },
      });
      if (!existing) {
        throw new NotFoundException('Image not found');
      }

      await this.prisma.shopGallery.update({
        where: { id: imageId },
        data: { caption },
      });

      // Invalidate cache
      try {
        if (this.cacheEnabled) {
          await this.redis.del(`gallery:${existing.shopId}`);
        }
      } catch {}

      return { success: true };
    }

    // Update the image
    const image = await this.prisma.shopGallery.updateMany({
      where: { 
        id: imageId,
        shopId 
      },
      data: { caption }
    });

    if (image.count === 0) {
      throw new NotFoundException('Image not found');
    }

    // Invalidate cache
    try {
      if (this.cacheEnabled) {
        await this.redis.del(`gallery:${shopId}`);
      }
    } catch {
      // ignore
    }

    return { success: true };
  }
}
