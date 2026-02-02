import { Category, Shop, Offer, Product, Reservation } from './types';
import { ApiService } from './services/api.service';

export type ReceiptTheme = {
  shopName?: string;
  phone?: string;
  city?: string;
  address?: string;
  logoDataUrl?: string;
  footerNote?: string;
  vatRatePercent?: number;
};

export type NotificationSound = {
  id: string;
  name: string;
  url: string;
};

export const MOCK_SHOPS: Shop[] = [
  
];

export const RayDB = {
  getShops: async () => ApiService.getShops(),
  getOffers: async () => ApiService.getOffers(),
  getProducts: async (shopId?: string) => ApiService.getProducts(shopId),
  getShopBySlug: async (slug: string) => ApiService.getShopBySlug(slug),
  addProduct: async (product: any) => ApiService.addProduct(product),
  getAnalytics: async (shopId: string) => ApiService.getShopAnalytics(shopId),
  getFavorites: () => JSON.parse(localStorage.getItem('ray_favorites') || '[]'),
  getCart: () => {
    try {
      const raw = localStorage.getItem('ray_cart');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  getNotificationSounds: (): NotificationSound[] => {
    try {
      const raw = localStorage.getItem('ray_notification_sounds');
      const parsed = raw ? JSON.parse(raw) : null;
      const arr = Array.isArray(parsed) ? parsed : [];
      const normalized = arr
        .map((s: any) => ({
          id: String(s?.id || ''),
          name: String(s?.name || ''),
          url: String(s?.url || ''),
        }))
        .filter((s: any) => s.id && s.url);

      if (normalized.length > 0) return normalized;
    } catch {
    }

    return [
      {
        id: 'default',
        name: 'الافتراضي',
        url: '/sounds/notif.mp3',
      },
    ];
  },
  syncNotificationSoundsFromPublic: async () => {
    try {
      const res = await fetch('/sounds/manifest.json', { cache: 'no-cache' });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray((data as any)?.sounds) ? (data as any).sounds : [];
      const normalized = (list || [])
        .map((s: any) => ({
          id: String(s?.id || ''),
          name: String(s?.name || ''),
          url: String(s?.url || (s?.file ? `/sounds/${String(s.file).replace(/^\/+/, '')}` : '') || ''),
        }))
        .filter((s: any) => s.id && s.url);

      if (normalized.length === 0) return;
      RayDB.setNotificationSounds(normalized);
    } catch {
    }
  },
  setNotificationSounds: (sounds: NotificationSound[]) => {
    const safe = Array.isArray(sounds) ? sounds : [];
    localStorage.setItem('ray_notification_sounds', JSON.stringify(safe));
    window.dispatchEvent(new Event('notification-sounds-update'));
  },
  addNotificationSound: (sound: { name: string; url: string }) => {
    const name = String(sound?.name || '').trim();
    const url = String(sound?.url || '').trim();
    if (!url) return;
    const next: NotificationSound = {
      id: `${Date.now()}`,
      name: name || 'صوت جديد',
      url,
    };
    const prev = RayDB.getNotificationSounds();
    RayDB.setNotificationSounds([next, ...prev]);
    RayDB.setSelectedNotificationSoundId(next.id);
  },
  getSelectedNotificationSoundId: (): string => {
    try {
      return String(localStorage.getItem('ray_notification_sound_id') || 'default');
    } catch {
      return 'default';
    }
  },
  setSelectedNotificationSoundId: (id: string) => {
    const sid = String(id || '').trim() || 'default';
    localStorage.setItem('ray_notification_sound_id', sid);
    window.dispatchEvent(new Event('notification-sounds-update'));
  },
  getSelectedNotificationSoundUrl: (): string => {
    const id = RayDB.getSelectedNotificationSoundId();
    const sounds = RayDB.getNotificationSounds();
    const found = sounds.find((s) => s.id === id) || sounds[0];
    return String(found?.url || '');
  },
  setCart: (items: any[]) => {
    const safe = Array.isArray(items) ? items : [];
    localStorage.setItem('ray_cart', JSON.stringify(safe));
    window.dispatchEvent(new Event('cart-updated'));
    return safe;
  },
  addToCart: (input: any) => {
    if (!input) return RayDB.getCart();
    const productId = String(input?.productId || input?.id || '').trim();
    const shopId = String(input?.shopId || '').trim();
    if (!productId) return RayDB.getCart();
    const variantSig = (() => {
      const raw = (input as any)?.variantSelection ?? (input as any)?.variant_selection;
      if (!raw || typeof raw !== 'object') return '';
      const typeId = String((raw as any)?.typeId || (raw as any)?.variantId || (raw as any)?.type || (raw as any)?.variant || '').trim();
      const sizeId = String((raw as any)?.sizeId || (raw as any)?.size || '').trim();
      if (!typeId || !sizeId) return '';
      return `${typeId}-${sizeId}`;
    })();
    const addonsSig = (() => {
      const list = Array.isArray((input as any)?.addons) ? (input as any).addons : [];
      const normalized = list
        .map((a: any) => ({
          optionId: String(a?.optionId || a?.id || '').trim(),
          variantId: String(a?.variantId || '').trim(),
        }))
        .filter((a: any) => a.optionId && a.variantId)
        .sort((a: any, b: any) => `${a.optionId}:${a.variantId}`.localeCompare(`${b.optionId}:${b.variantId}`));
      if (normalized.length === 0) return '';
      return normalized.map((a: any) => `${a.optionId}-${a.variantId}`).join('|');
    })();
    const lineId = String(
      input?.lineId || `${shopId || 'unknown'}:${productId}${variantSig ? `:v:${variantSig}` : ''}${addonsSig ? `:a:${addonsSig}` : ''}`,
    );

    const nextItem = {
      ...input,
      id: productId,
      shopId,
      lineId,
      quantity: Math.max(1, Number(input?.quantity) || 1),
      price: Number(input?.price) || 0,
      name: String(input?.name || ''),
      shopName: String(input?.shopName || input?.shop_name || ''),
      addons: Array.isArray((input as any)?.addons) ? (input as any).addons : [],
      variantSelection: (input as any)?.variantSelection ?? (input as any)?.variant_selection ?? null,
    };

    const prev = RayDB.getCart();
    const existing = prev.find((i: any) => String(i?.lineId || `${i?.shopId || 'unknown'}:${i?.id}`) === lineId);
    const merged = existing
      ? prev.map((i: any) => {
          const key = String(i?.lineId || `${i?.shopId || 'unknown'}:${i?.id}`);
          if (key !== lineId) return i;
          const prevQty = Number(i?.quantity) || 0;
          return { ...i, ...nextItem, quantity: prevQty + (Number(nextItem.quantity) || 1) };
        })
      : [...prev, nextItem];

    return RayDB.setCart(merged);
  },
  removeFromCart: (lineId: string) => {
    const key = String(lineId || '').trim();
    if (!key) return RayDB.getCart();
    const prev = RayDB.getCart();
    const filtered = prev.filter((i: any) => String(i?.lineId || `${i?.shopId || 'unknown'}:${i?.id}`) !== key);
    return RayDB.setCart(filtered);
  },
  updateCartItemQuantity: (lineId: string, delta: number) => {
    const key = String(lineId || '').trim();
    if (!key) return RayDB.getCart();
    const d = Number(delta) || 0;
    if (d === 0) return RayDB.getCart();
    const prev = RayDB.getCart();
    const next = prev
      .map((i: any) => {
        const itemKey = String(i?.lineId || `${i?.shopId || 'unknown'}:${i?.id}`);
        if (itemKey !== key) return i;
        const nextQty = Math.max(0, (Number(i?.quantity) || 0) + d);
        return { ...i, quantity: nextQty };
      })
      .filter((i: any) => (Number(i?.quantity) || 0) > 0);
    return RayDB.setCart(next);
  },
  clearCart: () => {
    return RayDB.setCart([]);
  },
  toggleFavorite: (id: string) => {
    const favs = JSON.parse(localStorage.getItem('ray_favorites') || '[]');
    const idx = favs.indexOf(id);
    if (idx === -1) favs.push(id); else favs.splice(idx, 1);
    localStorage.setItem('ray_favorites', JSON.stringify(favs));
    window.dispatchEvent(new Event('ray-db-update'));
    return idx === -1;
  },
  getReceiptTheme: (shopId: string): ReceiptTheme => {
    try {
      const sid = String(shopId || '').trim();
      if (!sid) return {};
      const raw = localStorage.getItem(`ray_receipt_theme:${sid}`);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  },
  setReceiptTheme: (shopId: string, theme: ReceiptTheme) => {
    const sid = String(shopId || '').trim();
    if (!sid) return;
    const safe: ReceiptTheme = theme && typeof theme === 'object' ? theme : {};
    const vatRatePercent = (() => {
      const raw = (safe as any)?.vatRatePercent;
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(n)) return 14;
      return Math.min(100, Math.max(0, n));
    })();
    localStorage.setItem(`ray_receipt_theme:${sid}`,
      JSON.stringify({
        shopName: safe.shopName || '',
        phone: safe.phone || '',
        city: safe.city || '',
        address: safe.address || '',
        logoDataUrl: safe.logoDataUrl || '',
        footerNote: safe.footerNote || '',
        vatRatePercent,
      })
    );
    window.dispatchEvent(new Event('receipt-theme-update'));
  },
  followShop: async (shopId: string) => ApiService.followShop(shopId),
  updateProductStock: async (id: string, stock: number) => ApiService.updateProductStock(id, stock),
  addSale: async (sale: any) => ApiService.addSale(sale),
  getReservations: async () => ApiService.getReservations(),
  addReservation: async (res: Reservation) => ApiService.addReservation(res),
  getProductById: async (id: string) => ApiService.getProductById(id),
  getOfferByProductId: async (productId: string) => ApiService.getOfferByProductId(productId),
  incrementVisitors: async (shopId: string) => {
     const sid = String(shopId || '').trim();
     if (!sid) return;
     try {
       const key = `ray_visit:${sid}`;
       const lastRaw = sessionStorage.getItem(key);
       const last = lastRaw ? Number(lastRaw) : 0;
       const now = Date.now();
       if (Number.isFinite(last) && last > 0 && now - last < 5 * 60 * 1000) {
         return;
       }
       sessionStorage.setItem(key, String(now));
     } catch {
       // ignore
     }

     await ApiService.incrementVisitors(sid);
  }
};
