'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X, Sun, Moon, Globe, Store, LogIn, User, ShoppingBag, Bell, Heart } from 'lucide-react';
import { useApp } from './AppProvider';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { SearchBar } from './SearchBar';
import { siteConfig, navLinks } from '@/lib/config';
import { apiPath, getStoredAuthToken } from '@/lib/api';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { theme, toggleTheme, lang, setLang, dir } = useApp();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { totalItems, setCartOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const token = getStoredAuthToken();
    setIsLoggedIn(!!token);
    if (token) {
      fetch(apiPath('/notifications/me/unread-count'), {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.ok ? r.json() : null).then(d => setUnreadNotifs(d?.unread_count || d?.count || 0)).catch(() => {});
    } else {
      setUnreadNotifs(0);
    }
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-[80] transition-all duration-300',
          scrolled ? 'glass shadow-sm' : 'bg-transparent',
          !scrolled && (pathname === '/' ? 'text-white' : 'text-slate-900 dark:text-white')
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-11 md:h-11 bg-brand-black rounded-lg flex items-center justify-center shadow-lg relative group overflow-hidden">
              <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image src="/brand/logo.png" alt="MNMKNK" width={28} height={28} className="relative z-10 w-6 h-6 md:w-7 md:h-7 object-contain" />
            </div>
            <span
              className={cn(
                'text-lg md:text-2xl font-bold tracking-tight hidden sm:block',
                'bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-cyan bg-[length:200%_200%] text-transparent bg-clip-text',
                'transition-transform duration-300 hover:scale-[1.06]'
              )}
            >
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
                  isActive(link.href)
                    ? 'bg-brand-black/5 dark:bg-white/10 text-brand-cyan'
                    : 'hover:bg-brand-black/5 dark:hover:bg-white/5'
                )}
              >
                {link.label[lang]}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="hidden lg:block">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-brand-black/5 dark:hover:bg-white/5 transition-all"
              aria-label="السلة"
            >
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-cyan text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative hidden md:flex w-9 h-9 md:w-10 md:h-10 rounded-lg items-center justify-center hover:bg-brand-black/5 dark:hover:bg-white/5 transition-all"
              aria-label="المفضلة"
            >
              <Heart className="w-4 h-4 md:w-5 md:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>
            {/* Notifications */}
            {isLoggedIn && (
              <Link
                href="/notifications"
                className="relative hidden md:flex w-9 h-9 md:w-10 md:h-10 rounded-lg items-center justify-center hover:bg-brand-black/5 dark:hover:bg-white/5 transition-all"
                aria-label="الإشعارات"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifs > 9 ? '9+' : unreadNotifs}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-brand-black/5 dark:hover:bg-white/5 transition-all"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center hover:bg-brand-black/5 dark:hover:bg-white/5 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand-black to-slate-800 text-white font-semibold text-xs hover:from-brand-cyan hover:to-cyan-600 hover:text-black transition-all shadow-lg"
              >
                <User className="w-4 h-4" />
                {lang === 'ar' ? 'البروفايل' : 'Profile'}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand-black to-slate-800 text-white font-semibold text-xs hover:from-brand-cyan hover:to-cyan-600 hover:text-black transition-all shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                {lang === 'ar' ? 'دخول' : 'Login'}
              </Link>
            )}
            <a
              href={`${siteConfig.dashboardUrl}/#/business/dashboard`}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-gradient text-white font-semibold text-xs hover:shadow-glow-cyan transition-all"
            >
              <Store className="w-4 h-4" />
              {lang === 'ar' ? 'للأعمال' : 'Business'}
            </a>
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-brand-black/5 dark:hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-brand-black shadow-2xl flex flex-col animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xl font-bold text-gradient">{siteConfig.name}</span>
              <button onClick={() => setMobileOpen(false)} className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-5 space-y-2">
              <div className="pb-2">
                <SearchBar />
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg font-semibold text-base transition-all',
                    isActive(link.href)
                      ? 'bg-brand-black/5 dark:bg-white/10 text-brand-cyan'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  )}
                >
                  {link.label[lang]}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <Link href="/wishlist" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 font-semibold">
                  <Heart className="w-5 h-5" />
                  {lang === 'ar' ? 'المفضلة' : 'Wishlist'}
                  {wishlistCount > 0 && (
                    <span className="mr-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{wishlistCount}</span>
                  )}
                </Link>
                {isLoggedIn && (
                  <Link href="/notifications" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 font-semibold">
                    <Bell className="w-5 h-5" />
                    {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                    {unreadNotifs > 0 && (
                      <span className="mr-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadNotifs}</span>
                    )}
                  </Link>
                )}
                {isLoggedIn ? (
                  <Link href="/profile" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 font-semibold">
                    <User className="w-5 h-5" />
                    {lang === 'ar' ? 'البروفايل' : 'Profile'}
                  </Link>
                ) : (
                  <Link href="/login" className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 font-semibold">
                    <User className="w-5 h-5" />
                    {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                  </Link>
                )}
                <a href={`${siteConfig.dashboardUrl}/#/business/dashboard`} className="flex items-center gap-3 p-4 rounded-lg bg-brand-gradient text-white font-semibold">
                  <Store className="w-5 h-5" />
                  {lang === 'ar' ? 'للأعمال' : 'Business'}
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
