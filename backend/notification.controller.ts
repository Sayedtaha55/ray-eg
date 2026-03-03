import { Body, Controller, Get, Patch, Param, Post, Query, Request, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { NotificationService } from './notification.service';
import { IsString, MinLength } from 'class-validator';

class PushSubscribeDto {
  @IsString()
  @MinLength(1)
  shopId!: string;

  subscription!: any;
}

class PushUnsubscribeDto {
  @IsString()
  @MinLength(1)
  shopId!: string;

  @IsString()
  @MinLength(1)
  endpoint!: string;
}

class CustomerPushSubscribeDto {
  subscription!: any;
}

class CustomerPushUnsubscribeDto {
  @IsString()
  @MinLength(1)
  endpoint!: string;
}

function parseOptionalInt(value: any) {
  if (typeof value === 'undefined' || value === null) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

@Controller('api/v1/notifications')
export class NotificationController {
  constructor(@Inject(NotificationService) private readonly notificationService: NotificationService) {}

  @Post('push/merchant/subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async pushMerchantSubscribe(@Request() req, @Body() body: PushSubscribeDto) {
    const role = String(req.user?.role || '').toLowerCase();
    const shopId = role === 'admin' ? String(body?.shopId || '').trim() : String(req.user?.shopId || '').trim();
    return this.notificationService.registerMerchantPushSubscription({
      actor: { role: req.user?.role, shopId: req.user?.shopId },
      shopId,
      subscription: (body as any)?.subscription,
    });
  }

  @Post('push/merchant/unsubscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async pushMerchantUnsubscribe(@Request() req, @Body() body: PushUnsubscribeDto) {
    const role = String(req.user?.role || '').toLowerCase();
    const shopId = role === 'admin' ? String(body?.shopId || '').trim() : String(req.user?.shopId || '').trim();
    return this.notificationService.unregisterMerchantPushSubscription({
      actor: { role: req.user?.role, shopId: req.user?.shopId },
      shopId,
      endpoint: String(body?.endpoint || ''),
    });
  }

  // Backward-compatible alias for older frontend code
  @Post('push/subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async pushSubscribeLegacy(@Request() req, @Body() body: PushSubscribeDto) {
    return this.pushMerchantSubscribe(req, body);
  }

  @Post('push/customer/subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  async pushCustomerSubscribe(@Request() req, @Body() body: CustomerPushSubscribeDto) {
    const userId = String(req.user?.id || '').trim();
    return this.notificationService.registerCustomerPushSubscription({
      userId,
      subscription: (body as any)?.subscription,
    });
  }

  @Post('push/customer/unsubscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  async pushCustomerUnsubscribe(@Request() req, @Body() body: CustomerPushUnsubscribeDto) {
    const userId = String(req.user?.id || '').trim();
    return this.notificationService.unregisterCustomerPushSubscription({
      userId,
      endpoint: String(body?.endpoint || ''),
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'merchant', 'admin', 'courier')
  async listMine(@Request() req, @Query('take') take: string, @Query('skip') skip: string) {
    const userId = String(req.user?.id || '').trim();
    return this.notificationService.listForUser(userId, {
      take: parseOptionalInt(take),
      skip: parseOptionalInt(skip),
    });
  }

  @Get('me/unread-count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'merchant', 'admin', 'courier')
  async unreadCountMine(@Request() req) {
    const userId = String(req.user?.id || '').trim();
    return this.notificationService.unreadCountForUser(userId);
  }

  @Patch('me/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'merchant', 'admin', 'courier')
  async markAllMineRead(@Request() req) {
    const userId = String(req.user?.id || '').trim();
    return this.notificationService.markAllReadForUser(userId);
  }

  @Patch('me/:id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'merchant', 'admin', 'courier')
  async markMineRead(@Request() req, @Param('id') id: string) {
    const userId = String(req.user?.id || '').trim();
    return this.notificationService.markReadForUser(userId, id);
  }

  @Get('shop/:shopId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async listShop(@Request() req, @Param('shopId') shopId: string, @Query('take') take: string, @Query('skip') skip: string) {
    return this.notificationService.listForShop(shopId, { role: req.user?.role, shopId: req.user?.shopId }, {
      take: parseOptionalInt(take),
      skip: parseOptionalInt(skip),
    });
  }

  @Get('shop/:shopId/unread-count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async unreadCountShop(@Request() req, @Param('shopId') shopId: string) {
    return this.notificationService.unreadCountForShop(shopId, { role: req.user?.role, shopId: req.user?.shopId });
  }

  @Patch('shop/:shopId/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async markAllShopRead(@Request() req, @Param('shopId') shopId: string) {
    return this.notificationService.markAllReadForShop(shopId, { role: req.user?.role, shopId: req.user?.shopId });
  }

  @Patch('shop/:shopId/:id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async markShopNotificationRead(@Request() req, @Param('shopId') shopId: string, @Param('id') id: string) {
    return this.notificationService.markReadForShop(shopId, { role: req.user?.role, shopId: req.user?.shopId }, id);
  }
}
