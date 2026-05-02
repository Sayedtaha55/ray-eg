import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards, Request, BadRequestException, Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { CartEventService } from '@modules/cart-event/cart-event.service';

function parseOptionalDate(value: any) {
  if (!value) return undefined;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseOptionalNumber(value: any) {
  if (value == null) return undefined;
  const n = Number(String(value));
  return Number.isFinite(n) ? n : undefined;
}

@Controller('api/v1/cart-events')
export class CartEventController {
  constructor(@Inject(CartEventService) private readonly cartEventService: CartEventService) {}

  @Post('public/track')
  async publicTrack(@Body() body: any) {
    const shopId = String(body?.shopId || '').trim();
    const productId = String(body?.productId || '').trim();
    const event = String(body?.event || '').trim();

    if (!shopId) throw new BadRequestException('shopId مطلوب');
    if (!productId) throw new BadRequestException('productId مطلوب');
    if (!event) throw new BadRequestException('event مطلوب');

    const validPublicEvents = ['add_to_cart', 'checkout_started'];
    if (!validPublicEvents.includes(event)) {
      throw new BadRequestException(`event يجب أن يكون أحد: ${validPublicEvents.join(', ')}`);
    }

    return this.cartEventService.track({
      shopId,
      productId,
      event,
      userId: body?.userId || null,
      sessionId: body?.sessionId || null,
      customerName: body?.customerName || null,
      customerEmail: body?.customerEmail || null,
      customerPhone: body?.customerPhone || null,
      quantity: body?.quantity,
      unitPrice: body?.unitPrice,
      currency: body?.currency,
      metadata: body?.metadata,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'merchant')
  async track(
    @Body() body: any,
    @Request() req?: any,
  ) {
    const userId = req.user?.id || req.user?.sub || null;
    const shopId = String(body?.shopId || '').trim();
    const productId = String(body?.productId || '').trim();
    const event = String(body?.event || '').trim();

    if (!shopId) throw new BadRequestException('shopId مطلوب');
    if (!productId) throw new BadRequestException('productId مطلوب');
    if (!event) throw new BadRequestException('event مطلوب');

    return this.cartEventService.track({
      shopId,
      productId,
      event,
      userId,
      sessionId: body?.sessionId || null,
      customerName: body?.customerName || null,
      customerEmail: body?.customerEmail || null,
      customerPhone: body?.customerPhone || null,
      quantity: body?.quantity,
      unitPrice: body?.unitPrice,
      currency: body?.currency,
      metadata: body?.metadata,
    });
  }

  @Get('abandoned')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async listAbandoned(
    @Query('shopId') shopId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    const role = String(req.user?.role || '').toUpperCase();
    const effectiveShopId = role === 'ADMIN' ? String(shopId || '') : String(req.user?.shopId || '');
    if (!effectiveShopId) throw new BadRequestException('shopId غير متوفر');

    return this.cartEventService.listAbandoned(
      effectiveShopId,
      { role: req.user?.role, shopId: effectiveShopId },
      {
        from: parseOptionalDate(from),
        to: parseOptionalDate(to),
        page: parseOptionalNumber(page),
        limit: parseOptionalNumber(limit),
      },
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async getStats(
    @Query('shopId') shopId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Request() req?: any,
  ) {
    const role = String(req.user?.role || '').toUpperCase();
    const effectiveShopId = role === 'ADMIN' ? String(shopId || '') : String(req.user?.shopId || '');
    if (!effectiveShopId) throw new BadRequestException('shopId غير متوفر');

    return this.cartEventService.getStats(
      effectiveShopId,
      { role: req.user?.role, shopId: effectiveShopId },
      {
        from: parseOptionalDate(from),
        to: parseOptionalDate(to),
      },
    );
  }

  @Patch(':id/recover')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async markRecovered(
    @Param('id') id: string,
    @Request() req?: any,
  ) {
    return this.cartEventService.markRecovered(
      String(id || '').trim(),
      { role: req.user?.role, shopId: req.user?.shopId },
    );
  }
}
