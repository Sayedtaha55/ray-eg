
import { supabase } from './supabase';
import { Shop, Product, Offer, Reservation, Category } from '../types';

export const ApiService = {
  // --- التحقق من الهوية ---
  async login(email: string, pass: string) {
    if (email.toLowerCase() === 'admin' && pass === '1234') {
      const adminUser = {
        id: 'admin-root-001',
        email: 'admin@ray.test',
        name: 'مدير النظام (Root)',
        role: 'admin',
        shopId: null
      };
      localStorage.setItem('ray_user', JSON.stringify(adminUser));
      localStorage.setItem('ray_token', 'root-access-granted');
      window.dispatchEvent(new Event('auth-change'));
      return { user: adminUser, session: { access_token: 'root-access-granted' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: pass,
    });

    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const userData = {
      id: data.user.id,
      email: data.user.email,
      name: profile?.name || 'مستخدم تست',
      role: profile?.role || 'customer',
      shopId: profile?.shop_id
    };

    localStorage.setItem('ray_user', JSON.stringify(userData));
    window.dispatchEvent(new Event('auth-change'));
    return { user: userData, session: data.session };
  },

  async signup(data: any) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email.toLowerCase(),
      password: data.password,
    });

    if (authError) throw authError;

    if (authData.user) {
      let shopId = null;
      if (data.role === 'merchant') {
        const { data: shop, error: shopError } = await supabase
          .from('shops')
          .insert({
            name: data.shopName,
            slug: data.shopName.toLowerCase().replace(/\s+/g, '-'),
            category: data.category,
            governorate: data.governorate,
            city: data.city,
            status: 'pending',
            logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.shopName)}&background=00E5FF`,
          })
          .select().single();

        if (shopError) throw shopError;
        shopId = shop.id;
      }

      await supabase.from('profiles').insert({
        id: authData.user.id,
        name: data.name,
        role: data.role,
        shop_id: shopId
      });
    }
    return { user: authData.user, session: authData.session };
  },

  // --- الإشعارات الحية (Realtime) ---
  subscribeToNotifications(shopId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifs-${shopId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `shop_id=eq.${shopId}` },
        (payload) => callback(payload.new)
      )
      .subscribe();
  },

  async getNotifications(shopId: string) {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async markNotificationsRead(shopId: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('shop_id', shopId);
    return true;
  },

  async addNotification(notif: any) {
    const { data, error } = await supabase.from('notifications').insert({
      shop_id: notif.shopId,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      is_read: false,
      created_at: new Date().toISOString()
    }).select().single();

    if (!error) {
       window.dispatchEvent(new CustomEvent('new-notification', { detail: data }));
    }
    return true;
  },

  // --- الخدمات العامة ---
  async getShops() {
    const { data } = await supabase.from('shops').select('*').eq('status', 'approved');
    return data || [];
  },

  async getOffers() {
    const { data } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  async getProducts(shopId?: string) {
    let query = supabase.from('products').select('*');
    if (shopId) query = query.eq('shop_id', shopId);
    const { data } = await query;
    return data || [];
  },

  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrl;
  },

  async placeOrder(order: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: orderData, error } = await supabase.from('orders').insert({ 
      user_id: user?.id, 
      total: order.total,
      items: order.items,
      status: 'pending',
      created_at: new Date().toISOString() 
    }).select().single();
    
    if (!error && order.items.length > 0) {
      await this.addNotification({
        shopId: order.items[0].shopId,
        title: 'طلب شراء جديد! 💳',
        message: `وصلك طلب بقيمة ج.م ${order.total}`,
        type: 'sale'
      });
    }

    if (error) throw error;
    return true;
  },

  async followShop(shopId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in to follow');
    await supabase.from('follows').insert({ user_id: user.id, shop_id: shopId });
    
    await this.addNotification({
      shopId: shopId,
      title: 'متابع جديد! ✨',
      message: 'أحدهم بدأ بمتابعة محلك الآن',
      type: 'follow'
    });

    return true;
  },

  async updateProductStock(id: string, stock: number) {
    await supabase.from('products').update({ stock }).eq('id', id);
    return true;
  },

  async addProduct(product: any) {
    const { error } = await supabase.from('products').insert({
      shop_id: product.shopId,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image_url: product.imageUrl
    });
    if (error) throw error;
    return true;
  },

  async addSale(sale: any) {
    const { data, error } = await supabase.from('orders').insert({
      shop_id: sale.shopId,
      total: sale.total,
      items: sale.items,
      type: sale.type,
      status: 'completed',
      created_at: new Date(sale.createdAt).toISOString()
    }).select().single();
    
    if (!error) {
      await this.addNotification({
        shopId: sale.shopId,
        title: 'عملية بيع كاشير 💰',
        message: `تم تسجيل بيع بقيمة ج.م ${sale.total.toFixed(0)}`,
        type: 'sale'
      });
    }

    if (error) throw error;
    return true;
  },

  async getReservations() {
    const { data } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  async addReservation(res: Reservation) {
    const { error } = await supabase.from('reservations').insert({
      id: res.id,
      item_id: res.itemId,
      item_name: res.itemName,
      item_image: res.itemImage,
      item_price: res.itemPrice,
      shop_id: res.shopId,
      shop_name: res.shopName,
      customer_name: res.customerName,
      customer_phone: res.customerPhone,
      status: res.status,
      created_at: new Date(res.createdAt).toISOString()
    });

    if (!error) {
      await this.addNotification({
        shopId: res.shopId,
        title: 'حجز جديد! 📅',
        message: `${res.customerName} حجز ${res.itemName}`,
        type: 'reservation'
      });
    }

    if (error) throw error;
    return true;
  },

  async getProductById(id: string) {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    return data;
  },

  async getOfferByProductId(productId: string) {
    const { data } = await supabase.from('offers').select('*').eq('id', productId).single();
    return data;
  },

  async getPendingShops() {
    const { data } = await supabase.from('shops').select('*').eq('status', 'pending');
    return data || [];
  },

  async updateShopStatus(shopId: string, status: 'approved' | 'rejected') {
    const { error } = await supabase.from('shops').update({ status }).eq('id', shopId);
    if (error) throw error;
    return true;
  },

  async getAllUsers() {
    const { data } = await supabase.from('profiles').select('*');
    return data || [];
  },

  async deleteUser(userId: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
    return true;
  },

  async updateUserRole(userId: string, role: string) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
    return true;
  },

  async getAllOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  async saveFeedback(feedback: any) {
    const { error } = await supabase.from('feedback').insert({
      content: feedback.text,
      user_name: feedback.userName || 'Guest',
      user_email: feedback.userEmail || 'guest@test.com',
      created_at: new Date().toISOString()
    });
    return true;
  },

  async getFeedback() {
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  async getSystemAnalytics() {
    const { count: shopsCount } = await supabase.from('shops').select('*', { count: 'exact', head: true });
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { data: sales } = await supabase.from('orders').select('total');
    const totalRevenue = sales?.reduce((acc, s) => acc + (s.total || 0), 0) || 0;

    return {
      totalShops: shopsCount || 0,
      totalUsers: usersCount || 0,
      totalOrders: ordersCount || 0,
      totalRevenue: totalRevenue.toLocaleString(),
    };
  }
};
