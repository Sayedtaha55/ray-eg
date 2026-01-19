import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
// import { RedisService } from './redis/redis.service';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';

@Injectable()
export class GalleryService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    // @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  private runFfmpeg(args: string[]) {
    const ffmpegExe = (typeof ffmpegPath === 'string' && ffmpegPath.trim()) ? ffmpegPath : null;
    if (!ffmpegExe) {
      throw new BadRequestException('Video processing is not available (ffmpeg not found)');
    }

    return new Promise<void>((resolve, reject) => {
      const proc = spawn(ffmpegExe, args, { windowsHide: true });
      let stderr = '';
      proc.stderr.on('data', (d) => {
        stderr += String(d || '');
      });
      proc.on('error', reject);
      proc.on('close', (code) => {
        if (code === 0) return resolve();
        reject(new Error(stderr || `ffmpeg exited with code ${code}`));
      });
    });
  }

  private async optimizeVideo(inputPath: string, outputPath: string) {
    await this.runFfmpeg([
      '-y',
      '-i', inputPath,
      '-map', '0:v:0',
      '-map', '0:a?',
      '-vf', 'scale=1280:-2:force_original_aspect_ratio=decrease',
      '-r', '30',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '28',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-c:a', 'aac',
      '-b:a', '96k',
      outputPath,
    ]);
  }

  private async generateVideoThumbnail(inputPath: string, outputPath: string) {
    await this.runFfmpeg([
      '-y',
      '-ss', '00:00:01',
      '-i', inputPath,
      '-frames:v', '1',
      '-vf', 'scale=640:-2:force_original_aspect_ratio=decrease',
      outputPath,
    ]);
  }

  private getSharpMaxPixels() {
    const raw = String(process.env.SHARP_MAX_INPUT_PIXELS || '40000000').trim();
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return 40000000;
    return Math.floor(n);
  }

  private createSharp(buffer: Buffer) {
    return sharp(buffer, { limitInputPixels: this.getSharpMaxPixels() });
  }

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
      try {
        if (file?.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch {
        // ignore
      }
      throw new BadRequestException(`Maximum ${maxImages} images allowed per gallery`);
    }

    const uploadsDir = path.dirname(file.path);
    const baseName = path.parse(file.filename).name;
    const mime = String(file?.mimetype || '').toLowerCase();
    const isVideo = mime.startsWith('video/');

    if (isVideo) {
      const outputFilename = `${baseName}-opt.mp4`;
      const outputPath = path.join(uploadsDir, outputFilename);
      const thumbFilename = `${baseName}-thumb.webp`;
      const thumbPath = path.join(uploadsDir, thumbFilename);

      try {
        await this.optimizeVideo(file.path, outputPath);
        await this.generateVideoThumbnail(outputPath, thumbPath);
      } catch {
        try {
          if (file?.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch {
          // ignore
        }
        throw new BadRequestException('Failed to process video');
      }

      try {
        if (file?.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch {
        // ignore
      }

      const galleryItem = await this.prisma.shopGallery.create({
        data: {
          shopId: targetShopId,
          imageUrl: `/uploads/gallery/${outputFilename}`,
          mediaType: 'VIDEO',
          thumbUrl: `/uploads/gallery/${thumbFilename}`,
          caption: caption || '',
        } as any,
      });

      try {
        // await this.redis.del(`gallery:${targetShopId}`);
      } catch {}

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

    const outputFilename = `${baseName}-opt.webp`;
    const outputPath = path.join(uploadsDir, outputFilename);
    const thumbFilename = `${baseName}-thumb.webp`;
    const thumbPath = path.join(uploadsDir, thumbFilename);
    const mediumFilename = `${baseName}-md.webp`;
    const mediumPath = path.join(uploadsDir, mediumFilename);

    try {
      const inputBuffer = await fs.promises.readFile(file.path);

      await this.createSharp(inputBuffer)
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      await this.createSharp(inputBuffer)
        .rotate()
        .resize({
          width: 900,
          height: 900,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 78 })
        .toFile(mediumPath);

      await this.createSharp(inputBuffer)
        .rotate()
        .resize({
          width: 320,
          height: 320,
          fit: 'cover',
          withoutEnlargement: true,
        })
        .webp({ quality: 75 })
        .toFile(thumbPath);
    } catch {
      try {
        if (file?.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch {
        // ignore
      }
      throw new BadRequestException('Failed to process image');
    }

    try {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch {
      // ignore
    }

    const galleryImage = await this.prisma.shopGallery.create({
      data: {
        shopId: targetShopId,
        imageUrl: `/uploads/gallery/${outputFilename}`,
        mediaType: 'IMAGE',
        thumbUrl: `/uploads/gallery/${thumbFilename}`,
        mediumUrl: `/uploads/gallery/${mediumFilename}`,
        caption: caption || '',
      } as any,
    });

    try {
      // await this.redis.del(`gallery:${targetShopId}`);
    } catch {}

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
      // const cached = await this.redis.get<any>(cacheKey);
      // if (Array.isArray(cached)) {
      //   return cached;
      // }
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
      // await this.redis.set(`gallery:${shopId}`, mapped, 300);
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

    const baseDir = path.resolve(process.cwd(), 'uploads', 'gallery');
    const variants = this.getVariantUrls((image as any).imageUrl);
    const filesToDelete = [
      (image as any).imageUrl,
      (image as any).mediumUrl || variants.mediumUrl,
      (image as any).thumbUrl || variants.thumbUrl,
    ];

    for (const url of filesToDelete) {
      const u = String(url || '');
      if (!u.startsWith('/uploads/gallery/')) continue;
      const rel = u.replace(/^\/uploads\/gallery\//, '');
      const filePath = path.resolve(baseDir, rel);
      if (filePath !== baseDir && !filePath.startsWith(baseDir + path.sep)) continue;
      if (!fs.existsSync(filePath)) continue;
      try {
        fs.unlinkSync(filePath);
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
      // await this.redis.del(`gallery:${image.shopId}`);
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

      try {
        // await this.redis.del(`gallery:${existing.shopId}`);
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
      // await this.redis.del(`gallery:${shopId}`);
    } catch {
      // ignore
    }

    return { success: true };
  }
}
