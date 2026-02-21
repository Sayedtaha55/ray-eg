import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MediaOptimizeQueue } from './media-optimize.queue';
import { MediaOptimizeService } from './media-optimize.service';

const enabled = String(process.env.MEDIA_OPT_ENABLE_WORKER || '').toLowerCase().trim() === 'true';

@Injectable()
export class MediaOptimizeWorker implements OnModuleInit, OnModuleDestroy {
  private running = false;
  private stopping = false;

  constructor(
    private readonly queue: MediaOptimizeQueue,
    private readonly optimize: MediaOptimizeService,
  ) {
    console.log('[MediaOptimizeWorker] constructor');
  }

  async onModuleInit() {
    if (!enabled) return;
    if (this.running) return;
    this.running = true;
    this.loop().catch(() => undefined);
  }

  async onModuleDestroy() {
    this.stopping = true;
  }

  private async loop() {
    while (!this.stopping) {
      const job = await this.queue.popBlocking(2);
      if (!job) continue;

      const startedAt = new Date().toISOString();
      await this.queue.setStatus(job.jobId, { state: 'processing', startedAt });

      try {
        const out = await this.optimize.optimizeNow({ key: job.key, mimeType: job.mimeType, purpose: job.purpose });
        await this.queue.setStatus(job.jobId, {
          state: 'done',
          finishedAt: new Date().toISOString(),
          url: out.url,
          key: out.key,
          thumbUrl: (out as any)?.thumbUrl,
          thumbKey: (out as any)?.thumbKey,
        });
      } catch (e: any) {
        const msg = e?.message ? String(e.message) : 'Optimization failed';
        await this.queue.setStatus(job.jobId, { state: 'failed', finishedAt: new Date().toISOString(), error: msg });
      }
    }
    this.running = false;
  }
}
