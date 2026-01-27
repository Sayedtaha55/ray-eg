import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { MediaPresignDto } from './media-presign.dto';
import { MediaPresignService } from './media-presign.service';

@Controller('api/v1/media')
export class MediaController {
  constructor(private readonly mediaPresign: MediaPresignService) {}

  @Post('presign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async presign(@Request() req, @Body() body: MediaPresignDto) {
    return this.mediaPresign.presignUpload(body, { role: req.user?.role, shopId: req.user?.shopId });
  }
}
