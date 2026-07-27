import { Request, Response, NextFunction } from 'express';

const AUTH_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const AUTH_RATE_LIMIT_MAX = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10);
const AUTH_RATE_LIMIT_WINDOW_MS_OVERRIDE = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '0', 10);

const windowMs = AUTH_RATE_LIMIT_WINDOW_MS_OVERRIDE > 0 ? AUTH_RATE_LIMIT_WINDOW_MS_OVERRIDE : AUTH_RATE_LIMIT_WINDOW_MS;

const AUTH_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/signup',
  '/api/v1/auth/courier-signup',
  '/api/v1/auth/password/forgot',
  '/api/v1/auth/password/reset',
  '/api/v1/auth/bootstrap-admin',
  '/api/v1/auth/dev-merchant-login',
  '/api/v1/auth/dev-courier-login',
];

const store = new Map<string, { count: number; resetTime: number; lockedUntil: number }>();
let lastCleanup = 0;

function isAuthPath(path: string): boolean {
  return AUTH_PATHS.some((p) => path.startsWith(p));
}

function getClientId(req: Request): string {
  const ip = String(req.ip || req.socket?.remoteAddress || 'unknown');
  const email = String((req.body as any)?.email || '').toLowerCase().trim();
  return email ? `${ip}:${email}` : ip;
}

export function authRateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!isAuthPath(req.path)) return next();
  if (String(req.method || '').toUpperCase() === 'OPTIONS') return next();

  const now = Date.now();

  if (now - lastCleanup > 5 * 60 * 1000) {
    for (const [key, data] of store.entries()) {
      if (now > data.resetTime && now > data.lockedUntil) {
        store.delete(key);
      }
    }
    lastCleanup = now;
  }

  const clientId = getClientId(req);
  let entry = store.get(clientId);

  if (!entry || now > entry.resetTime) {
    entry = { count: 1, resetTime: now + windowMs, lockedUntil: 0 };
    store.set(clientId, entry);
    res.set({
      'X-AuthRateLimit-Limit': String(AUTH_RATE_LIMIT_MAX),
      'X-AuthRateLimit-Remaining': String(AUTH_RATE_LIMIT_MAX - 1),
      'X-AuthRateLimit-Reset': new Date(entry.resetTime).toISOString(),
    });
    return next();
  }

  if (now < entry.lockedUntil) {
    const retryAfter = Math.ceil((entry.lockedUntil - now) / 1000);
    res.set({
      'Retry-After': String(retryAfter),
      'X-AuthRateLimit-Limit': String(AUTH_RATE_LIMIT_MAX),
      'X-AuthRateLimit-Remaining': '0',
      'X-AuthRateLimit-Reset': new Date(entry.lockedUntil).toISOString(),
    });
    return res.status(429).json({
      success: false,
      error: 'Too many authentication attempts',
      message: `تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى بعد ${retryAfter} ثانية.`,
      retryAfter,
    });
  }

  entry.count++;

  if (entry.count > AUTH_RATE_LIMIT_MAX) {
    const lockoutMs = Math.min(15 * 60 * 1000, windowMs * Math.pow(2, Math.floor((entry.count - AUTH_RATE_LIMIT_MAX) / AUTH_RATE_LIMIT_MAX)));
    entry.lockedUntil = now + lockoutMs;
    const retryAfter = Math.ceil(lockoutMs / 1000);
    res.set({
      'Retry-After': String(retryAfter),
      'X-AuthRateLimit-Limit': String(AUTH_RATE_LIMIT_MAX),
      'X-AuthRateLimit-Remaining': '0',
      'X-AuthRateLimit-Reset': new Date(entry.lockedUntil).toISOString(),
    });
    return res.status(429).json({
      success: false,
      error: 'Too many authentication attempts',
      message: `تم تجاوز عدد المحاولات المسموح. تم قفل الحساب مؤقتًا. حاول بعد ${retryAfter} ثانية.`,
      retryAfter,
    });
  }

  res.set({
    'X-AuthRateLimit-Limit': String(AUTH_RATE_LIMIT_MAX),
    'X-AuthRateLimit-Remaining': String(Math.max(0, AUTH_RATE_LIMIT_MAX - entry.count)),
    'X-AuthRateLimit-Reset': new Date(entry.resetTime).toISOString(),
  });

  next();
}
