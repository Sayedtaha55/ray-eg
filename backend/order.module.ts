import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CourierModule } from './courier.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [PrismaModule, CourierModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
