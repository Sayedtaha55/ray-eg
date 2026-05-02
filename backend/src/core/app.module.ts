import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@common/prisma/prisma.module';
import { RedisModule } from '@common/redis/redis.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ShopModule } from '@modules/shop/shop.module';
import { ProductModule } from '@modules/product/product.module';
import { GalleryModule } from '@modules/gallery/gallery.module';
import { ReservationModule } from '@modules/reservation/reservation.module';
import { OrderModule } from '@modules/order/order.module';
import { OfferModule } from '@modules/offer/offer.module';
import { InvoiceModule } from '@modules/invoice/invoice.module';
import { MonitoringModule } from '@common/monitoring/monitoring.module';
import { UsersModule } from '@modules/users/users.module';
import { AnalyticsModule } from '@modules/analytics/analytics.module';
import { CustomersModule } from '@modules/customers/customers.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { MediaModule } from '@modules/media/media.module';
import { CourierModule } from '@modules/courier/courier.module';
import { FeedbackModule } from '@modules/feedback/feedback.module';
import { ShopImageMapModule } from '@modules/shop-image-map/shop-image-map.module';
import { RealtimeModule } from '@common/realtime/realtime.module';
import { LoggerModule } from '@common/logger/logger.module';
import { SearchModule } from '@modules/search/search.module';
import { QueueModule } from '@modules/queue/queue.module';
import { ChatModule } from '@modules/chat/chat.module';
import { AiModule } from '@common/ai/ai.module';
import { MeasurementModule } from '@modules/measurement/measurement.module';
import { AppsModule } from '@modules/apps/apps.module';
import { CartEventModule } from '@modules/cart-event/cart-event.module';
import { MapListingModule } from '@modules/map-listing/map-listing.module';
import { PortalModule } from '@modules/portal/portal.module';
import { TestController } from './test.controller';
import { HealthController } from '@modules/health/health.controller';
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
const shouldImportAppsModule = includeAllModules || bootModules.has('apps') || nodeEnv === 'development';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    ...(shouldImportAppsModule ? [AppsModule] : []),
    ...(includeAllModules || bootModules.has('cart-event') ? [CartEventModule] : []),
    ...(includeAllModules || bootModules.has('search') ? [SearchModule] : []),
    ...(includeAllModules || bootModules.has('queue') ? [QueueModule] : []),
    ...(includeAllModules || bootModules.has('measurement') ? [MeasurementModule] : []),
    ...(includeAllModules || bootModules.has('map-listing') ? [MapListingModule] : []),
    ...(includeAllModules || bootModules.has('map-listing') || bootModules.has('portal') ? [PortalModule] : []),
  ],
  controllers: minimalBoot
    ? [HealthController, DatabaseTestController]
    : [TestController, HealthController, DatabaseTestController],
  providers: [AccountPurgeService],
})
export class AppModule {}
