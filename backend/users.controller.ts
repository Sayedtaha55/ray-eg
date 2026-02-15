import { Body, Controller, Get, Post, Patch, Param, UseGuards, Inject, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { UsersService } from './users.service';

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
  async listCouriers() {
    return this.usersService.listCouriers();
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
  async listPendingCouriers() {
    return this.usersService.listPendingCouriers();
  }

  @Patch('couriers/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approveCourier(@Param('id') id: string) {
    return this.usersService.approveCourier(id);
  }

  @Patch('couriers/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async rejectCourier(@Param('id') id: string) {
    return this.usersService.rejectCourier(id);
  }
}
