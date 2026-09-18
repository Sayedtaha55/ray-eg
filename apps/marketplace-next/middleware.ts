import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - _next (Next.js internals)
     * - static files (images, favicon, etc.)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

const MAIN_DOMAINS = new Set([
  'localhost',
  '127.0.0.1',
  'localhost:3000',
  'localhost:5174',
  '127.0.0.1:3000',
  '127.0.0.1:5174',
  'ray.eg',
  'www.ray.eg',
  'mnmknk.com',
  'www.mnmknk.com',
]);

/**
 * Multi-tenant Next.js Middleware:
 * 1. Checks if request comes from a custom domain (e.g. brand.com) or platform subdomain (e.g. store.ray.eg).
 * 2. Rewrites request internally to /site/:slug or /shop/:slug without changing browser URL.
 * 3. Keeps main marketplace accessible on root domains.
 */
export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostWithPort = req.headers.get('host')?.toLowerCase() || '';
  const hostname = hostWithPort.replace(/:\d+$/, '');

  // 1. Bypass main marketplace domains
  if (MAIN_DOMAINS.has(hostWithPort) || MAIN_DOMAINS.has(hostname)) {
    return NextResponse.next();
  }

  // 2. Check for platform subdomains (e.g. "el-ezaby.ray.eg" or "el-ezaby.localhost")
  const isPlatformSubdomain =
    (hostname.endsWith('.ray.eg') && hostname !== 'ray.eg' && hostname !== 'www.ray.eg') ||
    (hostname.endsWith('.mnmknk.com') && hostname !== 'mnmknk.com' && hostname !== 'www.mnmknk.com') ||
    (hostname.endsWith('.localhost') && hostname !== 'localhost');

  let tenantSlug = '';

  if (isPlatformSubdomain) {
    tenantSlug = hostname.split('.')[0];
  } else {
    // Custom domain (e.g. "my-dental-clinic.com" or "www.my-dental-clinic.com")
    tenantSlug = hostname.replace(/^www\./, '');
  }

  // 3. Rewrite request internally to storefront route
  if (tenantSlug && !url.pathname.startsWith('/site/') && !url.pathname.startsWith('/shop/')) {
    const rewritePath = `/site/${tenantSlug}${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(new URL(rewritePath, req.url));
  }

  return NextResponse.next();
}

