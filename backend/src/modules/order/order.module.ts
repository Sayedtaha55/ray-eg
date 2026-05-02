import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { CourierModule } from '@modules/courier/courier.module';
import { RedisModule } from '@common/redis/redis.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { OrderController } from '@modules/order/order.controller';
import { OrderService } from '@modules/order/order.service';

@Module({
  imports: [PrismaModule, CourierModule, RedisModule, NotificationModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
