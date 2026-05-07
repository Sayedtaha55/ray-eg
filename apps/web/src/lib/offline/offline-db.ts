'use client';

export const offlineDB = {
  saveShop: async (id: string, data: any) => {},
  getShop: async (id: string) => null,
  saveProducts: async (shopId: string, data: any[]) => {},
  getProducts: async (shopId: string) => [],
  saveReservations: async (shopId: string, data: any[]) => {},
  getReservations: async (shopId: string) => [],
  saveOrders: async (shopId: string, data: any[]) => {},
  getOrders: async (shopId: string) => [],
  saveNotifications: async (shopId: string, data: any[]) => {},
  getNotifications: async (shopId: string) => [],
  saveAnalytics: async (shopId: string, data: any) => {},
  getAnalytics: async (shopId: string) => null,
};

export function isOfflineError(error: any) {
  return false;
}
