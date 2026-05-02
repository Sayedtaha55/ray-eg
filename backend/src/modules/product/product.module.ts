import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
// import { RedisModule } from '@common/redis/redis.module';
import { RedisModule } from '@common/redis/redis.module';
import { ProductController } from '@modules/product/product.controller';
import { ProductService } from '@modules/product/product.service';

@Module({
  imports: [PrismaModule, RedisModule, /* RedisModule */],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
