import { Shop, Product, Offer, Reservation, Category, ShopGallery } from '../types';
import { MOCK_SHOPS } from '../constants';

// Mock implementation since we removed Supabase
class MockDatabase {
  private shops = MOCK_SHOPS;
  private messages: any[] = [];
  private notifications: any[] = [];
  private offers: any[] = [];
  private products: any[] = [];
  private users: any[] = [];

  // Auth methods
  async login(email: string, pass: string) {
    // Mock login - in real app, use JWT
    if (email === 'admin@ray.com' && pass === 'admin123') {
      return {
        user: { id: 'admin', email: 'admin@ray.com', name: 'Admin', role: 'admin' },
        session: { access_token: 'mock_token' }
      };
    }
    throw new Error('Invalid credentials');
  }

  async signup(data: any) {
    const user = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: data.role,
      shopId: data.role === 'merchant' ? Date.now().toString() : null
    };

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
  async getShops(filterStatus: 'approved' | 'pending' | 'rejected' = 'approved') {
    return this.shops.filter(s => s.status === filterStatus);
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
}

const mockDb = new MockDatabase();

export const ApiService = {
  // Auth
  login: mockDb.login.bind(mockDb),
  signup: mockDb.signup.bind(mockDb),

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

  // Users
  getAllUsers: mockDb.getAllUsers.bind(mockDb),
  deleteUser: mockDb.deleteUser.bind(mockDb),
  updateUserRole: mockDb.updateUserRole.bind(mockDb),
};
