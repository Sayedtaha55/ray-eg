import { Controller, Get, Query, Inject } from '@nestjs/common';
import { MapListingService } from '@modules/map-listing/map-listing.service';

@Controller('api/v1/map')
export class MapPinsController {
  constructor(@Inject(MapListingService) private readonly mapListingService: MapListingService) {}

  @Get('pins')
  async getPins(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('category') category?: string,
    @Query('q') q?: string,
    @Query('governorate') governorate?: string,
    @Query('city') city?: string,
  ) {
    const parsedLat = lat != null ? Number(lat) : undefined;
    const parsedLng = lng != null ? Number(lng) : undefined;
    const parsedRadius = radiusKm != null ? Number(radiusKm) : undefined;

    return this.mapListingService.getPins({
      lat: Number.isFinite(parsedLat) ? parsedLat : undefined,
      lng: Number.isFinite(parsedLng) ? parsedLng : undefined,
      radiusKm: Number.isFinite(parsedRadius) ? parsedRadius : undefined,
      category: category || undefined,
      q: q || undefined,
      governorate: governorate || undefined,
      city: city || undefined,
    });
  }
}
