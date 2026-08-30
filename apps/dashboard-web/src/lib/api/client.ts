const API_BASE = '/api/v1';

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface ApiResult<T> {
  data: T;
  meta: PageMeta | null;
  raw: any;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('ray_token');
}

function getCsrf(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/ray_csrf=([^;]+)/);
  return match ? match[1] : null;
}

export function buildQueryString(params: Record<string, any>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export async function apiRequestWithMeta<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const token = getToken();
  const csrf = getCsrf();
  const headers: Record<string, any = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (csrf) headers['X-CSRF-Token'] = csrf;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let msg = `خطأ في الطلب (${res.status})`;
    try {
      const errBody = await res.json();
      if (errBody?.message) msg = errBody.message;
      if (errBody?.error) msg = errBody.error;
    } catch {}
    throw new Error(msg);
  }

  const raw = await res.json();

  if (raw && typeof raw === 'object' && 'success' in raw && 'data' in raw) {
    return {
      data: raw.data as T,
      meta: raw.meta || null,
      raw,
    };
  }

  return { data: raw as T, meta: null, raw };
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const result = await apiRequestWithMeta<T>(path, options);
  return result.data;
}
