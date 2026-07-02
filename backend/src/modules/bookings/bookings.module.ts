import { Module } from '@nestjs/common';
import { BookingsController } from '@modules/bookings/bookings.controller';
import { BookingsAnalyticsController } from '@modules/bookings/bookings-analytics.controller';
import { PrismaModule } from '@common/prisma/prisma.module';
import { BookingsService } from '@modules/bookings/bookings.service';
import { BookingsAnalyticsService } from '@modules/bookings/bookings-analytics.service';

@Module({
  controllers: [BookingsController, BookingsAnalyticsController],
  imports: [PrismaModule],
  providers: [BookingsService, BookingsAnalyticsService],
  exports: [BookingsService, BookingsAnalyticsService],
})
export class BookingsModule {}
