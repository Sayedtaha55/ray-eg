import { Controller, Get, Patch, Param, Query, Request, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { NotificationService } from './notification.service';

function parseOptionalInt(value: any) {
  if (typeof value === 'undefined' || value === null) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

@Controller('api/v1/notifications')
export class NotificationController {
  constructor(@Inject(NotificationService) private readonly notificationService: NotificationService) {}

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
}
