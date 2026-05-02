import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { AnalyticsController } from '@modules/analytics/analytics.controller';
import { AnalyticsService } from '@modules/analytics/analytics.service';

@Module({
  imports: [forwardRef(() => PrismaModule)],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
