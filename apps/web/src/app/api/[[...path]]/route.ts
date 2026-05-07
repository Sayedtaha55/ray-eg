import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

// Local API routes that should NOT be proxied to backend
const LOCAL_ROUTES = new Set(['/api/auth/set-cookie', '/api/auth/clear-cookie']);

/**
 * Catch-all API proxy — forwards /api/* requests to NestJS backend.
 *
 * Next.js App Router file-system routes take priority over next.config rewrites,
 * so we use this catch-all route handler to proxy all API traffic.
 *
 * Local routes (set-cookie, clear-cookie) are handled by their own route.ts files
 * and never reach this handler because they match before the catch-all.
 */
async function proxyRequest(request: Request, method: string) {
  const url = new URL(request.url);
  const apiPath = url.pathname + url.search;

  // Skip local routes (shouldn't reach here due to file-system priority, but safety check)
  if (LOCAL_ROUTES.has(url.pathname)) {
    return NextResponse.json({ error: 'Local route' }, { status: 500 });
  }

  const targetUrl = `${BACKEND_URL}${apiPath}`;

  // Build headers — forward everything except host
  const headers = new Headers(request.headers);
  headers.delete('host');
  // Ensure auth cookies reach the backend (NestJS uses cookie-based auth in dev)
  const cookie = request.headers.get('cookie');
  if (cookie) headers.set('cookie', cookie);
  headers.set('X-Forwarded-Host', request.headers.get('host') || '');
  headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));
  if (!headers.get('X-Forwarded-For')) {
    headers.set('X-Forwarded-For', request.headers.get('x-forwarded-for') || '');
  }

  // Build fetch options
  const fetchOpts: RequestInit = {
    method,
    headers,
    redirect: 'manual',
    credentials: 'include',
  };

  // Forward body for non-GET/HEAD requests
  if (method !== 'GET' && method !== 'HEAD') {
    fetchOpts.body = request.body;
    // @ts-expect-error duplex is needed for streaming bodies in Node
    fetchOpts.duplex = 'half';
  }

  try {
    const backendRes = await fetch(targetUrl, fetchOpts);

    // Build response — copy status and headers
    const resHeaders = new Headers();
    // Copy all headers except transfer-encoding (invalid in Next.js responses)
    backendRes.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower !== 'transfer-encoding') {
        resHeaders.set(key, value);
      }
    });

    const body = await backendRes.arrayBuffer();

    return new NextResponse(body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: resHeaders,
    });
  } catch (err: any) {
    console.error(`[API Proxy] Error forwarding ${method} ${apiPath}:`, err.message);
    return NextResponse.json(
      { success: false, error: { code: 'PROXY_ERROR', message: 'Backend unavailable' } },
      { status: 502 },
    );
  }
}

// Export handlers for all HTTP methods
export const GET = (req: Request) => proxyRequest(req, 'GET');
export const POST = (req: Request) => proxyRequest(req, 'POST');
export const PUT = (req: Request) => proxyRequest(req, 'PUT');
export const PATCH = (req: Request) => proxyRequest(req, 'PATCH');
export const DELETE = (req: Request) => proxyRequest(req, 'DELETE');
export const OPTIONS = (req: Request) => proxyRequest(req, 'OPTIONS');
export const HEAD = (req: Request) => proxyRequest(req, 'HEAD');
