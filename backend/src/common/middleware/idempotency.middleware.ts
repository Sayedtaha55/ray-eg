import { Request, Response, NextFunction } from 'express';

const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;
const IDEMPOTENCY_TTL_MS = IDEMPOTENCY_TTL_SECONDS * 1000;

interface IdempotencyRecord {
  status: number;
  body: any;
  headers: Record<string, string>;
  createdAt: number;
}

// In-memory fallback when Redis is unavailable
const memoryStore = new Map<string, IdempotencyRecord>();
const memoryCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore) {
    if (now - record.createdAt > IDEMPOTENCY_TTL_MS) {
      memoryStore.delete(key);
    }
  }
}, 60 * 60 * 1000);
memoryCleanupInterval.unref();

// Redis client getter — set by main.ts during bootstrap
let redisGetter: (() => { setex: (key: string, ttl: number, val: string) => Promise<any>; get: (key: string) => Promise<string | null> } | null) | null = null;

export function setIdempotencyRedisGetter(getter: () => { setex: (key: string, ttl: number, val: string) => Promise<any>; get: (key: string) => Promise<string | null> } | null) {
  redisGetter = getter;
}

async function getRecord(key: string): Promise<IdempotencyRecord | null> {
  const redis = redisGetter?.();
  if (redis) {
    try {
      const raw = await redis.get(`idempotency:${key}`);
      if (raw) return JSON.parse(raw) as IdempotencyRecord;
    } catch {
      // fall through to memory
    }
  }
  return memoryStore.get(key) || null;
}

async function setRecord(key: string, record: IdempotencyRecord): Promise<void> {
  const redis = redisGetter?.();
  if (redis) {
    try {
      await redis.setex(`idempotency:${key}`, IDEMPOTENCY_TTL_SECONDS, JSON.stringify(record));
      return;
    } catch {
      // fall through to memory
    }
  }
  memoryStore.set(key, record);
}

export async function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  const method = String(req.method || '').toUpperCase();

  if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') {
    return next();
  }

  const key = String(req.headers['idempotency-key'] || '').trim();
  if (!key) {
    return next();
  }

  const existing = await getRecord(key);
  if (existing) {
    try {
      for (const [h, v] of Object.entries(existing.headers || {})) {
        res.setHeader(h, v);
      }
    } catch {
      // ignore header errors
    }
    return res.status(existing.status).json(existing.body);
  }

  const originalSend = res.send.bind(res);
  let responseBody: any = null;

  (res as any).send = function (body: any) {
    responseBody = body;
    return originalSend(body);
  };

  const originalEnd = res.end.bind(res);
  (res as any).end = function (...args: any[]) {
    try {
      const status = res.statusCode;
      if (status >= 200 && status < 400) {
        const headers: Record<string, string> = {};
        try {
          const contentType = res.getHeader('content-type');
          if (contentType) headers['content-type'] = String(contentType);
        } catch {}

        let parsed: any = responseBody;
        try {
          if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        } catch {}

        const record: IdempotencyRecord = { status, body: parsed, headers, createdAt: Date.now() };
        setRecord(key, record).catch(() => {
          // best-effort — if Redis fails we already have memory fallback in setRecord
        });
      }
    } catch {
      // ignore
    }

    return originalEnd(...args);
  };

  next();
}
