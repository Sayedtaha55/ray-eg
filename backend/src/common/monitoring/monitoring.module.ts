import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { LoggerModule } from '@common/logger/logger.module';
import { MonitoringController } from './monitoring.controller';
import { PrismaModule } from '@common/prisma/prisma.module';
import { RedisModule } from '@common/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule, LoggerModule],
  controllers: [MonitoringController],
  providers: [
    MonitoringService,
  ],
  exports: [
    MonitoringService,
  ],
})
export class MonitoringModule {}
