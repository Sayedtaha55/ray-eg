import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Search, User, Sparkles, Bell, Heart, ShoppingCart, Menu, X, LogOut, Info, PlusCircle, Home, Facebook, Mail, Phone } from 'lucide-react';
const RayAssistant = React.lazy(() => import('@/components/pages/shared/RayAssistant'));
const CartDrawer = React.lazy(() => import('@/components/pages/shared/CartDrawer'));
import { motion, AnimatePresence } from 'framer-motion';
import { RayDB } from '@/constants';
import BrandLogo from '@/components/common/BrandLogo';
import { ApiService } from '@/services/api.service';
import { useCartSound } from '@/hooks/useCartSound';
import { CartIconWithAnimation } from '@/components/common/CartIconWithAnimation';

const { Link, Outlet, useLocation, useNavigate } = ReactRouterDOM as any;

const PublicLayout: React.FC = () => {
  const WhatsAppIcon = (props: { size?: number }) => {
    const s = typeof props?.size === 'number' ? props.size : 18;
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 2C6.477 2 2 6.145 2 11.26c0 2.007.688 3.866 1.86 5.367L3 22l5.633-1.76c1.413.747 3.046 1.172 4.367 1.172 5.523 0 10-4.145 10-9.26C23 6.145 17.523 2 12 2Z"
          fill="currentColor"
          opacity="0.22"
        />
        <path
          d="M12 3.5c4.66 0 8.5 3.46 8.5 7.76 0 4.3-3.84 7.76-8.5 7.76-1.25 0-2.81-.39-4.1-1.12l-.42-.24-3.25 1.02.92-3.06-.27-.4C4.13 14.2 3.5 12.78 3.5 11.26 3.5 6.96 7.34 3.5 12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M9.4 8.5c-.2-.45-.4-.47-.58-.48h-.5c-.17 0-.45.06-.68.3-.23.25-.9.86-.9 2.09 0 1.23.92 2.42 1.05 2.59.13.17 1.78 2.72 4.34 3.7 2.13.82 2.56.66 3.02.62.46-.04 1.5-.6 1.71-1.18.21-.57.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3-.25-.13-1.5-.71-1.73-.8-.23-.09-.4-.13-.57.13-.17.26-.66.8-.81.96-.15.17-.3.19-.56.06-.25-.13-1.07-.38-2.03-1.2-.75-.63-1.25-1.4-1.4-1.64-.15-.25-.02-.38.12-.5.11-.1.25-.26.38-.39.13-.13.17-.22.25-.37.08-.15.04-.28-.02-.39-.06-.11-.52-1.23-.72-1.68Z"
          fill="currentColor"
        />
      </svg>
    );
  };

  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [authPrompt, setAuthPrompt] = useState<{ open: boolean; message: string; returnTo: string }>(() => ({
    open: false,
    message: 'قبل أي عملية لازم تسجل حساب.',
    returnTo: '/',
  }));
  const location = useLocation();
  const navigate = useNavigate();
  const { playSound } = useCartSound();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    const checkAuth = () => {
      const savedUser = localStorage.getItem('ray_user');
      if (savedUser) setUser(JSON.parse(savedUser));
      else setUser(null);
    };
    checkAuth();
    const handleAddToCart = (e: any) => {
      RayDB.addToCart(e.detail);
      const skipSound = Boolean(e?.detail && (e.detail.__skipSound || e.detail.__soundPlayed));
      if (!skipSound) playSound();
      setCartOpen(true);
    };
    const syncCart = () => {
      setCartItems(RayDB.getCart());
    };
    syncCart();
    window.addEventListener('add-to-cart', handleAddToCart);
    window.addEventListener('cart-updated', syncCart);
    window.addEventListener('auth-change', checkAuth);

    const onAuthRequired = (e: any) => {
      const detail = e?.detail || {};
      const msg = String(detail?.message || '').trim() || 'قبل أي عملية لازم تسجل حساب.';
      const returnTo = String(detail?.returnTo || '').trim() || `${window.location.pathname}${window.location.search || ''}`;
      setAuthPrompt({ open: true, message: msg, returnTo });
    };
    window.addEventListener('ray-auth-required', onAuthRequired as any);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('add-to-cart', handleAddToCart);
      window.removeEventListener('cart-updated', syncCart);
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('ray-auth-required', onAuthRequired as any);
    };
  }, [playSound]);

  useEffect(() => {
    const role = String(user?.role || '').toLowerCase();
    if (!user || role === 'merchant') {
      setUnreadCount(0);
      return;
    }

    let stopped = false;
    let lastId: string | null = null;
    let paused = typeof document !== 'undefined' ? document.visibilityState === 'hidden' : false;

    const pollUnread = async () => {
      if (stopped || paused) return;
      try {
        const res = await ApiService.getMyUnreadNotificationsCount();
        setUnreadCount(typeof res?.count === 'number' ? res.count : Number(res?.count || 0));
      } catch {
      }
    };

    const pollLatest = async () => {
      if (stopped || paused) return;
      try {
        const list = await ApiService.getMyNotifications({ take: 1 });
        const first = Array.isArray(list) && list.length > 0 ? list[0] : null;
        const id = first?.id ? String(first.id) : null;
        if (id && id !== lastId) {
          lastId = id;
          pollUnread();
        }
      } catch {
      }
    };

    pollUnread();
    pollLatest();
    const timer = setInterval(() => {
      pollUnread();
      pollLatest();
    }, 20000);

    const onVisibility = () => {
      paused = document.visibilityState === 'hidden';
      if (!paused) {
        pollUnread();
        pollLatest();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [user?.id, user?.role]);

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch {
    }
    localStorage.removeItem('ray_user');
    localStorage.removeItem('ray_token');
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const removeFromCart = (lineId: string) => {
    RayDB.removeFromCart(lineId);
  };

  const updateCartItemQuantity = (lineId: string, delta: number) => {
    RayDB.updateCartItemQuantity(lineId, delta);
  };

  const pathname = String(location?.pathname || '');
  const hideCartButton = pathname.startsWith('/shop/') || pathname.startsWith('/s/');

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A] selection:bg-[#00E5FF] selection:text-black font-sans">
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-in-out px-4 md:px-8 ${
          scrolled ? 'py-2 md:py-4' : 'py-4 md:py-8'
        }`}
      >
        <div 
          className={`max-w-[1400px] mx-auto h-16 md:h-20 rounded-[1.2rem] md:rounded-[2.5rem] transition-all duration-700 flex items-center justify-between px-3 md:px-10 ${
            scrolled 
              ? 'glass shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-white/50' 
              : 'bg-white/60 border-transparent'
          }`}
        >
          <Link to="/" className="flex items-center gap-2 md:gap-4">
            <BrandLogo variant="public" iconOnly name="" />
            <span className="text-xl md:text-3xl font-black tracking-tighter uppercase hidden sm:block ray-glow float-animation inline-block bg-gradient-to-r from-[#00E5FF] via-[#BD00FF] to-[#00E5FF] bg-[length:200%_200%] text-transparent bg-clip-text transition-transform duration-300 hover:scale-[1.06]">من مكانك</span>
          </Link>

          <div className="hidden lg:flex flex-1 items-center gap-6 max-w-2xl mx-8">
            <div onClick={() => setAssistantOpen(true)} className="flex-1 group">
              <div className="relative flex items-center bg-slate-100/60 hover:bg-white rounded-[1.5rem] px-6 py-3 border border-transparent hover:border-[#00E5FF]/30 cursor-pointer transition-all duration-500">
                <Sparkles className="w-4 h-4 text-[#00E5FF] ml-3" />
                <span className="text-slate-400 text-xs font-semibold truncate mr-2">ابحث عن أقوى العروض الآن...</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-4">
            {!hideCartButton && (
              <button 
                onClick={() => setCartOpen(true)}
                className="relative hidden md:flex w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 items-center justify-center hover:bg-slate-100 group transition-all"
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-hover:text-black" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-[#BD00FF] text-white text-[8px] md:text-[10px] font-black rounded-full flex items-center justify-center ring-2 md:ring-4 ring-white">
                    {cartItems.length}
                  </span>
                )}
              </button>
            )}
            {user && String(user?.role || '').toLowerCase() !== 'merchant' && (
              <button
                onClick={() => navigate('/profile?tab=notifications')}
                className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 group transition-all"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-hover:text-black" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-[8px] md:text-[10px] font-black rounded-full flex items-center justify-center ring-2 md:ring-4 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <div className="h-6 md:h-8 w-[1px] bg-slate-100 mx-1 md:mx-2 hidden sm:block" />
            {user ? (
              <Link to={user.role === 'merchant' ? '/business/dashboard' : '/profile'} className="flex items-center gap-2 md:gap-3 bg-slate-900 text-white pl-3 pr-1 py-1 rounded-full hover:bg-black transition-all">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#00E5FF] text-black font-black flex items-center justify-center text-[10px] md:text-xs">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <span className="text-[10px] md:text-xs font-black hidden md:block">{user.role === 'merchant' ? 'لوحة التحكم' : user.name}</span>
              </Link>
            ) : (
              <Link to="/login" className="bg-[#1A1A1A] text-white px-4 md:px-8 py-2 md:py-3.5 rounded-lg md:rounded-2xl font-black text-[10px] md:text-sm hover:bg-[#00E5FF] hover:text-black transition-all">
                دخول
              </Link>
            )}

            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-900"
              type="button"
              aria-label="فتح القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white z-[120] p-8 flex flex-col shadow-2xl" dir="rtl" >
              <div className="flex justify-between items-center mb-12">
                <span className="text-2xl font-black tracking-tighter uppercase ray-glow float-animation inline-block bg-gradient-to-r from-[#00E5FF] via-[#BD00FF] to-[#00E5FF] bg-[length:200%_200%] text-transparent bg-clip-text transition-transform duration-300 hover:scale-[1.06]">من مكانك</span>
                <button type="button" aria-label="إغلاق القائمة" onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <nav className="flex flex-col gap-6 flex-1">
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="pt-20 md:pt-32 pb-24 lg:pb-0 min-h-screen">
        <Outlet />
      </main>

      <div
        className="fixed bottom-0 left-0 right-0 z-[95] px-4 pb-4 lg:hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] px-2">
            <div className="flex items-stretch justify-between gap-1" dir="rtl">
              <Link
                to="/"
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all ${pathname === '/' || pathname === '' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-black'}`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-black">الرئيسية</span>
              </Link>

              <Link
                to="/dalil"
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all ${pathname.startsWith('/dalil') ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-black'}`}
              >
                <PlusCircle className="w-5 h-5" />
                <span className="text-[10px] font-black">الدليل الشامل</span>
              </Link>

              {!hideCartButton && (
                <div className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all text-slate-500 hover:bg-slate-50 hover:text-black">
                  <CartIconWithAnimation 
                    count={cartItems.length}
                    onClick={() => setCartOpen(true)}
                  />
                  <span className="text-[10px] font-black">السلة</span>
                </div>
              )}

              <Link
                to="/profile"
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all ${pathname.startsWith('/profile') ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-black'}`}
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] font-black">حسابي</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <React.Suspense fallback={null}>
        <RayAssistant isOpen={isAssistantOpen} onClose={() => setAssistantOpen(false)} />
      </React.Suspense>
      <React.Suspense fallback={null}>
        <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} items={cartItems} onRemove={removeFromCart} onUpdateQuantity={updateCartItemQuantity} />
      </React.Suspense>

      <AnimatePresence>
        {authPrompt.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthPrompt((p) => ({ ...p, open: false }))}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[500]"
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[510] w-[92vw] max-w-md"
              dir="rtl"
            >
              <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 md:p-8 text-right">
                <div className="text-slate-900 font-black text-2xl tracking-tight mb-2">يجب تسجل الدخول</div>
                <div className="text-slate-500 font-bold text-sm leading-relaxed mb-6">{authPrompt.message}</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    to={`/signup?returnTo=${encodeURIComponent(authPrompt.returnTo)}`}
                    onClick={() => setAuthPrompt((p) => ({ ...p, open: false }))}
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center"
                  >
                    التسجيل
                  </Link>
                  <Link
                    to="/"
                    onClick={() => setAuthPrompt((p) => ({ ...p, open: false }))}
                    className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm flex items-center justify-center"
                  >
                    الرئيسية
                  </Link>
                </div>

                <div className="mt-4 text-center">
                  <Link
                    to={`/login?returnTo=${encodeURIComponent(authPrompt.returnTo)}`}
                    onClick={() => setAuthPrompt((p) => ({ ...p, open: false }))}
                    className="text-slate-500 font-black text-xs hover:text-slate-900 transition-colors"
                  >
                    عندك حساب؟ تسجيل الدخول
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="bg-[#1A1A1A] text-white pt-16 md:pt-32 pb-24 md:pb-12 mt-16 md:mt-32 rounded-t-[2rem] md:rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Links Section - First on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-16 text-right">
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-widest text-[#00E5FF] mb-6">استكشف</h4>
              <nav className="flex flex-col gap-4 text-slate-300 font-bold text-sm md:text-lg">
                <Link to="/dalil" className="hover:text-white transition-colors">الدليل الشامل</Link>
                <Link to="/about" className="hover:text-white transition-colors">من نحن</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-widest text-[#BD00FF] mb-6">للأعمال</h4>
              <nav className="flex flex-col gap-4 text-slate-300 font-bold text-sm md:text-lg">
                <Link to="/business" className="hover:text-white transition-colors">انضم إلينا</Link>
                {String(user?.role || '').toLowerCase() === 'courier' ? (
                  <Link to="/courier/orders" className="hover:text-white transition-colors">لوحة المندوب</Link>
                ) : null}
              </nav>
            </div>
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-widest text-green-400 mb-6">مساعدة</h4>
              <nav className="flex flex-col gap-4 text-slate-300 font-bold text-sm md:text-lg">
                <Link to="/support" className="hover:text-white transition-colors">مركز المساعدة</Link>
                <Link to="/terms" className="hover:text-white transition-colors">شروط الخدمة</Link>
                <Link to="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                <Link to="/contact" className="hover:text-white transition-colors">تواصل معنا</Link>
              </nav>
            </div>
          </div>

          {/* Brand and Contact Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 text-right">
            <div>
              <div className="flex items-center gap-2 mb-6 flex-row-reverse md:justify-end">
                <BrandLogo variant="business" iconOnly />
                <span className="text-2xl font-black tracking-tighter uppercase">من مكانك</span>
              </div>
              <p className="text-slate-400 max-w-sm text-base md:text-xl font-medium mb-6">نحن في مرحلة التجربة. شكراً لثقتكم بنا في بناء مستقبل التسوق في مصر.</p>
            </div>

            <div className="space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="font-black text-[10px] uppercase tracking-widest text-white mb-4">تواصل معنا</h4>
                <a href="mailto:mnmknk.eg@gmail.com" className="flex items-center gap-3 flex-row-reverse text-slate-300 hover:text-white transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10">
                    <Mail size={16} />
                  </span>
                  <span className="font-bold text-sm md:text-base">mnmknk.eg@gmail.com</span>
                </a>
                <a href="tel:01067461059" className="flex items-center gap-3 flex-row-reverse text-slate-300 hover:text-white transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10">
                    <Phone size={16} />
                  </span>
                  <span className="font-bold text-sm md:text-base">01067461059</span>
                </a>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 flex-row-reverse md:justify-end">
                <a
                  href="mailto:mnmknk.eg@gmail.com"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-[#00E5FF]/40 hover:bg-white/15 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(0,229,255,0.25)]"
                  aria-label="Gmail"
                >
                  <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
                <a
                  href="https://wa.me/201067461059"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-emerald-400/40 hover:bg-white/15 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(16,185,129,0.25)]"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon size={16} />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61587556276694"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-blue-400/40 hover:bg-white/15 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(96,165,250,0.25)]"
                  aria-label="Facebook"
                >
                  <Facebook size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const MobileNavItem: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick: () => void }> = ({ to, icon, label, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all text-xl font-black text-slate-900">
    <span className="text-slate-300">{icon}</span> {label}
  </Link>
);

const NavButton: React.FC<{ to: string, icon: React.ReactNode, label: string, active?: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${active ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-black hover:bg-slate-50'}`}>
    {icon} <span>{label}</span>
  </Link>
);

export default PublicLayout;
