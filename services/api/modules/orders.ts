import { backendGet, backendPatch, backendPost } from '../httpClient';
import { normalizeOrderFromBackend } from '../normalizers';

export async function getAllOrdersViaBackend(
  opts: { shopId?: string; from?: string; to?: string } | undefined,
  localRole: string,
  localShopId?: string,
) {
  const params = new URLSearchParams();
  if (opts?.shopId) params.set('shopId', String(opts.shopId));
  if (opts?.from) params.set('from', String(opts.from));
  if (opts?.to) params.set('to', String(opts.to));
  const qs = params.toString();

  if (String(localRole || '').toUpperCase() === 'ADMIN') {
    try {
      const data = await backendGet<any[]>(`/api/v1/orders/admin${qs ? `?${qs}` : ''}`);
      return (data || []).map(normalizeOrderFromBackend);
    } catch {
      // ignore
    }
  }

  if (String(localRole || '').toUpperCase() === 'COURIER') {
    try {
      const data = await backendGet<any[]>(`/api/v1/orders/courier/me`);
      return (data || []).map(normalizeOrderFromBackend);
    } catch {
      // ignore
    }
  }

  const shopId = opts?.shopId || localShopId;
  if (shopId) {
    const merchantParams = new URLSearchParams();
    merchantParams.set('shopId', String(shopId));
    if (opts?.from) merchantParams.set('from', String(opts.from));
    if (opts?.to) merchantParams.set('to', String(opts.to));
    const qs2 = merchantParams.toString();
    try {
      const data = await backendGet<any[]>(`/api/v1/orders${qs2 ? `?${qs2}` : ''}`);
      return (data || []).map(normalizeOrderFromBackend);
    } catch {
      // ignore
    }
  }

  return [];
}

export async function placeOrderViaBackend(order: {
  items: any[];
  total: number;
  paymentMethod?: string;
  shopId?: string;
  notes?: string;
}) {
  const shopId = order.shopId || order.items?.[0]?.shopId;
  return await backendPost<any>('/api/v1/orders', {
    shopId,
    items: order.items,
    total: order.total,
    paymentMethod: order.paymentMethod,
    notes: order.notes,
  });
}

export async function updateOrderViaBackend(id: string, payload: { status?: string; notes?: string }) {
  return await backendPatch<any>(`/api/v1/orders/${encodeURIComponent(id)}`, payload);
}

export async function assignCourierToOrderViaBackend(id: string, courierId: string) {
  return await backendPatch<any>(`/api/v1/orders/${encodeURIComponent(id)}/assign-courier`, { courierId });
}

export async function getCourierOrdersViaBackend() {
  const data = await backendGet<any[]>(`/api/v1/orders/courier/me`);
  return (data || []).map(normalizeOrderFromBackend);
}

export async function updateCourierOrderViaBackend(id: string, payload: { status?: string; codCollected?: boolean }) {
  return await backendPatch<any>(`/api/v1/orders/${encodeURIComponent(id)}/courier`, payload);
}
