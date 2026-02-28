import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards, Request, BadRequestException, Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { OrderService } from './order.service';

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

@Controller('api/v1/orders')
export class OrderController {
  constructor(@Inject(OrderService) private readonly orderService: OrderService) {}

  @Get(':id/returns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  async listReturns(@Param('id') id: string, @Request() req?: any) {
    return this.orderService.listReturnsForOrder(String(id), {
      role: req?.user?.role,
      shopId: req?.user?.shopId,
      userId: req?.user?.id,
    });
  }

  @Post(':id/returns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async createReturn(@Param('id') id: string, @Body() body: any, @Request() req?: any) {
    const returnToStock = body?.returnToStock === true;
    const reason = typeof body?.reason === 'string' ? body.reason : undefined;
    const items = Array.isArray(body?.items) ? body.items : undefined;

    return this.orderService.createReturnForOrder(
      String(id),
      { returnToStock, reason, items },
      {
        role: req?.user?.role,
        shopId: req?.user?.shopId,
        userId: req?.user?.id,
      },
    );
  }

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

    return this.orderService.listByShop(
      shopId,
      { role: req.user?.role, shopId },
      {
        from: parseOptionalDate(from),
        to: parseOptionalDate(to),
      },
      {
        page: parseOptionalNumber(page),
        limit: parseOptionalNumber(limit),
      },
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

    return this.orderService.listByShop(
      targetShopId,
      { role: req.user?.role, shopId: req.user?.shopId },
      {
        from: parseOptionalDate(from),
        to: parseOptionalDate(to),
      },
      {
        page: parseOptionalNumber(page),
        limit: parseOptionalNumber(limit),
      },
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listAllAdmin(
    @Query('shopId') shopId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.orderService.listAllAdmin(
      {
        shopId: typeof shopId === 'string' ? shopId : undefined,
        from: parseOptionalDate(from),
        to: parseOptionalDate(to),
      },
      {
        page: parseOptionalNumber(page),
        limit: parseOptionalNumber(limit),
      },
    );
  }

  @Get('courier/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('courier')
  async listMyCourierOrders(@Query('page') page?: string, @Query('limit') limit?: string, @Request() req?: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('غير مصرح');
    }
    return this.orderService.listMyCourierOrders(String(userId), {
      page: parseOptionalNumber(page),
      limit: parseOptionalNumber(limit),
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'merchant', 'admin')
  async create(@Body() body: any, @Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('غير مصرح');
    }

    const shopId = String(body?.shopId || '').trim();
    const items = Array.isArray(body?.items) ? body.items : [];
    const total = typeof body?.total === 'number' ? body.total : Number(body?.total);
    const notes = typeof body?.notes === 'string' ? body.notes : undefined;
    const source = typeof body?.source === 'string' ? body.source : undefined;

    return this.orderService.createOrder({
      shopId,
      userId,
      items,
      total: Number.isNaN(total) ? undefined : total,
      paymentMethod: body?.paymentMethod,
      source,
      notes,
      status: body?.status,
    }, { role: req.user?.role, shopId: req.user?.shopId });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'merchant')
  async update(@Param('id') id: string, @Body() body: any, @Request() req?: any) {
    const status = typeof body?.status === 'string' ? body.status : undefined;
    const notes = typeof body?.notes === 'string' ? body.notes : undefined;
    return this.orderService.updateOrder(id, { status, notes }, { role: req?.user?.role, shopId: req?.user?.shopId });
  }

  @Patch(':id/assign-courier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async assignCourier(@Param('id') id: string, @Body() body: any) {
    const courierId = typeof body?.courierId === 'string' ? body.courierId : String(body?.courierId || '').trim();
    return this.orderService.assignCourierToOrder(id, courierId);
  }

  @Patch(':id/courier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('courier')
  async updateAsCourier(@Param('id') id: string, @Body() body: any, @Request() req) {
    const status = typeof body?.status === 'string' ? body.status : undefined;
    const codCollected = body?.codCollected === true;
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('غير مصرح');
    }
    return this.orderService.updateCourierOrder(id, { status, codCollected }, { userId: String(userId) });
  }
}
