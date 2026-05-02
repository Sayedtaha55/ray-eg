import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { RealtimeModule } from '@common/realtime/realtime.module';
import { ChatController } from '@modules/chat/chat.controller';
import { ChatService } from '@modules/chat/chat.service';

@Module({
  imports: [PrismaModule, RealtimeModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
