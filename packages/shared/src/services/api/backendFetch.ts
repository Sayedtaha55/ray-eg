import { bootstrapSessionFromBackend } from '../authStorage';
import { getBearerToken, usesHttpOnlyCookies } from './tokenService';
import { BackendRequestError, fetchWithTimeout, toBackendUrl } from './httpClient';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface BackendFetchOpts {
  timeoutMs?: number;
  signal?: AbortSignal;
  __allowAuthRefresh?: boolean;
}

function getAuthToken() {
  if (usesHttpOnlyCookies()) return '';
  return getBearerToken();
}

function isAuthPublicEndpoint(path: string) {
  const p = String(path || '');
  return p.startsWith('/api/v1/auth/login') || p.startsWith('/api/v1/auth/signup') || p.startsWith('/api/v1/auth/courier-signup');
}

function clearStoredAuth(reason: string) {
  try {
    localStorage.removeItem('ray_token');
    localStorage.removeItem('ray_user');
    localStorage.setItem('ray_auth_sync', JSON.stringify({ type: 'clear', reason, ts: Date.now() }));
  } catch {}
  if (typeof window !== 'undefined') {
    try { window.dispatchEvent(new CustomEvent('auth-change', { detail: { reason, ts: Date.now() } })); } catch {}
  }
}

function buildLoginRedirectUrl() {
  if (typeof window === 'undefined') return '/login';
  const routerMode = String(((import.meta as any)?.env?.VITE_ROUTER_MODE as string) || '').trim().toLowerCase();
  const returnTo = `${window.location.pathname || '/'}${window.location.search || ''}${window.location.hash || ''}`;
  const qs = new URLSearchParams();
  if (returnTo && returnTo !== '/' && returnTo !== '/#/' && returnTo !== '/login' && returnTo !== '/#/login') qs.set('returnTo', returnTo);
  const loginPath = `/login${qs.toString() ? `?${qs.toString()}` : ''}`;
  if (routerMode === 'browser') return loginPath;
  const basePath = `${window.location.origin}${window.location.pathname}`.replace(/\/$/, '');
  return `${basePath}/#${loginPath}`;
}

function handleUnauthorized(path: string, token: string) {
  if (!token || isAuthPublicEndpoint(path)) return false;
  clearStoredAuth('unauthorized');
  if (typeof window !== 'undefined') window.location.href = buildLoginRedirectUrl();
  return true;
}

async function shouldAttemptSessionRefresh(path: string) {
  if (isAuthPublicEndpoint(path)) return false;
  if (String(path || '').startsWith('/api/v1/auth/session')) return false;
  if (typeof window === 'undefined') return false;
  return true;
}

async function tryRefreshSessionOnce(reason: string) {
  try { await bootstrapSessionFromBackend({ force: true }); return true; } catch { return false; }
  finally { try { window.dispatchEvent(new CustomEvent('auth-change', { detail: { reason, ts: Date.now() } })); } catch {} }
}

function extractErrorMessage(data: any, fallback: string) {
  const msg = (data as any)?.message;
  if (typeof msg === 'string' && msg.trim()) return msg;
  if (Array.isArray(msg) && msg.length) { const parts = msg.map((x) => String(x)).filter(Boolean); if (parts.length) return parts.join(' | '); }
  const err = (data as any)?.error;
  if (typeof err === 'string' && err.trim()) return err;
  if (data && typeof data === 'object') { try { return JSON.stringify(data); } catch { return String(data); } }
  return fallback;
}

function isAbortError(err: any) {
  const name = String(err?.name || '');
  if (name === 'AbortError') return true;
  const msg = String(err?.message || '').toLowerCase();
  return msg.includes('abort');
}

const CSRF_COOKIE_NAME = 'ray_csrf';

function hasCsrfCookie(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    // Safe: only checking for presence of CSRF cookie; authentication token is stored in HttpOnly cookie
    const cookies = document.cookie.split(';').map((c) => c.trim().split('=')[0]);
    return cookies.includes(CSRF_COOKIE_NAME);
  } catch {
    return false;
  }
}

let csrfHeaderToken = '';

function getCsrfToken(): string {
  if (csrfHeaderToken) return csrfHeaderToken;
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)ray_csrf=([^;]+)/);
  return match ? match[1] : '';
}

async function primeCsrfCookie(force = false): Promise<void> {
  if (typeof document === 'undefined') return;
  if (!force && (hasCsrfCookie() || csrfHeaderToken)) return;
  try {
    const token = getAuthToken();
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetchWithTimeout(
      toBackendUrl('/api/v1/auth/session'),
      { method: 'GET', credentials: 'include', headers: authHeaders },
      6000,
    );
    const responseToken = response.headers.get('X-CSRF-Token');
    if (responseToken) csrfHeaderToken = responseToken;
  } catch {
    // Ignore failures; the next request will surface auth/CSRF errors if any.
  }
}

function shouldRetryMutationStatus(status: number) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

function getMutationRetryDelayMs(attempt: number) {
  return Math.min(2500, 400 * Math.pow(2, Math.max(0, attempt - 1)));
}

function sleep(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }

const backendAvailability = { downUntil: 0, failures: 0 };
const disabledBackendPathPrefixes = new Set<string>();

function isBackendTemporarilyDown() { return Date.now() < backendAvailability.downUntil; }

function markBackendFailure(path?: string) {
  backendAvailability.failures += 1;
  const backoffMs = Math.min(60_000, 1500 * Math.pow(2, Math.max(0, backendAvailability.failures - 1)));
  backendAvailability.downUntil = Date.now() + backoffMs;
  if (typeof window !== 'undefined') { try { window.dispatchEvent(new CustomEvent('ray-backend-status', { detail: { status: 'down', downUntil: backendAvailability.downUntil, failures: backendAvailability.failures, lastPath: path } })); } catch {} }
}

function markBackendSuccess(path?: string) {
  backendAvailability.failures = 0; backendAvailability.downUntil = 0;
  if (typeof window !== 'undefined') { try { window.dispatchEvent(new CustomEvent('ray-backend-status', { detail: { status: 'up', downUntil: 0, failures: 0, lastPath: path } })); } catch {} }
}

function isPathPrefixDisabled(path: string) {
  for (const prefix of disabledBackendPathPrefixes) { if (path.startsWith(prefix)) return true; }
  return false;
}

export function disablePathPrefix(prefix: string) { disabledBackendPathPrefixes.add(prefix); }

if (typeof window !== 'undefined') {
  try {
    const w = window as any;
    if (!w.__ray_backend_retry_listener_added) {
      w.__ray_backend_retry_listener_added = true;
      window.addEventListener('ray-backend-retry', () => {
        backendAvailability.failures = 0; backendAvailability.downUntil = 0;
        markBackendSuccess();
      });
    }
  } catch {}
}

export async function backendFetch<T>(
  method: HttpMethod,
  path: string,
  body?: any,
  opts?: BackendFetchOpts,
): Promise<T> {
  const token = getAuthToken();
  // Include cookies so session and CSRF values reach the backend origin.
  const fetchCredentials: RequestCredentials = 'include';
  const allowRefresh = Boolean(opts?.__allowAuthRefresh ?? true);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const hasBody = method !== 'GET' && method !== 'DELETE';
  const maxAttempts = method === 'GET' || method === 'DELETE' ? 1 : 3;
  let lastTransientError: any = null;

  if (isBackendTemporarilyDown()) throw new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
  if (isPathPrefixDisabled(path)) throw new BackendRequestError('Endpoint غير متاح', { status: 404, path });

  // Determine if the request mutates data. Using an array includes check avoids TypeScript's narrowing issues where comparisons like
  // `method !== 'HEAD'` become impossible after earlier checks (e.g., method is already narrowed to 'POST' | 'PUT' | 'PATCH').
  const isMutation = !['GET', 'DELETE', 'HEAD', 'OPTIONS'].includes(method as string);
  if (isMutation) {
    await primeCsrfCookie();
  }

  const headers: Record<string, string> = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    // Re-read CSRF token on each attempt (in case priming just set the cookie)
    const csrfToken = getCsrfToken();
    if (isMutation && csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    } else if (headers['x-csrf-token'] && !isMutation) {
      delete headers['x-csrf-token'];
    }

    let res: Response;
    try {
      res = await fetchWithTimeout(
        toBackendUrl(path),
        { method, credentials: fetchCredentials, ...(opts?.signal ? { signal: opts.signal } : {}), headers,
          ...(hasBody ? { body: isFormData ? body : JSON.stringify(body) } : {}) },
        opts?.timeoutMs,
      );
    } catch (err) {
      lastTransientError = isAbortError(err)
        ? new BackendRequestError('انتهت مهلة الاتصال بالسيرفر. جاري إعادة المحاولة...', { path })
        : new BackendRequestError('تعذر إتمام العملية الآن. جاري إعادة المحاولة...', { path });
      if (attempt < maxAttempts) { await sleep(getMutationRetryDelayMs(attempt)); continue; }
      markBackendFailure(path);
      throw isAbortError(err)
        ? new BackendRequestError('انتهت مهلة الاتصال بالسيرفر. حاول مرة أخرى.', { path })
        : new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
    }

    if (!res.ok) {
      let message = `Request failed (${res.status})`; let data: any = undefined;
      try {
        const raw = await res.text();
        try {
          data = raw ? JSON.parse(raw) : undefined;
          message = extractErrorMessage(data, message);
        } catch {
          if (raw.trim()) message = raw.trim().slice(0, 500);
        }
      } catch {}

      if (res.status === 404 && String(path || '').startsWith('/api/v1/favorites')) disablePathPrefix('/api/v1/favorites');
      try { console.error('Backend error', { path, status: res.status, data, message }); } catch {}

      // Recover once from a stale/mismatched CSRF cookie, then retry with a fresh token.
      if (res.status === 403 && data?.code === 'CSRF_TOKEN_INVALID' && attempt < 2) {
        await primeCsrfCookie(true);
        continue;
      }

      if (res.status === 401) {
        if (allowRefresh && (await shouldAttemptSessionRefresh(path))) {
          const ok = await tryRefreshSessionOnce(`401-refresh-${method.toLowerCase()}`);
          if (ok) return await backendFetch<T>(method, path, body, { ...(opts || {}), __allowAuthRefresh: false });
        }
        if (handleUnauthorized(path, token)) throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }

      if (attempt < maxAttempts && shouldRetryMutationStatus(res.status)) {
        lastTransientError = new BackendRequestError(message, { status: res.status, path, data });
        await sleep(getMutationRetryDelayMs(attempt));
        continue;
      }
      throw new BackendRequestError(message, { status: res.status, path, data });
    }

    const responseToken = res.headers.get('X-CSRF-Token');
    if (responseToken) csrfHeaderToken = responseToken;
    markBackendSuccess(path);
    return res.json() as Promise<T>;
  }

  markBackendFailure(path);
  throw lastTransientError || new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
}
