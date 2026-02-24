function normalizeBaseUrl(input: string) {
  return String(input || '').trim().replace(/\/+$/, '');
}

function isLocalHostname(hostname: string) {
  const h = String(hostname || '').toLowerCase().trim();
  return h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0';
}

function resolveBackendBaseUrl() {
  const envBackend = ((import.meta as any)?.env?.VITE_BACKEND_URL as string) || '';
  const envApi = ((import.meta as any)?.env?.VITE_API_URL as string) || '';
  const configured = normalizeBaseUrl(envBackend || envApi);
  if (configured) return configured;

  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const fallbackHost = hostname === 'localhost' ? '127.0.0.1' : hostname;
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

function getAuthToken() {
  try {
    return localStorage.getItem('ray_token') || '';
  } catch {
    return '';
  }
}

function isAuthPublicEndpoint(path: string) {
  const p = String(path || '');
  return (
    p.startsWith('/api/v1/auth/login') ||
    p.startsWith('/api/v1/auth/signup') ||
    p.startsWith('/api/v1/auth/courier-signup')
  );
}

function handleUnauthorized(path: string, token: string) {
  if (!token || isAuthPublicEndpoint(path)) return false;
  try {
    localStorage.removeItem('ray_token');
    localStorage.removeItem('ray_user');
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  return true;
}

export async function backendPost<T>(path: string, body: any): Promise<T> {
  return await backendPostWithOptions<T>(path, body);
}

export async function backendPostWithOptions<T>(
  path: string,
  body: any,
  opts?: { timeoutMs?: number; signal?: AbortSignal },
): Promise<T> {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let res: Response;
  if (isBackendTemporarilyDown()) {
    throw new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
  }
  if (isPathPrefixDisabled(path)) {
    throw new BackendRequestError('Endpoint غير متاح', { status: 404, path });
  }
  try {
    res = await fetchWithTimeout(`${BACKEND_BASE_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      ...(opts?.signal ? { signal: opts.signal } : {}),
      headers: {
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: isFormData ? body : JSON.stringify(body),
    }, opts?.timeoutMs);
  } catch (err) {
    if (isAbortError(err)) {
      throw new BackendRequestError('انتهت مهلة الاتصال بالسيرفر. حاول مرة أخرى.', { path });
    }
    markBackendFailure(path);
    throw new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
  }

  if (!res.ok) {
    let message = 'Request failed';
    let data: any = undefined;
    try {
      data = await res.json();
      message = extractErrorMessage(data, message);
    } catch {
      // ignore
    }

    try {
      // eslint-disable-next-line no-console
      console.error('Backend error', { path, status: res.status, data, message });
    } catch {
    }

    if (res.status === 401) {
      if (handleUnauthorized(path, token)) {
        throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    }

    throw new BackendRequestError(message, { status: res.status, path, data });
  }

  markBackendSuccess(path);

  return res.json() as Promise<T>;
}

export async function backendDelete<T>(path: string): Promise<T> {
  const token = getAuthToken();
  let res: Response;
  if (isBackendTemporarilyDown()) {
    throw new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
  }
  if (isPathPrefixDisabled(path)) {
    throw new BackendRequestError('Endpoint غير متاح', { status: 404, path });
  }
  try {
    res = await fetchWithTimeout(`${BACKEND_BASE_URL}${path}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (err) {
    if (isAbortError(err)) {
      throw new BackendRequestError('انتهت مهلة الاتصال بالسيرفر. حاول مرة أخرى.', { path });
    }
    markBackendFailure(path);
    throw new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
  }

  if (!res.ok) {
    let message = 'Request failed';
    let data: any = undefined;
    try {
      data = await res.json();
      message = extractErrorMessage(data, message);
    } catch {
      // ignore
    }

    try {
      // eslint-disable-next-line no-console
      console.error('Backend error', { path, status: res.status, data, message });
    } catch {
    }

    if (res.status === 401) {
      if (handleUnauthorized(path, token)) {
        throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    }

    throw new BackendRequestError(message, { status: res.status, path, data });
  }

  markBackendSuccess(path);

  return res.json() as Promise<T>;
}

export async function backendGet<T>(path: string): Promise<T> {
  const token = getAuthToken();
  let res: Response;
  if (isBackendTemporarilyDown()) {
    throw new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
  }
  if (isPathPrefixDisabled(path)) {
    throw new BackendRequestError('Endpoint غير متاح', { status: 404, path });
  }
  try {
    res = await fetchWithTimeout(`${BACKEND_BASE_URL}${path}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (err) {
    if (isAbortError(err)) {
      throw new BackendRequestError('انتهت مهلة الاتصال بالسيرفر. حاول مرة أخرى.', { path });
    }
    markBackendFailure(path);
    throw new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
  }

  if (!res.ok) {
    let message = 'Request failed';
    let data: any = undefined;
    try {
      data = await res.json();
      message = extractErrorMessage(data, message);
    } catch {
      // ignore
    }

    if (res.status === 401) {
      if (handleUnauthorized(path, token)) {
        throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    }

    throw new BackendRequestError(message, { status: res.status, path, data });
  }

  markBackendSuccess(path);

  return res.json() as Promise<T>;
}

export async function backendPatch<T>(path: string, body: any): Promise<T> {
  const token = getAuthToken();
  let res: Response;
  if (isBackendTemporarilyDown()) {
    throw new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
  }
  if (isPathPrefixDisabled(path)) {
    throw new BackendRequestError('Endpoint غير متاح', { status: 404, path });
  }
  try {
    res = await fetchWithTimeout(`${BACKEND_BASE_URL}${path}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (isAbortError(err)) {
      throw new BackendRequestError('انتهت مهلة الاتصال بالسيرفر. حاول مرة أخرى.', { path });
    }
    markBackendFailure(path);
    throw new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
  }

  if (!res.ok) {
    let message = 'Request failed';
    let data: any = undefined;
    try {
      data = await res.json();
      message = extractErrorMessage(data, message);
    } catch {
      // ignore
    }

    if (res.status === 401) {
      if (handleUnauthorized(path, token)) {
        throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    }

    throw new BackendRequestError(message, { status: res.status, path, data });
  }

  markBackendSuccess(path);

  return res.json() as Promise<T>;
}

export async function backendPut<T>(path: string, body: any): Promise<T> {
  const token = getAuthToken();
  let res: Response;
  if (isBackendTemporarilyDown()) {
    throw new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
  }
  if (isPathPrefixDisabled(path)) {
    throw new BackendRequestError('Endpoint غير متاح', { status: 404, path });
  }
  try {
    res = await fetchWithTimeout(`${BACKEND_BASE_URL}${path}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (isAbortError(err)) {
      throw new BackendRequestError('انتهت مهلة الاتصال بالسيرفر. حاول مرة أخرى.', { path });
    }
    markBackendFailure(path);
    throw new BackendRequestError('تعذر إتمام العملية الآن. حاول لاحقًا.', { path });
  }

  if (!res.ok) {
    let message = 'Request failed';
    let data: any = undefined;
    try {
      data = await res.json();
      message = extractErrorMessage(data, message);
    } catch {
      // ignore
    }

    if (res.status === 401) {
      if (handleUnauthorized(path, token)) {
        throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      }
    }

    throw new BackendRequestError(message, { status: res.status, path, data });
  }

  markBackendSuccess(path);

  return res.json() as Promise<T>;
}
