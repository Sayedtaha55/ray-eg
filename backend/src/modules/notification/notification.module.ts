import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { NotificationController } from '@modules/notification/notification.controller';
import { NotificationService } from '@modules/notification/notification.service';
import { WebPushService } from '@shared/services/web-push.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, WebPushService],
  exports: [NotificationService, WebPushService],
})
export class NotificationModule {}
