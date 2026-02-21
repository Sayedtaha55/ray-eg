import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import type { MediaStorage, MediaUploadInput, MediaUploadResult, UploadedFile } from './media-storage.types';

@Injectable()
export class MediaStorageService implements MediaStorage {
  private s3: any | null = null;
  private aws: {
    S3Client: any;
    PutObjectCommand: any;
    GetObjectCommand: any;
    DeleteObjectCommand: any;
  } | null = null;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    console.log('[MediaStorageService] constructor');
  }

  private async getAws() {
    if (this.aws) return this.aws;
    const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    this.aws = { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand };
    return this.aws;
  }

  private cleanEnv(value: any) {
    let v = String(value ?? '').trim();
    if (!v) return '';
    const lowered = v.toLowerCase();
    if (lowered === 'undefined' || lowered === 'null') return '';

    if (
      (v.startsWith('"') && v.endsWith('"') && v.length >= 2) ||
      (v.startsWith("'") && v.endsWith("'") && v.length >= 2)
    ) {
      v = v.slice(1, -1).trim();
    }

    return v;
  }

  private hasR2Config() {
    const accountId = this.cleanEnv(this.config.get<string>('R2_ACCOUNT_ID'));
    const accessKeyId = this.cleanEnv(this.config.get<string>('R2_ACCESS_KEY_ID'));
    const secretAccessKey = this.cleanEnv(this.config.get<string>('R2_SECRET_ACCESS_KEY'));
    const bucket = this.cleanEnv(this.config.get<string>('R2_BUCKET'));
    const publicBase = this.cleanEnv(this.config.get<string>('R2_PUBLIC_BASE_URL'));
    return Boolean(accountId && accessKeyId && secretAccessKey && bucket && publicBase);
  }

  private async getClient() {
    if (this.s3) return this.s3;

    const accountId = this.cleanEnv(this.config.get<string>('R2_ACCOUNT_ID'));
    const accessKeyId = this.cleanEnv(this.config.get<string>('R2_ACCESS_KEY_ID'));
    const secretAccessKey = this.cleanEnv(this.config.get<string>('R2_SECRET_ACCESS_KEY'));

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new BadRequestException('R2 credentials not configured');
    }

    const { S3Client } = await this.getAws();

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    return this.s3;
  }

  private sanitizeSegment(input: string) {
    return String(input || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .slice(0, 64);
  }

  private guessExt(mimeType: string, fileName?: string) {
    const mt = String(mimeType || '').toLowerCase().trim();
    const byMime: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov',
    };

    if (byMime[mt]) return byMime[mt];

    const name = String(fileName || '').trim();
    const dot = name.lastIndexOf('.');
    if (dot > 0 && dot < name.length - 1) {
      const ext = name.slice(dot + 1).toLowerCase();
      if (/^[a-z0-9]{1,8}$/.test(ext)) return ext;
    }

    return 'bin';
  }

  private chooseDriver() {
    // IMPORTANT: keep driver selection consistent with MediaPresignService.
    // If presign returns an R2 public URL, uploads must also go to R2 (and vice versa).
    const raw = this.cleanEnv(this.config.get<string>('MEDIA_STORAGE_MODE') || '')
      .toLowerCase()
      .trim();
    const mode = raw === 'r2' ? 'r2' : raw === 'local' ? 'local' : 'auto';

    const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';

    if (mode === 'local') return 'local' as const;
    if (mode === 'r2') return 'r2' as const;

    // Auto:
    // - Dev: default to local for simplicity.
    // - Prod: use R2 only if fully configured, otherwise fallback to local.
    //   (Presign layer may still enforce R2 for production uploads.)
    if (!isProd) return 'local' as const;

    return this.hasR2Config() ? ('r2' as const) : ('local' as const);
  }

  private validateFile(file: UploadedFile) {
    const mimeType = String((file as any)?.mimetype || '').toLowerCase().trim();
    if (!mimeType) throw new BadRequestException('mimeType مطلوب');

    const allowedTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ]);
    if (!allowedTypes.has(mimeType)) {
      throw new BadRequestException('Unsupported file type');
    }

    const maxBytes = 250 * 1024 * 1024;
    const size = Number((file as any)?.size || 0);
    if (size <= 0) throw new BadRequestException('Empty file');
    if (size > maxBytes) throw new BadRequestException('File too large');

    return { mimeType };
  }

  private buildKey(input: MediaUploadInput, mimeType: string) {
    const purpose = this.sanitizeSegment(input.purpose || 'images') || 'images';
    const ext = this.guessExt(mimeType, (input.file as any)?.originalname);
    const rand = randomBytes(16).toString('hex');
    const shopId = encodeURIComponent(String(input.shopId || '').trim());
    return `shops/${shopId}/${purpose}/${Date.now()}-${rand}.${ext}`;
  }

  private async uploadLocal(input: MediaUploadInput, key: string): Promise<MediaUploadResult> {
    const uploadsRoot = path.resolve(process.cwd(), 'uploads');
    const targetPath = path.resolve(uploadsRoot, key);
    if (!targetPath.startsWith(uploadsRoot)) {
      throw new BadRequestException('Invalid key');
    }

    try {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    } catch {
    }

    const buf = (input.file as any)?.buffer as Buffer;
    await fs.promises.writeFile(targetPath, buf);

    return { key, url: `/uploads/${key}` };
  }

  private async uploadR2(input: MediaUploadInput, key: string, mimeType: string): Promise<MediaUploadResult> {
    if (!this.hasR2Config()) {
      throw new BadRequestException('R2 is not configured');
    }

    const bucket = this.cleanEnv(this.config.get<string>('R2_BUCKET'));
    if (!bucket) throw new BadRequestException('R2_BUCKET not configured');

    const base = this.cleanEnv(this.config.get<string>('R2_PUBLIC_BASE_URL')).replace(/\/+$/, '');
    if (!base) throw new BadRequestException('R2_PUBLIC_BASE_URL not configured');

    const isVideo = String(mimeType || '').toLowerCase().startsWith('video/');
    const cacheControl = isVideo
      ? 'public, max-age=604800'
      : 'public, max-age=31536000, immutable';

    const buf = (input.file as any)?.buffer as Buffer;

    const { PutObjectCommand } = await this.getAws();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buf,
      ContentType: mimeType,
      CacheControl: cacheControl,
    });

    const client = await this.getClient();
    await client.send(command);

    return { key, url: `${base}/${key}` };
  }

  private getUploadsRoot() {
    return path.resolve(process.cwd(), 'uploads');
  }

  private getPublicBaseUrl() {
    const base = this.cleanEnv(this.config.get<string>('R2_PUBLIC_BASE_URL')).replace(/\/+$/, '');
    return base;
  }

  getPublicUrlForKey(key: string) {
    const driver = this.chooseDriver();
    if (driver === 'local') return `/uploads/${key}`;
    const base = this.getPublicBaseUrl();
    return base ? `${base}/${key}` : '';
  }

  async downloadToBuffer(key: string): Promise<{ buffer: Buffer; driver: 'local' | 'r2' }> {
    const driver = this.chooseDriver();

    if (driver === 'local') {
      const uploadsRoot = this.getUploadsRoot();
      const filePath = path.resolve(uploadsRoot, key);
      if (!filePath.startsWith(uploadsRoot)) {
        throw new BadRequestException('Invalid key');
      }
      const buffer = await fs.promises.readFile(filePath);
      return { buffer, driver };
    }

    if (!this.hasR2Config()) {
      throw new BadRequestException('R2 is not configured');
    }

    const bucket = this.cleanEnv(this.config.get<string>('R2_BUCKET'));
    if (!bucket) throw new BadRequestException('R2_BUCKET not configured');

    const { GetObjectCommand } = await this.getAws();
    const client = await this.getClient();
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

    const body = (res as any)?.Body;
    if (!body) {
      throw new BadRequestException('Failed to download object');
    }

    const chunks: Buffer[] = [];
    for await (const chunk of body as any) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return { buffer: Buffer.concat(chunks), driver };
  }

  async uploadBufferToKey(params: {
    key: string;
    buffer: Buffer;
    contentType: string;
    cacheControl?: string;
  }): Promise<MediaUploadResult> {
    const driver = this.chooseDriver();

    if (driver === 'local') {
      const uploadsRoot = this.getUploadsRoot();
      const targetPath = path.resolve(uploadsRoot, params.key);
      if (!targetPath.startsWith(uploadsRoot)) {
        throw new BadRequestException('Invalid key');
      }
      try {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      } catch {
      }
      await fs.promises.writeFile(targetPath, params.buffer);
      return { key: params.key, url: `/uploads/${params.key}` };
    }

    if (!this.hasR2Config()) {
      throw new BadRequestException('R2 is not configured');
    }

    const bucket = this.cleanEnv(this.config.get<string>('R2_BUCKET'));
    if (!bucket) throw new BadRequestException('R2_BUCKET not configured');

    const base = this.getPublicBaseUrl();
    if (!base) throw new BadRequestException('R2_PUBLIC_BASE_URL not configured');

    const { PutObjectCommand } = await this.getAws();
    const client = await this.getClient();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: params.key,
        Body: params.buffer,
        ContentType: params.contentType,
        CacheControl: params.cacheControl,
      }),
    );

    return { key: params.key, url: `${base}/${params.key}` };
  }

  async upload(input: MediaUploadInput): Promise<MediaUploadResult> {
    if (!input?.file) throw new BadRequestException('file مطلوب');
    const roleShopId = String(input.shopId || '').trim();
    if (!roleShopId) throw new BadRequestException('shopId مطلوب');

    const { mimeType } = this.validateFile(input.file);
    const key = this.buildKey(input, mimeType);

    const driver = this.chooseDriver();
    if (driver === 'r2') return await this.uploadR2(input, key, mimeType);
    return await this.uploadLocal(input, key);
  }

  async deleteKey(key: string): Promise<{ ok: true; driver: 'local' | 'r2' } | { ok: false; driver: 'local' | 'r2'; error: string }> {
    const cleanKey = String(key || '').trim();
    if (!cleanKey) throw new BadRequestException('key مطلوب');

    const driver = this.chooseDriver();

    if (driver === 'local') {
      const uploadsRoot = this.getUploadsRoot();
      const targetPath = path.resolve(uploadsRoot, cleanKey);
      if (!targetPath.startsWith(uploadsRoot)) {
        throw new BadRequestException('Invalid key');
      }

      try {
        await fs.promises.unlink(targetPath);
      } catch (e: any) {
        const code = String(e?.code || '');
        if (code === 'ENOENT') return { ok: true, driver };
        return { ok: false, driver, error: String(e?.message || 'Failed to delete file') };
      }

      return { ok: true, driver };
    }

    if (!this.hasR2Config()) {
      return { ok: false, driver, error: 'R2 is not configured' };
    }

    const bucket = this.cleanEnv(this.config.get<string>('R2_BUCKET'));
    if (!bucket) return { ok: false, driver, error: 'R2_BUCKET not configured' };

    try {
      const { DeleteObjectCommand } = await this.getAws();
      const client = await this.getClient();
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: cleanKey }));
      return { ok: true, driver };
    } catch (e: any) {
      return { ok: false, driver, error: String(e?.message || 'Failed to delete object') };
    }
  }
}
