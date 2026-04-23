import { Module } from '@nestjs/common';
import { MeasurementController } from './measurement.controller';
import { PrismaModule } from './prisma/prisma.module';
import { MeasurementService } from './measurement.service';

@Module({
  controllers: [MeasurementController],
  imports: [PrismaModule],
  providers: [MeasurementService],
  exports: [MeasurementService],
})
export class MeasurementModule {}
