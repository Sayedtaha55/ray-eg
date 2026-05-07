'use client';

const CART_KEY = 'ray_cart';

export interface CartItem {
  id: string;
  lineId?: string;
  name: string;
  price: number;
  quantity: number;
  shopId: string;
  shopName: string;
  imageUrl?: string;
  image?: string;
  unit?: string;
  addons?: any[];
  variantSelection?: any;
  packOptions?: any[];
  furnitureMeta?: any;
  selectedColor?: string;
  selectedSize?: any;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export const cartStorage = {
  getCart(): CartItem[] {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CART_KEY) : null;
    const parsed = safeParse<CartItem[]>(raw);
    return Array.isArray(parsed) ? parsed : [];
  },

  setCart(items: CartItem[]) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    try { window.dispatchEvent(new Event('cart-updated')); } catch {}
  },

  addToCart(item: CartItem) {
    const current = cartStorage.getCart();
    const lineId = `${item.shopId}:${item.id}:${Date.now()}`;
    current.push({ ...item, lineId });
    cartStorage.setCart(current);
    return lineId;
  },

  removeFromCart(lineId: string) {
    const current = cartStorage.getCart();
    const next = current.filter((i) => (i.lineId || `${i.shopId}:${i.id}`) !== lineId);
    cartStorage.setCart(next);
  },

  updateCartItemQuantity(lineId: string, delta: number) {
    const current = cartStorage.getCart();
    const next = current.map((i) => {
      const key = i.lineId || `${i.shopId}:${i.id}`;
      if (key === lineId) {
        return { ...i, quantity: Math.max(1, i.quantity + delta) };
      }
      return i;
    });
    cartStorage.setCart(next);
  },

  clearCart() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(CART_KEY);
    try { window.dispatchEvent(new Event('cart-updated')); } catch {}
  },

  getCartCount(): number {
    return cartStorage.getCart().reduce((sum, i) => sum + (i.quantity || 0), 0);
  },
};
