import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { RedisModule } from '@common/redis/redis.module';
import { ShopImageMapController } from '@modules/shop-image-map/shop-image-map.controller';
import { ShopImageMapService } from '@modules/shop-image-map/shop-image-map.service';
import { GeminiVisionService } from '@modules/media/gemini-vision.service';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ShopImageMapController],
  providers: [ShopImageMapService, GeminiVisionService],
  exports: [ShopImageMapService],
})
export class ShopImageMapModule {}
