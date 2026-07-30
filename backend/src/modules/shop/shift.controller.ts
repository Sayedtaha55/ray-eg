import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@Controller('shops/me/shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post('open')
  @Roles('MERCHANT', 'CASHIER', 'ADMIN')
  async openShift(@Request() req, @Body() body: any) {
    const shopId = String(req.user?.shopId || body?.shopId || '').trim();
    const userId = String(req.user?.id || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');
    return this.shiftService.openShift({
      shopId,
      userId,
      openingAmount: Number(body?.openingAmount || 0),
    });
  }

  @Patch(':id/close')
  @Roles('MERCHANT', 'CASHIER', 'ADMIN')
  async closeShift(@Param('id') id: string, @Body() body: any) {
    return this.shiftService.closeShift({
      shiftId: id,
      closingAmount: Number(body?.closingAmount || 0),
      note: body?.note,
    });
  }

  @Get('active')
  @Roles('MERCHANT', 'CASHIER', 'ADMIN')
  async getMyActiveShift(@Request() req, @Query('shopId') shopId: string) {
    const sid = String(shopId || req.user?.shopId || '').trim();
    const userId = String(req.user?.id || '').trim();
    return this.shiftService.getMyActiveShift(sid, userId);
  }

  @Get(':id')
  @Roles('MERCHANT', 'CASHIER', 'ADMIN')
  async getShift(@Param('id') id: string) {
    return this.shiftService.getShiftById(id);
  }

  @Get()
  @Roles('MERCHANT', 'CASHIER', 'ADMIN')
  async listShifts(
    @Query('shopId') shopId: string,
    @Query('userId') userId: string,
    @Query('status') status: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('take') take: string,
  ) {
    return this.shiftService.listShifts({
      shopId: typeof shopId === 'string' ? shopId : undefined,
      userId: typeof userId === 'string' ? userId : undefined,
      status: typeof status === 'string' ? status : undefined,
      from: typeof from === 'string' ? from : undefined,
      to: typeof to === 'string' ? to : undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('summary/overview')
  @Roles('MERCHANT', 'ADMIN')
  async getShiftSummary(
    @Request() req: any,
    @Query('shopId') shopId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const sid = String(shopId || req.user?.shopId || '').trim();
    return this.shiftService.getShiftSummary(sid, from, to);
  }
}
