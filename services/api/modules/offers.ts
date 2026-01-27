import { backendDelete, backendGet, backendPost } from '../httpClient';

export async function getOffersViaBackend(opts?: { take?: number; skip?: number; shopId?: string }) {
  const params = new URLSearchParams();
  if (typeof opts?.take === 'number') params.set('take', String(opts.take));
  if (typeof opts?.skip === 'number') params.set('skip', String(opts.skip));
  if (opts?.shopId) params.set('shopId', String(opts.shopId));
  const qs = params.toString();
  const offers = await backendGet<any[]>(`/api/v1/offers${qs ? `?${qs}` : ''}`);
  return offers || [];
}

export async function createOfferViaBackend(offer: any) {
  return await backendPost<any>('/api/v1/offers', offer);
}

export async function deleteOfferViaBackend(offerId: string) {
  return await backendDelete<any>(`/api/v1/offers/${encodeURIComponent(offerId)}`);
}

export async function getOfferByProductIdViaBackend(productId: string) {
  const params = new URLSearchParams();
  params.set('productId', String(productId));
  params.set('take', '1');
  params.set('skip', '0');
  const offers = await backendGet<any[]>(`/api/v1/offers?${params.toString()}`);
  return Array.isArray(offers) && offers.length > 0 ? offers[0] : null;
}

export async function getOfferByIdViaBackend(id: string) {
  return await backendGet<any>(`/api/v1/offers/${encodeURIComponent(id)}`);
}
