import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MediaOptimizeQueue } from './media-optimize.queue';
import { MediaOptimizeService } from './media-optimize.service';
import { Media3dOptimizeService } from './media-3d-optimize.service';

const enabled = String(process.env.MEDIA_OPT_ENABLE_WORKER || '').toLowerCase().trim() === 'true';

@Injectable()
export class MediaOptimizeWorker implements OnModuleInit, OnModuleDestroy {
  private running = false;
  private stopping = false;

  constructor(
    private readonly queue: MediaOptimizeQueue,
    private readonly optimize: MediaOptimizeService,
    private readonly optimize3d: Media3dOptimizeService,
  ) {
    console.log('[MediaOptimizeWorker] constructor');
  }

  private is3dJob(job: { key: string; mimeType: string; purpose?: string }) {
    const key = String(job?.key || '').toLowerCase();
    const mime = String(job?.mimeType || '').toLowerCase();
    const purpose = String(job?.purpose || '').toLowerCase();
    return key.endsWith('.glb') || key.endsWith('.gltf') || mime.startsWith('model/') || mime.includes('gltf') || purpose.includes('3d');
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
        const out = this.is3dJob(job)
          ? await this.optimize3d.optimize3D({ key: job.key, mimeType: job.mimeType })
          : await this.optimize.optimizeNow({ key: job.key, mimeType: job.mimeType, purpose: job.purpose });
        await this.queue.setStatus(job.jobId, {
          state: 'done',
          finishedAt: new Date().toISOString(),
          url: (out as any)?.url || (out as any)?.optimizedUrl,
          key: (out as any)?.key || (out as any)?.optimizedKey,
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
