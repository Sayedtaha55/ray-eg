import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ path: ['.env', `.env.${process.env.NODE_ENV || 'development'}`, '.env.local', `.env.${process.env.NODE_ENV || 'development'}.local`] });
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@core/app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import express from 'express';
import compression from 'compression';
import { createSlowDown } from '@common/middleware/slow-down.middleware';
import { requestIdMiddleware } from '@common/middleware/request-id.middleware';
import { idempotencyMiddleware, setIdempotencyRedisGetter } from '@common/middleware/idempotency.middleware';
import { csrfMiddleware } from '@common/middleware/csrf.middleware';
import { authRateLimitMiddleware } from '@common/middleware/auth-rate-limit.middleware';
import { CircuitBreakerMiddleware } from '@common/middleware/circuit-breaker.middleware';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from '@common/interceptors/timeout.interceptor';
import { AuditLogInterceptor } from '@common/interceptors/audit-log.interceptor';
import { TracingInterceptor } from '@common/interceptors/tracing.interceptor';
import { LoggerService } from '@common/logger/logger.service';
import { captureException, initSentry } from '@common/monitoring/sentry.util';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { logEnvValidation } from '@common/config/env-validation.util';
import { PrismaService } from '@common/prisma/prisma.service';
import { AdminIpGuard } from '@common/guards/admin-ip.guard';

async function bootstrap() {
  logEnvValidation();
  try { await initSentry(); } catch {}
  const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: isDev ? ['error', 'warn', 'log', 'debug', 'verbose'] : ['error', 'warn', 'log'],
  });
  app.enableShutdownHooks();
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = String(process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
      if (isDev) {
        return callback(null, true);
      }
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes('*')) {
        console.warn('[CORS] Wildcard origin (*) is not recommended in production — refusing request from', origin);
        return callback(new Error('Not allowed by CORS'));
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Idempotency-Key', 'X-CSRF-Token'],
    exposedHeaders: ['X-CSRF-Token'],
  });
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: isDev ? ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"] : ["'self'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", ...(isDev ? ["http:"] : [])],
        connectSrc: isDev ? ["'self'", "wss:", "https:", "http:"] : ["'self'", "wss:", "https:"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }));
  app.use(compression({ threshold: 1024, level: 6 }));
  app.use(requestIdMiddleware);
  app.use('/api', idempotencyMiddleware);
  app.use('/api', authRateLimitMiddleware);

  // Wire Redis client into idempotency middleware for distributed support
  try {
    const { RedisService } = await import('@common/redis/redis.service');
    const redisService = app.get(RedisService);
    const client = redisService?.getClient?.();
    if (client) {
      setIdempotencyRedisGetter(() => client);
    }
  } catch {
    // Redis not available — idempotency will fall back to in-memory store
  }
  const bodyLimit = process.env.BODY_LIMIT || '10mb';
  app.use(bodyParser.json({ limit: bodyLimit }));
  app.use(bodyParser.urlencoded({ extended: true, limit: bodyLimit }));
  app.use('/api', csrfMiddleware);
  try {
    const logger = app.get(LoggerService);
    app.useGlobalInterceptors(new TimeoutInterceptor(), new TracingInterceptor(), new LoggingInterceptor(logger), new AuditLogInterceptor(app.get(PrismaService)));
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

  // Cache headers for static assets
  app.use((req, res, next) => {
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.path.startsWith('/api')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    next();
  });

  // Graceful degradation middleware
  app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
      if (res.statusCode >= 500) {
        // On server errors, return a graceful response
        if (req.path.startsWith('/api')) {
          const body = JSON.stringify({
            success: false,
            error: 'Service temporarily unavailable',
            message: 'يرجى المحاولة مرة أخرى لاحقاً',
            retryAfter: 30,
          });
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Length', Buffer.byteLength(body));
          return originalSend.call(this, body);
        }
      }
      return originalSend.call(this, data);
    };
    next();
  });
  const apiCircuitBreaker = new CircuitBreakerMiddleware({
    failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURES || '10', 10),
    resetTimeoutMs: parseInt(process.env.CIRCUIT_BREAKER_RESET_MS || '30000', 10),
  });
  app.use('/api', apiCircuitBreaker.use.bind(apiCircuitBreaker));
  app.setGlobalPrefix('api/v1', {
    exclude: ['monitoring', 'monitoring/health'],
  });

  // Dev-only endpoint for TestSprite to retrieve password reset token
  if (isDev) {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/testing/internal/get-reset-token', async (req: any, res: any) => {
      try {
        const email = String(req?.query?.email || '').toLowerCase().trim();
        if (!email) return res.status(400).json({ success: false, message: 'email is required' });
        const { AuthService } = await import('@modules/auth/auth.service');
        const authService = app.get(AuthService);
        const token = await authService.generateTestResetToken(email);
        return res.status(200).json({ token });
      } catch (err: any) {
        return res.status(400).json({ success: false, message: String(err?.message || 'error') });
      }
    });
    // Alias for test compatibility
    expressApp.get('/api/v1/auth/password/reset-token-test', async (req: any, res: any) => {
      try {
        const email = String(req?.query?.email || '').toLowerCase().trim();
        if (!email) return res.status(400).json({ success: false, message: 'email is required' });
        const { AuthService } = await import('@modules/auth/auth.service');
        const authService = app.get(AuthService);
        const token = await authService.generateTestResetToken(email);
        return res.status(200).json({ token });
      } catch (err: any) {
        return res.status(400).json({ success: false, message: String(err?.message || 'error') });
      }
    });
  }
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalGuards(new AdminIpGuard());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false,
    transformOptions: { enableImplicitConversion: true },
    validationError: { target: false, value: false },
  }));
  const port = parseInt(process.env.PORT || '4000', 10);
  try {
    await app.listen(port, '0.0.0.0');
    console.log(`✅ MNMKNK Backend running on port ${port}`);
  } catch (err) {
    console.error(`[Bootstrap] Failed to listen on port ${port}:`, err);
    process.exit(1);
  }
}
bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal error:', err);
  process.exit(1);
});
