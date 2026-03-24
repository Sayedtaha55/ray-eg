import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ShopImageMapController } from './shop-image-map.controller';
import { ShopImageMapService } from './shop-image-map.service';
import { GeminiVisionService } from './gemini-vision.service';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ShopImageMapController],
  providers: [ShopImageMapService, GeminiVisionService],
  exports: [ShopImageMapService],
})
export class ShopImageMapModule {}
