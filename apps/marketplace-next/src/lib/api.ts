const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://api.mnmknk.com' : 'http://localhost:4000');

export function apiPath(path: string): string {
  return path.startsWith('/api') ? path : `/api/v1${path}`;
}

export function backendApiUrl(path: string): string {
  return `${BACKEND_URL}${apiPath(path)}`;
}

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('ray_token');
}

export async function jsonRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredAuthToken();
  const res = await fetch(apiPath(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    credentials: init.credentials ?? 'include',
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `API Error: ${res.status} ${res.statusText}`);
  }
  return data?.data !== undefined ? data.data : data;
}

export interface ApiOptions {
  revalidate?: number;
  tags?: string[];
  headers?: Record<string, string>;
}

async function apiFetch<T>(path: string, options?: ApiOptions & { method?: string; body?: unknown }): Promise<T> {
  const url = backendApiUrl(path);
  
  // Get token from localStorage for client-side requests
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = getStoredAuthToken();
  }
  
  const res = await fetch(url, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
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
      message = body?.message || body?.error || body?.data?.error || message;
    } catch {}
    throw new Error(message);
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
