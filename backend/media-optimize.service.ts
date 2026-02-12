import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { MediaCompressionService } from './media-compression.service';
import { MediaStorageService } from './media-storage.service';

type MediaOptimizeStatus =
  | { state: 'queued'; createdAt: string }
  | { state: 'processing'; startedAt: string }
  | { state: 'done'; finishedAt: string; url: string; key: string; thumbUrl?: string; thumbKey?: string }
  | { state: 'failed'; finishedAt: string; error: string };

@Injectable()
export class MediaOptimizeService {
  constructor(
    private readonly compression: MediaCompressionService,
    private readonly storage: MediaStorageService,
  ) {}

  private sanitizeSegment(input: string) {
    return String(input || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .slice(0, 64);
  }

  private splitKey(key: string) {
    const clean = String(key || '').trim();
    const lastDot = clean.lastIndexOf('.');
    if (lastDot <= 0 || lastDot >= clean.length - 1) {
      return { base: clean, ext: '' };
    }
    return { base: clean.slice(0, lastDot), ext: clean.slice(lastDot + 1) };
  }

  private buildImageVariantKey(originalKey: string, variant: 'opt' | 'md' | 'thumb') {
    const { base } = this.splitKey(originalKey);
    return `${base}-${variant}.webp`;
  }

  buildOptimizedKey(originalKey: string) {
    const { base } = this.splitKey(originalKey);
    return `${base}-opt.mp4`;
  }

  buildThumbKey(originalKey: string) {
    const { base } = this.splitKey(originalKey);
    return `${base}-thumb.webp`;
  }

  async optimizeNow(params: { key: string; mimeType: string; purpose?: string }) {
    const key = String(params?.key || '').trim();
    const mimeType = String(params?.mimeType || '').toLowerCase().trim();
    if (!key) throw new BadRequestException('key مطلوب');
    if (!mimeType) throw new BadRequestException('mimeType مطلوب');

    const isVideo = mimeType.startsWith('video/');

    if (!isVideo) {
      const { buffer } = await this.storage.downloadToBuffer(key);
      const sharpMod: any = await (async () => {
        try {
          const mod: any = await import('sharp');
          return mod?.default ?? mod;
        } catch {
          return null;
        }
      })();

      if (!sharpMod) {
        throw new BadRequestException('Image processing is not available (sharp not found)');
      }

      const limitInputPixels = (() => {
        const raw = String(process.env.SHARP_MAX_INPUT_PIXELS || '40000000').trim();
        const n = Number(raw);
        return Number.isFinite(n) && n > 0 ? Math.floor(n) : 40000000;
      })();

      const img = sharpMod(buffer, { limitInputPixels }).rotate();

      const qRaw = String(process.env.MEDIA_IMAGE_WEBP_QUALITY || '78').trim();
      const q = Math.max(35, Math.min(95, Number(qRaw) || 78));

      const optKey = this.buildImageVariantKey(key, 'opt');
      const mdKey = this.buildImageVariantKey(key, 'md');
      const thumbKey = this.buildImageVariantKey(key, 'thumb');

      const [optBuf, mdBuf, thumbBuf] = await Promise.all([
        img
          .clone()
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: q })
          .toBuffer(),
        img
          .clone()
          .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: Math.max(30, q - 2) })
          .toBuffer(),
        img
          .clone()
          .resize({ width: 320, height: 320, fit: 'cover', withoutEnlargement: true })
          .webp({ quality: Math.max(28, q - 4) })
          .toBuffer(),
      ]);

      const [optRes, mdRes, thumbRes] = await Promise.all([
        this.storage.uploadBufferToKey({
          key: optKey,
          buffer: optBuf,
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000, immutable',
        }),
        this.storage.uploadBufferToKey({
          key: mdKey,
          buffer: mdBuf,
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000, immutable',
        }),
        this.storage.uploadBufferToKey({
          key: thumbKey,
          buffer: thumbBuf,
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000, immutable',
        }),
      ]);

      return {
        url: optRes.url,
        key: optRes.key,
        thumbUrl: thumbRes.url,
        thumbKey: thumbRes.key,
        mediumUrl: mdRes.url,
        mediumKey: mdRes.key,
      } as any;
    }

    // Video: keep original file, generate optimized mp4 + thumbnail webp
    const purpose = this.sanitizeSegment(params?.purpose || 'videos') || 'videos';
    const workDir = path.join(os.tmpdir(), 'ray-eg-media-opt');
    this.compression.ensureDir(workDir);

    const rand = randomBytes(12).toString('hex');
    const inputPath = path.join(workDir, `${Date.now()}-${rand}-in`);

    const { buffer } = await this.storage.downloadToBuffer(key);
    await fs.promises.writeFile(inputPath, buffer);

    const optimizedKey = this.buildOptimizedKey(key);
    const thumbKey = this.buildThumbKey(key);
    const outputPath = path.join(workDir, `${Date.now()}-${rand}-opt.mp4`);
    const thumbPath = path.join(workDir, `${Date.now()}-${rand}-thumb.webp`);

    try {
      await this.compression.optimizeVideoMp4(inputPath, outputPath);
      await this.compression.generateVideoThumbnailWebp(outputPath, thumbPath);

      const [optBuf, thumbBuf] = await Promise.all([
        fs.promises.readFile(outputPath),
        fs.promises.readFile(thumbPath),
      ]);

      const optRes = await this.storage.uploadBufferToKey({
        key: optimizedKey,
        buffer: optBuf,
        contentType: 'video/mp4',
        cacheControl: 'public, max-age=604800',
      });

      const thumbRes = await this.storage.uploadBufferToKey({
        key: thumbKey,
        buffer: thumbBuf,
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000, immutable',
      });

      return {
        url: optRes.url,
        key: optRes.key,
        thumbUrl: thumbRes.url,
        thumbKey: thumbRes.key,
        purpose,
      };
    } finally {
      await Promise.all([
        fs.promises.unlink(inputPath).catch(() => undefined),
        fs.promises.unlink(outputPath).catch(() => undefined),
        fs.promises.unlink(thumbPath).catch(() => undefined),
      ]);
    }
  }

  static serializeStatus(s: MediaOptimizeStatus) {
    return JSON.stringify(s);
  }

  static parseStatus(raw: any): MediaOptimizeStatus | null {
    if (!raw) return null;
    try {
      return JSON.parse(String(raw));
    } catch {
      return null;
    }
  }
}
