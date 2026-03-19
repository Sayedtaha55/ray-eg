import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { PrismaModule } from './prisma/prisma.module';
import { BookingsService } from './bookings.service';

@Module({
  controllers: [BookingsController],
  imports: [PrismaModule],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
