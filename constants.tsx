
import { Category, Shop, Offer, Product, Reservation } from './types';
import { ApiService } from './services/api.service';

/**
 * MOCK_SHOPS: Required for pages that rely on static shop list filtering.
 */
export const MOCK_SHOPS: Shop[] = [];

/**
 * RayDB: تم تحويله ليكون جسراً (Bridge) يستدعي ApiService السحابي.
 * هذا يضمن عدم كسر الكود الموجود في المكونات (UI Components).
 */

export const RayDB = {
  getShops: async () => ApiService.getShops(),
  getOffers: async () => ApiService.getOffers(),
  getProducts: async () => ApiService.getProducts(),
  
  // دالة التهيئة لم تعد ضرورية مع Supabase ولكن نتركها للتوافق
  init: () => ({ shops: [], offers: [], products: [], reservations: [], sales: [] }),

  getShopBySlug: async (slug: string) => {
    const shops = await ApiService.getShops();
    return shops.find(s => s.slug === slug || s.id === slug);
  },

  // سيتم استدعاء هذه الدوال مباشرة من واجهة التاجر باستخدام ApiService
  addProduct: async (product: any, discount: number) => {
    return ApiService.addProduct(product);
  },

  incrementVisitors: async (shopId: string) => {
    // في Supabase نستخدم RPC أو Increment
    console.log('Incrementing visitors for', shopId);
  },

  getAnalytics: (shopId: string) => {
    // سيتم جلب التحليلات الحقيقية من Supabase في MerchantDashboard
    return { revenueToday: 0, totalRevenue: 0, salesCountToday: 0, totalOrders: 0, chartData: [] };
  },

  getFavorites: () => JSON.parse(localStorage.getItem('ray_favorites') || '[]'),
  toggleFavorite: (id: string) => {
    const favs = JSON.parse(localStorage.getItem('ray_favorites') || '[]');
    const idx = favs.indexOf(id);
    if (idx === -1) favs.push(id); else favs.splice(idx, 1);
    localStorage.setItem('ray_favorites', JSON.stringify(favs));
    window.dispatchEvent(new Event('ray-db-update'));
    return idx === -1;
  },

  // Missing methods added to bridge with ApiService
  followShop: async (shopId: string) => ApiService.followShop(shopId),
  updateProductStock: async (id: string, stock: number) => ApiService.updateProductStock(id, stock),
  addSale: async (sale: any) => ApiService.addSale(sale),
  getReservations: async () => ApiService.getReservations(),
  addReservation: async (res: Reservation) => ApiService.addReservation(res),
  getProductById: async (id: string) => {
    const products = await ApiService.getProducts();
    return products.find(p => p.id === id);
  },
  getOfferByProductId: async (productId: string) => {
    const offers = await ApiService.getOffers();
    return offers.find(o => o.id === productId);
  }
};
