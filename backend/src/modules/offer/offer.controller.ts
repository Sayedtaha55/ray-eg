import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, BadRequestException, Inject, Query, ForbiddenException, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { OfferService } from '@modules/offer/offer.service';

 function parseOptionalInt(value: any) {
   if (typeof value === 'undefined' || value === null) return undefined;
   const n = Number(value);
   return Number.isNaN(n) ? undefined : n;
 }

@Controller('offers')
export class OfferController {
  constructor(@Inject(OfferService) private readonly offerService: OfferService) {}

  @Get()
  async listActive(
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('shopId') shopId: string,
    @Query('shopCategory') shopCategory: string,
    @Query('productId') productId: string,
  ) {
    const shopIdNorm = typeof shopId === 'string' ? String(shopId).trim() : '';
    const shopCategoryNorm = typeof shopCategory === 'string' ? String(shopCategory).trim() : '';
    const productIdNorm = typeof productId === 'string' ? String(productId).trim() : '';
    return this.offerService.listActive({
      take: parseOptionalInt(take),
      skip: parseOptionalInt(skip),
      shopId: shopIdNorm || undefined,
      shopCategory: shopCategoryNorm || undefined,
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

    const discountType = String(body?.discountType || body?.type || '').toLowerCase();
    const discountValue = typeof body?.discountValue === 'number' ? body.discountValue : Number(body?.discountValue);
    const mappedDiscount = (typeof body?.discount === 'number' ? body.discount : Number(body?.discount)) ||
      (discountType === 'percentage' && !Number.isNaN(discountValue) ? discountValue : undefined);

    const mappedExpiresAt = body?.expiresAt || body?.endDate || undefined;
    const mappedOldPrice = typeof body?.oldPrice === 'number' ? body.oldPrice : Number(body?.oldPrice);
    const mappedNewPrice = typeof body?.newPrice === 'number' ? body.newPrice : Number(body?.newPrice);

    const result = await this.offerService.create({
      shopId: targetShopId,
      productId: body?.productId,
      productIds: body?.productIds,
      variantPricing: body?.variantPricing,
      title: body?.title || body?.name,
      description: body?.description,
      discount: mappedDiscount,
      oldPrice: mappedOldPrice,
      newPrice: mappedNewPrice,
      pricingMode: body?.pricingMode,
      pricingValue: body?.pricingValue,
      imageUrl: body?.imageUrl,
      expiresAt: mappedExpiresAt,
    }, { role: req.user?.role, shopId: req.user?.shopId });

    if (result) {
      const r = result as any;
      if (r.createdAt && !r.startDate) r.startDate = r.createdAt.toISOString ? r.createdAt.toISOString() : r.createdAt;
      if (r.expiresAt && !r.endDate) r.endDate = r.expiresAt.toISOString ? r.expiresAt.toISOString() : r.expiresAt;
      if (r.title && !r.name) r.name = r.title;
      if (!r.discountType) r.discountType = body?.discountType || body?.type || 'percentage';
      if (!r.discountValue && r.discountType === 'percentage') r.discountValue = r.discount || body?.discountValue || 20;
      if (!r.discount_type) r.discount_type = r.discountType;
      if (!r.shopId && body?.shopId) r.shopId = body.shopId;
    }

    return result;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async deactivate(@Param('id') id: string, @Request() req) {
    return this.offerService.deactivate(id, { role: req.user?.role, shopId: req.user?.shopId });
  }
}
