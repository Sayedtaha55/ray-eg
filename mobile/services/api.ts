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

  async updateMyShop(payload: any) {
    const { data } = await httpClient.patch('/shops/me', payload);
    return data;
  },

  async getShopAnalytics(shopId: string, params?: { from?: string; to?: string }) {
    const { data } = await httpClient.get(`/shops/${shopId}/analytics`, { params });
    return data;
  },

  async updateShopDesign(shopId: string, designConfig: any) {
    const { data } = await httpClient.patch(`/shops/${shopId}/design`, designConfig);
    return data;
  },

  // ── Products ──
  async getProductsForManage(shopId: string) {
    const { data } = await httpClient.get(`/products/manage/by-shop/${shopId}`);
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

  async placeOrder(payload: {
    shopId: string;
    items: any[];
    total: number;
    paymentMethod?: string;
    source?: string;
    notes?: string;
    customerPhone?: string;
    deliveryAddressManual?: string;
    deliveryLat?: number;
    deliveryLng?: number;
    deliveryNote?: string;
    customerNote?: string;
  }) {
    const { data } = await httpClient.post('/orders', payload);
    return data;
  },

  // ── Reservations ──
  async getReservations(shopId: string) {
    const { data } = await httpClient.get('/reservations', { params: { shopId } });
    return data;
  },

  async updateReservationStatus(id: string, status: string) {
    const { data } = await httpClient.patch(`/reservations/${id}/status`, { status });
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
    const { data } = await httpClient.get(`/notifications/shop/${shopId}`);
    return data;
  },

  async markNotificationsRead(shopId: string) {
    await httpClient.patch(`/notifications/shop/${shopId}/read`);
  },

  async registerMerchantPushSubscription(shopId: string, expoPushToken: string) {
    const endpoint = `https://expo.dev/push/${encodeURIComponent(expoPushToken)}`;
    await httpClient.post('/notifications/push/merchant/subscribe', {
      shopId,
      subscription: {
        endpoint,
        expoPushToken,
      },
    });
    return endpoint;
  },

  async unregisterMerchantPushSubscription(shopId: string, endpoint: string) {
    await httpClient.post('/notifications/push/merchant/unsubscribe', {
      shopId,
      endpoint,
    });
  },

  // ── Chats ──
  async getMerchantChats(shopId: string) {
    const { data } = await httpClient.get(`/shops/${shopId}/chats`);
    return data;
  },

  async getChatMessages(shopId: string, userId: string) {
    const { data } = await httpClient.get(`/shops/${shopId}/chats/${userId}/messages`);
    return data;
  },

  async sendChatMessage(shopId: string, userId: string, content: string) {
    const { data } = await httpClient.post(`/shops/${shopId}/chats/${userId}/messages`, { content });
    return data;
  },

  // ── Gallery ──
  async getShopGallery(shopId: string) {
    const { data } = await httpClient.get(`/gallery/${shopId}`);
    return data;
  },

  // ── Customers ──
  async getCustomers(shopId: string) {
    const { data } = await httpClient.get(`/customers/shop/${shopId}`);
    return data;
  },

  // ── Invoice ──
  async getInvoices(shopId: string) {
    const { data } = await httpClient.get('/invoices/me', { params: { shopId } });
    return data;
  },

  // ── Reports ──
  async getReports(shopId: string, params?: any) {
    const { data } = await httpClient.get(`/shops/${shopId}/reports`, { params });
    return data;
  },

  // ── Account ──
  async deactivateMyAccount() {
    const { data } = await httpClient.patch('/shops/me/deactivate');
    return data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    const { data } = await httpClient.patch('/auth/change-password', payload);
    return data;
  },
};
