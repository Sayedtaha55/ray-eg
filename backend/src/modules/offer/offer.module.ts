import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { RedisModule } from '@common/redis/redis.module';
import { OfferController } from '@modules/offer/offer.controller';
import { OfferService } from '@modules/offer/offer.service';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
