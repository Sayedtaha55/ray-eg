import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { PrismaModule } from './prisma/prisma.module';
// import { RedisModule } from './redis/redis.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { MediaModule } from './media.module';
import { NotificationModule } from './notification.module';

@Module({
  imports: [PrismaModule, MediaModule, NotificationModule, /* RedisModule, */ MonitoringModule],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
