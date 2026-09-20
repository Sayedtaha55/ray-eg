const RAW_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://api2.mnmknk.com' : 'http://localhost:4000');

const DEFAULT_API_TIMEOUT_MS = 15_000;
const API_TIMEOUT_MS = parsePositiveInteger(
  process.env.NEXT_PUBLIC_API_TIMEOUT_MS,
  DEFAULT_API_TIMEOUT_MS
);

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function mergeSignals(timeoutSignal: AbortSignal, requestSignal?: AbortSignal): AbortSignal {
  if (!requestSignal) return timeoutSignal;

  const controller = new AbortController();
  const abort = () => controller.abort();

  if (timeoutSignal.aborted || requestSignal.aborted) {
    controller.abort();
    return controller.signal;
  }

  timeoutSignal.addEventListener('abort', abort, { once: true });
  requestSignal.addEventListener('abort', abort, { once: true });

  return controller.signal;
}

// Identifies the calling app so the backend scopes auth cookies per product
// (ray_session-market / ray_session-dashboard) — a dashboard login and a
// marketplace login then coexist instead of overwriting each other.
const APP_SCOPE = 'market';

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const headers = new Headers(init.headers);
  if (!headers.has('X-App-Scope')) {
    headers.set('X-App-Scope', APP_SCOPE);
  }

  try {
    return await fetch(input, {
      ...init,
      headers,
      signal: mergeSignals(controller.signal, init.signal ?? undefined),
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`API request timed out after ${API_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// Strip invisible characters (BOM, zero-width, RTL/LTR marks) that sneak in
// via copy-paste from rich-text sources and break fetch silently.
const BACKEND_URL = RAW_BACKEND_URL.replace(
  /[\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g,
  ''
).replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function apiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.startsWith('/api') ? normalized : `/api/v1${normalized}`;
}

function extractErrorMessage(
  body: unknown,
  fallback: string
): { message: string; code?: string; details?: unknown } {
  if (!body || typeof body !== 'object') return { message: fallback };

  const record = body as Record<string, unknown>;
  const data =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : undefined;
  const message =
    (typeof record.message === 'string' && record.message) ||
    (typeof record.error === 'string' && record.error) ||
    (typeof data?.error === 'string' && data.error) ||
    fallback;
  const code =
    (typeof record.code === 'string' && record.code) ||
    (typeof data?.code === 'string' && data.code) ||
    undefined;

  return { message, code, details: record.details ?? data?.details };
}

export function backendApiUrl(path: string): string {
  return `${BACKEND_URL}${apiPath(path)}`;
}

export function backendOrigin(): string {
  return new URL(BACKEND_URL).origin;
}

// مفاتيح جلسة الماركت — مفصولة عن اللوحة (ray_dashboard_token) حتى لا يتطرش
// كل تطبيق الجلسة بتاعة التاني. المفاتيح القديمة المشتركة تُقرأ مرة واحدة
// للترحيل ثم تُمسح عند أول كتابة.
const TOKEN_KEY = 'ray_market_token';
const LEGACY_TOKEN_KEYS = ['ray_token', 'token'] as const;

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const scoped = localStorage.getItem(TOKEN_KEY);
  if (scoped) return scoped;
  for (const key of LEGACY_TOKEN_KEYS) {
    const legacy = localStorage.getItem(key);
    if (legacy) {
      localStorage.setItem(TOKEN_KEY, legacy);
      return legacy;
    }
  }
  return null;
}

export function storeAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  for (const key of LEGACY_TOKEN_KEYS) localStorage.removeItem(key);
}

export function clearStoredAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  for (const key of LEGACY_TOKEN_KEYS) localStorage.removeItem(key);
}

// ── Silent access-token refresh ──────────────────────────────────────────────
// The access token is short-lived; the session lives in the ray_session
// cookie. When a call comes back 401 we refresh once (single-flight so
// concurrent failures share one request) and retry with the new token.

let refreshInFlight: Promise<string | null> | null = null;
let lastRefreshAt = 0;
/** Paths that must never trigger a refresh retry (they manage auth themselves). */
const AUTH_PATHS = ['/auth/refresh', '/auth/login', '/auth/signup', '/auth/logout'];

export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (refreshInFlight) return refreshInFlight;
  // A refresh that succeeded less than 10s ago means the stored token is fresh.
  if (Date.now() - lastRefreshAt < 10_000) return getStoredAuthToken();

  refreshInFlight = (async () => {
    try {
      const res = await fetchWithTimeout(apiPath('/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) return null;
      const body = await res.json().catch(() => null);
      const accessToken =
        body?.data?.token?.accessToken ||
        body?.data?.accessToken ||
        body?.token?.accessToken ||
        null;
      if (!accessToken) return null;
      storeAuthToken(accessToken);
      lastRefreshAt = Date.now();
      return accessToken as string;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

/** True when the request failed with a dead access token we can try to renew. */
function isRefreshableAuthFailure(status: number, path: string, hadToken: boolean): boolean {
  return hadToken && status === 401 && !AUTH_PATHS.some((p) => path.includes(p));
}

async function tryRefresh(): Promise<string | null> {
  const token = await refreshAccessToken();
  if (!token) {
    // Session is gone (cookie expired/logged out elsewhere) — stop sending the dead token.
    clearStoredAuthToken();
  }
  return token;
}

export async function jsonRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const send = async (): Promise<{ res: Response; hadToken: boolean }> => {
    const token = getStoredAuthToken();
    const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
    const headers = new Headers(init.headers);
    if (!isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const res = await fetchWithTimeout(apiPath(path), {
      ...init,
      headers,
      credentials: init.credentials ?? 'include',
    });
    return { res, hadToken: !!token };
  };

  let { res, hadToken } = await send();

  // Access token expired mid-session — renew it from the session cookie once.
  if (res.status === 401 && isRefreshableAuthFailure(res.status, path, hadToken)) {
    const fresh = await tryRefresh();
    if (fresh) {
      ({ res, hadToken } = await send());
    }
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const fallback = `API Error: ${res.status} ${res.statusText}`;
    const error = extractErrorMessage(data, fallback);
    throw new ApiError(error.message, res.status, error.code, error.details);
  }
  return data?.data !== undefined ? data.data : data;
}

export interface ApiOptions {
  revalidate?: number;
  tags?: string[];
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// Client-side GET cache + in-flight dedup. `next.revalidate` only applies to
// server-side fetches, so in the browser every navigation re-fired every
// request. A short TTL collapses repeat GETs; any non-GET clears the cache.
const CLIENT_GET_TTL_MS = 30_000;
const clientGetCache = new Map<string, { at: number; data: unknown }>();
const inflightGets = new Map<string, Promise<unknown>>();

async function apiFetch<T>(
  path: string,
  options?: ApiOptions & { method?: string; body?: unknown }
): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();

  if (typeof window !== 'undefined') {
    if (method !== 'GET') {
      clientGetCache.clear();
    } else if (options?.revalidate !== 0) {
      const hit = clientGetCache.get(path);
      if (hit && Date.now() - hit.at < CLIENT_GET_TTL_MS) {
        return hit.data as T;
      }
      const pending = inflightGets.get(path);
      if (pending) {
        return pending as Promise<T>;
      }
      const exec = apiFetchUncached<T>(path, options)
        .then((data) => {
          clientGetCache.set(path, { at: Date.now(), data });
          return data;
        })
        .finally(() => {
          inflightGets.delete(path);
        });
      inflightGets.set(path, exec);
      return exec;
    }
  }

  return apiFetchUncached<T>(path, options);
}

async function apiFetchUncached<T>(
  path: string,
  options?: ApiOptions & { method?: string; body?: unknown }
): Promise<T> {
  const send = async (): Promise<{ res: Response; hadToken: boolean }> => {
    const url = typeof window === 'undefined' ? backendApiUrl(path) : apiPath(path);

    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = getStoredAuthToken();
    }

    const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;
    const headers = new Headers(options?.headers);
    if (!isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetchWithTimeout(url, {
      method: options?.method || 'GET',
      headers,
      body: options?.body
        ? isFormData
          ? (options.body as BodyInit)
          : JSON.stringify(options.body)
        : undefined,
      next: {
        revalidate: options?.revalidate ?? 3600,
        tags: options?.tags,
      },
      cache: options?.revalidate === 0 ? 'no-store' : undefined,
      signal: options?.signal,
    });
    return { res, hadToken: !!token };
  };

  let { res, hadToken } = await send();

  // Client-side 401 with a stored token — renew from the session cookie once.
  if (
    typeof window !== 'undefined' &&
    res.status === 401 &&
    isRefreshableAuthFailure(res.status, path, hadToken)
  ) {
    const fresh = await tryRefresh();
    if (fresh) {
      ({ res, hadToken } = await send());
    }
  }

  if (!res.ok) {
    // Handle 401 gracefully - don't throw for unauthorized on public endpoints
    if (res.status === 401) {
      const errorBody = await res.json().catch(() => null);
      const error = extractErrorMessage(errorBody, 'Unauthorized');
      throw new ApiError(error.message, 401, error.code || 'unauthorized', error.details);
    }
    const message = `API Error: ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      const error = extractErrorMessage(body, message);
      throw new ApiError(error.message, res.status, error.code, error.details);
    } catch (error) {
      if (error instanceof ApiError) throw error;
    }
    throw new ApiError(message, res.status);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string, options?: ApiOptions) => apiFetch<T>(path, options),
  post: <T>(path: string, body: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};

export { BACKEND_URL, API_TIMEOUT_MS };
