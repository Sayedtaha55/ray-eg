import { Body, Controller, Get, Inject, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { ChatService } from '@modules/chat/chat.service';

@Controller('api/v1/shops')
export class ChatController {
  constructor(@Inject(ChatService) private readonly chatService: ChatService) {}

  @Get(':shopId/chats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async listMerchantChats(@Param('shopId') shopId: string, @Request() req: any) {
    return this.chatService.listMerchantChats(String(shopId || '').trim(), req.user);
  }

  @Get(':shopId/chats/:userId/messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async getThread(@Param('shopId') shopId: string, @Param('userId') userId: string, @Request() req: any) {
    return this.chatService.getThreadMessages(String(shopId || '').trim(), String(userId || '').trim(), req.user);
  }

  @Post(':shopId/chats/:userId/messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async sendMessage(
    @Param('shopId') shopId: string,
    @Param('userId') userId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.chatService.sendMessageToUser(
      String(shopId || '').trim(),
      String(userId || '').trim(),
      String(body?.content || ''),
      req.user,
    );
  }
}
