'use client';

import { clientFetch } from '@/lib/api/client';

export async function apiPlaceOrder(order: {
  shopId?: string;
  items: any[];
  total: number;
  paymentMethod?: string;
  notes?: string;
  customerPhone?: string;
  deliveryAddressManual?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryNote?: string;
  customerNote?: string;
}): Promise<any> {
  return clientFetch('/v1/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

export async function apiGetShopByIdOrSlug(idOrSlug: string): Promise<any> {
  return clientFetch(`/v1/shops/${encodeURIComponent(idOrSlug)}`, {
    method: 'GET',
  });
}
