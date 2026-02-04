import { backendGet, backendPatch, backendPost } from '../httpClient';
import { normalizeOrderFromBackend } from '../normalizers';

export async function getCourierStateViaBackend() {
  return await backendGet<any>(`/api/v1/courier/state`);
}

export async function updateCourierStateViaBackend(payload: { isAvailable?: boolean; lat?: number; lng?: number; accuracy?: number }) {
  return await backendPatch<any>(`/api/v1/courier/state`, payload);
}

export async function getCourierOffersViaBackend() {
  const data = await backendGet<any[]>(`/api/v1/courier/offers`);
  return (data || []).map((o: any) => ({
    ...o,
    order: o?.order ? normalizeOrderFromBackend(o.order) : undefined,
  }));
}

export async function acceptCourierOfferViaBackend(id: string) {
  const data = await backendPost<any>(`/api/v1/courier/offers/${encodeURIComponent(id)}/accept`, {});
  return data ? normalizeOrderFromBackend(data) : data;
}

export async function rejectCourierOfferViaBackend(id: string) {
  return await backendPost<any>(`/api/v1/courier/offers/${encodeURIComponent(id)}/reject`, {});
}
