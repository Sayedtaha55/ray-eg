import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards, Request, BadRequestException, Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { InvoiceService } from './invoice.service';

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

@Controller('api/v1/invoices')
export class InvoiceController {
  constructor(@Inject(InvoiceService) private readonly invoiceService: InvoiceService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant')
  async listMine(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    const shopId = req.user?.shopId;
    if (!shopId) {
      throw new BadRequestException('shopId غير متوفر');
    }

    return this.invoiceService.listByShop(
      String(shopId),
      { role: req.user?.role, shopId: String(shopId) },
      { from: parseOptionalDate(from), to: parseOptionalDate(to) },
      { page: parseOptionalNumber(page), limit: parseOptionalNumber(limit) },
    );
  }

  @Get('summary/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant')
  async summaryMine(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Request() req?: any,
  ) {
    const shopId = req.user?.shopId;
    if (!shopId) {
      throw new BadRequestException('shopId غير متوفر');
    }

    return this.invoiceService.summaryByShop(
      String(shopId),
      { role: req.user?.role, shopId: String(shopId) },
      { from: parseOptionalDate(from), to: parseOptionalDate(to) },
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async listByShop(
    @Query('shopId') shopId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const shopIdFromQuery = typeof shopId === 'string' ? shopId : undefined;

    const targetShopId = role === 'ADMIN' ? shopIdFromQuery : shopIdFromToken;
    if (!targetShopId) {
      throw new BadRequestException('shopId مطلوب');
    }

    return this.invoiceService.listByShop(
      String(targetShopId),
      { role: req.user?.role, shopId: req.user?.shopId },
      { from: parseOptionalDate(from), to: parseOptionalDate(to) },
      { page: parseOptionalNumber(page), limit: parseOptionalNumber(limit) },
    );
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async summaryByShop(
    @Query('shopId') shopId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Request() req?: any,
  ) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const shopIdFromQuery = typeof shopId === 'string' ? shopId : undefined;

    const targetShopId = role === 'ADMIN' ? shopIdFromQuery : shopIdFromToken;
    if (!targetShopId) {
      throw new BadRequestException('shopId مطلوب');
    }

    return this.invoiceService.summaryByShop(
      String(targetShopId),
      { role: req.user?.role, shopId: req.user?.shopId },
      { from: parseOptionalDate(from), to: parseOptionalDate(to) },
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async getById(@Param('id') id: string, @Request() req?: any) {
    return this.invoiceService.getById(id, { role: req.user?.role, shopId: req.user?.shopId });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async create(@Body() body: any, @Request() req) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const userId = req.user?.id;

    const shopIdFromBody = typeof body?.shopId === 'string' ? String(body.shopId).trim() : '';
    const targetShopId = role === 'ADMIN' ? shopIdFromBody : String(shopIdFromToken || '').trim();

    if (!userId) throw new BadRequestException('غير مصرح');
    if (!targetShopId) throw new BadRequestException('shopId مطلوب');

    const invoiceDate = parseOptionalDate(body?.invoiceDate) ?? parseOptionalDate(body?.date);

    return this.invoiceService.create({
      shopId: targetShopId,
      createdById: String(userId),
      invoiceDate,
      notes: typeof body?.notes === 'string' ? body.notes : undefined,
      discount: typeof body?.discount === 'number' ? body.discount : Number(body?.discount ?? 0),
      vatRate: typeof body?.vatRate === 'number' ? body.vatRate : Number(body?.vatRate ?? 0),
      currency: typeof body?.currency === 'string' ? body.currency : undefined,
      items: Array.isArray(body?.items) ? body.items : [],
    }, { role: req.user?.role, shopId: req.user?.shopId });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    const invoiceDate = parseOptionalDate(body?.invoiceDate) ?? parseOptionalDate(body?.date);

    return this.invoiceService.update(id, {
      invoiceDate,
      notes: typeof body?.notes === 'string' ? body.notes : undefined,
      discount: typeof body?.discount === 'undefined' ? undefined : (typeof body?.discount === 'number' ? body.discount : Number(body?.discount)),
      vatRate: typeof body?.vatRate === 'undefined' ? undefined : (typeof body?.vatRate === 'number' ? body.vatRate : Number(body?.vatRate)),
      currency: typeof body?.currency === 'string' ? body.currency : undefined,
      items: typeof body?.items === 'undefined' ? undefined : (Array.isArray(body?.items) ? body.items : []),
    }, { role: req.user?.role, shopId: req.user?.shopId });
  }
}
