import { Controller, Get, Post, Param, UseGuards, Request, BadRequestException, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { AppsService } from '@modules/apps/apps.service';

@Controller('api/v1/apps')
export class AppsController {
  constructor(
    @Inject(AppsService) private readonly apps: AppsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async list() {
    return this.apps.listApps();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async myApps(@Request() req) {
    const shopId = String(req.user?.shopId || '').trim();
    if (!shopId) throw new BadRequestException('لا يوجد متجر مرتبط بهذا الحساب');
    return this.apps.listMyApps(shopId);
  }

  @Post(':key/install')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async install(@Param('key') key: string, @Request() req) {
    const shopId = String(req.user?.shopId || '').trim();
    if (!shopId) throw new BadRequestException('لا يوجد متجر مرتبط بهذا الحساب');
    return this.apps.installApp(shopId, key);
  }

  @Post(':key/uninstall')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async uninstall(@Param('key') key: string, @Request() req) {
    const shopId = String(req.user?.shopId || '').trim();
    if (!shopId) throw new BadRequestException('لا يوجد متجر مرتبط بهذا الحساب');
    return this.apps.uninstallApp(shopId, key);
  }

  @Post(':key/enable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async enable(@Param('key') key: string, @Request() req) {
    const shopId = String(req.user?.shopId || '').trim();
    if (!shopId) throw new BadRequestException('لا يوجد متجر مرتبط بهذا الحساب');
    return this.apps.setActive(shopId, key, true);
  }

  @Post(':key/disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async disable(@Param('key') key: string, @Request() req) {
    const shopId = String(req.user?.shopId || '').trim();
    if (!shopId) throw new BadRequestException('لا يوجد متجر مرتبط بهذا الحساب');
    return this.apps.setActive(shopId, key, false);
  }
}
