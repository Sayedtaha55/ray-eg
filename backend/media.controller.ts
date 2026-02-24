import { BadRequestException, Body, Controller, Get, HttpException, Inject, Optional, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { MediaPresignDto } from './media-presign.dto';
import { MediaPresignService } from './media-presign.service';
import { MediaStorageService } from './media-storage.service';
import { MediaOptimizeQueue } from './media-optimize.queue';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const disableGuards = String(process.env.MEDIA_DISABLE_GUARDS || '').toLowerCase() === 'true';
const disableRoles = String(process.env.MEDIA_DISABLE_ROLES || '').toLowerCase() === 'true';
const guards: any[] = disableGuards ? [] : [JwtAuthGuard, RolesGuard];
const merchantAdminRoles: any[] = disableRoles ? [] : ['merchant', 'admin'];

@Controller('api/v1/media')
export class MediaController {
  constructor(
    @Inject(MediaPresignService) private readonly mediaPresign: MediaPresignService,
    @Inject(MediaStorageService) private readonly mediaStorage: MediaStorageService,
  ) {}

  @Post('presign')
  @UseGuards(...guards)
  @Roles(...merchantAdminRoles)
  async presign(@Request() req, @Body() body: MediaPresignDto) {
    try {
      return await this.mediaPresign.presignUpload(body, { role: req.user?.role, shopId: req.user?.shopId });
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      const nodeEnv = String(process.env.NODE_ENV || '').toLowerCase();
      const isDev = nodeEnv !== 'production';
      const host = String(req?.headers?.host || '').toLowerCase();
      const isLocalHost = host.includes('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0');

      if (isDev || isLocalHost) {
        const name = e?.name ? String(e.name) : '';
        const status = typeof e?.$metadata?.httpStatusCode === 'number' ? e.$metadata.httpStatusCode : undefined;
        const code = e?.Code ? String(e.Code) : e?.code ? String(e.code) : '';
        const msg = e?.message ? String(e.message) : 'Internal error';
        const meta = [name, code, status ? String(status) : ''].filter(Boolean).join(' ');
        throw new BadRequestException(meta ? `${meta}: ${msg}` : msg);
      }

      throw e;
    }
  }

  @Post('upload')
  @UseGuards(...guards)
  @Roles(...merchantAdminRoles)
  async uploadMultipart(@Request() req, @Res({ passthrough: true }) res: any) {
    const nodeEnv = String(process.env.NODE_ENV || '').toLowerCase();
    const isDev = nodeEnv !== 'production';
    const host = String(req?.headers?.host || '').toLowerCase();
    const isLocalHost = host.includes('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0');

    try {
      const multerMod: any = await import('multer');
      const multer: any = multerMod?.default ?? multerMod;

      const dir = path.join(os.tmpdir(), 'ray-eg-uploads');
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {
      }

      const upload = multer({
        storage: multer.diskStorage({
          destination: (_req: any, _file: any, cb: any) => cb(null, dir),
          filename: (_req: any, file: any, cb: any) => {
            const ext = path.extname(String(file?.originalname || '')).slice(0, 16);
            const safeExt = ext && /^[a-z0-9.]+$/i.test(ext) ? ext : '';
            const name = `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`;
            cb(null, name);
          },
        }),
        limits: { fileSize: 250 * 1024 * 1024 },
      }).single('file');

      await new Promise<void>((resolve, reject) => {
        upload(req, res, (err: any) => {
          if (err) return reject(err);
          resolve();
        });
      });

      const file = (req as any).file;
      const body = (req as any).body || {};

      if (!file) throw new BadRequestException('file مطلوب');

      const tmpPath = String(file?.path || '').trim();
      if (!tmpPath) throw new BadRequestException('Invalid upload');

      const role = String(req.user?.role || '').toUpperCase();
      const tokenShopId = String(req.user?.shopId || '').trim();
      const bodyShopId = String(body?.shopId || '').trim();
      const shopId = role === 'ADMIN' ? bodyShopId : tokenShopId;
      if (!shopId) throw new BadRequestException('shopId مطلوب');

      const purpose = String(body?.purpose || 'images').trim();

      if (!this.mediaStorage || typeof (this.mediaStorage as any).upload !== 'function') {
        throw new BadRequestException('Media storage is not available');
      }

      let buf: Buffer;
      try {
        buf = await fs.promises.readFile(tmpPath);
      } finally {
        try {
          await fs.promises.unlink(tmpPath);
        } catch {
        }
      }

      const fileWithBuffer = { ...file, buffer: buf };
      const result = await this.mediaStorage.upload({ file: fileWithBuffer, shopId, purpose });
      return { url: result.url, key: result.key };
    } catch (e: any) {
      if (e instanceof HttpException) throw e;

      const name = e?.name ? String(e.name) : '';
      const code = e?.code ? String(e.code) : '';
      const msg = e?.message ? String(e.message) : 'Upload failed';
      const meta = [name, code].filter(Boolean).join(' ');

      if (isDev || isLocalHost) {
        throw new BadRequestException(meta ? `${meta}: ${msg}` : msg);
      }

      throw new BadRequestException('Upload failed');
    }
  }

  @Put('upload')
  @UseGuards(...guards)
  @Roles(...merchantAdminRoles)
  async upload(@Request() req) {
    const keyRaw = String(req?.query?.key || '').trim();
    if (!keyRaw) throw new BadRequestException('key مطلوب');

    if (keyRaw.includes('..') || keyRaw.includes('\\') || keyRaw.startsWith('/') || keyRaw.startsWith('.')) {
      throw new BadRequestException('Invalid key');
    }

    const uploadsRoot = path.resolve(process.cwd(), 'uploads');
    const targetPath = path.resolve(uploadsRoot, keyRaw);
    if (!targetPath.startsWith(uploadsRoot)) {
      throw new BadRequestException('Invalid key');
    }

    try {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    } catch {
    }

    const maxBytes = 250 * 1024 * 1024;
    const chunks: Buffer[] = [];
    let total = 0;
    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk: Buffer) => {
        total += chunk?.length || 0;
        if (total > maxBytes) {
          reject(new BadRequestException('File too large'));
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => resolve());
      req.on('error', (err: any) => reject(err));
    });

    const buf = Buffer.concat(chunks);
    if (!buf || buf.length === 0) throw new BadRequestException('Empty file');

    await fs.promises.writeFile(targetPath, buf);
    return { ok: true, key: keyRaw, publicUrl: `/uploads/${keyRaw}` };
  }
}

@Controller('api/v1/media')
export class MediaControllerLite {
  @Get('ping')
  ping() {
    return { ok: true };
  }
}

@Controller('api/v1/media')
export class MediaControllerPresignOnly {
  constructor(
    @Inject(MediaPresignService) private readonly mediaPresign: MediaPresignService,
    @Optional() private readonly mediaOptimizeQueue?: MediaOptimizeQueue,
  ) {}

  @Post('presign')
  @UseGuards(...guards)
  @Roles(...merchantAdminRoles)
  async presign(@Request() req, @Body() body: MediaPresignDto) {
    try {
      return await this.mediaPresign.presignUpload(body, { role: req.user?.role, shopId: req.user?.shopId });
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      const nodeEnv = String(process.env.NODE_ENV || '').toLowerCase();
      const isDev = nodeEnv !== 'production';
      const host = String(req?.headers?.host || '').toLowerCase();
      const isLocalHost = host.includes('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0');

      if (isDev || isLocalHost) {
        const name = e?.name ? String(e.name) : '';
        const status = typeof e?.$metadata?.httpStatusCode === 'number' ? e.$metadata.httpStatusCode : undefined;
        const code = e?.Code ? String(e.Code) : e?.code ? String(e.code) : '';
        const msg = e?.message ? String(e.message) : 'Internal error';
        const meta = [name, code, status ? String(status) : ''].filter(Boolean).join(' ');
        throw new BadRequestException(meta ? `${meta}: ${msg}` : msg);
      }

      throw e;
    }
  }

  @Post('complete')
  @UseGuards(...guards)
  @Roles(...merchantAdminRoles)
  async complete(@Request() req, @Body() body: any) {
    const key = String(body?.key || '').trim();
    const mimeType = String(body?.mimeType || '').toLowerCase().trim();
    const purpose = typeof body?.purpose === 'string' ? String(body.purpose).trim() : undefined;
    if (!key) throw new BadRequestException('key مطلوب');
    if (!mimeType) throw new BadRequestException('mimeType مطلوب');

    if (!this.mediaOptimizeQueue) {
      return { jobId: '', state: 'queued', queued: false };
    }

    const jobId = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    try {
      await this.mediaOptimizeQueue.enqueue({ jobId, key, mimeType, purpose });
    } catch {
      return { jobId, state: 'queued', queued: false };
    }

    return { jobId, state: 'queued', queued: true };
  }

  @Get('status')
  @UseGuards(...guards)
  @Roles(...merchantAdminRoles)
  async status(@Query('jobId') jobIdRaw?: string, @Query('key') keyRaw?: string) {
    if (!this.mediaOptimizeQueue) {
      return { jobId: String(jobIdRaw || '').trim() || '', status: null };
    }

    const jobId = String(jobIdRaw || '').trim();
    const key = String(keyRaw || '').trim();

    let id = jobId;
    if (!id && key) {
      id = (await this.mediaOptimizeQueue.getJobIdByMediaKey(key)) || '';
    }
    if (!id) throw new BadRequestException('jobId مطلوب');

    const status = await this.mediaOptimizeQueue.getStatus(id);
    return { jobId: id, status };
  }
}

@Controller('api/v1/media')
export class MediaControllerUploadOnly {
  constructor(@Inject(MediaStorageService) private readonly mediaStorage: MediaStorageService) {}

  @Post('upload')
  @UseGuards(...guards)
  @Roles(...merchantAdminRoles)
  async uploadMultipart(@Request() req, @Res({ passthrough: true }) res: any) {
    const multerMod: any = await import('multer');
    const multer: any = multerMod?.default ?? multerMod;

    const dir = path.join(os.tmpdir(), 'ray-eg-uploads');
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
    }

    const upload = multer({
      storage: multer.diskStorage({
        destination: (_req: any, _file: any, cb: any) => cb(null, dir),
        filename: (_req: any, file: any, cb: any) => {
          const ext = path.extname(String(file?.originalname || '')).slice(0, 16);
          const safeExt = ext && /^[a-z0-9.]+$/i.test(ext) ? ext : '';
          const name = `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 250 * 1024 * 1024 },
    }).single('file');

    await new Promise<void>((resolve, reject) => {
      upload(req, res, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const file = (req as any).file;
    const body = (req as any).body || {};
    if (!file) throw new BadRequestException('file مطلوب');

    const tmpPath = String(file?.path || '').trim();
    if (!tmpPath) throw new BadRequestException('Invalid upload');

    const role = String(req.user?.role || '').toUpperCase();
    const tokenShopId = String(req.user?.shopId || '').trim();
    const bodyShopId = String(body?.shopId || '').trim();
    const shopId = role === 'ADMIN' ? bodyShopId : tokenShopId;
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    const purpose = String(body?.purpose || 'images').trim();

    let buf: Buffer;
    try {
      buf = await fs.promises.readFile(tmpPath);
    } finally {
      try {
        await fs.promises.unlink(tmpPath);
      } catch {
      }
    }

    const fileWithBuffer = { ...file, buffer: buf };
    const result = await this.mediaStorage.upload({ file: fileWithBuffer, shopId, purpose });
    return { url: result.url, key: result.key };
  }
}

@Controller('api/v1/media')
export class MediaControllerPutOnly {
  @Put('upload')
  @UseGuards(...guards)
  @Roles(...merchantAdminRoles)
  async upload(@Request() req) {
    const keyRaw = String(req?.query?.key || '').trim();
    if (!keyRaw) throw new BadRequestException('key مطلوب');

    if (keyRaw.includes('..') || keyRaw.includes('\\') || keyRaw.startsWith('/') || keyRaw.startsWith('.')) {
      throw new BadRequestException('Invalid key');
    }

    const uploadsRoot = path.resolve(process.cwd(), 'uploads');
    const targetPath = path.resolve(uploadsRoot, keyRaw);
    if (!targetPath.startsWith(uploadsRoot)) {
      throw new BadRequestException('Invalid key');
    }

    try {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    } catch {
    }

    const maxBytes = 250 * 1024 * 1024;
    const chunks: Buffer[] = [];
    let total = 0;
    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk: Buffer) => {
        total += chunk?.length || 0;
        if (total > maxBytes) {
          reject(new BadRequestException('File too large'));
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => resolve());
      req.on('error', (err: any) => reject(err));
    });

    const buf = Buffer.concat(chunks);
    if (!buf || buf.length === 0) throw new BadRequestException('Empty file');

    await fs.promises.writeFile(targetPath, buf);
    return { ok: true, key: keyRaw, publicUrl: `/uploads/${keyRaw}` };
  }
}
