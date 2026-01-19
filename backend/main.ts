import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import express from 'express';

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

async function bootstrap() {
  const configuredOriginsRaw = String(process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '').trim();
  const allowedOrigins = configuredOriginsRaw
    ? configuredOriginsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        try {
          const url = new URL(origin);
          if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
            return callback(null, true);
          }

          if (isDev && isPrivateIpv4Host(url.hostname)) {
            return callback(null, true);
          }

          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
        } catch {
          // ignore
        }
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      optionsSuccessStatus: 204,
    },
  });

  if (String(process.env.TRUST_PROXY || '').toLowerCase() === 'true') {
    const httpAdapter: any = app.getHttpAdapter?.();
    const instance: any = httpAdapter?.getInstance?.();
    if (instance && typeof instance.set === 'function') {
      instance.set('trust proxy', 1);
    }
  }

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

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

  app.use('/uploads', express.static('uploads', {
    fallthrough: false,
    dotfiles: 'ignore',
    immutable: true,
    maxAge: '30d',
    setHeaders: (res, pathName) => {
      if (
        pathName.endsWith('.webp') ||
        pathName.endsWith('.png') ||
        pathName.endsWith('.jpg') ||
        pathName.endsWith('.jpeg') ||
        pathName.endsWith('.avif') ||
        pathName.endsWith('.mp4') ||
        pathName.endsWith('.webm')
      ) {
        res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      }
    },
  }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/signup', authLimiter);

  const galleryUploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 60,
    message: 'Too many uploads, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/v1/gallery/upload', galleryUploadLimiter);

  const reservationCreateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 40,
    message: 'Too many reservation requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/v1/reservations', (req: any, res: any, next: any) => {
    if (String(req?.method || '').toUpperCase() === 'POST') {
      return (reservationCreateLimiter as any)(req, res, next);
    }
    return next();
  });

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = parseInt(process.env.PORT || process.env.BACKEND_PORT || '4000', 10);
  const server = await app.listen(port, '0.0.0.0');
  
  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // eslint-disable-next-line no-console
  console.log(`✅ Backend running on http://localhost:${port}`);
}

bootstrap();
