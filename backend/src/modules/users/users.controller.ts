import { Body, Controller, Get, Post, Patch, Param, UseGuards, Inject, Request, BadRequestException, Query } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { UsersService } from '@modules/users/users.service';

@Controller('api/v1/users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Request() req: any, @Body() body: any) {
    const userId = String(req?.user?.id || '').trim();
    if (!userId) throw new BadRequestException('غير مصرح');
    return this.usersService.updateMe(userId, {
      name: body?.name != null ? String(body.name) : undefined,
      phone: body?.phone != null ? String(body.phone) : undefined,
    });
  }

  @Get('couriers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listCouriers(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.usersService.listCouriers({
      take: take != null && take !== '' ? Number(take) : undefined,
      skip: skip != null && skip !== '' ? Number(skip) : undefined,
      search: typeof search === 'string' ? search : undefined,
      isActive: typeof isActive === 'string' && isActive !== '' ? isActive : undefined,
    });
  }

  @Post('couriers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createCourier(@Body() body: any) {
    return this.usersService.createCourier({
      email: String(body?.email || ''),
      password: String(body?.password || ''),
      name: String(body?.name || ''),
      phone: body?.phone != null ? String(body.phone) : null,
    });
  }

  @Get('couriers/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listPendingCouriers(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.listPendingCouriers({
      take: take != null && take !== '' ? Number(take) : undefined,
      skip: skip != null && skip !== '' ? Number(skip) : undefined,
      search: typeof search === 'string' ? search : undefined,
    });
  }

  @Patch('couriers/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approveCourier(@Param('id') id: string) {
    return this.usersService.approveCourier(id);
  }


  @Get('couriers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getCourierDetails(@Param('id') id: string) {
    return this.usersService.getCourierAdminDetails(id);
  }

  @Patch('couriers/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async setCourierStatus(@Param('id') id: string, @Body() body: any) {
    const isActive = typeof body?.isActive === 'boolean'
      ? body.isActive
      : String(body?.isActive || '').trim().toLowerCase() === 'true';
    return this.usersService.setCourierActiveStatus(id, isActive);
  }

  @Patch('couriers/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async rejectCourier(@Param('id') id: string) {
    return this.usersService.rejectCourier(id);
  }
}
