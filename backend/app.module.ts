import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { ShopModule } from './shop.module';
import { ProductModule } from './product.module';
import { GalleryModule } from './gallery.module';
import { ReservationModule } from './reservation.module';
import { OrderModule } from './order.module';
import { OfferModule } from './offer.module';
import { InvoiceModule } from './invoice.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { UsersModule } from './users.module';
import { AnalyticsModule } from './analytics.module';
import { CustomersModule } from './customers.module';
import { NotificationModule } from './notification.module';
import { MediaModule } from './media.module';
import { CourierModule } from './courier.module';
import { FeedbackModule } from './feedback.module';
import { ShopImageMapModule } from './shop-image-map.module';
import { TestController } from './test.controller';
import { HealthController } from './health.controller';
import { DatabaseTestController } from './db-test.controller';

 const nodeEnv = process.env.NODE_ENV || 'development';
 const minimalBoot = String(process.env.MINIMAL_BOOT || '').toLowerCase() === 'true';
 const bootModulesRaw = String(process.env.BOOT_MODULES || '').trim().toLowerCase();
 const bootModules = new Set(
   bootModulesRaw
     ? bootModulesRaw.split(',').map((s) => s.trim()).filter(Boolean)
     : [],
 );
 const includeAllModules = !minimalBoot && bootModules.size === 0;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${nodeEnv}`, '.env.local', `.env.${nodeEnv}.local`],
    }),
    PrismaModule,
    RedisModule,
    ...(includeAllModules || bootModules.has('auth') ? [AuthModule] : []),
    ...(includeAllModules || bootModules.has('shop') ? [ShopModule] : []),
    ...(includeAllModules || bootModules.has('product') ? [ProductModule] : []),
    ...(includeAllModules || bootModules.has('gallery') ? [GalleryModule] : []),
    ...(includeAllModules || bootModules.has('reservation') ? [ReservationModule] : []),
    ...(includeAllModules || bootModules.has('order') ? [OrderModule] : []),
    ...(includeAllModules || bootModules.has('offer') ? [OfferModule] : []),
    ...(includeAllModules || bootModules.has('invoice') ? [InvoiceModule] : []),
    ...(includeAllModules || bootModules.has('monitoring') ? [MonitoringModule] : []),
    ...(includeAllModules || bootModules.has('users') ? [UsersModule] : []),
    ...(includeAllModules || bootModules.has('analytics') ? [AnalyticsModule] : []),
    ...(includeAllModules || bootModules.has('customers') ? [CustomersModule] : []),
    ...(includeAllModules || bootModules.has('notification') ? [NotificationModule] : []),
    ...(includeAllModules || bootModules.has('courier') ? [CourierModule] : []),
    ...(includeAllModules || bootModules.has('media') ? [MediaModule] : []),
    ...(includeAllModules || bootModules.has('feedback') ? [FeedbackModule] : []),
    ...(includeAllModules || bootModules.has('image-map') || bootModules.has('shop') || bootModules.has('product')
      ? [ShopImageMapModule]
      : []),
  ],
  controllers: minimalBoot
    ? [HealthController, DatabaseTestController]
    : [TestController, HealthController, DatabaseTestController],
})
export class AppModule {}
