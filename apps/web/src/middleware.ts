import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, isValidLocale } from '@/i18n/config';

const LOCALE_COOKIE = 'NEXT_LOCALE';

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && isValidLocale(cookie)) return cookie;
  return defaultLocale;
}

/**
 * Next.js Middleware — runs on every request at the edge.
 *
 * Responsibilities:
 * 1. Locale detection + redirect
 * 2. Auth cookie validation + role-based redirects
 * 3. Tenant resolution (path-based now, subdomain later)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Skip API routes — they are proxied via next.config rewrites ──
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // ── 0. Locale handling ────────────────────────────────────
  const maybeLocale = pathname.split('/')[1];
  if (maybeLocale && isValidLocale(maybeLocale)) {
    const res = NextResponse.next();
    if (maybeLocale !== request.cookies.get(LOCALE_COOKIE)?.value) {
      res.cookies.set(LOCALE_COOKIE, maybeLocale, { path: '/', maxAge: 365 * 86400, sameSite: 'lax' });
    }
    // Strip locale for auth checks below
    const bare = pathname.slice(`/${maybeLocale}`.length) || '/';
    return applyAuthRules(request, bare, maybeLocale, res);
  }

  // No locale prefix — redirect
  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

function applyAuthRules(request: NextRequest, barePath: string, locale: string, res: NextResponse) {
  const token = request.cookies.get('ray_session')?.value;
  const role = request.cookies.get('ray_role')?.value;
  const roleUpper = String(role || '').toUpperCase();
  const portalSession = request.cookies.get('portal_session')?.value;
  const p = barePath;
  const l = `/${locale}`;

  // Logged-in merchant visiting /business landing → redirect to dashboard
  if ((p === '/business' || p === '/business/') && token && (roleUpper === 'MERCHANT' || roleUpper === 'ADMIN')) {
    return NextResponse.redirect(new URL(`${l}/business/dashboard`, request.url));
  }
  // Not-logged-in visiting /business/dashboard → redirect to landing
  if (p.startsWith('/business/dashboard') && (!token || (roleUpper !== 'MERCHANT' && roleUpper !== 'ADMIN'))) {
    return NextResponse.redirect(new URL(`${l}/business`, request.url));
  }
  if (p.startsWith('/admin/dashboard') && (!token || roleUpper !== 'ADMIN')) {
    return NextResponse.redirect(new URL(`${l}/admin/gate`, request.url));
  }
  if (p.startsWith('/courier/orders') && (!token || (roleUpper !== 'COURIER' && roleUpper !== 'ADMIN'))) {
    return NextResponse.redirect(new URL(`${l}/courier`, request.url));
  }
  if (
    p.startsWith('/portal') &&
    !p.startsWith('/portal/login') &&
    !p.startsWith('/portal/signup') &&
    !portalSession
  ) {
    return NextResponse.redirect(new URL(`${l}/portal/login`, request.url));
  }

  // Legacy redirects
  if (p === '/shops' || p === '/restaurants') return NextResponse.redirect(new URL(`${l}/`, request.url));
  if (p === '/delivery') return NextResponse.redirect(new URL(`${l}/courier`, request.url));
  if (['/dalil-almahalat','/dalil-almat3am','/dalil-alanshta','/menmakank','/mnmknk'].includes(p)) {
    return NextResponse.redirect(new URL(`${l}/dalil`, request.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|mp4|webm|woff2?)$).*)',
  ],
};
