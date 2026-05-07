'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, Home, Facebook, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { useT } from '@/i18n/useT';

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.007.688 3.866 1.86 5.367L3 22l5.633-1.76c1.413.747 3.046 1.172 4.367 1.172 5.523 0 10-4.145 10-9.26C23 6.145 17.523 2 12 2Z" fill="currentColor" opacity="0.22" />
      <path d="M12 3.5c4.66 0 8.5 3.46 8.5 7.76 0 4.3-3.84 7.76-8.5 7.76-1.25 0-2.81-.39-4.1-1.12l-.42-.24-3.25 1.02.92-3.06-.27-.4C4.13 14.2 3.5 12.78 3.5 11.26 3.5 6.96 7.34 3.5 12 3.5Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.4 8.5c-.2-.45-.4-.47-.58-.48h-.5c-.17 0-.45.06-.68.3-.23.25-.9.86-.9 2.09 0 1.23.92 2.42 1.05 2.59.13.17 1.78 2.72 4.34 3.7 2.13.82 2.56.66 3.02.62.46-.04 1.5-.6 1.71-1.18.21-.57.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3-.25-.13-1.5-.71-1.73-.8-.23-.09-.4-.13-.57.13-.17.26-.66.8-.81.96-.15.17-.3.19-.56.06-.25-.13-1.07-.38-2.03-1.2-.75-.63-1.25-1.4-1.4-1.64-.15-.25-.02-.38.12-.5.11-.1.25-.26.38-.39.13-.13.17-.22.25-.37.08-.15.04-.28-.02-.39-.06-.11-.52-1.23-.72-1.68Z" fill="currentColor" />
    </svg>
  );
}

export default function PublicFooter() {
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1];
  const activeLocale: Locale = isValidLocale(locale || '') ? (locale as Locale) : 'ar';
  const prefix = `/${activeLocale}`;
  const t = useT();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 md:pt-32 pb-24 md:pb-12 mt-16 md:mt-32 rounded-t-[2rem] md:rounded-t-[4rem]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-12 md:gap-16 md:grid md:grid-cols-2">
          {/* Links Section */}
          <div className="order-2 md:order-1">
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 text-right">
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-[#00E5FF] mb-6">{t('footer.explore', 'Explore')}</h3>
                <nav className="flex flex-col gap-4 text-slate-300 font-bold text-sm md:text-lg">
                  <Link href={`${prefix}/offers/restaurants`} className="hover:text-white transition-colors">{t('offers.restaurants', 'Restaurant Offers')}</Link>
                  <Link href={`${prefix}/offers/fashion`} className="hover:text-white transition-colors">{t('offers.fashion', 'Fashion Offers')}</Link>
                  <Link href={`${prefix}/offers/supermarket`} className="hover:text-white transition-colors">{t('offers.supermarket', 'Supermarket Offers')}</Link>
                  <Link href={`${prefix}/about`} className="hover:text-white transition-colors">{t('nav.about', 'About')}</Link>
                  <Link href={`${prefix}/directory`} className="hover:text-white transition-colors">{t('nav.directory', 'Directory')}</Link>
                  <Link href={`${prefix}/blog`} className="hover:text-white transition-colors">{t('nav.blog', 'Blog')}</Link>
                  <Link href={`${prefix}/filter`} className="hover:text-white transition-colors">{t('nav.search', 'Search')}</Link>
                </nav>
              </div>
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-[#E879F9] mb-6">{t('footer.forBusiness', 'For Business')}</h3>
                <nav className="flex flex-col gap-4 text-slate-300 font-bold text-sm md:text-lg">
                  <Link href={`${prefix}/business`} className="hover:text-white transition-colors">{t('footer.joinUs', 'Join Us')}</Link>
                  <Link href={`${prefix}/map/add-listing`} className="hover:text-white transition-colors">{t('footer.addListing', 'Add Your Business')}</Link>
                  <Link href={`${prefix}/courier`} className="hover:text-white transition-colors">{t('nav.courier', 'Courier')}</Link>
                </nav>
              </div>
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-green-300 mb-6">{t('footer.help', 'Help')}</h3>
                <nav className="flex flex-col gap-4 text-slate-300 font-bold text-sm md:text-lg">
                  <Link href={`${prefix}/support`} className="hover:text-white transition-colors">{t('footer.helpCenter', 'Help Center')}</Link>
                  <Link href={`${prefix}/terms`} className="hover:text-white transition-colors">{t('footer.terms', 'Terms of Service')}</Link>
                  <Link href={`${prefix}/privacy`} className="hover:text-white transition-colors">{t('footer.privacy', 'Privacy Policy')}</Link>
                  <Link href={`${prefix}/contact`} className="hover:text-white transition-colors">{t('footer.contact', 'Contact Us')}</Link>
                  <Link href={`${prefix}/return-policy`} className="hover:text-white transition-colors">{t('footer.returnPolicy', 'Return Policy')}</Link>
                </nav>
              </div>
            </div>

            <div className="md:hidden space-y-3 text-right">
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle('explore')}
                  className="w-full flex items-center justify-between px-4 py-4 bg-white/5"
                  aria-expanded={!!open.explore}
                >
                  <span className="font-black text-[10px] uppercase tracking-widest text-[#00E5FF]">{t('footer.explore', 'Explore')}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${open.explore ? 'rotate-180' : ''}`} />
                </button>
                {open.explore && (
                  <nav className="flex flex-col gap-3 px-4 py-4 text-slate-300 font-bold text-sm">
                    <Link href={`${prefix}/offers/restaurants`} className="hover:text-white transition-colors">{t('offers.restaurants', 'Restaurant Offers')}</Link>
                    <Link href={`${prefix}/offers/fashion`} className="hover:text-white transition-colors">{t('offers.fashion', 'Fashion Offers')}</Link>
                    <Link href={`${prefix}/offers/supermarket`} className="hover:text-white transition-colors">{t('offers.supermarket', 'Supermarket Offers')}</Link>
                    <Link href={`${prefix}/about`} className="hover:text-white transition-colors">{t('nav.about', 'About')}</Link>
                    <Link href={`${prefix}/directory`} className="hover:text-white transition-colors">{t('nav.directory', 'Directory')}</Link>
                    <Link href={`${prefix}/blog`} className="hover:text-white transition-colors">{t('nav.blog', 'Blog')}</Link>
                  </nav>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle('business')}
                  className="w-full flex items-center justify-between px-4 py-4 bg-white/5"
                  aria-expanded={!!open.business}
                >
                  <span className="font-black text-[10px] uppercase tracking-widest text-[#E879F9]">{t('footer.forBusiness', 'For Business')}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${open.business ? 'rotate-180' : ''}`} />
                </button>
                {open.business && (
                  <nav className="flex flex-col gap-3 px-4 py-4 text-slate-300 font-bold text-sm">
                    <Link href={`${prefix}/business`} className="hover:text-white transition-colors">{t('footer.joinUs', 'Join Us')}</Link>
                    <Link href={`${prefix}/map/add-listing`} className="hover:text-white transition-colors">{t('footer.addListing', 'Add Your Business')}</Link>
                    <Link href={`${prefix}/courier`} className="hover:text-white transition-colors">{t('nav.courier', 'Courier')}</Link>
                  </nav>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle('help')}
                  className="w-full flex items-center justify-between px-4 py-4 bg-white/5"
                  aria-expanded={!!open.help}
                >
                  <span className="font-black text-[10px] uppercase tracking-widest text-green-300">{t('footer.help', 'Help')}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${open.help ? 'rotate-180' : ''}`} />
                </button>
                {open.help && (
                  <nav className="flex flex-col gap-3 px-4 py-4 text-slate-300 font-bold text-sm">
                    <Link href={`${prefix}/support`} className="hover:text-white transition-colors">{t('footer.helpCenter', 'Help Center')}</Link>
                    <Link href={`${prefix}/terms`} className="hover:text-white transition-colors">{t('footer.terms', 'Terms of Service')}</Link>
                    <Link href={`${prefix}/privacy`} className="hover:text-white transition-colors">{t('footer.privacy', 'Privacy Policy')}</Link>
                    <Link href={`${prefix}/contact`} className="hover:text-white transition-colors">{t('footer.contact', 'Contact Us')}</Link>
                  </nav>
                )}
              </div>
            </div>
          </div>

          {/* Brand */}
          <div className="order-1 md:order-2">
            <div className="flex items-center gap-2 mb-6 flex-row-reverse md:justify-end">
              <Image src="/brand/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 rounded-xl" />
              <span className="text-2xl font-black tracking-tighter uppercase">{t('nav.brand', 'MNMKNK')}</span>
            </div>
            <p className="text-slate-400 max-w-sm text-base md:text-xl font-medium mb-6">
              {t('footer.beta', 'We are in beta. Thank you for your trust in building the future of shopping in Egypt.')}
            </p>
          </div>

          {/* Contact + Social */}
          <div className="order-3 md:order-3 space-y-6 text-right">
            <div className="space-y-3">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-white mb-4">{t('footer.contactTitle', 'Contact Us')}</h3>
              <a href="mailto:mnmknk.eg@gmail.com" className="flex items-center gap-3 flex-row-reverse text-slate-300 hover:text-white transition-colors">
                <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10">
                  <Mail size={16} />
                </span>
                <span className="font-bold text-sm md:text-base">{t('footer.email', 'Email')}</span>
              </a>
              <a href="tel:01067461059" className="flex items-center gap-3 flex-row-reverse text-slate-300 hover:text-white transition-colors">
                <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10">
                  <Phone size={16} />
                </span>
                <span className="font-bold text-sm md:text-base">01067461059</span>
              </a>
              <div className="flex items-center gap-3 flex-row-reverse text-slate-300">
                <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10">
                  <Home size={16} />
                </span>
                <span className="font-bold text-sm md:text-base">{t('home.cairoEgypt', 'Cairo, Egypt')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-white mb-4">{t('footer.followUs', 'Follow Us')}</h3>
              <div className="flex gap-3 flex-row-reverse">
                <a
                  href="mailto:mnmknk.eg@gmail.com"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-[#00E5FF]/40 hover:bg-white/15 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(0,229,255,0.25)]"
                  aria-label={t('common.email', 'Email')}
                >
                  <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
                <a
                  href="https://wa.me/201067461059"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-emerald-400/40 hover:bg-white/15 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(16,185,129,0.25)]"
                  aria-label={t('common.whatsapp', 'WhatsApp')}
                >
                  <WhatsAppIcon size={16} />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61587556276694"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-blue-400/40 hover:bg-white/15 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(96,165,250,0.25)]"
                  aria-label={t('common.facebook', 'Facebook')}
                >
                  <Facebook size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-8">
          © {new Date().getFullYear()} {t('nav.brand', 'MNMKNK')} — {t('footer.rights', 'All rights reserved')}
        </div>
      </div>
    </footer>
  );
}
