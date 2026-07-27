// ─── Portal HTTP Client ────────────────────────────────────────────────────
// Uses portal_token from localStorage instead of ray_token

function getPortalToken(): string {
  try { return localStorage.getItem('portal_token') || ''; } catch { return ''; }
}

function getBaseUrl(): string {
  const envBackend = ((import.meta as any)?.env?.VITE_BACKEND_URL as string) || '';
  const envApi = ((import.meta as any)?.env?.VITE_API_URL as string) || '';
  const configured = String(envBackend || envApi).trim().replace(/\/+$/, '');
  if (configured) return configured;
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  if (isLocal) return 'http://localhost:4000';
  return 'https://api.mnmknk.com';
}

async function portalFetch<T>(method: string, path: string, body?: any): Promise<T> {
  const token = getPortalToken();
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    let message = 'Request failed';
    try { const d = await res.json(); message = d?.message || message; } catch {}
    if (res.status === 401) {
      localStorage.removeItem('portal_token');
      localStorage.removeItem('portal_owner');
      if (typeof window !== 'undefined') window.location.href = '/portal/login';
    }
    throw Object.assign(new Error(message), { status: res.status, path });
  }
  return res.json() as Promise<T>;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type PortalOwner = {
  id: string;
  phone: string | null;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export type PortalListing = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  websiteUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  socialLinks: any;
  logoUrl: string | null;
  coverUrl: string | null;
  status: string;
  role: string;
  grantedAt: string;
  branches: any[];
  _count?: { analyticsEvents?: number };
};

export type PortalAnalytics = {
  total: number;
  byType: Record<string, number>;
  daily: Record<string, number>;
  days: number;
};

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function portalRegister(email: string, password: string, opts?: { name?: string; phone?: string }) {
  return await portalFetch<{
    ok: boolean;
    access_token: string;
    owner: PortalOwner;
  }>('POST', '/api/v1/portal/auth/register', {
    email,
    password,
    ...(opts?.name ? { name: opts.name } : {}),
    ...(opts?.phone ? { phone: opts.phone } : {}),
  });
}

export async function portalLogin(email: string, password: string) {
  return await portalFetch<{
    ok: boolean;
    access_token: string;
    owner: PortalOwner;
  }>('POST', '/api/v1/portal/auth/login', { email, password });
}

export async function portalRequestOtp(phone: string, purpose: string = 'login') {
  return await portalFetch<{ ok: boolean; devCode?: string }>(
    'POST', '/api/v1/portal/auth/otp/request', { phone, purpose },
  );
}

export async function portalVerifyOtp(phone: string, code: string, purpose: string = 'login') {
  return await portalFetch<{
    ok: boolean;
    access_token: string;
    owner: PortalOwner;
  }>('POST', '/api/v1/portal/auth/otp/verify', { phone, code, purpose });
}

export async function portalLogout() {
  return await portalFetch<{ ok: boolean }>('POST', '/api/v1/portal/auth/logout', {});
}

export async function portalChangePassword(currentPassword: string, newPassword: string) {
  return await portalFetch<{ ok: boolean }>('POST', '/api/v1/portal/auth/change-password', {
    currentPassword,
    newPassword,
  });
}

export async function portalDevLogin() {
  return await portalFetch<{
    ok: boolean;
    access_token: string;
    owner: PortalOwner;
  }>('POST', '/api/v1/portal/auth/dev-portal-login', {});
}

// ─── Profile ────────────────────────────────────────────────────────────────

export async function portalGetMe() {
  return await portalFetch<PortalOwner>('GET', '/api/v1/portal/me');
}

export async function portalUpdateMe(data: { name?: string; email?: string; avatarUrl?: string }) {
  return await portalFetch<PortalOwner>('PATCH', '/api/v1/portal/me', data);
}

// ─── Listings ──────────────────────────────────────────────────────────────

export async function portalGetListings() {
  return await portalFetch<PortalListing[]>('GET', '/api/v1/portal/listings');
}

export async function portalClaimListing(listingId: string) {
  return await portalFetch<{ ok: boolean; autoApproved?: boolean; message?: string }>(
    'POST', '/api/v1/portal/claim', { listingId },
  );
}

export async function portalEditListing(id: string, data: Partial<PortalListing>) {
  return await portalFetch<PortalListing>('PATCH', `/api/v1/portal/listings/${id}`, data);
}

// ─── Branches ──────────────────────────────────────────────────────────────

export async function portalAddBranch(listingId: string, branch: {
  name?: string;
  latitude: number;
  longitude: number;
  addressLabel?: string;
  governorate?: string;
  city?: string;
  phone?: string;
}) {
  return await portalFetch<any>('POST', `/api/v1/portal/listings/${listingId}/branches`, branch);
}

export async function portalEditBranch(listingId: string, branchId: string, data: any) {
  return await portalFetch<any>('PATCH', `/api/v1/portal/listings/${listingId}/branches/${branchId}`, data);
}

export async function portalSetPrimaryBranch(listingId: string, branchId: string) {
  return await portalFetch<{ ok: boolean }>(
    'POST', `/api/v1/portal/listings/${listingId}/branches/${branchId}/set-primary`, {},
  );
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export async function portalTrackEvent(listingId: string, type: string, meta?: any) {
  return await portalFetch<{ ok: boolean }>(
    'POST', `/api/v1/portal/listings/${listingId}/events`, { type, meta },
  );
}

export async function portalGetAnalytics(listingId: string, range: number = 30) {
  return await portalFetch<PortalAnalytics>(
    'GET', `/api/v1/portal/listings/${listingId}/analytics?range=${range}`,
  );
}

// ─── Admin Dev Impersonation ──────────────────────────────────────────────

export async function portalAdminImpersonate(listingId: string) {
  // This uses the admin ray_token, so import from httpClient
  const { backendPost } = await import('../httpClient');
  return await backendPost<{
    ok: boolean;
    access_token: string;
    ownerId: string;
    phone: string;
    expiresIn: string;
  }>('/api/v1/portal/admin/dev-impersonate', { listingId });
}
