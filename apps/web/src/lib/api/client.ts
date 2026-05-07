const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export class BackendRequestError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API Error ${status}`);
    this.name = 'BackendRequestError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Server-side fetch wrapper for NestJS backend.
 * Used in Server Components and API routes.
 */
export async function serverFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  authToken?: string,
): Promise<T> {
  const url = `${BACKEND_URL}${path}`;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    // Default: cache for 60s (ISR). Pages can override via options.next.revalidate or options.cache
    next: options.next || { revalidate: 60 },
    ...(options.cache ? { cache: options.cache } : {}),
  });

  if (!res.ok) {
    throw new BackendRequestError(res.status, await res.text());
  }

  return res.json() as Promise<T>;
}

/**
 * Client-side fetch wrapper for NestJS backend.
 * Used in Client Components (SWR fetcher, mutations).
 */
export async function clientFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `/api${path}`;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    throw new BackendRequestError(res.status, await res.text());
  }

  return res.json() as Promise<T>;
}
