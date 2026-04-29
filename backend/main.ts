import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import express from 'express';
import compression from 'compression';
import * as path from 'path';
import * as fs from 'fs';
import { createSlowDown } from './middleware/slow-down.middleware';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { idempotencyMiddleware } from './middleware/idempotency.middleware';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { LoggerService } from './logger/logger.service';
import { captureException, initSentry } from './monitoring/sentry.util';

console.log('[main.ts] File loaded');

function loadDotEnvFile(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) return;
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = String(line || '').trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();

      if (!key) continue;
      if (typeof process.env[key] !== 'undefined') continue;

      if (
        (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
        (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

try {
  const root = process.cwd();
  const envPath = path.resolve(root, '.env');
  loadDotEnvFile(envPath);

  const nodeEnv = String(process.env.NODE_ENV || 'development').trim() || 'development';
  const envLocalPath = path.resolve(root, '.env.local');
  const envNodePath = path.resolve(root, `.env.${nodeEnv}`);
  const envNodeLocalPath = path.resolve(root, `.env.${nodeEnv}.local`);

  loadDotEnvFile(envLocalPath);
  loadDotEnvFile(envNodePath);
  loadDotEnvFile(envNodeLocalPath);

  const envLower = String(process.env.NODE_ENV || '').toLowerCase();
  if (envLower !== 'production') {
    try {
      // eslint-disable-next-line no-console
      console.log('[env] NODE_ENV=', process.env.NODE_ENV);
      // eslint-disable-next-line no-console
      console.log('[env] ALLOW_DEV_MERCHANT_BOOTSTRAP=', process.env.ALLOW_DEV_MERCHANT_BOOTSTRAP);
      // eslint-disable-next-line no-console
      console.log('[env] ALLOW_DEV_COURIER_BOOTSTRAP=', process.env.ALLOW_DEV_COURIER_BOOTSTRAP);
      try {
        const dbUrl = String(process.env.DATABASE_URL || '').trim();
        if (dbUrl) {
          const u = new URL(dbUrl);
          const dbName = String(u.pathname || '').replace(/^\//, '');
          // eslint-disable-next-line no-console
          console.log('[env] DATABASE_URL=', `${u.protocol}//${u.host}/${dbName}`);
        } else {
          // eslint-disable-next-line no-console
          console.log('[env] DATABASE_URL=', '(empty)');
        }
      } catch {
        // eslint-disable-next-line no-console
        console.log('[env] DATABASE_URL=', '(unparseable)');
      }
    } catch {
      // ignore
    }
  }
} catch {
  // ignore
}

process.on('uncaughtException', (err) => {
  try {
    // eslint-disable-next-line no-console
    console.error('[main.ts] uncaughtException:', err);
  } catch {
    // ignore
  }

  try {
    void captureException(err, { source: 'uncaughtException' });
  } catch {
  }
});

process.on('unhandledRejection', (reason) => {
  try {
    // eslint-disable-next-line no-console
    console.error('[main.ts] unhandledRejection:', reason);
  } catch {
    // ignore
  }

  try {
    void captureException(reason, { source: 'unhandledRejection' });
  } catch {
  }
});

function isPrivateIpv4Host(hostname: string) {
  const parts = hostname.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

@Catch()
class AnyExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger?: LoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req: any = ctx.getRequest();
    const res: any = ctx.getResponse();

    const requestId = String(req?.requestId || req?.headers?.['x-request-id'] || '').trim() || undefined;

    try {
      void captureException(exception, {
        requestId,
        method: String(req?.method || '').toUpperCase(),
        url: String(req?.originalUrl || req?.url || ''),
        ip: String(req?.ip || ''),
        userId: req?.user?.id ?? req?.user?.userId ?? req?.user?.sub,
      });
    } catch {
    }

    try {
      if (this.logger) {
        this.logger.error('Unhandled exception', {
          requestId,
          method: String(req?.method || '').toUpperCase(),
          url: String(req?.originalUrl || req?.url || ''),
          ip: String(req?.ip || ''),
          userId: req?.user?.id ?? req?.user?.userId ?? req?.user?.sub,
          error: exception?.stack || exception,
        });
      } else {
        // eslint-disable-next-line no-console
        console.error('Unhandled exception:', exception);
      }
    } catch {
    }

    const nodeEnv = String(process.env.NODE_ENV || '').toLowerCase();
    const isDev = nodeEnv !== 'production';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      if (!isDev && status >= 500) {
        return res.status(status).json({ message: 'حدث خطأ، حاول لاحقًا', requestId });
      }

      if (body && typeof body === 'object') {
        return res.status(status).json({ ...(body as any), requestId });
      }
      return res.status(status).json({ message: body, requestId });
    }

    if (isDev) {
      const name = exception?.name ? String(exception.name) : '';
      const statusCode = typeof exception?.$metadata?.httpStatusCode === 'number' ? exception.$metadata.httpStatusCode : undefined;
      const code = exception?.Code ? String(exception.Code) : exception?.code ? String(exception.code) : '';
      const msg = exception?.message ? String(exception.message) : 'Internal error';
      const meta = [name, code, statusCode ? String(statusCode) : ''].filter(Boolean).join(' ');
      const detail = meta ? `${meta}: ${msg}` : msg;
      return res.status(400).json({
        statusCode: 400,
        error: 'Bad Request',
        message: detail,
        requestId,
        stack: exception?.stack ? String(exception.stack) : undefined,
      });
    }

    return res.status(500).json({ message: 'حدث خطأ، حاول لاحقًا', requestId });
  }
}

async function bootstrap() {
  console.log('[main.ts] Bootstrap function started');

  try {
    await initSentry();
  } catch {
  }

  const configuredOriginsRaw = String(
    process.env.CORS_ORIGIN ||
      process.env.FRONTEND_URL ||
      process.env.FRONTEND_APP_URL ||
      '',
  ).trim();
  const allowedOrigins = configuredOriginsRaw
    ? configuredOriginsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';

  const isAllowedOrigin = (origin: string | undefined) => {
    if (!origin) return true;
    try {
      const url = new URL(origin);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return true;
      }

      const originHost = String(url.hostname || '').toLowerCase();
      const originNormalized = `${String(url.protocol || '').toLowerCase()}//${originHost}${url.port ? `:${url.port}` : ''}`;

      if (!isDev && allowedOrigins.length === 0) {
        const host = String(url.hostname || '').toLowerCase();
        if (host === 'vercel.app' || host.endsWith('.vercel.app')) {
          return true;
        }
      }

      if (isDev && isPrivateIpv4Host(url.hostname)) {
        return true;
      }

      for (const entryRaw of allowedOrigins) {
        const entry = String(entryRaw || '').trim();
        if (!entry) continue;

        const entryLower = entry.toLowerCase();

        if (entryLower.startsWith('http://') || entryLower.startsWith('https://')) {
          try {
            const allowedUrl = new URL(entryLower);
            const allowedHost = String(allowedUrl.hostname || '').toLowerCase();
            const allowedNormalized = `${String(allowedUrl.protocol || '').toLowerCase()}//${allowedHost}${allowedUrl.port ? `:${allowedUrl.port}` : ''}`;
            if (allowedNormalized === originNormalized) return true;
          } catch {
            // ignore
          }
          continue;
        }

        if (entryLower.startsWith('*.')) {
          const suffix = entryLower.slice(2);
          if (suffix && (originHost === suffix || originHost.endsWith(`.${suffix}`))) return true;
          continue;
        }

        if (originHost === entryLower) return true;
      }
    } catch {
      // ignore
    }
    return false;
  };

  console.log('[main.ts] NestFactory.create() starting...');

  const createStartedAt = Date.now();
  const createWatchdogMs = (() => {
    const raw = String(process.env.NEST_CREATE_WATCHDOG_MS || '').trim();
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
    return isDev ? 20000 : 8000;
  })();
  const createWatchdog = setTimeout(() => {
    try {
      const elapsed = Date.now() - createStartedAt;
      // eslint-disable-next-line no-console
      console.warn(`[main.ts] NestFactory.create() still pending after ${elapsed}ms`);

      const getActiveHandles = (process as any)?._getActiveHandles;
      const handles: any[] = typeof getActiveHandles === 'function' ? getActiveHandles.call(process) : [];
      const summary = handles.map((h) => {
        const name = h?.constructor?.name || typeof h;
        const info = {
          name,
          fd: (h as any)?.fd,
          path: (h as any)?.path,
          isStdout: h === (process as any).stdout,
          isStderr: h === (process as any).stderr,
          localAddress: (h as any)?.localAddress,
          localPort: (h as any)?.localPort,
          remoteAddress: (h as any)?.remoteAddress,
          remotePort: (h as any)?.remotePort,
        };
        return info;
      });
      // eslint-disable-next-line no-console
      console.warn('[main.ts] Active handles:', summary);
    } catch (e) {
      try {
        // eslint-disable-next-line no-console
        console.warn('[main.ts] create watchdog failed:', e);
      } catch {
      }
    }
  }, createWatchdogMs);

  const disableNestLogger = String(process.env.NEST_DISABLE_LOGGER || '').toLowerCase().trim() === 'true';

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    ...(disableNestLogger ? { logger: false as any } : {}),
    cors: {
      origin: (origin, callback) => {
        return callback(null, isAllowedOrigin(origin));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Idempotency-Key'],
      optionsSuccessStatus: 204,
    },
  });
  clearTimeout(createWatchdog);
  console.log('[main.ts] NestFactory.create() done');

  app.use(requestIdMiddleware);

  app.use('/api', idempotencyMiddleware);

  app.use(compression({
    threshold: 1024,
    level: 6,
  }));

  try {
    const logger = app.get(LoggerService);
    app.useGlobalInterceptors(new TimeoutInterceptor(), new LoggingInterceptor(logger));
    app.useGlobalFilters(new AnyExceptionFilter(logger));
  } catch {
    app.useGlobalFilters(new AnyExceptionFilter());
  }

  const bodyLimitRaw = String(process.env.BODY_LIMIT || '').trim();
  const bodyLimit = bodyLimitRaw || '25mb';
  app.use(bodyParser.json({ limit: bodyLimit }));
  app.use(bodyParser.urlencoded({ extended: true, limit: bodyLimit }));

  console.log('[main.ts] app.init() starting...');
  await app.init();
  console.log('[main.ts] app.init() done');

  if (isDev) {
    try {
      const httpAdapter: any = app.getHttpAdapter?.();
      const instance: any = httpAdapter?.getInstance?.();
      const stack: any[] = instance?._router?.stack || [];

      const parseRoutePath = (p: any) => {
        if (!p) return '';
        if (typeof p === 'string') return p;
        if (p instanceof RegExp) return p.toString();
        return String(p);
      };

      const extractFromStack = (s: any[], prefix: string = ''): string[] => {
        const out: string[] = [];
        for (const layer of s || []) {
          const route = layer?.route;
          if (route?.path && route?.methods) {
            const methods = Object.keys(route.methods);
            const p = `${prefix}${parseRoutePath(route.path)}`;
            for (const m of methods) out.push(`${m.toUpperCase()} ${p}`);
            continue;
          }

          const nestedStack = layer?.handle?.stack;
          if (Array.isArray(nestedStack)) {
            const p = parseRoutePath(layer?.regexp || layer?.path);
            out.push(...extractFromStack(nestedStack, `${prefix}${p === '/' ? '' : p}`));
          }
        }
        return out;
      };

      const routes = extractFromStack(stack);

      const interesting = routes.filter(
        (r) => r.includes('/api/v1/shops') || r.includes('/api/v1/analytics') || r.includes('/api/v1/media'),
      );
      // eslint-disable-next-line no-console
      console.log('[Routes] total=', routes.length);
      // eslint-disable-next-line no-console
      console.log('[Routes] interesting=', interesting);
    } catch {
    }
  }

  // Trust proxy for production (Railway/Cloudflare)
  // Env var: TRUST_PROXY=true (or auto-enabled if RAILWAY_ENVIRONMENT is set)
  const shouldTrustProxy =
    String(process.env.TRUST_PROXY || '').toLowerCase() === 'true' ||
    !!process.env.RAILWAY_ENVIRONMENT;

  if (shouldTrustProxy) {
    const httpAdapter: any = app.getHttpAdapter?.();
    const instance: any = httpAdapter?.getInstance?.();
    if (instance && typeof instance.set === 'function') {
      instance.set('trust proxy', 1);
    }
  }

  app.use((req: any, res: any, next: any) => {
    const origin = typeof req?.headers?.origin === 'string' ? req.headers.origin : undefined;
    const allowed = isAllowedOrigin(origin);

    if (allowed && origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With,Idempotency-Key');
    }

    if (String(req?.method || '').toUpperCase() === 'OPTIONS') {
      return res.sendStatus(allowed ? 204 : 403);
    }

    return next();
  });

  try {
    const httpAdapter: any = app.getHttpAdapter?.();
    const instance: any = httpAdapter?.getInstance?.();
    if (instance && typeof instance.get === 'function') {
      instance.get('/robots.txt', (req: any, res: any) => {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        return res.status(200).send('User-agent: *\nDisallow: /\n');
      });
    }
  } catch {
    // ignore
  }

  app.use('/api', (req: any, res: any, next: any) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return next();
  });

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", "wss:", "https:", "http:"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }));

  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir, {
    fallthrough: false,
    dotfiles: 'ignore',
    immutable: true,
    maxAge: '365d',
    setHeaders: (res, pathName) => {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");

      const lower = String(pathName || '').toLowerCase();
      if (
        lower.endsWith('.html') ||
        lower.endsWith('.htm') ||
        lower.endsWith('.svg') ||
        lower.endsWith('.xml') ||
        lower.endsWith('.json') ||
        lower.endsWith('.js') ||
        lower.endsWith('.mjs') ||
        lower.endsWith('.css') ||
        lower.endsWith('.pdf')
      ) {
        res.setHeader('Content-Disposition', 'attachment');
        res.setHeader('Cache-Control', 'private, no-store');
        return;
      }
      if (
        lower.endsWith('.webp') ||
        lower.endsWith('.png') ||
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.avif') ||
        lower.endsWith('.glb') ||
        lower.endsWith('.gltf') ||
        lower.endsWith('.ktx2') ||
        lower.endsWith('.basis') ||
        lower.endsWith('.wasm') ||
        lower.endsWith('.mp4') ||
        lower.endsWith('.webm')
      ) {
        if (lower.endsWith('.mp4') || lower.endsWith('.webm')) {
          res.setHeader('Cache-Control', 'public, max-age=604800');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    },
  }));

  // Production-ready slow-down: delays aggressive clients to smooth traffic
  // Env vars: API_SLOW_DOWN_AFTER (default 300), API_SLOW_DOWN_MS (default 250)
  const apiSlowDown = createSlowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: parseInt(process.env.API_SLOW_DOWN_AFTER || (isDev ? '1000' : '300'), 10),
    delayMs: parseInt(process.env.API_SLOW_DOWN_MS || (isDev ? '0' : '250'), 10),
    maxDelayMs: 4000,
    skip: (req: any) => String(req?.method || '').toUpperCase() === 'OPTIONS',
  });

  app.use('/api', apiSlowDown);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 200 : 20,
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => String(req?.method || '').toUpperCase() === 'OPTIONS',
  });

  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/signup', authLimiter);

  const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 200 : 20,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => String(req?.method || '').toUpperCase() === 'OPTIONS',
  });

  app.use('/api/v1/auth/password/forgot', forgotPasswordLimiter);

  const galleryUploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: isDev ? 600 : 60,
    message: 'Too many uploads, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => String(req?.method || '').toUpperCase() === 'OPTIONS',
  });

  app.use('/api/v1/gallery/upload', galleryUploadLimiter);

  const publicReadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: parseInt(process.env.PUBLIC_READ_RATE_LIMIT_MAX || (isDev ? '2000' : '600'), 10),
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => {
      const method = String(req?.method || '').toUpperCase();
      if (method === 'OPTIONS') return true;
      if (method !== 'GET' && method !== 'HEAD') return true;
      const url = String(req?.originalUrl || req?.url || '');
      // Only public read endpoints
      if (url.includes('/api/v1/shops/admin')) return true;
      if (url.includes('/api/v1/shops/me')) return true;
      if (url.includes('/api/v1/products/manage')) return true;
      return false;
    },
  });

  app.use('/api/v1/shops', publicReadLimiter);
  app.use('/api/v1/products', publicReadLimiter);

  const publicFeedbackLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: isDev ? 120 : 20,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => String(req?.method || '').toUpperCase() === 'OPTIONS',
  });

  app.use('/api/v1/feedback/public', publicFeedbackLimiter);

  const reservationCreateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: isDev ? 400 : 40,
    message: 'Too many reservation requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => String(req?.method || '').toUpperCase() === 'OPTIONS',
  });

  app.use('/api/v1/reservations', (req: any, res: any, next: any) => {
    if (String(req?.method || '').toUpperCase() === 'POST') {
      return (reservationCreateLimiter as any)(req, res, next);
    }
    return next();
  });

  // Global rate limit for production scaling
  // Env var: GLOBAL_RATE_LIMIT_MAX (default 3000 for production, 2000 for dev)
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX || (isDev ? '2000' : '3000'), 10),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => String(req?.method || '').toUpperCase() === 'OPTIONS',
  }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  console.log('[main.ts] About to listen...');
  const port = parseInt(process.env.PORT || process.env.BACKEND_PORT || '4000', 10);
  const server = await app.listen(port, '0.0.0.0');
  
  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    try {
      await app.close();
    } catch {
      // ignore
    }
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

  // eslint-disable-next-line no-console
  console.log(`✅ Backend running on http://127.0.0.1:${port}`);
}

bootstrap().catch((err) => {
  try {
    // eslint-disable-next-line no-console
    console.error('[main.ts] Fatal bootstrap error:', err);
  } catch {
  }
  process.exit(1);
});
