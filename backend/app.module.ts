import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
// import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { ShopModule } from './shop.module';
import { ProductModule } from './product.module';
import { GalleryModule } from './gallery.module';
import { ReservationModule } from './reservation.module';
import { OrderModule } from './order.module';
import { OfferModule } from './offer.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { UsersModule } from './users.module';
import { AnalyticsModule } from './analytics.module';
import { CustomersModule } from './customers.module';
import { NotificationModule } from './notification.module';
import { TestController } from './test.controller';
import { HealthController } from './health.controller';
import { DatabaseTestController } from './db-test.controller';

 const nodeEnv = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${nodeEnv}`, '.env.local', `.env.${nodeEnv}.local`],
    }),
    PrismaModule,
    // RedisModule, // Temporarily disabled
    AuthModule,
    ShopModule,
    ProductModule,
    GalleryModule,
    ReservationModule,
    OrderModule,
    OfferModule,
    MonitoringModule,
    UsersModule,
    AnalyticsModule,
    CustomersModule,
    NotificationModule,
  ],
  controllers: [TestController, HealthController, DatabaseTestController],
})
export class AppModule {}
