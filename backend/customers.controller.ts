import { Body, Controller, ForbiddenException, Get, Inject, InternalServerErrorException, Logger, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { CustomersService } from './customers.service';

@Controller('api/v1/customers')
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);

  constructor(
    @Inject(CustomersService) private readonly customersService: CustomersService,
  ) {}

  @Get('shop/:shopId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async getShopCustomers(@Param('shopId') shopId: string, @Request() req: any) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = String(req.user?.shopId || '').trim();

    if (role !== 'ADMIN') {
      if (!shopIdFromToken || shopIdFromToken !== String(shopId || '').trim()) {
        throw new ForbiddenException('غير مصرح');
      }
    }

    const targetShopId = role === 'ADMIN' ? String(shopId || '').trim() : shopIdFromToken;

    try {
      return await this.customersService.getShopCustomers(targetShopId);
    } catch (err: any) {
      this.logger.error(
        `getShopCustomers failed (shopId=${targetShopId})`,
        err?.stack || String(err),
      );
      throw new InternalServerErrorException('حدث خطأ أثناء تحميل العملاء');
    }
  }

  @Put(':customerId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async updateCustomerStatus(@Param('customerId') customerId: string, @Body() body: any) {
    return this.customersService.updateCustomerStatus(customerId, body?.status);
  }

  @Post('send-promotion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async sendPromotion(@Body() body: any, @Request() req: any) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = String(req.user?.shopId || '').trim();
    const shopId = String(body?.shopId || '').trim();

    if (role !== 'ADMIN') {
      if (!shopIdFromToken || !shopId || shopIdFromToken !== shopId) {
        throw new ForbiddenException('غير مصرح');
      }
    }

    return this.customersService.sendCustomerPromotion(body?.customerId, shopId);
  }

  @Post('convert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async convert(@Body() body: any, @Request() req: any) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = String(req.user?.shopId || '').trim();
    const shopId = String(body?.shopId || '').trim();

    if (role !== 'ADMIN') {
      if (!shopIdFromToken || !shopId || shopIdFromToken !== shopId) {
        throw new ForbiddenException('غير مصرح');
      }
    }

    return this.customersService.convertReservationToCustomer(body);
  }
}
