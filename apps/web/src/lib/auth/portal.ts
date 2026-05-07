export type PortalOwner = {
  id: string;
  phone: string | null;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
};

export type PortalAuthResponse = {
  ok: boolean;
  access_token: string;
  owner: PortalOwner;
};

function readPortalToken(): string {
  try {
    return localStorage.getItem('portal_token') || '';
  } catch {
    return '';
  }
}

export function persistPortalSession(data: { access_token: string; owner: PortalOwner }) {
  // TODO: Move portal session to httpOnly cookies (like main auth flow) to protect against XSS.
  // localStorage tokens are readable by any JS on the page.
  try {
    localStorage.setItem('portal_token', data.access_token);
    localStorage.setItem('portal_owner', JSON.stringify(data.owner));
  } catch {
    // ignore
  }
}

export function clearPortalSession() {
  try {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_owner');
  } catch {
    // ignore
  }
}

async function portalFetch<T>(path: string, body: any): Promise<T> {
  const token = typeof window !== 'undefined' ? readPortalToken() : '';
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) {
      clearPortalSession();
    }
    throw Object.assign(new Error(text || 'Request failed'), { status: res.status });
  }

  return res.json() as Promise<T>;
}

export async function portalLogin(email: string, password: string): Promise<PortalAuthResponse> {
  return portalFetch<PortalAuthResponse>('/api/v1/portal/auth/login', { email, password });
}

export async function portalRegister(email: string, password: string, opts?: { name?: string; phone?: string }): Promise<PortalAuthResponse> {
  return portalFetch<PortalAuthResponse>('/api/v1/portal/auth/register', {
    email,
    password,
    ...(opts?.name ? { name: opts.name } : {}),
    ...(opts?.phone ? { phone: opts.phone } : {}),
  });
}
