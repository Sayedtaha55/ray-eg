import { Module } from '@nestjs/common';
import { MeasurementController } from '@modules/measurement/measurement.controller';
import { PrismaModule } from '@common/prisma/prisma.module';
import { MeasurementService } from '@modules/measurement/measurement.service';

@Module({
  controllers: [MeasurementController],
  imports: [PrismaModule],
  providers: [MeasurementService],
  exports: [MeasurementService],
})
export class MeasurementModule {}
