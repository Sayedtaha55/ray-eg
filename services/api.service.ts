import { Shop, Product, Offer, Reservation, Category, ShopGallery } from '../types';
import { MOCK_SHOPS } from '../constants';

// Mock implementation since we removed Supabase
class MockDatabase {
  private shops = (MOCK_SHOPS as any[]).map((s) => ({
    ...s,
    status: s.status ?? 'approved',
    // aliases for older code paths using snake_case
    logo_url: s.logo_url ?? s.logoUrl,
    banner_url: s.banner_url ?? s.bannerUrl ?? s.pageDesign?.bannerUrl,
  }));
  private messages: any[] = [];
  private notifications: any[] = [];
  private offers: any[] = [];
  private products: any[] = [];
  private users: any[] = [];
  private reservations: any[] = [];
  private orders: any[] = [];
  private shopGallery: any[] = [];
  private themes: any[] = [];
  private analytics: any = {
    totalRevenue: 125000,
    totalUsers: 8432,
    totalShops: 156,
    totalOrders: 3421
  };
  private shopAnalytics: Record<string, any> = {};

  // Auth methods
  async login(email: string, pass: string) {
    // Mock login - in real app, use JWT
    if ((email === 'admin' && pass === '1234') || (email === 'admin@ray.com' && pass === 'admin123')) {
      return {
        user: { id: 'admin', email: email, name: 'Admin', role: 'admin' },
        session: { access_token: 'mock_token' }
      };
    }
    throw new Error('Invalid credentials');
  }

  private slugify(value: string) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private ensureUniqueSlug(base: string) {
    const baseSlug = this.slugify(base) || `shop-${Date.now()}`;
    let slug = baseSlug;
    let i = 1;
    while (this.shops.some((s: any) => s.slug === slug)) {
      i += 1;
      slug = `${baseSlug}-${i}`;
    }
    return slug;
  }

  async signup(data: any) {
    const userId = Date.now().toString();
    const shopId = data.role === 'merchant' ? `${Date.now().toString()}_shop` : null;

    const user = {
      id: userId,
      email: data.email,
      name: data.name,
      role: data.role,
      shopId
    };

    if (data.role === 'merchant') {
      if (!data.shopName || !data.category || !data.governorate || !data.city) {
        throw new Error('بيانات المحل غير مكتملة');
      }

      const slug = this.ensureUniqueSlug(data.shopName || data.name || `shop-${userId}`);
      const shop: any = {
        id: shopId,
        name: data.shopName,
        slug,
        category: data.category,
        governorate: data.governorate,
        city: data.city,
        email: data.shopEmail || data.email,
        logoUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=200',
        rating: 0,
        followers: 0,
        visitors: 0,
        status: 'pending',
        phone: data.shopPhone || data.phone,
        openingHours: data.openingHours || '',
        addressDetailed: data.addressDetailed || '',
        description: data.shopDescription || '',
        ownerId: userId,
        pageDesign: {
          primaryColor: '#00E5FF',
          layout: 'modern',
          bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
          headerType: 'centered'
        }
      };

      this.shops.push(shop);
    }

    this.users.push(user);
    
    return {
      user,
      session: { access_token: 'mock_token' }
    };
  }

  // Chat methods
  async sendMessage(msg: any) {
    const message = {
      ...msg,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    this.messages.push(message);
    return { error: null };
  }

  async getMessages(shopId: string, userId: string) {
    return this.messages.filter(m => m.shopId === shopId);
  }

  async getMerchantChats(shopId: string) {
    return this.messages.filter(m => m.shopId === shopId);
  }

  subscribeToMessages(shopId: string, callback: (payload: any) => void) {
    // Mock subscription - in real app, use WebSocket
    return {
      unsubscribe: () => {}
    };
  }

  // Notification methods
  subscribeToNotifications(shopId: string, callback: (payload: any) => void) {
    // Mock subscription
    return {
      unsubscribe: () => {}
    };
  }

  async getNotifications(shopId: string) {
    return this.notifications.filter(n => n.shop_id === shopId);
  }

  async markNotificationsRead(shopId: string) {
    this.notifications = this.notifications.map(n => 
      n.shop_id === shopId ? { ...n, is_read: true } : n
    );
    return { error: null };
  }

  // Shop methods
  async getShops(filterStatus: 'approved' | 'pending' | 'rejected' | 'all' | '' = 'approved') {
    if (!filterStatus || filterStatus === 'all') {
      return this.shops;
    }
    return this.shops.filter((s: any) => (s.status ?? 'approved') === filterStatus);
  }

  async updateShopDesign(id: string, designConfig: any) {
    const shopIndex = this.shops.findIndex(s => s.id === id);
    if (shopIndex !== -1) {
      this.shops[shopIndex].pageDesign = designConfig;
    }
    return { error: null };
  }

  async getShopBySlugOrId(slugOrId: string) {
    return this.shops.find(s => s.slug === slugOrId || s.id === slugOrId);
  }

  async getShopBySlug(slug: string) {
    return this.getShopBySlugOrId(slug);
  }

  async updateShopStatus(id: string, status: 'approved' | 'pending' | 'rejected') {
    const shopIndex = this.shops.findIndex(s => s.id === id);
    if (shopIndex !== -1) {
      this.shops[shopIndex].status = status;
    }
    return { error: null };
  }

  async followShop(shopId: string) {
    const shopIndex = this.shops.findIndex(s => s.id === shopId);
    if (shopIndex !== -1) {
      this.shops[shopIndex].followers = (this.shops[shopIndex].followers || 0) + 1;
    }
    return { error: null };
  }

  async incrementVisitors(shopId: string) {
    const shopIndex = this.shops.findIndex(s => s.id === shopId);
    if (shopIndex !== -1) {
      this.shops[shopIndex].visitors = (this.shops[shopIndex].visitors || 0) + 1;
    }
    return { error: null };
  }

  // Offer methods
  async getOffers() {
    return this.offers;
  }

  async createOffer(offerData: any) {
    const offer = {
      ...offerData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    this.offers.push(offer);
    return { error: null };
  }

  async deleteOffer(offerId: string) {
    this.offers = this.offers.filter(o => o.id !== offerId);
    return { error: null };
  }

  async getOfferByProductId(productId: string) {
    return this.offers.find(o => o.product_id === productId);
  }

  // Product methods
  async getProducts(shopId?: string) {
    if (shopId) {
      return this.products.filter(p => p.shop_id === shopId);
    }
    return this.products;
  }

  async getProductById(id: string) {
    return this.products.find(p => p.id === id);
  }

  async addProduct(product: any) {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    this.products.push(newProduct);
    return { error: null };
  }

  async updateProductStock(id: string, stock: number) {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex !== -1) {
      this.products[productIndex].stock = stock;
    }
    return { error: null };
  }

  async deleteProduct(id: string) {
    this.products = this.products.filter(p => p.id !== id);
    return { error: null };
  }

  // Reservation methods
  async getReservations() {
    return this.reservations;
  }

  async addReservation(reservation: any) {
    const r = {
      ...reservation,
      id: reservation.id || Date.now().toString(),
      created_at: reservation.created_at || new Date().toISOString(),
      status: reservation.status || 'pending'
    };
    this.reservations.push(r);
    return { error: null };
  }

  async updateReservationStatus(id: string, status: string) {
    const idx = this.reservations.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.reservations[idx] = { ...this.reservations[idx], status };
    }
    return { error: null };
  }

  // Orders / Sales methods
  async getAllOrders() {
    return this.orders;
  }

  async addSale(sale: any) {
    const o = {
      ...sale,
      id: sale.id || Date.now().toString(),
      created_at: sale.created_at || new Date().toISOString(),
      total: sale.total ?? 0,
      shop_id: sale.shop_id ?? sale.shopId,
      items: sale.items ?? []
    };
    this.orders.push(o);
    return { error: null };
  }

  // Shop analytics / gallery
  async getShopAnalytics(shopId: string) {
    if (!this.shopAnalytics[shopId]) {
      this.shopAnalytics[shopId] = {
        shop_id: shopId,
        revenue: 0,
        ordersCount: 0,
        visitorsCount: 0,
        followersCount: 0
      };
    }
    return this.shopAnalytics[shopId];
  }

  async getShopGallery(shopId: string) {
    return this.shopGallery.filter((img) => img.shop_id === shopId || img.shopId === shopId);
  }

  async addShopGalleryImage(shopId: string, image: any) {
    const entry = {
      ...image,
      id: image.id || Date.now().toString(),
      shop_id: shopId,
      created_at: image.created_at || new Date().toISOString()
    };
    this.shopGallery.push(entry);
    return { error: null };
  }

  async deleteShopGalleryImage(id: string) {
    this.shopGallery = this.shopGallery.filter((img) => img.id !== id);
    return { error: null };
  }

  // User management
  async getAllUsers() {
    return this.users;
  }

  async deleteUser(id: string) {
    this.users = this.users.filter(u => u.id !== id);
    return true;
  }

  async updateUserRole(id: string, role: string) {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      this.users[userIndex].role = role;
    }
    return { error: null };
  }

  // Analytics methods
  async getSystemAnalytics() {
    return this.analytics;
  }

  async getPendingShops() {
    return this.shops.filter(s => s.status === 'pending');
  }

  // Theme methods
  async getThemeTemplates() {
    // Return default themes if no themes in database
    if (this.themes.length === 0) {
      return [
        {
          id: '1',
          name: 'modern',
          displayName: 'عصري',
          description: 'تصميم عصري بألوان زاهية وخطوط واضحة',
          category: 'modern',
          primary: '#00E5FF',
          secondary: '#BD00FF',
          accent: '#000000',
          background: '#FFFFFF',
          text: '#000000',
          fontFamily: 'Inter',
          borderRadius: '1rem'
        },
        {
          id: '2',
          name: 'classic',
          displayName: 'كلاسيكي',
          description: 'تصميم كلاسيكي بألوان هادئة وأنيقة',
          category: 'classic',
          primary: '#2C3E50',
          secondary: '#E74C3C',
          accent: '#34495E',
          background: '#FFFFFF',
          text: '#2C3E50',
          fontFamily: 'Georgia',
          borderRadius: '0.5rem'
        },
        {
          id: '3',
          name: 'minimal',
          displayName: 'بسيط',
          description: 'تصميم بسيط ونظيف بألوان محايدة',
          category: 'minimal',
          primary: '#333333',
          secondary: '#666666',
          accent: '#000000',
          background: '#FFFFFF',
          text: '#333333',
          fontFamily: 'Arial',
          borderRadius: '0.25rem'
        }
      ];
    }
    return this.themes;
  }

  async createTheme(themeData: any) {
    const theme = {
      ...themeData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    this.themes.push(theme);
    return { error: null };
  }

  async updateTheme(id: string, themeData: any) {
    const themeIndex = this.themes.findIndex(t => t.id === id);
    if (themeIndex !== -1) {
      this.themes[themeIndex] = { ...this.themes[themeIndex], ...themeData };
    }
    return { error: null };
  }

  async deleteTheme(id: string) {
    this.themes = this.themes.filter(t => t.id !== id);
    return { error: null };
  }

  // Feedback
  async getFeedback() {
    // Return mock feedback data
    return [
      {
        id: '1',
        userId: 'user1',
        userName: 'أحمد محمد',
        userEmail: 'ahmed@example.com',
        rating: 5,
        comment: 'خدمة ممتازة ومنتجات رائعة!',
        createdAt: new Date().toISOString(),
        status: 'published'
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'فاطمة علي',
        userEmail: 'fatima@example.com',
        rating: 4,
        comment: 'جيد جدا ولكن يمكن تحسين سرعة التوصيل',
        createdAt: new Date().toISOString(),
        status: 'published'
      }
    ];
  }
}

const mockDb = new MockDatabase();

const BACKEND_BASE_URL = ((import.meta as any)?.env?.VITE_BACKEND_URL as string) || 'http://localhost:4000';

async function backendPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      message = data?.message || data?.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

async function loginViaBackend(email: string, pass: string) {
  const data = await backendPost<{ access_token: string; user: any }>(
    '/api/v1/auth/login',
    { email, password: pass },
  );
  return {
    user: data.user,
    session: { access_token: data.access_token },
  };
}

async function signupViaBackend(payload: any) {
  const data = await backendPost<{ access_token: string; user: any }>(
    '/api/v1/auth/signup',
    payload,
  );
  return {
    user: data.user,
    session: { access_token: data.access_token },
  };
}

export const ApiService = {
  // Auth
  login: async (email: string, pass: string) => {
    try {
      return await loginViaBackend(email, pass);
    } catch {
      return await mockDb.login(email, pass);
    }
  },
  signup: async (data: any) => {
    try {
      return await signupViaBackend(data);
    } catch {
      return await mockDb.signup(data);
    }
  },

  // Chat
  sendMessage: mockDb.sendMessage.bind(mockDb),
  getMessages: mockDb.getMessages.bind(mockDb),
  getMerchantChats: mockDb.getMerchantChats.bind(mockDb),
  subscribeToMessages: mockDb.subscribeToMessages.bind(mockDb),

  // Notifications
  subscribeToNotifications: mockDb.subscribeToNotifications.bind(mockDb),
  getNotifications: mockDb.getNotifications.bind(mockDb),
  markNotificationsRead: mockDb.markNotificationsRead.bind(mockDb),

  // Shops
  getShops: mockDb.getShops.bind(mockDb),
  updateShopDesign: mockDb.updateShopDesign.bind(mockDb),
  getShopBySlugOrId: mockDb.getShopBySlugOrId.bind(mockDb),
  getShopBySlug: mockDb.getShopBySlug.bind(mockDb),
  updateShopStatus: mockDb.updateShopStatus.bind(mockDb),
  followShop: mockDb.followShop.bind(mockDb),
  incrementVisitors: mockDb.incrementVisitors.bind(mockDb),

  // Offers
  getOffers: mockDb.getOffers.bind(mockDb),
  createOffer: mockDb.createOffer.bind(mockDb),
  deleteOffer: mockDb.deleteOffer.bind(mockDb),
  getOfferByProductId: mockDb.getOfferByProductId.bind(mockDb),

  // Products
  getProducts: mockDb.getProducts.bind(mockDb),
  getProductById: mockDb.getProductById.bind(mockDb),
  addProduct: mockDb.addProduct.bind(mockDb),
  updateProductStock: mockDb.updateProductStock.bind(mockDb),
  deleteProduct: mockDb.deleteProduct.bind(mockDb),

  // Reservations
  getReservations: mockDb.getReservations.bind(mockDb),
  addReservation: mockDb.addReservation.bind(mockDb),
  updateReservationStatus: mockDb.updateReservationStatus.bind(mockDb),

  // Orders / Sales
  getAllOrders: mockDb.getAllOrders.bind(mockDb),
  addSale: mockDb.addSale.bind(mockDb),
  placeOrder: async (order: { items: any[]; total: number; paymentMethod?: string }) => {
    const sale = {
      totalAmount: order.total,
      items: order.items,
      paymentMethod: order.paymentMethod,
      createdAt: new Date().toISOString(),
    };
    return mockDb.addSale(sale);
  },

  // Shop analytics / gallery
  getShopAnalytics: mockDb.getShopAnalytics.bind(mockDb),
  getShopGallery: mockDb.getShopGallery.bind(mockDb),
  addShopGalleryImage: mockDb.addShopGalleryImage.bind(mockDb),
  deleteShopGalleryImage: mockDb.deleteShopGalleryImage.bind(mockDb),

  // Users
  getAllUsers: mockDb.getAllUsers.bind(mockDb),
  deleteUser: mockDb.deleteUser.bind(mockDb),
  updateUserRole: mockDb.updateUserRole.bind(mockDb),

  // Analytics
  getSystemAnalytics: mockDb.getSystemAnalytics.bind(mockDb),
  getPendingShops: mockDb.getPendingShops.bind(mockDb),

  // Themes
  getThemeTemplates: mockDb.getThemeTemplates.bind(mockDb),
  createTheme: mockDb.createTheme.bind(mockDb),
  updateTheme: mockDb.updateTheme.bind(mockDb),
  deleteTheme: mockDb.deleteTheme.bind(mockDb),

  // Feedback
  getFeedback: mockDb.getFeedback.bind(mockDb),
  saveFeedback: async (feedbackData: any) => {
    // Mock save feedback
    return { error: null };
  }
};
