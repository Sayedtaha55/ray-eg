import { backendGet, backendPost } from '../httpClient';
import { normalizeUserFromBackend } from '../normalizers';

export async function loginViaBackend(email: string, pass: string) {
  const data = await backendPost<{ access_token: string; user: any }>(
    '/api/v1/auth/login',
    { email, password: pass },
  );
  return {
    user: normalizeUserFromBackend(data.user),
    session: { access_token: data.access_token },
  };
}

export async function devMerchantLoginViaBackend() {
  const data = await backendPost<{ access_token: string; user: any }>(
    '/api/v1/auth/dev-merchant-login',
    {},
  );
  return {
    user: normalizeUserFromBackend(data.user),
    session: { access_token: data.access_token },
  };
}

export async function sessionViaBackend() {
  const data = await backendGet<{ access_token: string; user: any }>('/api/v1/auth/session');
  return {
    user: normalizeUserFromBackend(data.user),
    session: { access_token: data.access_token },
  };
}

export async function signupViaBackend(payload: any) {
  const data = await backendPost<any>('/api/v1/auth/signup', payload);
  const pending = Boolean(data?.pending);
  if (pending) {
    return {
      pending: true,
      user: normalizeUserFromBackend(data.user),
      session: { access_token: '' },
      shop: data?.shop,
    };
  }
  return {
    user: normalizeUserFromBackend(data.user),
    session: { access_token: data.access_token },
  };
}
