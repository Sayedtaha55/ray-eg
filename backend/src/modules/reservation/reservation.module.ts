import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { ReservationController } from '@modules/reservation/reservation.controller';
import { ReservationService } from '@modules/reservation/reservation.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
