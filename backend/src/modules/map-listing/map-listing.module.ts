import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { MapListingController } from '@modules/map-listing/map-listing.controller';
import { MapPinsController } from './map-pins.controller';
import { MapListingService } from '@modules/map-listing/map-listing.service';

@Module({
  imports: [PrismaModule],
  controllers: [MapListingController, MapPinsController],
  providers: [MapListingService],
  exports: [MapListingService],
})
export class MapListingModule {}
