import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { RedisService } from '@common/redis/redis.service';

@Injectable()
export class AiCacheService {
  constructor(private readonly redis: RedisService) {}

  private isEnabled() {
    const raw = String(process.env.AI_CACHE_ENABLE || '').trim().toLowerCase();
    return raw === 'true' || raw === '1' || raw === 'yes';
  }

  private getTtlSeconds() {
    const raw = String(process.env.AI_CACHE_TTL_SECONDS || '').trim();
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
    return 60 * 10;
  }

  buildKey(params: {
    provider: string;
    model?: string;
    shopId: string;
    tier: string;
    message: string;
    context?: any;
    tools?: string[];
  }) {
    const payload = {
      provider: params.provider,
      model: params.model || '',
      shopId: params.shopId,
      tier: params.tier,
      message: params.message,
      context: params.context || {},
      tools: params.tools || [],
    };

    const json = JSON.stringify(payload);
    const hash = createHash('sha256').update(json).digest('hex');
    return `ai:chat:${hash}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled()) return null;
    return this.redis.get<T>(key);
  }

  async set(key: string, value: any) {
    if (!this.isEnabled()) return;
    await this.redis.set(key, value, this.getTtlSeconds());
  }
}
