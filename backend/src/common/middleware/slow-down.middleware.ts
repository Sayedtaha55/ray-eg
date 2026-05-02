import { Request, Response, NextFunction } from 'express';

type SlowDownOptions = {
  windowMs: number;
  delayAfter: number;
  delayMs: number;
  maxDelayMs?: number;
  skip?: (req: Request) => boolean;
};

export function createSlowDown(options: SlowDownOptions) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  let lastCleanupAt = 0;

  const windowMs = Math.max(1, Math.floor(options.windowMs));
  const delayAfter = Math.max(0, Math.floor(options.delayAfter));
  const delayMs = Math.max(0, Math.floor(options.delayMs));
  const maxDelayMs = Math.max(0, Math.floor(options.maxDelayMs ?? 4000));

  function cleanup(now: number) {
    for (const [key, data] of requests.entries()) {
      if (now > data.resetTime) {
        requests.delete(key);
      }
    }
  }

  function getClientId(req: Request) {
    const forwarded = String((req.headers as any)?.['x-forwarded-for'] || '').split(',')[0].trim();
    if (forwarded) return forwarded;
    return (req as any).ip || req.socket?.remoteAddress || 'unknown';
  }

  return (req: Request, res: Response, next: NextFunction) => {
    if (String(req?.method || '').toUpperCase() === 'OPTIONS') return next();
    if (options.skip?.(req)) return next();

    const now = Date.now();
    if (now - lastCleanupAt > 60_000) {
      cleanup(now);
      lastCleanupAt = now;
    }

    const clientId = getClientId(req);
    const key = clientId;

    let data = requests.get(key);
    if (!data || now > data.resetTime) {
      data = { count: 0, resetTime: now + windowMs };
      requests.set(key, data);
    }

    data.count += 1;

    const overBy = Math.max(0, data.count - delayAfter);
    const delay = Math.min(maxDelayMs, overBy * delayMs);

    if (delay > 0) {
      setTimeout(() => next(), delay);
      return;
    }

    next();
  };
}
