// Mock implementation since we removed Supabase
class MockDatabase {
  private shops: any[] = [];
  private messages: any[] = [];
  private knownMessageIds: Set<string> = new Set();
  private messageSubscribers: Record<string, Set<(payload: any) => void>> = {};
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
    totalOrders: 850,
    totalCustomers: 1200,
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    customerGrowth: 15.2
  };
  private shopAnalytics: Record<string, any> = {};

  constructor() {
    this.loadMessagesFromStorage();
  }

  private normalizeStoredMessage(msg: any) {
    const shopIdRaw = msg?.shopId ?? msg?.shop_id;
    const role = msg?.role;
    const sender_id = msg?.sender_id ?? msg?.senderId;
    const sender_name = msg?.sender_name ?? msg?.senderName;
    const content = msg?.content ?? msg?.text ?? '';
    const created_at = msg?.created_at ?? msg?.createdAt ?? new Date().toISOString();
    const userId = msg?.userId ?? msg?.user_id ?? (role === 'customer' ? sender_id : undefined);

    const shopId = shopIdRaw != null ? String(shopIdRaw) : '';
    const normalizedSenderId = sender_id != null ? String(sender_id) : '';
    const normalizedUserId = userId != null ? String(userId) : undefined;

    if (!shopId || !normalizedSenderId || !role) return null;

    return {
      id: String(msg?.id ?? Date.now().toString()),
      shopId,
      userId: normalizedUserId,
      sender_id: normalizedSenderId,
      sender_name,
      role,
      content,
      created_at,
    };
  }

  private loadMessagesFromStorage() {
    try {
      const raw = localStorage.getItem('ray_mock_messages');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.messages = parsed
          .map((m: any) => this.normalizeStoredMessage(m))
          .filter(Boolean);
        this.knownMessageIds = new Set(this.messages.map((m: any) => String(m.id)));
        this.saveMessagesToStorage();
      }
    } catch {
      // ignore
    }
  }

  private saveMessagesToStorage() {
    try {
      localStorage.setItem('ray_mock_messages', JSON.stringify(this.messages));
    } catch {
      // ignore
    }
  }

  // Auth methods
  async login(email: string, pass: string) {
    // Mock login - in real app, use JWT
    if (
      (email === 'admin' && pass === '1234') ||
      (email === 'admin@ray.com' && pass === 'admin123') ||
      (email === 'admin@mnmknk.com' && pass === 'admin123')
    ) {
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
    const shopId = msg?.shopId ?? msg?.shop_id;
    const role = msg?.role;
    const sender_id = msg?.sender_id ?? msg?.senderId;
    const sender_name = msg?.sender_name ?? msg?.senderName;
    const content = msg?.content ?? msg?.text ?? '';

    const userId = (() => {
      if (msg?.userId) return msg.userId;
      if (role === 'customer') return sender_id;
      return undefined;
    })();

    const message = {
      id: Date.now().toString(),
      shopId: shopId != null ? String(shopId) : shopId,
      userId: userId != null ? String(userId) : userId,
      sender_id: sender_id != null ? String(sender_id) : sender_id,
      sender_name,
      role,
      content,
      created_at: new Date().toISOString(),
    };

    this.messages.push(message);
    this.knownMessageIds.add(String(message.id));
    this.saveMessagesToStorage();

    if (shopId && this.messageSubscribers[shopId]) {
      for (const cb of this.messageSubscribers[shopId]) {
        try {
          cb(message);
        } catch {
          // ignore
        }
      }
    }

    return { error: null };
  }

  async getMessages(shopId: string, userId: string) {
    const sid = String(shopId);
    const uid = String(userId);
    return this.messages.filter(m => String(m.shopId ?? m.shop_id) === sid && String(m.userId ?? m.user_id) === uid);
  }

  async getMerchantChats(shopId: string) {
    const sid = String(shopId);
    const shopMessages = this.messages
      .map((m: any) => this.normalizeStoredMessage(m) || null)
      .filter(Boolean)
      .filter((m: any) => String(m.shopId) === sid && m.userId);
    const byUserId: Record<string, any[]> = {};
    for (const m of shopMessages) {
      const uid = String(m.userId);
      if (!byUserId[uid]) byUserId[uid] = [];
      byUserId[uid].push(m);
    }

    const chats = Object.entries(byUserId).map(([userId, msgs]) => {
      const sorted = msgs.slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const last = sorted[sorted.length - 1];
      const customerMsg = sorted.find(m => m.role === 'customer');
      return {
        userId,
        userName: customerMsg?.sender_name || 'عميل',
        lastMessage: last?.content || '',
        lastMessageAt: last?.created_at,
      };
    });

    return chats.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
  }

  subscribeToMessages(shopId: string, callback: (payload: any) => void) {
    if (!this.messageSubscribers[shopId]) {
      this.messageSubscribers[shopId] = new Set();
    }
    this.messageSubscribers[shopId].add(callback);

    const onStorage = (e: StorageEvent) => {
      try {
        if (e.key !== 'ray_mock_messages' || !e.newValue) return;
        const parsed = JSON.parse(e.newValue);
        if (!Array.isArray(parsed)) return;
        const normalized = parsed
          .map((m: any) => this.normalizeStoredMessage(m))
          .filter(Boolean);

        for (const m of normalized) {
          const id = String(m.id);
          if (this.knownMessageIds.has(id)) continue;
          this.knownMessageIds.add(id);
          this.messages.push(m);
          if (m.shopId === shopId) {
            try {
              callback(m);
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // ignore
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }

    return {
      unsubscribe: () => {
        this.messageSubscribers[shopId]?.delete(callback);
        if (typeof window !== 'undefined') {
          window.removeEventListener('storage', onStorage);
        }
      }
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

  // Customer management
  private customers: any[] = [];

  async getShopCustomers(shopId: string) {
    return this.customers.filter(c => c.shopId === shopId);
  }

  async convertReservationToCustomer(customerData: any) {
    // Check if customer already exists
    const existingCustomer = this.customers.find(c => 
      c.shopId === customerData.shopId && 
      (c.phone === customerData.customerPhone || c.email === customerData.customerEmail)
    );

    if (existingCustomer) {
      // Update existing customer
      existingCustomer.orders += 1;
      existingCustomer.totalSpent += customerData.firstPurchaseAmount || 0;
      existingCustomer.lastPurchaseDate = new Date().toISOString();
      existingCustomer.lastPurchaseItem = customerData.firstPurchaseItem;
      return existingCustomer;
    } else {
      // Create new customer
      const customer = {
        id: Date.now().toString(),
        name: customerData.customerName,
        phone: customerData.customerPhone,
        email: customerData.customerEmail,
        shopId: customerData.shopId,
        convertedFromReservation: true,
        createdAt: new Date().toISOString(),
        lastPurchaseDate: new Date().toISOString(),
        firstPurchaseItem: customerData.firstPurchaseItem,
        orders: 1,
        totalSpent: customerData.firstPurchaseAmount || 0,
        status: 'active'
      };
      this.customers.push(customer);
      return customer;
    }
  }

  async updateCustomerStatus(customerId: string, status: string) {
    const customer = this.customers.find(c => c.id === customerId);
    if (customer) {
      customer.status = status;
      return customer;
    }
    throw new Error('Customer not found');
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

export const mockDb = new MockDatabase();
