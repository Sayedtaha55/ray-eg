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

let refreshInFlight: Promise<string | null> | null = null;

// Silently exchange the ray_session refresh cookie for a fresh access token.
// Shared logic with lib/auth.tsx — kept local to avoid a circular import.
export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        if (!res.ok) return null;
        const data = await res.json().catch(() => null);
        const accessToken = data?.data?.token?.accessToken || data?.token?.accessToken;
        if (!accessToken) return null;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('ray_token', accessToken);
        const user = data?.data?.user || data?.user;
        if (user) {
          localStorage.setItem('ray_user', JSON.stringify(user));
          window.dispatchEvent(new Event('ray-user-refreshed'));
        }
        return accessToken as string;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export async function apiRequestWithMeta<T = any>(
  path: string,
  options: RequestInit = {},
  _retried = false
): Promise<ApiResult<T>> {
  const token = getToken();
  const csrf = getCsrf();
  const headers: Record<string, any> = {
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
    let errBody: any = null;
    try {
      errBody = await res.json();
      if (errBody?.message) msg = errBody.message;
      if (errBody?.error) msg = errBody.error;
    } catch {}
    // access token lives only 15 min — on expiry, refresh silently and retry once
    const expired = res.status === 401 && /expired|invalid token|invalid_token/i.test(String(msg));
    if (expired && !_retried) {
      const newToken = await refreshAccessToken();
      if (newToken) return apiRequestWithMeta<T>(path, options, true);
      window.dispatchEvent(new Event('ray-session-expired'));
      throw new Error('انتهت الجلسة، من فضلك سجل الدخول من جديد');
    }
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
