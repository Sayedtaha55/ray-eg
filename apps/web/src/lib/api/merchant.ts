// Placeholder for merchant API for Next.js migration
// In a real scenario, this would use fetch() or a shared httpClient

export async function merchantGetMyShop() {
  const res = await fetch('/api/v1/merchant/my-shop');
  if (!res.ok) throw new Error('Failed to fetch shop');
  return res.json();
}

export async function merchantGetProducts(shopId: string) {
  const res = await fetch(`/api/v1/merchant/products?shopId=${shopId}`);
  return res.json();
}

export async function merchantGetReservations(shopId: string) {
  const res = await fetch(`/api/v1/merchant/reservations?shopId=${shopId}`);
  return res.json();
}

export async function merchantGetOrders(params: any) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/v1/merchant/orders?${query}`);
  return res.json();
}

export async function merchantGetShopAnalytics(shopId: string, params: any) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/v1/merchant/analytics/${shopId}?${query}`);
  return res.json();
}

export async function merchantGetNotifications(shopId: string) {
  const res = await fetch(`/api/v1/merchant/notifications?shopId=${shopId}`);
  return res.json();
}

export async function merchantGetOffers() {
  const res = await fetch('/api/v1/merchant/offers');
  return res.json();
}

export async function merchantGetGallery(shopId: string) {
  const res = await fetch(`/api/v1/merchant/gallery?shopId=${shopId}`);
  return res.json();
}

export async function merchantDeleteProduct(id: string) {
  return fetch(`/api/v1/merchant/products/${id}`, { method: 'DELETE' });
}

export async function merchantDeleteOffer(id: string) {
  return fetch(`/api/v1/merchant/offers/${id}`, { method: 'DELETE' });
}

export async function merchantUpdateReservationStatus(id: string, status: string) {
  return fetch(`/api/v1/merchant/reservations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function merchantConvertReservationToCustomer(data: any) {
  return fetch('/api/v1/merchant/customers/from-reservation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function merchantGetAbandonedCartStats(params: any) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/v1/merchant/abandoned-carts/stats?${query}`);
  return res.json();
}

export async function merchantGetAbandonedCarts(params: any) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/v1/merchant/abandoned-carts?${query}`);
  return res.json();
}

export async function merchantMarkCartEventRecovered(id: string) {
  return fetch(`/api/v1/merchant/abandoned-carts/${id}/recover`, { method: 'POST' });
}
