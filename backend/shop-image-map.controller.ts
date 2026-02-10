import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { ShopImageMapService } from './shop-image-map.service';

@Controller('api/v1/shops')
export class ShopImageMapController {
  constructor(@Inject(ShopImageMapService) private readonly shopImageMapService: ShopImageMapService) {}

  @Get(':slug/image-map/active')
  async getActiveForCustomer(@Param('slug') slug: string) {
    return this.shopImageMapService.getActiveForCustomerBySlug(slug);
  }

  @Get(':shopId/image-maps/manage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async listForManage(@Param('shopId') shopId: string, @Request() req: any) {
    return this.shopImageMapService.listByShopForManage(shopId, { role: req.user?.role, shopId: req.user?.shopId });
  }

  @Post(':shopId/image-maps')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async create(@Param('shopId') shopId: string, @Body() body: any, @Request() req: any) {
    return this.shopImageMapService.createMap(shopId, body, { role: req.user?.role, shopId: req.user?.shopId });
  }

  @Patch(':shopId/image-maps/:mapId/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async activate(@Param('shopId') shopId: string, @Param('mapId') mapId: string, @Request() req: any) {
    return this.shopImageMapService.activateMap(shopId, mapId, { role: req.user?.role, shopId: req.user?.shopId });
  }

  @Patch(':shopId/image-maps/:mapId/layout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async saveLayout(@Param('shopId') shopId: string, @Param('mapId') mapId: string, @Body() body: any, @Request() req: any) {
    return this.shopImageMapService.saveLayout(shopId, mapId, body, { role: req.user?.role, shopId: req.user?.shopId });
  }

  @Post(':shopId/image-maps/analyze')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async analyze(@Param('shopId') shopId: string, @Body() body: any, @Request() req: any) {
    return this.shopImageMapService.analyze(shopId, body, { role: req.user?.role, shopId: req.user?.shopId });
  }
}
