import { Module } from '@nestjs/common';
import { BookingsController } from '@modules/bookings/bookings.controller';
import { PrismaModule } from '@common/prisma/prisma.module';
import { BookingsService } from '@modules/bookings/bookings.service';

@Module({
  controllers: [BookingsController],
  imports: [PrismaModule],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
