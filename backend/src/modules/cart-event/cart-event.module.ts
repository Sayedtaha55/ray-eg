import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { CartEventController } from '@modules/cart-event/cart-event.controller';
import { CartEventService } from '@modules/cart-event/cart-event.service';

@Module({
  imports: [PrismaModule],
  controllers: [CartEventController],
  providers: [CartEventService],
  exports: [CartEventService],
})
export class CartEventModule {}
