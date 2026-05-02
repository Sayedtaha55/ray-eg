import { Controller, Get, Post, Patch, Body, Query, Param, Request, UseGuards, Inject, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { MapListingService } from '@modules/map-listing/map-listing.service';

function parseOptionalNumber(value: any) {
  if (value == null) return undefined;
  const n = Number(String(value));
  return Number.isFinite(n) ? n : undefined;
}

@Controller('api/v1/map-listings')
export class MapListingController {
  constructor(@Inject(MapListingService) private readonly mapListingService: MapListingService) {}

  @Post('public/submit')
  async publicSubmit(@Body() body: any) {
    const title = String(body?.title || '').trim();
    if (!title) throw new BadRequestException('اسم النشاط مطلوب');

    const lat = Number(body?.branch?.latitude);
    const lng = Number(body?.branch?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('الموقع على الخريطة مطلوب');
    }

    return this.mapListingService.publicSubmit({
      title,
      category: body?.category || undefined,
      description: body?.description || undefined,
      websiteUrl: body?.websiteUrl || undefined,
      phone: body?.phone || undefined,
      whatsapp: body?.whatsapp || undefined,
      socialLinks: body?.socialLinks || undefined,
      logoUrl: body?.logoUrl || undefined,
      coverUrl: body?.coverUrl || undefined,
      linkedShopId: body?.linkedShopId || undefined,
      branch: {
        name: body?.branch?.name || undefined,
        latitude: lat,
        longitude: lng,
        addressLabel: body?.branch?.addressLabel || undefined,
        governorate: body?.branch?.governorate || undefined,
        city: body?.branch?.city || undefined,
        phone: body?.branch?.phone || undefined,
      },
    });
  }

  @Get('public/:id')
  async getPublicListing(@Param('id') id: string) {
    return this.mapListingService.getListing(String(id || '').trim());
  }

  @Post(':id/branches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async addBranch(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req?: any,
  ) {
    const lat = Number(body?.latitude);
    const lng = Number(body?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('الموقع على الخريطة مطلوب');
    }

    return this.mapListingService.addBranch(
      String(id || '').trim(),
      {
        name: body?.name || undefined,
        latitude: lat,
        longitude: lng,
        addressLabel: body?.addressLabel || undefined,
        governorate: body?.governorate || undefined,
        city: body?.city || undefined,
        phone: body?.phone || undefined,
      },
      { role: req.user?.role, shopId: req.user?.shopId, id: req.user?.id || req.user?.sub },
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listPending(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    return this.mapListingService.getPendingListings(
      { role: req.user?.role, id: req.user?.id || req.user?.sub },
      { page: parseOptionalNumber(page), limit: parseOptionalNumber(limit) },
    );
  }

  @Post('admin/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approve(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req?: any,
  ) {
    return this.mapListingService.approve(
      String(id || '').trim(),
      { role: req.user?.role, id: req.user?.id || req.user?.sub },
      body?.note || undefined,
    );
  }

  @Post('admin/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async reject(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req?: any,
  ) {
    return this.mapListingService.reject(
      String(id || '').trim(),
      { role: req.user?.role, id: req.user?.id || req.user?.sub },
      body?.note || undefined,
    );
  }

  @Post('admin/:id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async suspend(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req?: any,
  ) {
    return this.mapListingService.suspend(
      String(id || '').trim(),
      { role: req.user?.role, id: req.user?.id || req.user?.sub },
      body?.note || undefined,
    );
  }
}
