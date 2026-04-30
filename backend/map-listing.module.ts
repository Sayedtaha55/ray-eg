import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MapListingController } from './map-listing.controller';
import { MapPinsController } from './map-pins.controller';
import { MapListingService } from './map-listing.service';

@Module({
  imports: [PrismaModule],
  controllers: [MapListingController, MapPinsController],
  providers: [MapListingService],
  exports: [MapListingService],
})
export class MapListingModule {}
