import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Req() req: any,
    @Body()
    body: {
      message: string;
      shopId: string;
      context?: { currentPage?: string; locale?: string };
    },
  ) {
    if (!body.message?.trim()) {
      throw new BadRequestException('message is required');
    }
    if (!body.shopId) {
      throw new BadRequestException('shopId is required');
    }

    // Ensure the authenticated user owns this shop
    const user = req.user;
    if (user?.shopId !== body.shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    try {
      return await this.aiService.chat({
        shopId: body.shopId,
        message: body.message.trim(),
        context: body.context,
      });
    } catch (err: any) {
      this.logger.error(`AI chat error: ${err.message}`, err.stack);
      throw new BadRequestException(err.message || 'AI service error — please try again');
    }
  }

  @Post('chat/stream')
  @HttpCode(HttpStatus.OK)
  async chatStream(
    @Req() req: any,
    @Body()
    body: {
      message: string;
      shopId: string;
      context?: { currentPage?: string; locale?: string };
    },
  ) {
    if (!body.message?.trim()) {
      throw new BadRequestException('message is required');
    }
    if (!body.shopId) {
      throw new BadRequestException('shopId is required');
    }

    const user = req.user;
    if (user?.shopId !== body.shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    // For now, return non-streaming (streaming requires SSE setup in main.ts)
    return this.aiService.chat({
      shopId: body.shopId,
      message: body.message.trim(),
      context: body.context,
    });
  }

  @Post('tier')
  @HttpCode(HttpStatus.OK)
  async getTierInfo(@Req() req: any, @Body() body: { shopId: string }) {
    const user = req.user;
    if (user?.shopId !== body.shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    const { PrismaService } = await import('../prisma/prisma.service');
    // Use injected prisma instead
    return { tier: 'FREE', message: 'Tier info endpoint — will be implemented with billing' };
  }
}
