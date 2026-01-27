import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';
import { MediaPresignDto } from './media-presign.dto';

@Injectable()
export class MediaPresignService {
  private s3: S3Client | null = null;

  constructor(private readonly config: ConfigService) {
  }

  private getClient() {
    if (this.s3) return this.s3;

    const accountId = String(this.config.get<string>('R2_ACCOUNT_ID') || '').trim();
    const accessKeyId = String(this.config.get<string>('R2_ACCESS_KEY_ID') || '').trim();
    const secretAccessKey = String(this.config.get<string>('R2_SECRET_ACCESS_KEY') || '').trim();

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new BadRequestException('R2 credentials not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in Railway Environment Variables.');
    }

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

  async presignUpload(dto: MediaPresignDto, auth: { role?: string; shopId?: string }) {
    const mimeType = String(dto?.mimeType || '').toLowerCase().trim();
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

    const isVideo = mimeType.startsWith('video/');
    const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
    const maxImageMbRaw = String(this.config.get<string>('MEDIA_IMAGE_MAX_MB') || '5').trim();
    const maxVideoMbRaw = String(this.config.get<string>('MEDIA_VIDEO_MAX_MB') || (isProd ? '50' : '150')).trim();
    const maxBytes = Math.floor((isVideo ? Number(maxVideoMbRaw) : Number(maxImageMbRaw)) * 1024 * 1024);

    if (typeof dto?.size === 'number' && dto.size > maxBytes) {
      throw new BadRequestException('File too large');
    }

    const role = String(auth?.role || '').toUpperCase();
    const tokenShopId = String(auth?.shopId || '').trim();
    const bodyShopId = String(dto?.shopId || '').trim();

    const shopId = role === 'ADMIN' ? bodyShopId : tokenShopId;
    if (!shopId) throw new ForbiddenException('لا يوجد متجر مرتبط بهذا الحساب');

    const purpose = this.sanitizeSegment(dto?.purpose || (isVideo ? 'videos' : 'images')) || (isVideo ? 'videos' : 'images');
    const ext = this.guessExt(mimeType, dto?.fileName);

    const bucket = String(this.config.get<string>('R2_BUCKET') || '').trim();
    if (!bucket) throw new BadRequestException('R2_BUCKET not configured. Please set R2_BUCKET in Railway Environment Variables.');

    const rand = randomBytes(16).toString('hex');
    const key = `shops/${encodeURIComponent(shopId)}/${purpose}/${Date.now()}-${rand}.${ext}`;

    const expiresInRaw = String(this.config.get<string>('MEDIA_PRESIGN_EXPIRES_SECONDS') || '60').trim();
    const expiresIn = Math.max(10, Math.min(600, Number(expiresInRaw) || 60));

    const cacheControl = isVideo
      ? 'public, max-age=604800'
      : 'public, max-age=31536000, immutable';

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: mimeType,
      CacheControl: cacheControl,
    });

    const uploadUrl = await getSignedUrl(this.getClient(), command, { expiresIn });

    const base = String(this.config.get<string>('R2_PUBLIC_BASE_URL') || '').trim().replace(/\/+$/, '');
    const publicUrl = base ? `${base}/${key}` : '';

    return {
      uploadUrl,
      key,
      publicUrl,
      expiresIn,
    };
  }
}
