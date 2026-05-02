import { getStoredMerchantContext, syncMerchantContextFromBackend } from './authStorage';

export type AuthRedirectInput = {
  role?: any;
  user?: any;
  returnTo?: any;
  merchantStatus?: any;
};

export function normalizeSafeReturnTo(value: any) {
  const rt = String(value || '').trim();
  if (!rt) return undefined;
  if (!rt.startsWith('/')) return undefined;
  if (rt.startsWith('//')) return undefined;
  return rt;
}

export async function resolvePostAuthDestination(input: AuthRedirectInput) {
  const returnTo = normalizeSafeReturnTo(input?.returnTo);
  if (returnTo) return returnTo;

  const role = String(input?.role || input?.user?.role || '').trim().toLowerCase();

  if (role === 'admin') return '/admin/dashboard';
  if (role === 'courier') return '/courier/orders';
  if (role === 'merchant') {
    const statusRaw = String(input?.merchantStatus || '').trim().toLowerCase();
    if (statusRaw === 'approved') return '/business/dashboard';
    if (statusRaw && statusRaw !== 'approved') return '/business/pending';

    try {
      const context = (await syncMerchantContextFromBackend(input?.user)) || getStoredMerchantContext();
      const status = String(context?.status || '').trim().toLowerCase();
      if (status && status !== 'approved') return '/business/pending';
      return String(context?.preferredRoute || '/business/dashboard');
    } catch {
      const context = getStoredMerchantContext();
      const status = String(context?.status || '').trim().toLowerCase();
      if (status && status !== 'approved') return '/business/pending';
      return String(context?.preferredRoute || '/business/dashboard');
    }
  }

  return '/profile';
}
