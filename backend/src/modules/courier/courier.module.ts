import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { CourierController } from '@modules/courier/courier.controller';
import { CourierService } from '@modules/courier/courier.service';
import { CourierDispatchService } from './courier-dispatch.service';

@Module({
  imports: [PrismaModule],
  controllers: [CourierController],
  providers: [CourierService, CourierDispatchService],
  exports: [CourierService, CourierDispatchService],
})
export class CourierModule {}
