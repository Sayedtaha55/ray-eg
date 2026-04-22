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
import { RealtimeModule } from './realtime/realtime.module';
import { LoggerModule } from './logger/logger.module';
import { SearchModule } from './search.module';
import { QueueModule } from './queue.module';
import { ChatModule } from './chat.module';
import { AiModule } from './ai/ai.module';
import { TestController } from './test.controller';
import { HealthController } from './health.controller';
import { DatabaseTestController } from './db-test.controller';
import { AccountPurgeService } from './account-purge.service';

 const nodeEnv = process.env.NODE_ENV || 'development';
 const minimalBoot = String(process.env.MINIMAL_BOOT || '').toLowerCase() === 'true';
 const bootModulesRaw = String(process.env.BOOT_MODULES || '').trim().toLowerCase();
 const bootModules = new Set(
   bootModulesRaw
     ? bootModulesRaw.split(',').map((s) => s.trim()).filter(Boolean)
     : [],
 );
 const includeAllModules = bootModules.size === 0;

 const shouldImportMediaModule = includeAllModules || bootModules.has('media') || bootModules.has('shop');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${nodeEnv}`, '.env.local', `.env.${nodeEnv}.local`],
    }),
    LoggerModule,
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
    ...(shouldImportMediaModule ? [MediaModule] : []),
    ...(includeAllModules || bootModules.has('feedback') ? [FeedbackModule] : []),
    ...(includeAllModules || bootModules.has('image-map') || bootModules.has('shop') ? [ShopImageMapModule] : []),
    ...(includeAllModules || bootModules.has('realtime') ? [RealtimeModule] : []),
    ...(includeAllModules || bootModules.has('chat') ? [ChatModule] : []),
    // AI module requires AI_ENABLED=true (hidden from production until ready)
 ...(includeAllModules || bootModules.has('ai') ? (process.env.AI_ENABLED === 'true' ? [AiModule] : []) : []),
    ...(includeAllModules || bootModules.has('search') ? [SearchModule] : []),
    ...(includeAllModules || bootModules.has('queue') ? [QueueModule] : []),
  ],
  controllers: minimalBoot
    ? [HealthController, DatabaseTestController]
    : [TestController, HealthController, DatabaseTestController],
  providers: [AccountPurgeService],
})
export class AppModule {}
