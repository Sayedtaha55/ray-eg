import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'ray_session';
const KYC_STATUS_COOKIE = 'ray_kyc_status';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // KYC guard: redirect non-verified merchants to onboarding
  if (
    !pathname.startsWith('/onboarding') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/admin')
  ) {
    const kycStatus = req.cookies.get(KYC_STATUS_COOKIE)?.value || '';
    const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
    if (hasSession && kycStatus && kycStatus !== 'verified') {
      const url = req.nextUrl.clone();
      url.pathname = '/onboarding/kyc';
      return NextResponse.redirect(url);
    }
  }

  // Only guard admin area (excluding the gate page itself and static/next internals)
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  if (pathname === '/admin/gate' || pathname.startsWith('/admin/gate/')) {
    return NextResponse.next();
  }

  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/gate';
    url.search = `?returnTo=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/onboarding/:path*'],
};
