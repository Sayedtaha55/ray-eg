import { Request, Response, NextFunction } from 'express';

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

interface IdempotencyRecord {
  status: number;
  body: any;
  headers: Record<string, string>;
  createdAt: number;
}

const store = new Map<string, IdempotencyRecord>();

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now - record.createdAt > IDEMPOTENCY_TTL_MS) {
      store.delete(key);
    }
  }
}, 60 * 60 * 1000);

export function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  const method = String(req.method || '').toUpperCase();

  if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') {
    return next();
  }

  const key = String(req.headers['idempotency-key'] || '').trim();
  if (!key) {
    return next();
  }

  const existing = store.get(key);
  if (existing) {
    try {
      for (const [h, v] of Object.entries(existing.headers || {})) {
        res.setHeader(h, v);
      }
    } catch {}
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

        store.set(key, { status, body: parsed, headers, createdAt: Date.now() });
      }
    } catch {}

    return originalEnd(...args);
  };

  next();
}
