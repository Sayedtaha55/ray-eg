import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { AiAuditService } from './ai-audit.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { AiJobsService, AiJobType } from './ai-jobs.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly auditService: AiAuditService,
    private readonly knowledgeBase: KnowledgeBaseService,
    private readonly jobsService: AiJobsService,
  ) {}

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

    return { tier: 'FREE', message: 'Tier info endpoint — will be implemented with billing' };
  }

  // ─── Audit & Approval Endpoints ──────────────────────────────────

  @Get('audit/:shopId')
  async getAuditTrail(
    @Req() req: any,
    @Param('shopId') shopId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
  ) {
    const user = req.user;
    if (user?.shopId !== shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    return this.auditService.getAuditTrail(shopId, {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      status: status as any,
    });
  }

  @Get('audit/:shopId/pending')
  async getPendingApprovals(
    @Req() req: any,
    @Param('shopId') shopId: string,
  ) {
    const user = req.user;
    if (user?.shopId !== shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    return this.auditService.getPendingApprovals(shopId);
  }

  @Post('audit/approve/:logId')
  @HttpCode(HttpStatus.OK)
  async approveAction(
    @Req() req: any,
    @Param('logId') logId: string,
    @Body() body: { shopId: string },
  ) {
    const user = req.user;
    if (user?.shopId !== body.shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    await this.auditService.approveAction(logId, user.id);
    return { success: true, message: 'Action approved' };
  }

  @Post('audit/reject/:logId')
  @HttpCode(HttpStatus.OK)
  async rejectAction(
    @Req() req: any,
    @Param('logId') logId: string,
    @Body() body: { shopId: string; reason?: string },
  ) {
    const user = req.user;
    if (user?.shopId !== body.shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    await this.auditService.rejectAction(logId, body.reason);
    return { success: true, message: 'Action rejected' };
  }

  @Get('costs/:shopId')
  async getCostAnalytics(
    @Req() req: any,
    @Param('shopId') shopId: string,
    @Query('days') days?: string,
  ) {
    const user = req.user;
    if (user?.shopId !== shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    return this.auditService.getCostAnalytics(shopId, days ? parseInt(days, 10) : 30);
  }

  // ─── Knowledge Base Endpoints ────────────────────────────────────

  @Get('knowledge/:shopId/stats')
  async getKnowledgeStats(
    @Req() req: any,
    @Param('shopId') shopId: string,
  ) {
    const user = req.user;
    if (user?.shopId !== shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    return this.knowledgeBase.getStats(shopId);
  }

  @Post('knowledge/:shopId/add')
  @HttpCode(HttpStatus.OK)
  async addKnowledgeDocument(
    @Req() req: any,
    @Param('shopId') shopId: string,
    @Body() body: {
      type: 'product' | 'policy' | 'faq' | 'support_ticket' | 'custom';
      title: string;
      content: string;
      sourceId?: string;
      metadata?: Record<string, any>;
    },
  ) {
    const user = req.user;
    if (user?.shopId !== shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    if (!body.title || !body.content) {
      throw new BadRequestException('title and content are required');
    }

    const docId = await this.knowledgeBase.addDocument({
      shopId,
      type: body.type,
      title: body.title,
      content: body.content,
      sourceId: body.sourceId,
      metadata: body.metadata,
    });

    return { success: true, documentId: docId };
  }

  @Post('knowledge/:shopId/search')
  @HttpCode(HttpStatus.OK)
  async searchKnowledge(
    @Req() req: any,
    @Param('shopId') shopId: string,
    @Body() body: { query: string; type?: string; limit?: number },
  ) {
    const user = req.user;
    if (user?.shopId !== shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    if (!body.query) {
      throw new BadRequestException('query is required');
    }

    return this.knowledgeBase.search({
      shopId,
      query: body.query,
      type: body.type,
      limit: body.limit,
    });
  }

  @Post('knowledge/:shopId/sync-product')
  @HttpCode(HttpStatus.OK)
  async syncProductToKnowledge(
    @Req() req: any,
    @Param('shopId') shopId: string,
    @Body() body: {
      id: string;
      name: string;
      description?: string;
      price?: number;
      category?: string;
      tags?: string[];
    },
  ) {
    const user = req.user;
    if (user?.shopId !== shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    await this.knowledgeBase.syncProduct(shopId, body);
    return { success: true };
  }

  // ─── Job Queue Endpoints ──────────────────────────────────────────

  @Post('jobs/:shopId/add')
  @HttpCode(HttpStatus.OK)
  async addJob(
    @Req() req: any,
    @Param('shopId') shopId: string,
    @Body() body: {
      type: AiJobType;
      payload: Record<string, any>;
      priority?: number;
      delay?: number;
    },
  ) {
    const user = req.user;
    if (user?.shopId !== shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    if (!body.type) {
      throw new BadRequestException('type is required');
    }

    const jobId = await this.jobsService.addJob({
      shopId,
      type: body.type,
      payload: body.payload,
      priority: body.priority,
      delay: body.delay,
    });

    return { success: true, jobId };
  }

  @Get('jobs/:jobId/status')
  async getJobStatus(@Req() req: any, @Param('jobId') jobId: string) {
    const job = await this.jobsService.getJobStatus(jobId);
    if (!job) {
      throw new BadRequestException('Job not found');
    }

    const user = req.user;
    if (user?.shopId !== job.shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this job');
    }

    return job;
  }

  @Get('jobs/:shopId/pending')
  async getPendingJobs(
    @Req() req: any,
    @Param('shopId') shopId: string,
  ) {
    const user = req.user;
    if (user?.shopId !== shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this shop');
    }

    return this.jobsService.getPendingJobs(shopId);
  }

  @Post('jobs/:jobId/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelJob(
    @Req() req: any,
    @Param('jobId') jobId: string,
    @Body() body: { shopId: string },
  ) {
    const user = req.user;
    if (user?.shopId !== body.shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this job');
    }

    await this.jobsService.cancelJob(jobId);
    return { success: true, message: 'Job cancelled' };
  }

  @Post('jobs/:jobId/retry')
  @HttpCode(HttpStatus.OK)
  async retryJob(
    @Req() req: any,
    @Param('jobId') jobId: string,
    @Body() body: { shopId: string },
  ) {
    const user = req.user;
    if (user?.shopId !== body.shopId && user?.role !== 'ADMIN') {
      throw new BadRequestException('You do not have access to this job');
    }

    const newJobId = await this.jobsService.retryJob(jobId);
    if (!newJobId) {
      throw new BadRequestException('Job not found or not in failed state');
    }

    return { success: true, jobId: newJobId };
  }

  @Get('jobs/queue-stats')
  async getQueueStats() {
    return this.jobsService.getQueueStats();
  }
}
