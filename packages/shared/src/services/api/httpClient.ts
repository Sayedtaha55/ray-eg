import { bootstrapSessionFromBackend } from '../authStorage';
import { backendFetch } from './backendFetch';

function normalizeBaseUrl(input: string) {
  return String(input || '').trim().replace(/\/+$/, '');
}

function clearStoredAuth(reason: string) {
  try {
    localStorage.removeItem('ray_token');
    localStorage.removeItem('ray_user');
    localStorage.setItem('ray_auth_sync', JSON.stringify({ type: 'clear', reason, ts: Date.now() }));
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('auth-change', { detail: { reason, ts: Date.now() } }));
    } catch {
    }
  }
}

function isLocalHostname(hostname: string) {
  const h = String(hostname || '').toLowerCase().trim();
  return h === '' || h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0';
}

function resolveBackendBaseUrl() {
  const envBackend = ((import.meta as any)?.env?.VITE_BACKEND_URL as string) || '';
  const envApi = ((import.meta as any)?.env?.VITE_API_URL as string) || '';
  const electronBackend = typeof window !== 'undefined' ? String((window as any)?.electronApp?.backendUrl || '') : '';
  const configured = normalizeBaseUrl(electronBackend || envBackend || envApi);
  if (configured) return configured;

  const hostname = typeof window !== 'undefined' ? String(window.location.hostname || '') : 'localhost';
  const fallbackHost = isLocalHostname(hostname) ? 'localhost' : (hostname || 'localhost');
  const fallback = `http://${fallbackHost}:4000`;

  const prodDefault = 'https://api.mnmknk.com';

  // Prevent silent misconfiguration in production builds.
  // If this triggers on prod, you MUST set VITE_BACKEND_URL in your hosting environment.
  const isProdBuild = Boolean((import.meta as any)?.env?.PROD);
  if (isProdBuild && !isLocalHostname(hostname)) {
    // eslint-disable-next-line no-console
    console.error(
      '[Config] Missing VITE_BACKEND_URL (or VITE_API_URL). Frontend is falling back to:',
      fallback,
      '— this will likely break production. Set VITE_BACKEND_URL=https://api.mnmknk.com',
    );

    return normalizeBaseUrl(prodDefault);
  }

  return normalizeBaseUrl(fallback);
}

const BACKEND_BASE_URL = resolveBackendBaseUrl();

export class BackendRequestError extends Error {
  status?: number;
  path?: string;
  data?: any;

  constructor(message: string, opts?: { status?: number; path?: string; data?: any }) {
    super(message);
    this.name = 'BackendRequestError';
    this.status = opts?.status;
    this.path = opts?.path;
    this.data = opts?.data;
  }
}

function stringifySafe(value: any) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function extractErrorMessage(data: any, fallback: string) {
  const msg = (data as any)?.message;
  if (typeof msg === 'string' && msg.trim()) return msg;
  if (Array.isArray(msg) && msg.length) {
    const parts = msg.map((x) => String(x)).filter(Boolean);
    if (parts.length) return parts.join(' | ');
  }
  const err = (data as any)?.error;
  if (typeof err === 'string' && err.trim()) return err;
  if (data && typeof data === 'object') return stringifySafe(data);
  return fallback;
}

function resolveApiTimeoutMs() {
  const raw = (import.meta as any)?.env?.VITE_API_TIMEOUT_MS;
  const parsed = Number(raw);
  const base = Number.isFinite(parsed) && parsed > 0 ? parsed : 15000;
  return Math.max(3000, Math.min(60000, Math.floor(base)));
}

function isAbortError(err: any) {
  const name = String(err?.name || '');
  if (name === 'AbortError') return true;
  const msg = String(err?.message || '').toLowerCase();
  return msg.includes('abort');
}

function normalizeTimeoutMs(timeoutMs?: number) {
  if (typeof timeoutMs === 'number' && Number.isFinite(timeoutMs) && timeoutMs > 0) {
    return Math.max(3000, Math.min(10 * 60 * 1000, Math.floor(timeoutMs)));
  }
  return resolveApiTimeoutMs();
}

export async function fetchWithTimeout(url: string, init: RequestInit & { signal?: AbortSignal }, timeoutMs?: number) {
  const ms = normalizeTimeoutMs(timeoutMs);
  const hasAbort = typeof AbortController !== 'undefined';
  if (!hasAbort || ms <= 0) return fetch(url, init);

  const controller = new AbortController();
  const parentSignal = init?.signal;
  if (parentSignal) {
    if (parentSignal.aborted) {
      controller.abort();
    } else {
      parentSignal.addEventListener('abort', () => controller.abort(), { once: true } as any);
    }
  }

  const timer = setTimeout(() => {
    try {
      controller.abort();
    } catch {
    }
  }, ms);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const backendAvailability = {
  downUntil: 0,
  failures: 0,
};

const disabledBackendPathPrefixes = new Set<string>();

function isBackendTemporarilyDown() {
  return Date.now() < backendAvailability.downUntil;
}

function emitBackendStatus(detail: { status: 'up' | 'down'; downUntil: number; failures: number; lastPath?: string }) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('ray-backend-status', { detail }));
  } catch {
  }
}

function markBackendFailure(path?: string) {
  backendAvailability.failures += 1;
  const backoffMs = Math.min(60_000, 1500 * Math.pow(2, Math.max(0, backendAvailability.failures - 1)));
  backendAvailability.downUntil = Date.now() + backoffMs;
  emitBackendStatus({
    status: 'down',
    downUntil: backendAvailability.downUntil,
    failures: backendAvailability.failures,
    lastPath: path,
  });
}

function markBackendSuccess(path?: string) {
  backendAvailability.failures = 0;
  backendAvailability.downUntil = 0;
  emitBackendStatus({ status: 'up', downUntil: 0, failures: 0, lastPath: path });
}

if (typeof window !== 'undefined') {
  try {
    const w = window as any;
    if (!w.__ray_backend_retry_listener_added) {
      w.__ray_backend_retry_listener_added = true;
      window.addEventListener('ray-backend-retry', () => {
        backendAvailability.failures = 0;
        backendAvailability.downUntil = 0;
        emitBackendStatus({ status: 'up', downUntil: 0, failures: 0 });
      });
    }
  } catch {
  }
}

function shouldRetryMutationStatus(status: number) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

function getMutationRetryDelayMs(attempt: number) {
  return Math.min(2500, 400 * Math.pow(2, Math.max(0, attempt - 1)));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPathPrefixDisabled(path: string) {
  for (const prefix of disabledBackendPathPrefixes) {
    if (path.startsWith(prefix)) return true;
  }
  return false;
}

export function disablePathPrefix(prefix: string) {
  disabledBackendPathPrefixes.add(prefix);
}

export function toBackendUrl(url: string) {
  if (!url) return url;
  return url.startsWith('/') ? `${BACKEND_BASE_URL}${url}` : url;
}

import { getBearerToken, usesHttpOnlyCookies, getFetchCredentials } from './tokenService';

function getAuthToken() {
  if (usesHttpOnlyCookies()) {
    // httpOnly cookie handles auth — don't send Bearer header
    return '';
  }
  return getBearerToken();
}

function isAuthPublicEndpoint(path: string) {
  const p = String(path || '');
  return (
    p.startsWith('/api/v1/auth/login') ||
    p.startsWith('/api/v1/auth/signup') ||
    p.startsWith('/api/v1/auth/courier-signup')
  );
}

function buildLoginRedirectUrl() {
  if (typeof window === 'undefined') return '/login';

  const routerMode = String(((import.meta as any)?.env?.VITE_ROUTER_MODE as string) || '').trim().toLowerCase();
  const returnTo = `${window.location.pathname || '/'}${window.location.search || ''}${window.location.hash || ''}`;
  const qs = new URLSearchParams();

  if (returnTo && returnTo !== '/' && returnTo !== '/#/' && returnTo !== '/login' && returnTo !== '/#/login') {
    qs.set('returnTo', returnTo);
  }

  const loginPath = `/login${qs.toString() ? `?${qs.toString()}` : ''}`;
  if (routerMode === 'browser') return loginPath;

  const basePath = `${window.location.origin}${window.location.pathname}`.replace(/\/$/, '');
  return `${basePath}/#${loginPath}`;
}

function handleUnauthorized(path: string, token: string) {
  if (!token || isAuthPublicEndpoint(path)) return false;
  clearStoredAuth('unauthorized');
  if (typeof window !== 'undefined') {
    window.location.href = buildLoginRedirectUrl();
  }
  return true;
}

async function shouldAttemptSessionRefresh(path: string) {
  if (isAuthPublicEndpoint(path)) return false;
  if (String(path || '').startsWith('/api/v1/auth/session')) return false;
  if (typeof window === 'undefined') return false;
  // If you have an HTTP-only cookie session, this refresh can recover from expired bearer tokens.
  return true;
}

async function tryRefreshSessionOnce(reason: string) {
  try {
    await bootstrapSessionFromBackend({ force: true });
    return true;
  } catch {
    return false;
  } finally {
    try {
      window.dispatchEvent(new CustomEvent('auth-change', { detail: { reason, ts: Date.now() } }));
    } catch {
    }
  }
}

export async function backendPost<T>(path: string, body: any): Promise<T> {
  return await backendPostWithOptions<T>(path, body);
}

export async function backendPostWithOptions<T>(
  path: string,
  body: any,
  opts?: { timeoutMs?: number; signal?: AbortSignal },
): Promise<T> {
  return backendFetch<T>('POST', path, body, opts);
}

export async function backendDelete<T>(path: string, opts?: { __allowAuthRefresh?: boolean }): Promise<T> {
  return backendFetch<T>('DELETE', path, undefined, opts);
}

export async function backendGet<T>(path: string, opts?: { __allowAuthRefresh?: boolean }): Promise<T> {
  return backendFetch<T>('GET', path, undefined, opts);
}

export async function backendPatch<T>(path: string, body: any, opts?: { timeoutMs?: number; signal?: AbortSignal }): Promise<T> {
  return backendFetch<T>('PATCH', path, body, opts);
}

export async function backendPut<T>(path: string, body: any, opts?: { timeoutMs?: number; signal?: AbortSignal }): Promise<T> {
  return backendFetch<T>('PUT', path, body, opts);
}
