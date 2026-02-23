import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import { PrismaService } from './prisma/prisma.service';
import { MediaCompressionService } from './media-compression.service';

@Injectable()
export class ShopMediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaCompressionService,
  ) {}

  private parseBase64DataUrl(dataUrl: string) {
    const raw = String(dataUrl || '');
    const m = raw.match(/^data:([^;]+);base64,(.+)$/i);
    if (!m) return null;
    const mime = String(m[1] || '').toLowerCase();
    const base64 = String(m[2] || '');
    return { mime, base64 };
  }

  async persistShopImageFromDataUrl(params: { shopId: string; kind: 'logo' | 'banner'; dataUrl: string }) {
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
    const mdUrl = (written as any).md ? `${urlBase}/${baseName}-md.webp` : null;
    const thumbUrl = (written as any).thumb ? `${urlBase}/${baseName}-thumb.webp` : null;

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
}
