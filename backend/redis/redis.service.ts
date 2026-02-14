import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null;

  async onModuleInit() {
    const redisUrl = String(process.env.REDIS_URL || '').trim();

    this.client = redisUrl
      ? new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        })
      : new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    this.client.on('error', (err) => {
      console.warn('⚠️ Redis connection error (cache disabled):', err?.message || err);
    });

    try {
      await this.client.connect();
    } catch (err: any) {
      console.warn('⚠️ Redis is not available. Continuing without cache.');
      try {
        await this.client.disconnect();
      } catch {
        // ignore
      }
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) await this.client.disconnect();
  }

  getClient(): Redis | null {
    return this.client;
  }

  // Basic operations
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.client) return;
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    const value = await this.client.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value as T;
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, ttl: number): Promise<void> {
    if (!this.client) return;
    await this.client.expire(key, ttl);
  }

  async setIfNotExists(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.client) return false;
    const ttl = typeof ttlSeconds === 'number' && Number.isFinite(ttlSeconds) ? Math.max(1, Math.floor(ttlSeconds)) : undefined;
    const res = ttl
      ? await this.client.set(key, value, 'EX', ttl, 'NX')
      : await this.client.set(key, value, 'NX');
    return res === 'OK';
  }

  // Cache utilities
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.client) return;

    let cursor = '0';
    do {
      const result = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 500);
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } while (cursor !== '0');
  }

  async getMultiple<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.client) return keys.map(() => null);
    const values = await this.client.mget(...keys);
    return values.map(value => {
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    });
  }

  async setMultiple(keyValuePairs: Record<string, any>, ttl?: number): Promise<void> {
    if (!this.client) return;
    const pipeline = this.client.pipeline();
    
    Object.entries(keyValuePairs).forEach(([key, value]) => {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        pipeline.setex(key, ttl, serializedValue);
      } else {
        pipeline.set(key, serializedValue);
      }
    });
    
    await pipeline.exec();
  }

  // Cache helpers for our app
  async cacheShop(shopId: string, shopData: any, ttl = 3600): Promise<void> {
    await this.set(`shop:${shopId}`, shopData, ttl);
    await this.set(`shop:slug:${shopData.slug}`, shopData, ttl);
  }

  async getShop(shopId: string): Promise<any | null> {
    return this.get(`shop:${shopId}`);
  }

  async getShopBySlug(slug: string): Promise<any | null> {
    return this.get(`shop:slug:${slug}`);
  }

  async cacheShopsList(shops: any[], ttl = 1800): Promise<void> {
    await this.set('shops:list', shops, ttl);
  }

  async getShopsList(): Promise<any[] | null> {
    return this.get('shops:list');
  }

  async cacheProduct(productId: string, productData: any, ttl = 3600): Promise<void> {
    await this.set(`product:${productId}`, productData, ttl);
  }

  async getProduct(productId: string): Promise<any | null> {
    return this.get(`product:${productId}`);
  }

  async invalidateShopCache(shopId: string, slug?: string): Promise<void> {
    await this.del(`shop:${shopId}`);
    if (slug) {
      await this.del(`shop:slug:${slug}`);
    }
    await this.del('shops:list');
  }

  async invalidateProductCache(productId: string): Promise<void> {
    await this.del(`product:${productId}`);
  }

  // Analytics and monitoring
  async incrementCounter(key: string, amount = 1): Promise<number> {
    if (!this.client) return 0;
    return this.client.incrby(key, amount);
  }

  async getCounter(key: string): Promise<number> {
    if (!this.client) return 0;
    const value = await this.client.get(key);
    return value ? parseInt(value) : 0;
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      if (!this.client) return false;
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}
