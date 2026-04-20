import httpClient from './httpClient';
import { saveTokens, saveUser } from './authStorage';

export const ApiService = {
  // ── Auth ──
  async login(email: string, password: string) {
    const { data } = await httpClient.post('/auth/login', { email, password });
    if (data?.session?.access_token) {
      await saveTokens(data.session.access_token, data.session.refresh_token);
    }
    if (data?.user) {
      await saveUser(data.user);
    }
    return data;
  },

  async logout() {
    try { await httpClient.post('/auth/logout'); } catch {}
  },

  // ── Shop ──
  async getMyShop() {
    const { data } = await httpClient.get('/shops/me');
    return data;
  },

  async getShopAnalytics(shopId: string, params?: { from?: string; to?: string }) {
    const { data } = await httpClient.get(`/shops/${shopId}/analytics`, { params });
    return data;
  },

  // ── Products ──
  async getProductsForManage(shopId: string) {
    const { data } = await httpClient.get(`/shops/${shopId}/products`);
    return data;
  },

  async deleteProduct(id: string) {
    await httpClient.delete(`/products/${id}`);
  },

  // ── Orders / Sales ──
  async getAllOrders(params: { shopId: string; from?: string; to?: string }) {
    const { data } = await httpClient.get('/orders', { params });
    return data;
  },

  // ── Reservations ──
  async getReservations(shopId: string) {
    const { data } = await httpClient.get(`/shops/${shopId}/reservations`);
    return data;
  },

  async updateReservationStatus(id: string, status: string) {
    const { data } = await httpClient.patch(`/reservations/${id}`, { status });
    return data;
  },

  // ── Offers / Promotions ──
  async getOffers() {
    const { data } = await httpClient.get('/offers');
    return data;
  },

  async deleteOffer(id: string) {
    await httpClient.delete(`/offers/${id}`);
  },

  // ── Notifications ──
  async getNotifications(shopId: string) {
    const { data } = await httpClient.get(`/shops/${shopId}/notifications`);
    return data;
  },

  async markNotificationsRead(shopId: string) {
    await httpClient.patch(`/shops/${shopId}/notifications/read`);
  },

  // ── Gallery ──
  async getShopGallery(shopId: string) {
    const { data } = await httpClient.get(`/shops/${shopId}/gallery`);
    return data;
  },

  // ── Customers ──
  async getCustomers(shopId: string) {
    const { data } = await httpClient.get(`/shops/${shopId}/customers`);
    return data;
  },

  // ── Invoice ──
  async getInvoices(shopId: string) {
    const { data } = await httpClient.get(`/shops/${shopId}/invoices`);
    return data;
  },

  // ── Reports ──
  async getReports(shopId: string, params?: any) {
    const { data } = await httpClient.get(`/shops/${shopId}/reports`, { params });
    return data;
  },
};
