import { Controller, Post, Get, Delete, UseGuards, Request, Body, Param, UploadedFile, UseInterceptors, Inject, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { GalleryService } from './gallery.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { randomBytes } from 'crypto';

@Controller('api/v1/gallery')
export class GalleryController {
  constructor(
    @Inject(GalleryService) private readonly galleryService: GalleryService,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dest = './uploads/gallery';
        try {
          fs.mkdirSync(dest, { recursive: true });
        } catch {
          // ignore
        }
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const randomName = randomBytes(16).toString('hex');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    limits: {
      fileSize: 80 * 1024 * 1024, // 80MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'video/mp4',
        'video/webm',
        'video/quicktime',
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Unsupported file type') as any, false);
      }
    }
  }))
  async uploadImage(
    @UploadedFile() file: any,
    @Request() req,
    @Body('caption') caption?: string,
    @Body('shopId') shopId?: string,
  ) {
    const userId = req.user.id;
    return this.galleryService.uploadImage(userId, file, caption, shopId);
  }

  @Get(':shopId')
  async getGallery(@Param('shopId') shopId: string) {
    return this.galleryService.getGalleryByShop(shopId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async deleteImage(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.galleryService.deleteImage(userId, id);
  }

  @Post(':id/caption')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async updateCaption(
    @Param('id') id: string,
    @Request() req,
    @Body('caption') caption: string,
  ) {
    const userId = req.user.id;
    return this.galleryService.updateCaption(userId, id, caption);
  }
}
