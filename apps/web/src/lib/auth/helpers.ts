/**
 * Auth helpers for Next.js client components.
 * Handles login/signup API calls and session cookie persistence.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  shopId?: string;
}

type BackendAuthResponse = {
  access_token: string;
  user: AuthUser;
  session?: { access_token: string };
};

export interface LoginResponse {
  user: AuthUser;
  session: { access_token: string };
}

export interface SignupResponse {
  user: AuthUser;
  session: { access_token: string };
}

function normalizeAuthResponse(raw: BackendAuthResponse): LoginResponse {
  const token =
    (raw as any)?.session?.access_token != null
      ? String((raw as any).session.access_token)
      : String((raw as any)?.access_token || '');

  const user = (raw as any)?.user as AuthUser;
  if (!token || !user?.id || !user?.role) {
    throw new Error('Invalid auth response');
  }

  return { user, session: { access_token: token } };
}

/** Call backend login endpoint (proxied via Next.js rewrites → /api/v1/...) */
export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(body), { status: res.status });
  }
  return normalizeAuthResponse(await res.json());
}

/** Call backend signup endpoint */
export async function apiSignup(data: Record<string, string>): Promise<SignupResponse> {
  const res = await fetch('/api/v1/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(body), { status: res.status });
  }
  return normalizeAuthResponse(await res.json());
}

/** Call backend forgot-password endpoint */
export async function apiForgotPassword(email: string): Promise<{ ok: boolean }> {
  const res = await fetch('/api/v1/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(body), { status: res.status });
  }
  return res.json();
}

/** Fetch current session (used after OAuth redirect) */
export async function apiGetSession(): Promise<LoginResponse> {
  const res = await fetch('/api/v1/auth/session', {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(body), { status: res.status });
  }
  return normalizeAuthResponse(await res.json());
}

/** Dev merchant login (development only) */
export async function apiDevMerchantLogin(opts?: { shopCategory?: string }): Promise<LoginResponse> {
  const res = await fetch('/api/v1/auth/dev-merchant-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts || {}),
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(body), { status: res.status });
  }
  return normalizeAuthResponse(await res.json());
}

/** Dev courier login (development only) */
export async function apiDevCourierLogin(): Promise<LoginResponse> {
  const res = await fetch('/api/v1/auth/dev-courier-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(body), { status: res.status });
  }
  return normalizeAuthResponse(await res.json());
}

/** Bootstrap admin account (development only) */
export async function apiBootstrapAdmin(data: { token: string; email: string; password: string; name: string }): Promise<{ ok: boolean }> {
  const res = await fetch('/api/v1/auth/bootstrap-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(body), { status: res.status });
  }
  return res.json();
}

/** Call backend reset-password endpoint */
export async function apiResetPassword(token: string, newPassword: string): Promise<{ ok: boolean }> {
  const res = await fetch('/api/v1/auth/password/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error(body), { status: res.status });
  }
  return res.json();
}

/** Set session cookies via Next.js API route */
export async function setSessionCookies(accessToken: string, user: AuthUser): Promise<void> {
  const res = await fetch('/api/auth/set-cookie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ accessToken, user }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`setSessionCookies failed (${res.status}): ${body}`);
  }

  // Notify client UI that auth state has changed (PublicNav, etc.)
  try {
    window.dispatchEvent(new Event('auth-change'));
  } catch {}
}

/** Clear session cookies */
export async function clearSessionCookies(): Promise<void> {
  await fetch('/api/auth/clear-cookie', { method: 'POST' });
}

/** Resolve post-login redirect based on role */
export function resolvePostLoginRedirect(role: string, returnTo?: string, isBusinessLogin?: boolean): string {
  const r = role.toLowerCase();
  if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
    if (returnTo.startsWith('/admin') && r !== 'admin') return '/';
    return returnTo;
  }
  if (r === 'admin') return '/admin/dashboard';
  if (r === 'merchant' || r === 'business') return '/business/dashboard';
  if (r === 'courier') return '/courier/orders';
  if (isBusinessLogin) return '/business/dashboard';
  return '/';
}
