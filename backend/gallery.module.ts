import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { PrismaModule } from './prisma/prisma.module';
import { MediaModule } from './media.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [PrismaModule, MediaModule, RedisModule],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
