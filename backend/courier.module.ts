import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CourierController } from './courier.controller';
import { CourierService } from './courier.service';
import { CourierDispatchService } from './courier-dispatch.service';

@Module({
  imports: [PrismaModule],
  controllers: [CourierController],
  providers: [CourierService, CourierDispatchService],
  exports: [CourierService, CourierDispatchService],
})
export class CourierModule {}
