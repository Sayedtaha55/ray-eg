'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { useT } from '@/i18n/useT';
import PublicNav from '@/components/client/public/PublicNav';
import PublicFooter from '@/components/server/public/PublicFooter';
import CartDrawer from '@/components/client/public/CartDrawer';
import FeedbackWidget from '@/components/client/public/FeedbackWidget';
import RayAssistant from '@/components/client/public/RayAssistant';

interface NavUser {
  id: string;
  name?: string;
  email?: string;
  role: string;
  shopId?: string;
}

export default function PublicLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const localeSeg = pathname?.split('/')?.[1];
  const activeLocale: Locale = isValidLocale(localeSeg || '') ? (localeSeg as Locale) : 'ar';
  const t = useT();
  const [user, setUser] = useState<NavUser | null>(null);
  const [cartItems, setCartItems] = useState<unknown[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isAssistantOpen, setAssistantOpen] = useState(false);

  // Read user from cookie (set by our auth flow) or localStorage fallback
  useEffect(() => {
    const readUser = () => {
      // Try cookie first (Next.js middleware sets these)
      const role = document.cookie
        .split('; ')
        .find((row) => row.startsWith('ray_role='))
        ?.split('=')[1];
      const userId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('ray_user_id='))
        ?.split('=')[1];
      const userName = document.cookie
        .split('; ')
        .find((row) => row.startsWith('ray_user_name='))
        ?.split('=')[1];
      const shopId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('ray_shop_id='))
        ?.split('=')[1];

      if (userId && role) {
        setUser({
          id: userId,
          name: userName ? decodeURIComponent(userName) : undefined,
          role,
          shopId: shopId || undefined,
        });
        return;
      }

      // Fallback: localStorage (backward compat with Vite app)
      try {
        const stored = localStorage.getItem('ray_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id) {
            setUser(parsed);
            return;
          }
        }
      } catch {}
      setUser(null);
    };

    readUser();
    window.addEventListener('auth-change', readUser);
    return () => window.removeEventListener('auth-change', readUser);
  }, []);

  // Cart sync
  useEffect(() => {
    const syncCart = () => {
      try {
        // RayDB is not yet migrated — use localStorage as interim
        const cart = localStorage.getItem('ray_cart');
        if (cart) {
          const parsed = JSON.parse(cart);
          setCartItems(Array.isArray(parsed) ? parsed : []);
        }
      } catch {
        setCartItems([]);
      }
    };
    syncCart();
    window.addEventListener('cart-updated', syncCart);
    window.addEventListener('storage', syncCart);
    return () => {
      window.removeEventListener('cart-updated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/clear-cookie', { method: 'POST' });
    } catch {}
    try {
      localStorage.removeItem('ray_token');
      localStorage.removeItem('ray_user');
    } catch {}
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = `/${activeLocale}`;
  }, []);

  const handleAssistantOpen = useCallback(() => {
    setAssistantOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A] selection:bg-[#00E5FF] selection:text-black font-sans">
      <PublicNav
        user={user}
        cartCount={cartItems.length}
        unreadCount={unreadCount}
        onCartOpen={() => setCartOpen(true)}
        onAssistantOpen={handleAssistantOpen}
        onLogout={handleLogout}
      />

      <main className="pt-20 md:pt-28 pb-24 md:pb-8">
        {children}
      </main>

      <PublicFooter />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />

      {/* Feedback Widget */}
      <FeedbackWidget />

      {/* Ray Assistant */}
      <RayAssistant isOpen={isAssistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
