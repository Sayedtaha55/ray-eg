import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

const CSRF_COOKIE_NAME = 'ray_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const CSRF_EXEMPT_PREFIXES = [
  '/v1/auth/login',
  '/v1/auth/signup',
  '/v1/auth/courier-signup',
  '/v1/auth/password/forgot',
  '/v1/auth/password/reset',
  '/v1/auth/bootstrap-admin',
  '/v1/auth/google',
  '/v1/auth/dev-merchant-login',
  '/v1/auth/dev-courier-login',
  '/v1/auth/dev-portal-login',
];

function isCsrfExempt(path: string) {
  const p = String(path || '');
  return CSRF_EXEMPT_PREFIXES.some((prefix) => p.startsWith(prefix));
}

export function setCsrfCookie(res: Response) {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: String(process.env.NODE_ENV || '').toLowerCase() === 'production' ? 'strict' : 'lax',
    secure: String(process.env.NODE_ENV || '').toLowerCase() === 'production',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
}

function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

function extractCookie(req: Request, name: string): string | null {
  const header = String(req.headers?.cookie || '');
  if (!header) return null;
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const k = trimmed.slice(0, eq).trim();
    if (k === name) return trimmed.slice(eq + 1).trim() || null;
  }
  return null;
}

export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
  const csrfDisabled = String(process.env.CSRF_DISABLED || '').toLowerCase() === 'true';
  if (csrfDisabled) {
    const cookieToken = extractCookie(req, CSRF_COOKIE_NAME);
    const token = cookieToken || setCsrfCookie(res);
    res.setHeader('X-CSRF-Token', token);
    return next();
  }

  if (isDev) {
    const cookieToken = extractCookie(req, CSRF_COOKIE_NAME);
    const token = cookieToken || setCsrfCookie(res);
    res.setHeader('X-CSRF-Token', token);
    return next();
  }

  if (isCsrfExempt(req.path)) {
    const cookieToken = extractCookie(req, CSRF_COOKIE_NAME);
    const token = cookieToken || setCsrfCookie(res);
    res.setHeader('X-CSRF-Token', token);
    return next();
  }

  const cookieToken = extractCookie(req, CSRF_COOKIE_NAME);
  const headerToken = String(req.headers[CSRF_HEADER_NAME] || '').trim();

  // Electron/dev clients may run on 127.0.0.1 while the API runs on localhost.
  // SameSite rules can block the host-only cookie, so the issued header token is the
  // fallback when no CSRF cookie arrives. If a cookie exists, still require equality.
  const invalidToken = !headerToken || (Boolean(cookieToken) && cookieToken !== headerToken);
  if (invalidToken) {
    return res.status(403).json({
      success: false,
      code: 'CSRF_TOKEN_INVALID',
      message: 'رمز الحماية غير صالح',
    });
  }

  const nextToken = setCsrfCookie(res);
  res.setHeader('X-CSRF-Token', nextToken);
  next();
}
