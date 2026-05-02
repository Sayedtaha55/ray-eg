import { Module } from '@nestjs/common';
import { GalleryController } from '@modules/gallery/gallery.controller';
import { GalleryService } from '@modules/gallery/gallery.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { MediaModule } from '@modules/media/media.module';
import { RedisModule } from '@common/redis/redis.module';

@Module({
  imports: [PrismaModule, MediaModule, RedisModule],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
