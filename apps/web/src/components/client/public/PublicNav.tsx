'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { isValidLocale, type Locale } from '@/i18n/config';
import { switchLocale } from '@/i18n/navigation';
import { useT } from '@/i18n/useT';
import {
  Search,
  User,
  Sparkles,
  Bell,
  Heart,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  Info,
  PlusCircle,
  Home,
  Facebook,
  Mail,
  Phone,
  Globe,
  BookOpen,
  Truck,
} from 'lucide-react';

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.007.688 3.866 1.86 5.367L3 22l5.633-1.76c1.413.747 3.046 1.172 4.367 1.172 5.523 0 10-4.145 10-9.26C23 6.145 17.523 2 12 2Z" fill="currentColor" opacity="0.22" />
      <path d="M12 3.5c4.66 0 8.5 3.46 8.5 7.76 0 4.3-3.84 7.76-8.5 7.76-1.25 0-2.81-.39-4.1-1.12l-.42-.24-3.25 1.02.92-3.06-.27-.4C4.13 14.2 3.5 12.78 3.5 11.26 3.5 6.96 7.34 3.5 12 3.5Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.4 8.5c-.2-.45-.4-.47-.58-.48h-.5c-.17 0-.45.06-.68.3-.23.25-.9.86-.9 2.09 0 1.23.92 2.42 1.05 2.59.13.17 1.78 2.72 4.34 3.7 2.13.82 2.56.66 3.02.62.46-.04 1.5-.6 1.71-1.18.21-.57.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3-.25-.13-1.5-.71-1.73-.8-.23-.09-.4-.13-.57.13-.17.26-.66.8-.81.96-.15.17-.3.19-.56.06-.25-.13-1.07-.38-2.03-1.2-.75-.63-1.25-1.4-1.4-1.64-.15-.25-.02-.38.12-.5.11-.1.25-.26.38-.39.13-.13.17-.22.25-.37.08-.15.04-.28-.02-.39-.06-.11-.52-1.23-.72-1.68Z" fill="currentColor" />
    </svg>
  );
}

interface NavUser {
  id: string;
  name?: string;
  email?: string;
  role: string;
  shopId?: string;
}

interface PublicNavProps {
  user: NavUser | null;
  cartCount: number;
  unreadCount: number;
  onCartOpen: () => void;
  onAssistantOpen: () => void;
  onLogout: () => void;
}

export default function PublicNav({
  user,
  cartCount,
  unreadCount,
  onCartOpen,
  onAssistantOpen,
  onLogout,
}: PublicNavProps) {
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1];
  const activeLocale: Locale = isValidLocale(locale || '') ? (locale as Locale) : 'ar';
  const prefix = `/${activeLocale}`;
  const barePath = pathname?.slice(prefix.length) || '/';
  const isRtl = activeLocale === 'ar';
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFabOpen, setFabOpen] = useState(false);

  const hideCartButton =
    barePath === '/shop' ||
    barePath.startsWith('/shop/') ||
    barePath === '/s' ||
    barePath.startsWith('/s/');

  useEffect(() => {
    let rafId: number | null = null;
    const updateScrolledState = () => {
      rafId = null;
      setScrolled(window.scrollY > 20);
    };
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateScrolledState);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    setFabOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── Top Navbar ──────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
            : 'bg-white/70 backdrop-blur-sm'
        }`}
      >
        <div
          className="max-w-[1400px] mx-auto h-16 md:h-[4.5rem] flex items-center justify-between px-4 md:px-8"
        >
          {/* Logo */}
          <Link href={`${prefix}/`} className="flex items-center gap-2 md:gap-4">
            <Image src="/brand/logo.png" alt="Logo" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10 rounded-xl" />
            <span className="text-xl md:text-3xl font-black tracking-tighter uppercase hidden sm:block ray-glow float-animation inline-block bg-gradient-to-r from-[#00E5FF] via-[#BD00FF] to-[#00E5FF] bg-[length:200%_200%] text-transparent bg-clip-text transition-transform duration-300 hover:scale-[1.06]">
              {t('nav.brand', 'From Your Place')}
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 items-center gap-6 max-w-2xl mx-8">
            <div onClick={() => onAssistantOpen()} className="flex-1 group">
              <div className="relative flex items-center bg-slate-100/60 hover:bg-white rounded-[1.5rem] px-6 py-3 border border-transparent hover:border-[#00E5FF]/30 cursor-pointer transition-all duration-500">
                <Sparkles className="w-4 h-4 text-[#00E5FF] ml-3" />
                <span className="text-slate-400 text-xs font-semibold truncate mr-2">{t('common.search', 'Search with Ray')}</span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            {/* Cart (desktop) */}
            {!hideCartButton && (
              <button
                onClick={onCartOpen}
                className="relative hidden md:flex w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 items-center justify-center hover:bg-slate-100 group transition-all"
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-hover:text-black" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-[#BD00FF] text-white text-[8px] md:text-[10px] font-black rounded-full flex items-center justify-center ring-2 md:ring-4 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Notifications */}
            {user && String(user.role).toLowerCase() !== 'merchant' && (
              <Link
                href={`${prefix}/profile?tab=notifications`}
                className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 group transition-all"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-hover:text-black" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-[8px] md:text-[10px] font-black rounded-full flex items-center justify-center ring-2 md:ring-4 ring-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Language Toggle */}
            <LanguageToggle variant="public" className="hidden sm:flex" />

            <div className="h-6 md:h-8 w-[1px] bg-slate-100 mx-1 md:mx-2 hidden sm:block" />

            {/* User / Login */}
            {user ? (
              <Link
                href={`${prefix}${String(user.role).toLowerCase() === 'merchant' ? '/business' : '/profile'}`}
                className="flex items-center gap-2 md:gap-3 bg-slate-900 text-white pl-2.5 md:pl-3 pr-1 py-1 rounded-full hover:bg-black transition-all max-w-[9.5rem] sm:max-w-none"
              >
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#00E5FF] text-black font-black flex items-center justify-center text-[10px] md:text-xs">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <span className="text-[10px] md:text-xs font-black hidden md:block truncate">
                  {user.role === 'merchant' ? t('nav.controlPanel', 'Control Panel') : user.name}
                </span>
              </Link>
            ) : (
              <Link
                href={`${prefix}/login?role=customer`}
                className="bg-[#1A1A1A] text-white px-4 md:px-8 py-2 md:py-3.5 rounded-lg md:rounded-2xl font-black text-[10px] md:text-sm hover:bg-[#00E5FF] hover:text-black transition-all"
              >
                {t('common.login', 'Log In')}
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-900"
              type="button"
              aria-label={t('common.openMenu', 'Open Menu')}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Slide-out Menu ───────────────────────── */}
      {isMobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] animate-fade-in"
          />
          <div
            className="fixed right-0 top-0 h-full w-[88%] max-w-sm bg-white z-[120] px-5 pt-6 pb-8 sm:p-8 flex flex-col shadow-2xl overflow-y-auto animate-[slideInFromRight_220ms_ease-out]"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="flex justify-between items-center mb-8 gap-3">
              <div className="flex items-center gap-2">
                <Image src="/brand/logo.png" alt="Logo" width={28} height={28} className="w-7 h-7 rounded-lg" />
                <span className="text-2xl font-black tracking-tighter uppercase ray-glow float-animation inline-block bg-gradient-to-r from-[#00E5FF] via-[#BD00FF] to-[#00E5FF] bg-[length:200%_200%] text-transparent bg-clip-text">
                  {t('nav.brand', 'MNMKNK')}
                </span>
              </div>
              <button type="button" aria-label={t('common.close', 'Close')} onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick search */}
            <div className="mb-5 rounded-[1.5rem] bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-400 mb-2">{t('common.quickAccess', 'Quick Access')}</div>
              <button
                type="button"
                onClick={() => {
                  onAssistantOpen();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-right text-slate-700 shadow-sm ring-1 ring-slate-100"
              >
                <span className="font-bold text-sm">{t('common.search', 'Search with Ray')}</span>
                <Sparkles className="w-4 h-4 text-[#00E5FF] shrink-0" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex flex-col gap-2 flex-1">
              <MobileNavItem href={`${prefix}/`} icon={<Home className="w-5 h-5" />} label={t('common.home', 'Home')} onClick={() => setMobileMenuOpen(false)} />
              <MobileNavItem href={`${prefix}/offers`} icon={<Heart className="w-5 h-5" />} label={t('nav.offers', 'Offers')} onClick={() => setMobileMenuOpen(false)} />
              <MobileNavItem href={`${prefix}/map`} icon={<Search className="w-5 h-5" />} label={t('nav.map', 'Map')} onClick={() => setMobileMenuOpen(false)} />
              <MobileNavItem href={`${prefix}/support`} icon={<Info className="w-5 h-5" />} label={t('nav.support', 'Support')} onClick={() => setMobileMenuOpen(false)} />
              <MobileNavItem href={`${prefix}/filter`} icon={<Search className="w-5 h-5" />} label={t('nav.search', 'Search')} onClick={() => setMobileMenuOpen(false)} />
              <MobileNavItem href={`${prefix}/directory`} icon={<Globe className="w-5 h-5" />} label={t('nav.directory', 'Directory')} onClick={() => setMobileMenuOpen(false)} />
              <MobileNavItem href={`${prefix}/blog`} icon={<BookOpen className="w-5 h-5" />} label={t('nav.blog', 'Blog')} onClick={() => setMobileMenuOpen(false)} />
              <MobileNavItem href={`${prefix}/courier`} icon={<Truck className="w-5 h-5" />} label={t('nav.courier', 'Courier')} onClick={() => setMobileMenuOpen(false)} />
              {user ? (
                <>
                  <MobileNavItem
                    href={`${prefix}${String(user.role).toLowerCase() === 'merchant' ? '/business/dashboard' : '/profile'}`}
                    icon={<User className="w-5 h-5" />}
                    label={String(user.role).toLowerCase() === 'merchant' ? t('nav.dashboard', 'Dashboard') : t('nav.myAccount', 'My Account')}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 transition-all text-xl font-black text-red-600 text-right"
                  >
                    <span className="text-red-300"><LogOut className="w-5 h-5" /></span> {t('common.logout', 'Log Out')}
                  </button>
                </>
              ) : (
                <>
                  <MobileNavItem href={`${prefix}/login?role=customer`} icon={<User className="w-5 h-5" />} label={t('common.login', 'Log In')} onClick={() => setMobileMenuOpen(false)} />
                  <MobileNavItem href={`${prefix}/signup?role=customer`} icon={<PlusCircle className="w-5 h-5" />} label={t('common.signup', 'Sign Up')} onClick={() => setMobileMenuOpen(false)} />
                </>
              )}
            </nav>

            {/* Bottom section */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
              <LanguageToggle variant="public" mode="options" className="w-full justify-center" />
              <a href="tel:01067461059" className="flex items-center gap-3 flex-row-reverse text-slate-500 hover:text-slate-900 transition-colors">
                <span className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Phone size={16} />
                </span>
                <span className="font-bold text-sm">01067461059</span>
              </a>
            </div>
          </div>
        </>
      )}

      {/* ── Bottom Mobile Navigation ────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200 z-50 md:hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <div className="max-w-md mx-auto">
          <div className="bg-white/95 border border-slate-200 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] px-2">
            <div className="flex items-stretch justify-between gap-1" dir="rtl">
              <Link
                href={`${prefix}/`}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all ${
                  barePath === '/' || barePath === '' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-black'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-black">{t('common.home', 'Home')}</span>
              </Link>

              <button
                type="button"
                onClick={() => setFabOpen((v) => !v)}
                aria-label={t('common.actions', 'Actions')}
                aria-expanded={isFabOpen}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all ${
                  isFabOpen ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-black'
                }`}
              >
                <div className="relative">
                  <PlusCircle className={`w-6 h-6 transition-transform ${isFabOpen ? 'rotate-45' : ''}`} />
                </div>
                <span className="text-[10px] font-black">{t('common.actions', 'Actions')}</span>
              </button>

              <Link
                href={`${prefix}/profile`}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all ${
                  barePath.startsWith('/profile') ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-black'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] font-black">{t('nav.myAccount', 'My Account')}</span>
              </Link>

              {!hideCartButton && (
                <button
                  onClick={onCartOpen}
                  className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all text-slate-500 hover:bg-slate-50 hover:text-black"
                >
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#BD00FF] text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-black">{t('common.cart', 'Cart')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isFabOpen && (
        <>
          <button
            type="button"
            aria-label={t('common.close', 'Close')}
            onClick={() => setFabOpen(false)}
            className="fixed inset-0 z-[55] bg-black/40"
          />
          <div
            className="fixed left-0 right-0 bottom-24 z-[60] mx-auto max-w-md px-4"
            role="dialog"
            aria-label={t('common.actions', 'Actions')}
          >
            <div className="bg-white rounded-[1.5rem] shadow-2xl ring-1 ring-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100" dir="rtl">
                <div className="font-black text-sm">{t('common.actions', 'Actions')}</div>
                <button
                  type="button"
                  onClick={() => setFabOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center hover:bg-slate-100"
                  aria-label={t('common.close', 'Close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-3" dir="rtl">
                <Link
                  href={`${prefix}/map`}
                  onClick={() => setFabOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-slate-50 transition-all"
                >
                  <span className="font-black text-sm">{t('nav.map', 'Map')}</span>
                  <Search className="w-5 h-5 text-slate-500" />
                </Link>
                <Link
                  href={`${prefix}/offers`}
                  onClick={() => setFabOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-slate-50 transition-all"
                >
                  <span className="font-black text-sm">{t('nav.offers', 'Offers')}</span>
                  <Heart className="w-5 h-5 text-slate-500" />
                </Link>
                <Link
                  href={`${prefix}/support`}
                  onClick={() => setFabOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-slate-50 transition-all"
                >
                  <span className="font-black text-sm">{t('nav.support', 'Support')}</span>
                  <Info className="w-5 h-5 text-slate-500" />
                </Link>
                <Link
                  href={`${prefix}/contact`}
                  onClick={() => setFabOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-slate-50 transition-all"
                >
                  <span className="font-black text-sm">{t('common.contactUs', 'Contact Us')}</span>
                  <Mail className="w-5 h-5 text-slate-500" />
                </Link>
                <Link
                  href={`${prefix}/filter`}
                  onClick={() => setFabOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-slate-50 transition-all"
                >
                  <span className="font-black text-sm">{t('nav.search', 'Search')}</span>
                  <Search className="w-5 h-5 text-slate-500" />
                </Link>
                <Link
                  href={`${prefix}/directory`}
                  onClick={() => setFabOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-slate-50 transition-all"
                >
                  <span className="font-black text-sm">{t('nav.directory', 'Directory')}</span>
                  <Globe className="w-5 h-5 text-slate-500" />
                </Link>
                <Link
                  href={`${prefix}/blog`}
                  onClick={() => setFabOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-slate-50 transition-all"
                >
                  <span className="font-black text-sm">{t('nav.blog', 'Blog')}</span>
                  <BookOpen className="w-5 h-5 text-slate-500" />
                </Link>
                <Link
                  href={`${prefix}/courier`}
                  onClick={() => setFabOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 hover:bg-slate-50 transition-all"
                >
                  <span className="font-black text-sm">{t('nav.courier', 'Courier')}</span>
                  <Truck className="w-5 h-5 text-slate-500" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ── Sub-components ────────────────────────────────────── */

function MobileNavItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all text-xl font-black text-slate-900"
    >
      <span className="text-slate-300">{icon}</span> {label}
    </Link>
  );
}

function LanguageToggle({
  className,
  variant,
  mode,
}: {
  className?: string;
  variant?: string;
  mode?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const current = pathname?.split('/')?.[1];
  const lang: Locale = isValidLocale(current || '') ? (current as Locale) : 'ar';
  const isAr = lang === 'ar';

  const go = (target: Locale) => {
    const next = switchLocale(pathname || '/', target);
    router.push(next);
  };

  const toggle = () => go(isAr ? 'en' : 'ar');
  const setLanguage = (l: Locale) => go(l);

  const baseClasses =
    'flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-[10px] md:text-xs transition-all';

  const colorClasses =
    'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900';

  return (
    <button
      type="button"
      aria-label={t('common.toggleLanguage', 'Toggle language')}
      onClick={toggle}
      className={`${baseClasses} ${colorClasses} ${className}`}
    >
      {isAr ? t('common.englishLabel', 'English') : t('common.arabicLabel', 'Arabic')}
    </button>
  );
}
