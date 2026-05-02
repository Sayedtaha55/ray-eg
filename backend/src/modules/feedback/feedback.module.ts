import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { FeedbackController } from '@modules/feedback/feedback.controller';
import { FeedbackService } from '@modules/feedback/feedback.service';

@Module({
  imports: [PrismaModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
