import { Body, Controller, Get, Post, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { UsersService } from './users.service';

@Controller('api/v1/users')
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

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
}
