import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { FeedbackService } from './feedback.service';

@Controller('api/v1/feedback')
export class FeedbackController {
  constructor(@Inject(FeedbackService) private readonly feedbackService: FeedbackService) {}

  @Post('public')
  async createPublic(@Body() body: any) {
    return this.feedbackService.createPublic({
      comment: body?.text ?? body?.comment,
      rating: typeof body?.rating === 'number' ? body.rating : undefined,
      userName: body?.userName != null ? String(body.userName) : undefined,
      userEmail: body?.userEmail != null ? String(body.userEmail) : undefined,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'merchant', 'admin', 'courier')
  async createMine(@Request() req, @Body() body: any) {
    const userId = String(req.user?.id || '').trim();
    return this.feedbackService.createForUser(userId, {
      comment: body?.text ?? body?.comment,
      rating: typeof body?.rating === 'number' ? body.rating : undefined,
      shopId: body?.shopId != null ? String(body.shopId) : null,
      productId: body?.productId != null ? String(body.productId) : null,
    });
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listAdmin(
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Query('status') status: string,
    @Query('q') q: string,
  ) {
    const paging = this.feedbackService.parseListQuery(take, skip);
    return this.feedbackService.listAdmin({ ...paging, status, q });
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatusAdmin(@Param('id') id: string, @Body() body: any) {
    return this.feedbackService.updateStatusAdmin(id, body?.status);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteAdmin(@Param('id') id: string) {
    return this.feedbackService.deleteAdmin(id);
  }
}
