import { ApiService } from '@/services/api.service';

export type DataLoaderContext = {
  shopId: string;
  now: Date;
  salesFrom: Date;
  analyticsFrom: Date;
};

export type DataLoaderResult = {
  sales?: any[];
  products?: any[];
  reservations?: any[];
  analytics?: any;
  notifications?: any[];
  activeOffers?: any[];
  galleryImages?: any[];
};

export type DataLoader = (ctx: DataLoaderContext) => Promise<DataLoaderResult>;

const SALES_TABS = new Set(['sales', 'quotes', 'loyalty', 'subscriptions', 'epayment', 'orderStatus', 'returns', 'abandonedCart']);

export const tabDataLoaders: Record<string, DataLoader> = {
  products: async (ctx) => {
    const list = await (ApiService as any).getProductsForManage(ctx.shopId);
    return { products: list };
  },
  reservations: async (ctx) => {
    const list = await (ApiService as any).loadBookingDashboardRecords?.(ctx.shopId);
    return { reservations: list };
  },
  sales: async (ctx) => {
    const list = await ApiService.getAllOrders({ shopId: ctx.shopId, from: ctx.salesFrom.toISOString(), to: ctx.now.toISOString() });
    return { sales: list };
  },
  overview: async (ctx) => {
    const [notif, analytics] = await Promise.all([
      ApiService.getNotifications(ctx.shopId),
      ApiService.getShopAnalytics(ctx.shopId, { from: ctx.analyticsFrom.toISOString(), to: ctx.now.toISOString() }),
    ]);
    return { notifications: (notif || []).slice(0, 5), analytics };
  },
  reports: async (ctx) => {
    const [orders, analytics, reservations] = await Promise.all([
      ApiService.getAllOrders({ shopId: ctx.shopId, from: ctx.salesFrom.toISOString(), to: ctx.now.toISOString() }),
      ApiService.getShopAnalytics(ctx.shopId, { from: ctx.analyticsFrom.toISOString(), to: ctx.now.toISOString() }),
      (ApiService as any).loadBookingDashboardRecords?.(ctx.shopId) || [],
    ]);
    return { sales: orders, analytics, reservations };
  },
  promotions: async (ctx) => {
    const offers = await ApiService.getOffers();
    return { activeOffers: (offers || []).filter((o: any) => o.shopId === ctx.shopId) };
  },
  gallery: async (ctx) => {
    const images = await ApiService.getShopGallery(ctx.shopId);
    return { galleryImages: images || [] };
  },
};

export function getTabDataLoader(tab: string): DataLoader | undefined {
  if (SALES_TABS.has(tab)) return tabDataLoaders.sales;
  return tabDataLoaders[tab];
}
