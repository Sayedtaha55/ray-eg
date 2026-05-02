import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, ValidationPipe } from '@nestjs/common';
import { AppModule } from '@core/app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import express from 'express';
import compression from 'compression';
import * as path from 'path';
import * as fs from 'fs';
import { createSlowDown } from '@common/middleware/slow-down.middleware';
import { requestIdMiddleware } from '@common/middleware/request-id.middleware';
import { idempotencyMiddleware } from '@common/middleware/idempotency.middleware';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from '@common/interceptors/timeout.interceptor';
import { LoggerService } from '@common/logger/logger.service';
import { captureException, initSentry } from '@common/monitoring/sentry.util';

async function bootstrap() {
  try { await initSentry(); } catch {}
  const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: isDev ? ['error', 'warn', 'log', 'debug', 'verbose'] : ['error', 'warn', 'log'],
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
  app.use(compression({ threshold: 1024, level: 6 }));
  app.use(requestIdMiddleware);
  app.use('/api', idempotencyMiddleware);
  const bodyLimit = process.env.BODY_LIMIT || '50mb';
  app.use(bodyParser.json({ limit: bodyLimit }));
  app.use(bodyParser.urlencoded({ extended: true, limit: bodyLimit }));
  try {
    const logger = app.get(LoggerService);
    app.useGlobalInterceptors(new TimeoutInterceptor(), new LoggingInterceptor(logger));
  } catch {}
  if (!isDev) {
    const httpAdapter: any = app.getHttpAdapter?.();
    const instance: any = httpAdapter?.getInstance?.();
    if (instance && typeof instance.set === 'function') instance.set('trust proxy', 1);
  }
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX || '10000', 10),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`✅ MNMKNK High-Performance Backend running on port ${port}`);
}
bootstrap();
