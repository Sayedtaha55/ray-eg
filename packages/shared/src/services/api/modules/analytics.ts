import { backendGet } from '../httpClient';
import { normalizeShopFromBackend } from '../normalizers';

export async function getSystemAnalyticsViaBackendWithFallback(mockDb: any) {
  try {
    return await backendGet<any>('/api/v1/analytics/system');
  } catch {
    return await mockDb.getSystemAnalytics();
  }
}

export async function getSystemAnalyticsTimeseriesViaBackendWithFallback(days: number = 7, mockDb: any) {
  try {
    return await backendGet<any[]>(`/api/v1/analytics/system/timeseries?days=${encodeURIComponent(String(days))}`);
  } catch {
    const stats = await mockDb.getSystemAnalytics();
    const safeDays = Math.min(Math.max(Number(days) || 7, 1), 90);
    const avg = Number(stats?.totalRevenue || 0) / safeDays;
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (safeDays - 1));
    const out: any[] = [];
    for (let i = 0; i < safeDays; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push({
        date: d.toISOString().slice(0, 10),
        revenue: avg,
        orders: 0,
      });
    }
    return out;
  }
}

export async function getSystemActivityViaBackend(limit: number = 10) {
  try {
    return await backendGet<any[]>(`/api/v1/analytics/system/activity?limit=${encodeURIComponent(String(limit))}`);
  } catch {
    return [];
  }
}

export async function getPendingShopsViaBackend() {
  const shops = await backendGet<any[]>('/api/v1/shops/admin/list?status=PENDING');
  return shops.map(normalizeShopFromBackend);
}
