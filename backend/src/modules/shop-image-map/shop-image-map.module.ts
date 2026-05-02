import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { ShopImageMapController } from '@modules/shop-image-map/shop-image-map.controller';
import { ShopImageMapService } from '@modules/shop-image-map/shop-image-map.service';
import { GeminiVisionService } from './gemini-vision.service';

@Module({
  imports: [PrismaModule],
  controllers: [ShopImageMapController],
  providers: [ShopImageMapService, GeminiVisionService],
  exports: [ShopImageMapService],
})
export class ShopImageMapModule {}
