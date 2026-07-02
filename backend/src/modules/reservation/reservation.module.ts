import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@common/prisma/prisma.module';
import { BookingsModule } from '@modules/bookings/bookings.module';
import { ReservationController } from '@modules/reservation/reservation.controller';
import { ReservationService } from '@modules/reservation/reservation.service';
import { ReservationAnalyticsController } from '@modules/reservation/reservation-analytics.controller';
import { ReservationAnalyticsService } from '@modules/reservation/reservation-analytics.service';

@Module({
  imports: [PrismaModule, ScheduleModule, BookingsModule],
  controllers: [ReservationController, ReservationAnalyticsController],
  providers: [ReservationService, ReservationAnalyticsService],
  exports: [ReservationService, ReservationAnalyticsService],
})
export class ReservationModule {}
