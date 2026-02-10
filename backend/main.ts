import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import express from 'express';
import * as path from 'path';
import { createSlowDown } from './middleware/slow-down.middleware';

console.log('[main.ts] File loaded');

process.on('uncaughtException', (err) => {
  try {
    // eslint-disable-next-line no-console
    console.error('[main.ts] uncaughtException:', err);
  } catch {
    // ignore
  }
});

process.on('unhandledRejection', (reason) => {
  try {
    // eslint-disable-next-line no-console
    console.error('[main.ts] unhandledRejection:', reason);
  } catch {
    // ignore
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
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req: any = ctx.getRequest();
    const res: any = ctx.getResponse();

    try {
      // eslint-disable-next-line no-console
      console.error('Unhandled exception:', exception);
    } catch {
    }

    const nodeEnv = String(process.env.NODE_ENV || '').toLowerCase();
    const isDev = nodeEnv !== 'production';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      if (!isDev && status >= 500) {
        return res.status(status).json({ message: 'حدث خطأ، حاول لاحقًا' });
      }

      return res.status(status).json(body);
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
        stack: exception?.stack ? String(exception.stack) : undefined,
      });
    }

    return res.status(500).json({ message: 'حدث خطأ، حاول لاحقًا' });
  }
}

async function bootstrap() {
  console.log('[main.ts] Bootstrap function started');
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

      if (!isDev && allowedOrigins.length === 0) {
        const host = String(url.hostname || '').toLowerCase();
        if (host === 'vercel.app' || host.endsWith('.vercel.app')) {
          return true;
        }
      }

      if (isDev && isPrivateIpv4Host(url.hostname)) {
        return true;
      }

      if (allowedOrigins.includes(origin)) {
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  };

  console.log('[main.ts] NestFactory.create() starting...');

  const createStartedAt = Date.now();
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
  }, 8000);

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: (origin, callback) => {
        return callback(null, isAllowedOrigin(origin));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      optionsSuccessStatus: 204,
    },
  });
  clearTimeout(createWatchdog);
  console.log('[main.ts] NestFactory.create() done');

  console.log('[main.ts] app.init() starting...');
  await app.init();
  console.log('[main.ts] app.init() done');

  if (isDev) {
    try {
      const httpAdapter: any = app.getHttpAdapter?.();
      const instance: any = httpAdapter?.getInstance?.();
      const stack: any[] = instance?._router?.stack || [];
      const routes = stack
        .filter((layer: any) => layer?.route?.path)
        .flatMap((layer: any) => {
          const methods = layer?.route?.methods ? Object.keys(layer.route.methods) : [];
          return methods.map((m: string) => `${m.toUpperCase()} ${layer.route.path}`);
        });

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
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With');
    }

    if (String(req?.method || '').toUpperCase() === 'OPTIONS') {
      return res.sendStatus(allowed ? 204 : 403);
    }

    return next();
  });

  const bodyLimitRaw = String(process.env.BODY_LIMIT || '').trim();
  const bodyLimit = bodyLimitRaw || '25mb';
  app.use(bodyParser.json({ limit: bodyLimit }));
  app.use(bodyParser.urlencoded({ extended: true, limit: bodyLimit }));

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
      if (
        pathName.endsWith('.webp') ||
        pathName.endsWith('.png') ||
        pathName.endsWith('.jpg') ||
        pathName.endsWith('.jpeg') ||
        pathName.endsWith('.avif') ||
        pathName.endsWith('.mp4') ||
        pathName.endsWith('.webm')
      ) {
        if (pathName.endsWith('.mp4') || pathName.endsWith('.webm')) {
          res.setHeader('Cache-Control', 'public, max-age=604800');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    },
  }));

  const apiSlowDown = createSlowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: isDev ? 1000 : 100,
    delayMs: isDev ? 0 : 500,
    maxDelayMs: 4000,
    skip: (req) => {
      const url = String((req as any)?.originalUrl || (req as any)?.url || '');
      return url.startsWith('/api/v1/health') || url.startsWith('/api/v1/db-test');
    },
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

  const galleryUploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: isDev ? 600 : 60,
    message: 'Too many uploads, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => String(req?.method || '').toUpperCase() === 'OPTIONS',
  });

  app.use('/api/v1/gallery/upload', galleryUploadLimiter);

  const mediaPresignLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: isDev ? 1200 : 120,
    message: 'Too many upload requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => String(req?.method || '').toUpperCase() === 'OPTIONS',
  });

  app.use('/api/v1/media/presign', mediaPresignLimiter);

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

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 2000 : 1200,
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

  app.useGlobalFilters(new AnyExceptionFilter());

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
