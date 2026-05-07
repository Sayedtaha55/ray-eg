'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

export default function BusinessHeader() {
  const t = useT();
  const { locale, dir } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const role = document.cookie
      .split('; ')
      .find(row => row.startsWith('ray_role='))
      ?.split('=')[1];
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('ray_role='));
    setIsLoggedIn(!!role && (role === 'MERCHANT' || role === 'ADMIN'));
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const links = [
    { href: `/${locale}/business#features`, label: t('business.featuresBadge', 'Features') },
    { href: `/${locale}/business#steps`, label: t('business.stepsBadge', 'How It Works') },
    { href: `/${locale}/business#industries`, label: t('business.industriesBadge', 'Industries') },
    { href: `/${locale}/business#about`, label: t('business.aboutBadge', 'About') },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-slate-950/95 backdrop-blur-md shadow-2xl py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex items-center justify-between">
          <Link href={`/${locale}/business`} className="flex items-center gap-3 group">
            <Image src="/brand/logo.png" alt="Logo" width={36} height={36} className="w-9 h-9 rounded-xl shadow-lg group-hover:shadow-[#00E5FF]/30 transition-shadow" />
            <span className="text-xl font-black tracking-tighter text-white hidden sm:block">
              {t('business.heroTitle1', 'Grow Your')} <span className="text-[#00E5FF]">{t('business.heroTitle2', 'Business')}</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-white/70 hover:text-white font-bold text-sm transition-colors">{l.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href={`/${locale}/business/dashboard`} className={`hidden sm:inline-flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-colors`}>
                <LayoutDashboard size={16} />
                {t('business.dashboardLink', 'Dashboard')}
              </Link>
            ) : (
              <Link href={`/${locale}/login?role=merchant`} className={`hidden sm:inline-flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-colors`}>
                {t('auth.loginTitle', 'Login')}
              </Link>
            )}
            <Link href={`/${locale}/business/onboarding`} className="bg-[#00E5FF] text-slate-900 px-5 py-2.5 rounded-xl font-black text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all hidden sm:inline-flex items-center gap-2">
              {t('business.startFreeTrial', 'Start Free Trial')} <Arrow className="w-4 h-4" />
            </Link>
            <button type="button" onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-white" aria-label={t('common.openMenu', 'Open Menu')}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" onClick={() => setMobileOpen(false)} />
          <div className={`fixed top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} h-full w-[85%] max-w-sm bg-slate-950 z-[120] p-6 flex flex-col shadow-2xl`} dir={dir}>
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-black text-white">{t('business.heroTitle1')} <span className="text-[#00E5FF]">{t('business.heroTitle2')}</span></span>
              <button type="button" onClick={() => setMobileOpen(false)} className="p-2 text-white"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex flex-col gap-4 flex-1">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-white/80 hover:text-white font-bold text-lg py-2 border-b border-white/10 transition-colors">{l.label}</a>
              ))}
            </nav>
            <div className="space-y-3 pt-6 border-t border-white/10">
              {isLoggedIn ? (
                <Link href={`/${locale}/business/dashboard`} onClick={() => setMobileOpen(false)} className="block w-full text-center py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"><LayoutDashboard size={16} />{t('business.dashboardLink', 'Dashboard')}</Link>
              ) : (
                <Link href={`/${locale}/login?role=merchant`} onClick={() => setMobileOpen(false)} className="block w-full text-center py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/10 transition-colors">{t('auth.loginTitle', 'Login')}</Link>
              )}
              <Link href={`/${locale}/business/onboarding`} onClick={() => setMobileOpen(false)} className="block w-full text-center py-3 rounded-xl bg-[#00E5FF] text-slate-900 font-black hover:shadow-lg transition-all">{t('business.startFreeTrial', 'Start Free Trial')}</Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
