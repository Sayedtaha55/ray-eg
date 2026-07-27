import { Injectable, Inject } from '@nestjs/common';
import { RedisService } from '@common/redis/redis.service';

const LOCKOUT_PREFIX = 'auth:lockout:';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_SEC = 15 * 60; // 15 minutes
const SLIDING_WINDOW_SEC = 60 * 60; // 1 hour

@Injectable()
export class AccountLockoutService {
  constructor(@Inject(RedisService) private readonly redis: RedisService) {}

  private async get(key: string): Promise<string | null> {
    try {
      const client = this.redis.getClient?.();
      if (!client) return null;
      return await client.get(key);
    } catch {
      return null;
    }
  }

  private async incr(key: string): Promise<number> {
    try {
      const client = this.redis.getClient?.();
      if (!client) return 0;
      const val = await client.incr(key);
      if (val === 1) {
        await client.expire(key, SLIDING_WINDOW_SEC);
      }
      return val;
    } catch {
      return 0;
    }
  }

  private async expire(key: string, seconds: number): Promise<void> {
    try {
      const client = this.redis.getClient?.();
      if (!client) return;
      await client.set(key, '1', 'EX', seconds);
    } catch {
      // ignore
    }
  }

  private async del(key: string): Promise<void> {
    try {
      const client = this.redis.getClient?.();
      if (!client) return;
      await client.del(key);
    } catch {
      // ignore
    }
  }

  async isLocked(identifier: string): Promise<{ locked: boolean; retryAfter: number }> {
    const lockKey = `${LOCKOUT_PREFIX}locked:${identifier}`;
    const locked = await this.get(lockKey);
    if (locked) {
      try {
        const client = this.redis.getClient?.();
        if (client) {
          const ttl = await client.ttl(lockKey);
          return { locked: true, retryAfter: Math.max(1, ttl) };
        }
      } catch {
        // ignore
      }
      return { locked: true, retryAfter: LOCKOUT_DURATION_SEC };
    }
    return { locked: false, retryAfter: 0 };
  }

  async recordFailure(identifier: string): Promise<{ locked: boolean; attempts: number; retryAfter: number }> {
    const attemptsKey = `${LOCKOUT_PREFIX}attempts:${identifier}`;
    const attempts = await this.incr(attemptsKey);

    if (attempts >= MAX_ATTEMPTS) {
      const lockKey = `${LOCKOUT_PREFIX}locked:${identifier}`;
      await this.expire(lockKey, LOCKOUT_DURATION_SEC);
      await this.del(attemptsKey);
      return { locked: true, attempts, retryAfter: LOCKOUT_DURATION_SEC };
    }

    return { locked: false, attempts, retryAfter: 0 };
  }

  async recordSuccess(identifier: string): Promise<void> {
    const attemptsKey = `${LOCKOUT_PREFIX}attempts:${identifier}`;
    await this.del(attemptsKey);
  }
}
