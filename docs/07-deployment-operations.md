# 7) دليل النشر والتشغيل الإنتاجي الشامل

## 7.1 نموذج النشر (Deployment Model)

### 7.1.1 بنية النشر الموصى بها
```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (CDN)                      │
│                   (Cloudflare/AWS CloudFront)             │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Frontend (Static Assets)                 │
│                   (Vercel/Netlify/CloudFront)           │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Backend API (Node.js/NestJS)              │
│                   (Railway/DigitalOcean/AWS)             │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Database (PostgreSQL)                      │
│                   (Managed/Cloud/On-Premise)             │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Cache Layer (Redis)                        │
│                   (Managed/Cloud/On-Premise)             │
└─────────────────────────────────────────────────────────────┘
```

### 7.1.2 الخدمات المفصولة
**Frontend (Static Assets):**
- **Vercel** (موصى به للـ React SPA)
- **Netlify** (بديل ممتاز)
- **AWS CloudFront + S3** (للمشاريع الكبيرة)
- **Cloudflare Pages** (لـ performance عالي)

**Backend API:**
- **Railway** (موصى به للـ Node.js)
- **DigitalOcean** (بديل اقتصادي)
- **AWS EC2/ECS** (للمشاريع الكبيرة)
- **Google Cloud Run** (serverless option)

**Database:**
- **Railway PostgreSQL** (موصى به)
- **AWS RDS** (للمشاريع الكبيرة)
- **Neon** (serverless PostgreSQL)
- **Supabase** (PostgreSQL مع إضافات)

**Cache Layer:**
- **Railway Redis** (موصى به)
- **Redis Cloud** (Redis.com)
- **AWS ElastiCache** (للمشاريع الكبيرة)
- **Upstash** (serverless Redis)

## 7.2 أوامر البناء (Build Commands)

### 7.2.1 بناء الواجهة الأمامية
```bash
# بناء للإنتاج
npm run build

# بناء مع تحليل الأداء
npm run build:analyze

# بناء مع تحسين الصور
npm run build:optimize

# بناء مع PWA
npm run build:pwa

# التحقق من البناء
npm run build:check
```

### 7.2.2 بناء الواجهة الخلفية
```bash
# بناء للإنتاج
npm run backend:build

# بناء مع source maps (للتصحيح)
npm run backend:build:dev

# بناء محسّن
npm run backend:build:prod

# بناء مع Docker
npm run backend:build:docker

# بناء مخصص للمنصة
npm run vercel-build
```

### 7.2.3 Vite Configuration للبناء
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@services': resolve(__dirname, 'src/services'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          state: ['@reduxjs/toolkit', 'react-redux'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5174,
    host: true,
  },
  preview: {
    port: 4174,
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
```

## 7.3 تشغيل الخادم في الإنتاج

### 7.3.1 إعداد البيئة للإنتاج
```bash
# .env.production
NODE_ENV=production
PORT=4000
BACKEND_PORT=4000

# قاعدة البيانات
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# الأمان
JWT_SECRET="your-super-secure-jwt-secret"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
BCRYPT_ROUNDS=12

# CORS والواجهة الأمامية
CORS_ORIGIN="https://your-domain.com,https://www.your-domain.com"
FRONTEND_URL="https://your-domain.com"
FRONTEND_APP_URL="https://your-domain.com"

# الخدمات الخارجية
GEMINI_API_KEY="your-gemini-api-key"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# التخزين
MEDIA_STORAGE_MODE="s3"
AWS_S3_BUCKET="your-s3-bucket"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"

# البريد الإلكتروني
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"

# المراقبة
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="info"

# التشغيل
TRUST_PROXY=true
MINIMAL_BOOT=false
BOOT_MODULES="auth,shop,product,order,payment,courier,analytics"
```

### 7.3.2 إعداد Health Checks
```typescript
// backend/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, Type } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health';
import { RedisHealthIndicator } from './redis.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private redisHealth: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('prisma'),
      () => this.redisHealth.isHealthy('redis'),
      () => ({ status: 'up', message: 'Application is healthy' }),
    ]);
  }

  @Get('detailed')
  @HealthCheck()
  checkDetailed() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('prisma'),
      () => this.redisHealth.isHealthy('redis'),
      () => ({ status: 'up', message: 'Application is healthy' }),
      () => ({ status: 'up', message: 'Database connections are healthy' }),
      () => ({ status: 'up', message: 'Cache layer is healthy' }),
    ]);
  }
}
```

### 7.3.3 Graceful Shutdown
```typescript
// backend/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ... إعدادات التطبيق

  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    
    app.close().then(() => {
      console.log('Application closed successfully');
      process.exit(0);
    }).catch((error) => {
      console.error('Error during application shutdown', error);
      process.exit(1);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  await app.listen(process.env.PORT || 4000);
}
```

## 7.4 متغيرات البيئة الحرجة للإنتاج

### 7.4.1 متغيرات أساسية
```bash
# إعدادات الخادم
NODE_ENV=production
PORT=4000
BACKEND_PORT=4000
HOST=0.0.0.0

# قاعدة البيانات
DATABASE_URL="postgresql://username:password@host:5432/database"
DIRECT_URL="postgresql://username:password@host:5432/database"

# الأمان
JWT_SECRET="your-super-secure-jwt-secret-min-32-chars"
REFRESH_TOKEN_SECRET="your-refresh-token-secret-min-32-chars"
BCRYPT_ROUNDS=12
SESSION_SECRET="your-session-secret-min-32-chars"

# CORS والواجهات
CORS_ORIGIN="https://your-domain.com,https://www.your-domain.com"
FRONTEND_URL="https://your-domain.com"
FRONTEND_APP_URL="https://your-domain.com"
ALLOWED_ORIGINS="https://your-domain.com,https://www.your-domain.com"

# التشغيل المرن
TRUST_PROXY=true
MINIMAL_BOOT=false
BOOT_MODULES="auth,shop,product,order,payment,courier,analytics,notification"
```

### 7.4.2 متغيرات الخدمات الخارجية
```bash
# Google Services
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# AI Services
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Payment Gateways
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
PAYMO_API_KEY="your-paymo-api-key"
FAWRY_API_KEY="your-fawry-api-key"

# Email Services
SENDGRID_API_KEY="your-sendgrid-api-key"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"

# SMS Services
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
```

### 7.4.3 متغيرات التخزين والملفات
```bash
# AWS S3
AWS_S3_BUCKET="your-s3-bucket"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_ENDPOINT="https://s3.amazonaws.com"

# التخزين المحلي
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"  # 10MB
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/avi"

# CDN
CDN_URL="https://cdn.your-domain.com"
STATIC_URL="https://static.your-domain.com"
```

## 7.5 صحة الخدمة والمراقبة (Health & Monitoring)

### 7.5.1 Health Endpoints
```typescript
// Health endpoints للمراقبة
GET /health                    # Health check أساسي
GET /health/detailed          # Health check مفصل
GET /monitoring/uptime        # Uptime statistics
GET /monitoring/metrics        # Performance metrics
GET /monitoring/alerts         # Active alerts
GET /monitoring/dashboard      # Monitoring dashboard
```

### 7.5.2 Metrics Collection
```typescript
// backend/src/monitoring/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/client';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getSystemMetrics() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsers24h,
      totalOrders,
      orders24h,
      totalRevenue,
      revenue24h,
      totalShops,
      activeShops24h,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: last24h } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: last24h } }),
      this.prisma.order.aggregate({ _sum: { total: true } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: last24h } },
      }),
      this.prisma.shop.count(),
      this.prisma.shop.count({ where: { isActive: true, createdAt: { gte: last24h } }),
    ]);

    return {
      users: {
        total: totalUsers,
        new24h: newUsers24h,
        growth7d: await this.calculateGrowth('user', last7d),
      },
      orders: {
        total: totalOrders,
        new24h: orders24h,
        growth7d: await this.calculateGrowth('order', last7d),
      },
      revenue: {
        total: totalRevenue._sum.total || 0,
        last24h: revenue24h._sum.total || 0,
        growth7d: await this.calculateRevenueGrowth(last7d),
      },
      shops: {
        total: totalShops,
        active24h: activeShops24h,
        growth7d: await this.calculateGrowth('shop', last7d),
      },
      timestamp: now,
    };
  }

  private async calculateGrowth(model: string, since: Date) {
    const before = await this.prisma[model].count({
      where: { createdAt: { lt: since } },
    });
    const after = await this.prisma[model].count({
      where: { createdAt: { gte: since } },
    });
    return before > 0 ? ((after - before) / before) * 100 : 0;
  }

  private async calculateRevenueGrowth(since: Date) {
    const before = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { lt: since } },
    });
    const after = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: since } },
    });
    const beforeRevenue = before._sum.total || 0;
    const afterRevenue = after._sum.total || 0;
    return beforeRevenue > 0 ? ((afterRevenue - beforeRevenue) / beforeRevenue) * 100 : 0;
  }
}
```

### 7.5.3 Alerting System
```typescript
// backend/src/monitoring/alerts.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AlertsService {
  private alerts: Map<string, Alert> = new Map();

  @Cron('*/5 * * * *') // كل 5 دقائق
  async checkSystemHealth() {
    const checks = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.checkRedisHealth(),
      this.checkDiskSpace(),
      this.checkMemoryUsage(),
      this.checkResponseTime(),
    ]);

    const failedChecks = checks.filter(check => check.status === 'rejected');
    
    if (failedChecks.length > 0) {
      await this.sendAlert({
        type: 'system',
        severity: 'critical',
        message: `System health check failed: ${failedChecks.length} services down`,
        details: failedChecks.map(check => check.reason),
      });
    }
  }

  async checkDatabaseHealth(): Promise<HealthCheck> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'fulfilled', service: 'database' };
    } catch (error) {
      return { status: 'rejected', service: 'database', reason: error.message };
    }
  }

  async checkRedisHealth(): Promise<HealthCheck> {
    try {
      await this.redis.ping();
      return { status: 'fulfilled', service: 'redis' };
    } catch (error) {
      return { status: 'rejected', service: 'redis', reason: error.message };
    }
  }

  private async sendAlert(alert: Alert) {
    // إرسال إلى Sentry
    if (this.sentry) {
      this.sentry.captureMessage(alert.message, {
        level: alert.severity === 'critical' ? 'fatal' : 'error',
        extra: alert.details,
      });
    }

    // إرسال بريد إلكتروني
    await this.emailService.sendAlert(alert);

    // إرسال Slack notification
    await this.slackService.sendAlert(alert);
  }
}
```

## 7.6 التعامل مع الضغط العالي (High Load Handling)

### 7.6.1 Rate Limiting Strategy
```typescript
// backend/src/common/guards/rate-limit.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from 'nestjs-rate-limit';

@Injectable()
export class CustomRateLimitGuard extends RateLimitGuard {
  protected getRequestIdentifier(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    return request.ip || request.headers['x-forwarded-for'];
  }

  protected getKey(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const endpoint = request.route.path;
    const method = request.method;
    return `${method}:${endpoint}`;
  }

  protected getSkipIf(): boolean {
    return false;
  }
}

// Rate limiting configurations
export const rateLimitConfigs = {
  // Strict limits for sensitive endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 5, // 5 محاولات فقط
    message: 'Too many authentication attempts',
  },
  
  // Moderate limits for general API
  api: {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // 100 طلب
    message: 'Rate limit exceeded',
  },
  
  // Lenient limits for public endpoints
  public: {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 1000, // 1000 طلب
    message: 'Rate limit exceeded',
  },
};
```

### 7.6.2 Caching Strategy
```typescript
// backend/src/common/interceptors/cache.interceptor.ts
import { Injectable, ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor {
  constructor(private cacheManager: CacheManager) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request);
    
    // محاولة الحصول من الكاش
    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // تنفيذ الطلب وتخزين النتيجة
    return next.handle().pipe(
      tap(async (response) => {
        // تخزين النتيجة في الكاش لمدة 5 دقائق
        await this.cacheManager.set(cacheKey, response, 300000);
      }),
    );
  }

  private generateCacheKey(request: Request): string {
    const { method, url, query } = request;
    const queryString = new URLSearchParams(query).toString();
    return `${method}:${url}:${queryString}`;
  }
}
```

### 7.6.3 Queue System for Heavy Tasks
```typescript
// backend/src/queues/queue.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('heavy-tasks')
export class HeavyTasksProcessor {
  @Process('send-email')
  async sendEmail(job: Job) {
    const { to, subject, template, data } = job.data;
    
    try {
      await this.emailService.sendEmail(to, subject, template, data);
      
      // تحديث حالة الـ job
      await job.progress(100);
      
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      // إعادة المحاولة بعد 30 ثانية
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  @Process('generate-report')
  async generateReport(job: Job) {
    const { userId, reportType, filters } = job.data;
    
    try {
      // تحديث التقدم
      await job.progress(10);
      
      const report = await this.reportService.generateReport(
        userId,
        reportType,
        filters,
      );
      
      await job.progress(50);
      
      // حفظ التقرير
      await this.reportService.saveReport(report);
      
      await job.progress(100);
      
      return { success: true, reportId: report.id };
    } catch (error) {
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }
}
```

## 7.7 إغلاق آمن للخدمة (Secure Shutdown)

### 7.7.1 Graceful Shutdown Implementation
```typescript
// backend/src/shutdown/shutdown.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Injectable()
export class ShutdownService implements OnModuleDestroy {
  private readonly logger = new Logger(ShutdownService.name);
  private isShuttingDown = false;

  async onModuleDestroy() {
    this.logger.log('Application is shutting down...');
    await this.gracefulShutdown();
  }

  async gracefulShutdown() {
    if (this.isShuttingDown) {
      return;
    }
    
    this.isShuttingDown = true;
    
    try {
      // 1. Stop accepting new connections
      this.logger.log('Stopping new connections...');
      
      // 2. Wait for existing requests to complete
      this.logger.log('Waiting for existing requests to complete...');
      await this.waitForRequestsToComplete();
      
      // 3. Close database connections
      this.logger.log('Closing database connections...');
      await this.closeDatabaseConnections();
      
      // 4. Clear cache
      this.logger.log('Clearing cache...');
      await this.clearCache();
      
      // 5. Close file handles
      this.logger.log('Closing file handles...');
      await this.closeFileHandles();
      
      this.logger.log('Graceful shutdown completed successfully');
    } catch (error) {
      this.logger.error('Error during graceful shutdown', error);
      throw error;
    }
  }

  private async waitForRequestsToComplete(timeout = 30000): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        // تحقق إذا كانت هناك طلبات نشطة
        const activeRequests = this.getActiveRequestsCount();
        if (activeRequests === 0) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000);
      
      // إجبار المهلة
      setTimeout(() => {
        clearInterval(checkInterval);
        this.logger.warn(`Timeout waiting for requests to complete. ${this.getActiveRequestsCount()} requests still active.`);
        resolve();
      }, timeout);
    });
  }

  private getActiveRequestsCount(): number {
    // تطبيق منطق عد الطلبات النشطة
    return 0; // Placeholder
  }

  private async closeDatabaseConnections(): Promise<void> {
    // إغلاق اتصالات قاعدة البيانات
    // await this.prisma.$disconnect();
  }

  private async clearCache(): Promise<void> {
    // مسح الـ cache
    // await this.cacheManager.reset();
  }

  private async closeFileHandles(): Promise<void> {
    // إغلاق ملفات مفتوحة
    // Close any open file streams
  }
}
```

### 7.7.2 Zero-Downtime Deployment
```bash
#!/bin/bash
# scripts/zero-downtime-deploy.sh

echo "Starting zero-downtime deployment..."

# 1. بناء النسخة الجديدة
echo "Building new version..."
npm run build
npm run backend:build

# 2. تشغيل النسخة الجديدة على بورت مختلف
echo "Starting new version on port 4001..."
PORT=4001 npm run backend:start &

NEW_PID=$!
echo "New version started with PID: $NEW_PID"

# 3. انتظر حتى تصبح النسخة الجديدة جاهزة
echo "Waiting for new version to be ready..."
sleep 30

# 4. التحقق من صحة النسخة الجديدة
echo "Checking new version health..."
if curl -f http://localhost:4001/health; then
    echo "New version is healthy"
    
    # 5. تحديث load balancer
    echo "Updating load balancer..."
    # تحديث load balancer للإشارة إلى البورت الجديد
    
    # 6. إيقاف النسخة القديمة
    echo "Stopping old version..."
    kill $(cat /tmp/old-app.pid)
    
    # 7. إعادة تشغيل النسخة الجديدة على البورت الأساسي
    echo "Restarting new version on port 4000..."
    kill $NEW_PID
    PORT=4000 npm run backend:start &
    
    echo "Deployment completed successfully"
else
    echo "New version health check failed, rolling back..."
    kill $NEW_PID
    exit 1
fi
```

## 7.8 Docker Configuration

### 7.8.1 Multi-stage Dockerfile
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Build stage
FROM base AS builder
WORKDIR /app
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set work directory
WORKDIR /app

# Copy dependencies
COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy environment files
COPY .env.production .env

# Create uploads directory
RUN mkdir -p uploads && chown -R nodejs:nodejs uploads

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start application
USER nodejs
CMD ["node", "dist/backend/main.js"]
```

### 7.8.2 Docker Compose for Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  postgres_data:
  redis_data:
```

## 7.9 Platform-Specific Deployments

### 7.9.1 Vercel Deployment
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "@api_base_url",
    "VITE_APP_NAME": "@app_name",
    "VITE_APP_VERSION": "@app_version"
  },
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

### 7.9.2 Railway Deployment
```bash
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 3
  },
  "services": {
    "api": {
      "buildCommand": "npm run backend:build",
      "startCommand": "npm run backend:start",
      "healthcheckPath": "/health"
    }
  }
}
```

### 7.9.3 AWS ECS Deployment
```yaml
# ecs-task-definition.json
{
  "family": "ray-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "ray-api",
      "image": "your-account.dkr.ecr.region.amazonaws.com/ray-api:latest",
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "4000"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ray-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:4000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

## 7.10 أفضل الممارسات للنشر (Deployment Best Practices)

### 7.10.1 Security Best Practices
```typescript
// 1. استخدم HTTPS دائما
// 2. استخدم secure headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// 3. استخدم rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests',
}));

// 4. استخدم CORS بشكل صحيح
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 5. استخدم environment variables للبيانات الحساسة
// لا تخزن أسرار في الكود
```

### 7.10.2 Performance Best Practices
```typescript
// 1. استخدم caching بشكل استراتيجي
// 2. استخدم connection pooling
// 3. استخدم compression
app.use(compression());

// 4. استخدم static file serving
app.use('/uploads', express.static('uploads'));

// 5. استخدم clustering في الإنتاج
if (cluster.isMaster) {
  const numCPUs = require('os').cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Run application
}
```

### 7.10.3 Monitoring Best Practices
```typescript
// 1. استخدم structured logging
import { Logger } from '@nestjs/common';

const logger = new Logger('App');

// 2. استخدم metrics collection
// 3. استخدم health checks
// 4. استخدم error tracking
// 5. استخدم performance monitoring
```

## 7.11 التحقق من النجاح (Success Checklist)

### 7.11.1 Pre-Deployment Checklist
- [ ] جميع الاختبارات تمر بنجاح
- [ ] البناء ينجح بدون أخطاء
- [ ] متغيرات البيئة معدة بشكل صحيح
- [ ] قاعدة البيانات متصلة و تعمل
- [ ] Health checks تعمل
- [ ] SSL/TLS شهادة صالحة
- [ ] Load balancer مُعد بشكل صحيح

### 7.11.2 Post-Deployment Checklist
- [ ] التطبيق يعمل على البورت الصحيح
- [ ] Health checks تمر بنجاح
- [ ] Database connections تعمل
- [ ] Cache layer يعمل
- [ ] External services متصلة
- [ ] Monitoring يعمل
- [ ] Logs يتم جمعها بشكل صحيح

### 7.11.3 Performance Checklist
- [ ] Response times < 200ms للـ 95% من الطلبات
- [ ] Uptime > 99.9%
- [ ] Memory usage < 80%
- [ ] CPU usage < 70%
- [ ] Database connections محسّنة بشكل صحيح
- [ ] Cache hit rate > 80%

### 7.11.4 Security Checklist
- [ ] HTTPS يعمل بشكل صحيح
- [ ] Security headers مُعدة
- [ ] Rate limiting يعمل
- [ ] CORS مُعد بشكل صحيح
- [ ] البيانات الحساسة مشفرة
- [ ] لا يوجد ثغرات أمنية معروفة
- [ ] Access controls تعمل بشكل صحيح

هذا الدليل الشامل يغطي جميع جوانب النشر والتشغيل الإنتاجي لمشروع Ray، مع التركيز على الأمان والأداء والموثوقية.
