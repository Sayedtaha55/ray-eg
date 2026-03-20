import { randomUUID } from 'crypto';

export type RequestIdRequest = {
  headers?: Record<string, any>;
  requestId?: string;
  user?: any;
  method?: string;
  originalUrl?: string;
  url?: string;
  ip?: string;
};

export type RequestIdResponse = {
  setHeader?: (name: string, value: string) => void;
};

export function requestIdMiddleware(req: RequestIdRequest, res: RequestIdResponse, next: () => void) {
  const existing = (() => {
    const raw = (req as any)?.headers?.['x-request-id'] ?? (req as any)?.headers?.['X-Request-Id'];
    if (typeof raw !== 'string') return '';
    const v = raw.trim();
    return v && v.length <= 128 ? v : '';
  })();

  const id = existing || (() => {
    try {
      return typeof randomUUID === 'function' ? randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    } catch {
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
  })();

  (req as any).requestId = id;

  try {
    res?.setHeader?.('X-Request-Id', id);
  } catch {
    // ignore
  }

  return next();
}
