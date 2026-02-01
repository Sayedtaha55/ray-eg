import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, BadRequestException, Inject, Query, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { OfferService } from './offer.service';

 function parseOptionalInt(value: any) {
   if (typeof value === 'undefined' || value === null) return undefined;
   const n = Number(value);
   return Number.isNaN(n) ? undefined : n;
 }

@Controller('api/v1/offers')
export class OfferController {
  constructor(@Inject(OfferService) private readonly offerService: OfferService) {}

  @Get()
  async listActive(
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('shopId') shopId: string,
    @Query('productId') productId: string,
  ) {
    const shopIdNorm = typeof shopId === 'string' ? String(shopId).trim() : '';
    const productIdNorm = typeof productId === 'string' ? String(productId).trim() : '';
    return this.offerService.listActive({
      take: parseOptionalInt(take),
      skip: parseOptionalInt(skip),
      shopId: shopIdNorm || undefined,
      productId: productIdNorm || undefined,
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const offerId = String(id || '').trim();
    if (!offerId) throw new BadRequestException('id مطلوب');
    return this.offerService.getActiveById(offerId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async create(@Body() body: any, @Request() req) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const shopIdFromBody = typeof body?.shopId === 'string' ? String(body.shopId).trim() : '';
    const targetShopId = role === 'ADMIN' ? shopIdFromBody : String(shopIdFromToken || '').trim();

    if (!targetShopId) throw new BadRequestException('shopId مطلوب');

    if (role !== 'ADMIN' && shopIdFromToken && String(shopIdFromToken) !== targetShopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    return this.offerService.create({
      shopId: targetShopId,
      productId: body?.productId,
      productIds: body?.productIds,
      title: body?.title,
      description: body?.description,
      discount: body?.discount,
      oldPrice: body?.oldPrice,
      newPrice: body?.newPrice,
      pricingMode: body?.pricingMode,
      pricingValue: body?.pricingValue,
      imageUrl: body?.imageUrl,
      expiresAt: body?.expiresAt,
    }, { role: req.user?.role, shopId: req.user?.shopId });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async deactivate(@Param('id') id: string, @Request() req) {
    return this.offerService.deactivate(id, { role: req.user?.role, shopId: req.user?.shopId });
  }
}
