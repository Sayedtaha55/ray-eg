const RAW_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://api.mnmknk.com' : 'http://localhost:4000');

const BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, '');

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

function extractErrorMessage(body: unknown, fallback: string): { message: string; code?: string; details?: unknown } {
  if (!body || typeof body !== 'object') return { message: fallback };

  const record = body as Record<string, unknown>;
  const data = record.data && typeof record.data === 'object' ? record.data as Record<string, unknown> : undefined;
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

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ray_token') || localStorage.getItem('token');
}

export function storeAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ray_token', token);
  localStorage.setItem('token', token);
}

export function clearStoredAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ray_token');
  localStorage.removeItem('token');
}

export async function jsonRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredAuthToken();
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const headers = new Headers(init.headers);
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(apiPath(path), {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  });

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
}

async function apiFetch<T>(path: string, options?: ApiOptions & { method?: string; body?: unknown }): Promise<T> {
  const url = typeof window === 'undefined' ? backendApiUrl(path) : apiPath(path);
  
  // Get token from localStorage for client-side requests
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

  const res = await fetch(url, {
    method: options?.method || 'GET',
    headers,
    body: options?.body ? (isFormData ? options.body as BodyInit : JSON.stringify(options.body)) : undefined,
    next: {
      revalidate: options?.revalidate ?? 3600,
      tags: options?.tags,
    },
    cache: options?.revalidate === 0 ? 'no-store' : undefined,
  });

  if (!res.ok) {
    let message = `API Error: ${res.status} ${res.statusText}`;
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

export { BACKEND_URL };
