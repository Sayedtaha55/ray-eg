import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RedisService } from './redis/redis.service';

type EnqueueInput = {
  jobId: string;
  key: string;
  mimeType: string;
  purpose?: string;
};

@Injectable()
export class MediaOptimizeQueue implements OnModuleInit, OnModuleDestroy {
  private readonly queueKey = String(process.env.MEDIA_OPT_QUEUE_KEY || 'queue:media:opt').trim() || 'queue:media:opt';
  private readonly statusPrefix = String(process.env.MEDIA_OPT_STATUS_PREFIX || 'media:opt:status:').trim() || 'media:opt:status:';
  private readonly keyPrefix = String(process.env.MEDIA_OPT_KEY_PREFIX || 'media:opt:key:').trim() || 'media:opt:key:';

  constructor(private readonly redis: RedisService) {}

  async onModuleInit() {
    // no-op
  }

  async onModuleDestroy() {
    // no-op
  }

  private getClient() {
    return this.redis.getClient();
  }

  getStatusKey(jobId: string) {
    return `${this.statusPrefix}${jobId}`;
  }

  getStatusKeyByMediaKey(mediaKey: string) {
    return `${this.keyPrefix}${mediaKey}`;
  }

  async enqueue(job: EnqueueInput) {
    const client = this.getClient();
    if (!client) throw new Error('Redis unavailable');

    await client.multi()
      .set(this.getStatusKey(job.jobId), JSON.stringify({ state: 'queued', createdAt: new Date().toISOString() }))
      .set(this.getStatusKeyByMediaKey(job.key), job.jobId, 'EX', 60 * 60 * 6)
      .lpush(this.queueKey, JSON.stringify(job))
      .exec();
  }

  async getJobIdByMediaKey(mediaKey: string): Promise<string | null> {
    const client = this.getClient();
    if (!client) return null;
    const id = await client.get(this.getStatusKeyByMediaKey(mediaKey));
    return id ? String(id) : null;
  }

  async getStatus(jobId: string): Promise<any | null> {
    const client = this.getClient();
    if (!client) return null;
    const raw = await client.get(this.getStatusKey(jobId));
    if (!raw) return null;
    try {
      return JSON.parse(String(raw));
    } catch {
      return null;
    }
  }

  async setStatus(jobId: string, status: any, ttlSeconds = 60 * 60 * 6) {
    const client = this.getClient();
    if (!client) return;
    await client.set(this.getStatusKey(jobId), JSON.stringify(status), 'EX', ttlSeconds);
  }

  async popBlocking(timeoutSeconds = 2): Promise<EnqueueInput | null> {
    const client = this.getClient();
    if (!client) return null;

    const res = await client.brpop(this.queueKey, timeoutSeconds);
    if (!res || !Array.isArray(res) || res.length < 2) return null;

    const payload = res[1];
    if (!payload) return null;

    try {
      const parsed = JSON.parse(String(payload));
      if (!parsed?.jobId || !parsed?.key || !parsed?.mimeType) return null;
      return parsed as EnqueueInput;
    } catch {
      return null;
    }
  }
}
