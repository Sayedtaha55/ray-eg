import { backendGet, backendPatch, backendPost } from '../httpClient';

export type CartEventInput = {
  shopId: string;
  productId: string;
  event: 'add_to_cart' | 'checkout_started' | 'payment_completed' | 'abandoned';
  sessionId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  quantity?: number;
  unitPrice?: number;
  currency?: string;
  metadata?: any;
};

export async function trackCartEventViaBackend(input: CartEventInput) {
  return await backendPost<any>('/api/v1/cart-events', input);
}

export async function getAbandonedCartsViaBackend(opts?: {
  shopId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (opts?.shopId) params.set('shopId', opts.shopId);
  if (opts?.from) params.set('from', opts.from);
  if (opts?.to) params.set('to', opts.to);
  if (typeof opts?.page === 'number') params.set('page', String(opts.page));
  if (typeof opts?.limit === 'number') params.set('limit', String(opts.limit));
  const qs = params.toString();
  return await backendGet<{ items: any[]; total: number; page: number; limit: number }>(`/api/v1/cart-events/abandoned${qs ? `?${qs}` : ''}`);
}

export async function getAbandonedCartStatsViaBackend(opts?: {
  shopId?: string;
  from?: string;
  to?: string;
}) {
  const params = new URLSearchParams();
  if (opts?.shopId) params.set('shopId', opts.shopId);
  if (opts?.from) params.set('from', opts.from);
  if (opts?.to) params.set('to', opts.to);
  const qs = params.toString();
  return await backendGet<any>(`/api/v1/cart-events/stats${qs ? `?${qs}` : ''}`);
}

export async function markCartEventRecoveredViaBackend(id: string) {
  return await backendPatch<any>(`/api/v1/cart-events/${encodeURIComponent(id)}/recover`, {});
}
