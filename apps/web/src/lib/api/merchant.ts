'use client';

import { clientFetch } from './client';

/* ── Shop ─────────────────────────────────────────── */
export const merchantGetMyShop = () => clientFetch<any>('/v1/shops/me');
export const merchantUpdateMyShop = (data: Record<string, unknown>) =>
  clientFetch<any>('/v1/shops/me', { method: 'PATCH', body: JSON.stringify(data) });
export const merchantUpdateShopDesign = (data: Record<string, unknown>) =>
  clientFetch<any>('/v1/shops/me/design', { method: 'PATCH', body: JSON.stringify(data) });
export const merchantUploadBanner = (formData: FormData) =>
  fetch('/api/v1/shops/me/banner', { method: 'POST', body: formData }).then(r => {
    if (!r.ok) throw new Error('Upload failed');
    return r.json();
  });

/* ── Products ─────────────────────────────────────── */
export const merchantGetProducts = (shopId: string) =>
  clientFetch<any[]>(`/v1/products?shopId=${shopId}&manage=true`);
export const merchantAddProduct = (data: any) =>
  clientFetch<any>('/v1/products', { method: 'POST', body: JSON.stringify(data) });
export const merchantUpdateProduct = (id: string, data: any) =>
  clientFetch<any>(`/v1/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const merchantDeleteProduct = (id: string) =>
  clientFetch<any>(`/v1/products/${id}`, { method: 'DELETE' });
export const merchantUpdateProductStock = (id: string, stock: number) =>
  clientFetch<any>(`/v1/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ stock }) });

/* ── Orders / Sales ───────────────────────────────── */
export const merchantGetOrders = (params: { shopId: string; from?: string; to?: string }) => {
  const q = new URLSearchParams();
  q.set('shopId', params.shopId);
  if (params.from) q.set('from', params.from);
  if (params.to) q.set('to', params.to);
  return clientFetch<any[]>(`/v1/orders?${q.toString()}`);
};
export const merchantUpdateOrder = (id: string, data: Record<string, unknown>) =>
  clientFetch<any>(`/v1/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

/* ── Reservations ─────────────────────────────────── */
export const merchantGetReservations = (shopId: string) =>
  clientFetch<any[]>(`/v1/reservations?shopId=${shopId}`);
export const merchantUpdateReservationStatus = (id: string, status: string) =>
  clientFetch<any>(`/v1/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const merchantConvertReservationToCustomer = (data: any) =>
  clientFetch<any>('/v1/customers/convert-reservation', { method: 'POST', body: JSON.stringify(data) });

/* ── Analytics ────────────────────────────────────── */
export const merchantGetShopAnalytics = (shopId: string, params?: { from?: string; to?: string }) => {
  const q = new URLSearchParams();
  if (params?.from) q.set('from', params.from);
  if (params?.to) q.set('to', params.to);
  return clientFetch<any>(`/v1/shops/${shopId}/analytics?${q.toString()}`);
};

/* ── Notifications ────────────────────────────────── */
export const merchantGetNotifications = (shopId: string) =>
  clientFetch<any[]>(`/v1/notifications?shopId=${shopId}`);
export const merchantMarkNotificationRead = (shopId: string, notificationId: string) =>
  clientFetch<any>(`/v1/notifications/${notificationId}/read`, { method: 'PATCH' });
export const merchantMarkAllNotificationsRead = (shopId: string) =>
  clientFetch<any>(`/v1/notifications/read-all?shopId=${shopId}`, { method: 'PATCH' });

/* ── Offers / Promotions ──────────────────────────── */
export const merchantGetOffers = () => clientFetch<any[]>('/v1/offers');
export const merchantCreateOffer = (data: any) =>
  clientFetch<any>('/v1/offers', { method: 'POST', body: JSON.stringify(data) });
export const merchantDeleteOffer = (id: string) =>
  clientFetch<any>(`/v1/offers/${id}`, { method: 'DELETE' });

/* ── Gallery ──────────────────────────────────────── */
export const merchantGetGallery = (shopId: string) =>
  clientFetch<any[]>(`/v1/shops/${shopId}/gallery`);
export const merchantAddGalleryImage = (shopId: string, formData: FormData) =>
  fetch(`/api/v1/shops/${shopId}/gallery`, { method: 'POST', body: formData }).then(r => {
    if (!r.ok) throw new Error('Upload failed');
    return r.json();
  });
export const merchantDeleteGalleryImage = (shopId: string, imageId: string) =>
  clientFetch<any>(`/v1/shops/${shopId}/gallery/${imageId}`, { method: 'DELETE' });

/* ── Customers ────────────────────────────────────── */
export const merchantGetCustomers = (shopId: string) =>
  clientFetch<any[]>(`/v1/customers?shopId=${shopId}`);
export const merchantUpdateCustomerStatus = (id: string, status: string) =>
  clientFetch<any>(`/v1/customers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const merchantSendCustomerPromotion = (customerId: string, shopId: string) =>
  clientFetch<any>(`/v1/customers/${customerId}/promote`, { method: 'POST', body: JSON.stringify({ shopId }) });

/* ── Invoices ─────────────────────────────────────── */
export const merchantGetInvoices = (shopId: string) =>
  clientFetch<any[]>(`/v1/invoices?shopId=${shopId}`);
export const merchantCreateInvoice = (data: any) =>
  clientFetch<any>('/v1/invoices', { method: 'POST', body: JSON.stringify(data) });
export const merchantGetInvoiceById = (id: string) =>
  clientFetch<any>(`/v1/invoices/${id}`);
export const merchantUpdateInvoice = (id: string, data: any) =>
  clientFetch<any>(`/v1/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

/* ── Abandoned Cart ──────────────────────────────── */
export const merchantGetAbandonedCartStats = (params: { shopId: string }) =>
  clientFetch<any>(`/v1/cart-events/stats?shopId=${params.shopId}`);
export const merchantGetAbandonedCarts = (params: { shopId: string; page?: number; limit?: number }) => {
  const q = new URLSearchParams();
  q.set('shopId', params.shopId);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  return clientFetch<any>(`/v1/cart-events?${q.toString()}`);
};
export const merchantMarkCartEventRecovered = (id: string) =>
  clientFetch<any>(`/v1/cart-events/${id}/recover`, { method: 'PATCH' });

/* ── Module Upgrade Requests ──────────────────────── */
export const merchantCreateModuleUpgradeRequest = (data: { requestedModules: string[] }) =>
  clientFetch<any>('/v1/module-upgrade-requests', { method: 'POST', body: JSON.stringify(data) });

/* ── Auth / Account ──────────────────────────────── */
export const merchantChangePassword = (data: { currentPassword: string; newPassword: string }) =>
  clientFetch<any>('/v1/auth/change-password', { method: 'POST', body: JSON.stringify(data) });
export const merchantDeactivateAccount = () =>
  clientFetch<any>('/v1/auth/deactivate', { method: 'POST' });

/* ── Apps ────────────────────────────────────────── */
export const merchantListApps = () => clientFetch<any[]>('/v1/apps');
export const merchantListMyApps = () => clientFetch<any[]>('/v1/apps/mine');
export const merchantInstallApp = (key: string) =>
  clientFetch<any>(`/v1/apps/${key}/install`, { method: 'POST' });
export const merchantUninstallApp = (key: string) =>
  clientFetch<any>(`/v1/apps/${key}/uninstall`, { method: 'POST' });
export const merchantEnableApp = (key: string) =>
  clientFetch<any>(`/v1/apps/${key}/enable`, { method: 'PATCH' });
export const merchantDisableApp = (key: string) =>
  clientFetch<any>(`/v1/apps/${key}/disable`, { method: 'PATCH' });
