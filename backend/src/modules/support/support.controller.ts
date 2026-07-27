import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards, Inject } from '@nestjs/common';
import { AnyDto } from '@shared/dto/any.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { SupportService } from '@modules/support/support.service';

@Controller('support')
export class SupportController {
  constructor(@Inject(SupportService) private readonly supportService: SupportService) {}

  @Post('public')
  async createPublic(@Body() body: AnyDto) {
    return this.supportService.createPublic({
      type: body?.type,
      subject: body?.subject,
      message: body?.message,
      userName: body?.userName,
      userEmail: body?.userEmail,
      userPhone: body?.userPhone,
      shopId: body?.shopId,
      orderId: body?.orderId,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'merchant', 'admin', 'courier')
  async createMine(@Request() req, @Body() body: AnyDto) {
    const userId = String(req.user?.id || '').trim();
    return this.supportService.createForUser(userId, {
      type: body?.type,
      subject: body?.subject,
      message: body?.message,
      shopId: body?.shopId,
      orderId: body?.orderId,
    });
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'merchant', 'admin', 'courier')
  async listMine(@Request() req, @Query('take') take: string, @Query('skip') skip: string) {
    const userId = String(req.user?.id || '').trim();
    const paging = this.supportService.parseListQuery(take, skip);
    return this.supportService.listForUser(userId, paging);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listAdmin(
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('status') status: string,
    @Query('type') type: string,
    @Query('q') q: string,
  ) {
    const paging = this.supportService.parseListQuery(take, skip);
    return this.supportService.listAdmin({ ...paging, status, type, q });
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getStats() {
    return this.supportService.getStats();
  }

  @Patch('admin/:id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async replyAdmin(@Param('id') id: string, @Body() body: AnyDto) {
    return this.supportService.replyAdmin(id, body?.reply);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatusAdmin(@Param('id') id: string, @Body() body: AnyDto) {
    return this.supportService.updateStatusAdmin(id, body?.status);
  }

  @Patch('admin/:id/priority')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updatePriorityAdmin(@Param('id') id: string, @Body() body: AnyDto) {
    return this.supportService.updatePriorityAdmin(id, body?.priority);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteAdmin(@Param('id') id: string) {
    return this.supportService.deleteAdmin(id);
  }
}
