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

// ---------------------------------------------------------------------------
// Shop analytics report pages (backed by Go backend)
// ---------------------------------------------------------------------------

export type AnalyticsReportParams = {
  period?: '7d' | '30d' | '90d';
  timeRange?: string;
  startDate?: string;
  endDate?: string;
};

function buildReportQuery(params?: AnalyticsReportParams): string {
  const qs = new URLSearchParams();
  if (params?.period) qs.set('period', params.period);
  if (params?.timeRange) qs.set('time_range', params.timeRange);
  if (params?.startDate) qs.set('start_date', params.startDate);
  if (params?.endDate) qs.set('end_date', params.endDate);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getConversionsAnalyticsViaBackend(shopId: string, params?: AnalyticsReportParams) {
  return await backendGet<any>(`/api/v1/analytics/shop/${encodeURIComponent(shopId)}/conversions${buildReportQuery(params)}`);
}

export async function getProductPerformanceReportViaBackend(shopId: string, params?: AnalyticsReportParams) {
  return await backendGet<any>(`/api/v1/analytics/shop/${encodeURIComponent(shopId)}/product-performance${buildReportQuery(params)}`);
}

export async function getAnalyticsOverviewViaBackend(shopId: string, params?: AnalyticsReportParams) {
  return await backendGet<any>(`/api/v1/analytics/shop/${encodeURIComponent(shopId)}/overview${buildReportQuery(params)}`);
}

export async function getSalesReportViaBackend(shopId: string, params?: AnalyticsReportParams) {
  return await backendGet<any>(`/api/v1/analytics/shop/${encodeURIComponent(shopId)}/sales-report${buildReportQuery(params)}`);
}

export async function getTrafficAnalyticsViaBackend(shopId: string, params?: AnalyticsReportParams) {
  return await backendGet<any>(`/api/v1/analytics/shop/${encodeURIComponent(shopId)}/traffic${buildReportQuery(params)}`);
}

export async function getCustomerInsightsViaBackend(shopId: string, params?: AnalyticsReportParams) {
  return await backendGet<any>(`/api/v1/analytics/shop/${encodeURIComponent(shopId)}/customer-insights${buildReportQuery(params)}`);
}
