import { Controller, Get, Patch, Post, Body, Param, UseGuards, Request, BadRequestException, Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { CourierService } from './courier.service';

@Controller('api/v1/courier')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('courier')
export class CourierController {
  constructor(@Inject(CourierService) private readonly courierService: CourierService) {}

  @Get('state')
  async getState(@Request() req?: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');
    return this.courierService.getMyState(String(userId));
  }

  @Patch('state')
  async updateState(@Body() body: any, @Request() req?: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');
    return this.courierService.updateMyState(String(userId), {
      isAvailable: typeof body?.isAvailable === 'boolean' ? body.isAvailable : undefined,
      lat: typeof body?.lat === 'number' ? body.lat : Number(body?.lat),
      lng: typeof body?.lng === 'number' ? body.lng : Number(body?.lng),
      accuracy: typeof body?.accuracy === 'number' ? body.accuracy : Number(body?.accuracy),
    });
  }

  @Get('offers')
  async listOffers(@Request() req?: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');
    return this.courierService.listMyOffers(String(userId));
  }

  @Post('offers/:id/accept')
  async accept(@Param('id') id: string, @Request() req?: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');
    return this.courierService.acceptOffer(String(userId), id);
  }

  @Post('offers/:id/reject')
  async reject(@Param('id') id: string, @Request() req?: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');
    return this.courierService.rejectOffer(String(userId), id);
  }
}
