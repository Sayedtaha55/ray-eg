import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CartEventController } from './cart-event.controller';
import { CartEventService } from './cart-event.service';

@Module({
  imports: [PrismaModule],
  controllers: [CartEventController],
  providers: [CartEventService],
  exports: [CartEventService],
})
export class CartEventModule {}
