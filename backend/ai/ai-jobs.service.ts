import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Queue, Job, Worker } from 'bullmq';
import { Redis } from 'ioredis';

export type AiJobType = 
  | 'generate_content'
  | 'optimize_media'
  | 'build_embeddings'
  | 'sync_knowledge'
  | 'analyze_sentiment'
  | 'process_3d_model'
  | 'generate_thumbnails'
  | 'batch_update';

export interface AiJobData {
  shopId: string;
  type: AiJobType;
  payload: Record<string, any>;
  priority?: number;
}

export interface AiJobResult {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

@Injectable()
export class AiJobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiJobsService.name);
  private redis?: Redis;
  private queue?: Queue<AiJobData, AiJobResult>;
  private worker?: Worker<AiJobData, AiJobResult>;
  private readonly redisEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const redisUrl = this.config.get<string>('REDIS_URL');
    this.redisEnabled = !!redisUrl;

    if (this.redisEnabled) {
      try {
        this.redis = new Redis(redisUrl!, {
          maxRetriesPerRequest: null,
          lazyConnect: true,
          connectTimeout: 5000,
        });

        this.queue = new Queue<AiJobData, AiJobResult>('ai-jobs', {
          connection: this.redis,
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 50 },
          },
        });

        this.logger.log('AI Jobs: Redis queue configured');
      } catch (err: any) {
        this.logger.warn(`AI Jobs: Redis connection failed — falling back to DB-only mode: ${err.message}`);
        this.redisEnabled = false;
        this.redis = undefined;
        this.queue = undefined;
      }
    } else {
      this.logger.log('AI Jobs: No REDIS_URL configured — running in DB-only mode');
    }
  }

  async onModuleInit() {
    if (this.redisEnabled && this.config.get<string>('NODE_ENV') !== 'test') {
      try {
        await this.redis?.ping();
        await this.startWorker();
      } catch (err: any) {
        this.logger.warn(`AI Jobs: Redis not reachable — worker disabled: ${err.message}`);
      }
    }
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
    await this.redis?.quit();
  }

  /**
   * Start the job worker
   */
  private async startWorker() {
    this.worker = new Worker<AiJobData, AiJobResult>(
      'ai-jobs',
      async (job) => this.processJob(job),
      {
        connection: this.redis,
        concurrency: 5,
      }
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} (${job.data.type}) completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} (${job?.data.type}) failed:`, err);
    });

    this.logger.log('AI Jobs worker started');
  }

  /**
   * Add a job to the queue
   */
  async addJob(params: {
    shopId: string;
    type: AiJobType;
    payload: Record<string, any>;
    priority?: number;
    delay?: number;
  }): Promise<string> {
    const { shopId, type, payload, priority = 5, delay } = params;

    // Create job record in database
    const dbJob = await this.prisma.aiJob.create({
      data: {
        shopId,
        type,
        payload: payload as any,
        priority,
        status: 'pending',
      },
    });

    // Add to BullMQ queue (if available)
    if (this.queue) {
      const job = await this.queue.add(
        type,
        { shopId, type, payload, priority },
        { jobId: dbJob.id, priority, delay },
      );
      this.logger.log(`Added job ${job.id} (${type}) for shop ${shopId}`);
    } else {
      this.logger.log(`Added DB-only job ${dbJob.id} (${type}) for shop ${shopId}`);
    }

    return dbJob.id;
  }

  /**
   * Process a job
   */
  private async processJob(job: Job<AiJobData>): Promise<AiJobResult> {
    const { shopId, type, payload } = job.data;
    const startTime = Date.now();

    // Update status to processing
    await this.prisma.aiJob.update({
      where: { id: job.id! },
      data: {
        status: 'processing',
        startedAt: new Date(),
      },
    });

    try {
      let result: AiJobResult;

      switch (type) {
        case 'generate_content':
          result = await this.handleGenerateContent(payload);
          break;
        case 'optimize_media':
          result = await this.handleOptimizeMedia(payload);
          break;
        case 'build_embeddings':
          result = await this.handleBuildEmbeddings(shopId, payload);
          break;
        case 'sync_knowledge':
          result = await this.handleSyncKnowledge(shopId, payload);
          break;
        case 'process_3d_model':
          result = await this.handleProcess3DModel(payload);
          break;
        case 'generate_thumbnails':
          result = await this.handleGenerateThumbnails(payload);
          break;
        default:
          result = { success: false, error: `Unknown job type: ${type}` };
      }

      // Update job as completed
      await this.prisma.aiJob.update({
        where: { id: job.id! },
        data: {
          status: result.success ? 'completed' : 'failed',
          result: result.data as any,
          error: result.error,
          completedAt: new Date(),
        },
      });

      const duration = Date.now() - startTime;
      this.logger.log(`Job ${job.id} completed in ${duration}ms`);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.prisma.aiJob.update({
        where: { id: job.id! },
        data: {
          status: 'failed',
          error: errorMessage,
          completedAt: new Date(),
        },
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Handle content generation job
   */
  private async handleGenerateContent(payload: any): Promise<AiJobResult> {
    // TODO: Implement content generation
    return { success: true, data: { message: 'Content generated' } };
  }

  /**
   * Handle media optimization job
   */
  private async handleOptimizeMedia(payload: any): Promise<AiJobResult> {
    // TODO: Implement media optimization
    return { success: true, data: { message: 'Media optimized' } };
  }

  /**
   * Handle embedding building job
   */
  private async handleBuildEmbeddings(shopId: string, payload: any): Promise<AiJobResult> {
    // TODO: Build embeddings for documents
    return { success: true, data: { message: 'Embeddings built' } };
  }

  /**
   * Handle knowledge sync job
   */
  private async handleSyncKnowledge(shopId: string, payload: any): Promise<AiJobResult> {
    // TODO: Sync knowledge base
    return { success: true, data: { message: 'Knowledge synced' } };
  }

  /**
   * Handle 3D model processing job
   */
  private async handleProcess3DModel(payload: any): Promise<AiJobResult> {
    // TODO: Process 3D model (draco, ktx2, etc.)
    return { success: true, data: { message: '3D model processed' } };
  }

  /**
   * Handle thumbnail generation job
   */
  private async handleGenerateThumbnails(payload: any): Promise<AiJobResult> {
    // TODO: Generate thumbnails
    return { success: true, data: { message: 'Thumbnails generated' } };
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string) {
    const dbJob = await this.prisma.aiJob.findUnique({ where: { id: jobId } });
    if (!dbJob) return null;

    let queueState: string | null = null;
    let progress: number | null = null;

    if (this.queue) {
      const queueJob = await this.queue.getJob(jobId);
      if (queueJob) {
        queueState = await queueJob.getState();
        const p = queueJob.progress;
        progress = typeof p === 'number' ? p : null;
      }
    }

    return { ...dbJob, queueState, progress };
  }

  /**
   * Get pending jobs for a shop
   */
  async getPendingJobs(shopId: string) {
    return this.prisma.aiJob.findMany({
      where: {
        shopId,
        status: { in: ['pending', 'processing'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Cancel a pending job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    if (this.queue) {
      const job = await this.queue.getJob(jobId);
      if (job) await job.remove();
    }

    await this.prisma.aiJob.update({
      where: { id: jobId },
      data: { status: 'failed', error: 'Cancelled by user' },
    });

    return true;
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<string | null> {
    const dbJob = await this.prisma.aiJob.findUnique({
      where: { id: jobId },
    });

    if (!dbJob || dbJob.status !== 'failed') return null;

    return this.addJob({
      shopId: dbJob.shopId,
      type: dbJob.type as AiJobType,
      payload: dbJob.payload as Record<string, any>,
      priority: dbJob.priority,
    });
  }

  /**
   * Get queue stats
   */
  async getQueueStats() {
    if (!this.queue) {
      return { waiting: 0, active: 0, completed: 0, failed: 0, total: 0, mode: 'db-only' as const };
    }

    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
    ]);

    return {
      waiting, active, completed, failed,
      total: waiting + active + completed + failed,
      mode: 'redis' as const,
    };
  }
}
