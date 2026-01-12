import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { TestController } from './test.controller';
import { HealthController } from './health.controller';
import { DatabaseTestController } from './db-test.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    MonitoringModule,
  ],
  controllers: [TestController, HealthController, DatabaseTestController],
})
export class AppModule {}
