'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, Facebook } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.007.688 3.866 1.86 5.367L3 22l5.633-1.76c1.413.747 3.046 1.172 4.367 1.172 5.523 0 10-4.145 10-9.26C23 6.145 17.523 2 12 2Z" fill="currentColor" opacity="0.22" />
    <path d="M12 3.5c4.66 0 8.5 3.46 8.5 7.76 0 4.3-3.84 7.76-8.5 7.76-1.25 0-2.81-.39-4.1-1.12l-.42-.24-3.25 1.02.92-3.06-.27-.4C4.13 14.2 3.5 12.78 3.5 11.26 3.5 6.96 7.34 3.5 12 3.5Z" stroke="currentColor" strokeWidth="1.3" />
    <path d="M9.4 8.5c-.2-.45-.4-.47-.58-.48h-.5c-.17 0-.45.06-.68.3-.23.25-.9.86-.9 2.09 0 1.23.92 2.42 1.05 2.59.13.17 1.78 2.72 4.34 3.7 2.13.82 2.56.66 3.02.62.46-.04 1.5-.6 1.71-1.18.21-.57.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3-.25-.13-1.5-.71-1.73-.8-.23-.09-.4-.13-.57.13-.17.26-.66.8-.81.96-.15.17-.3.19-.56.06-.25-.13-1.07-.38-2.03-1.2-.75-.63-1.25-1.4-1.4-1.64-.15-.25-.02-.38.12-.5.11-.1.25-.26.38-.39.13-.13.17-.22.25-.37.08-.15.04-.28-.02-.39-.06-.11-.52-1.23-.72-1.68Z" fill="currentColor" />
  </svg>
);

export default function BusinessFooter() {
  const t = useT();
  const { locale, dir } = useLocale();
  const isRtl = dir === 'rtl';

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
          <div className="md:col-span-1">
            <div className={`flex items-center gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-9 h-9 bg-[#00E5FF] rounded-xl flex items-center justify-center overflow-hidden">
                <Image src="/brand/logo.png" alt="MNMKNK" width={36} height={36} className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white uppercase">{t('nav.brand', 'MNMKNK')}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">{t('business.platformDesc')}</p>
          </div>
          <div>
            <h4 className="text-sm font-black text-white mb-4 uppercase tracking-wider">{t('business.product')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href={`/${locale}/business/signup`} className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('business.createStore')}</Link></li>
              <li><Link href={`/${locale}/courier`} className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('business.courierSignup')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-black text-white mb-4 uppercase tracking-wider">{t('business.company')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#about" className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('common.aboutUs')}</a></li>
              <li><Link href={`/${locale}`} className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('common.home')}</Link></li>
              <li><Link href={`/${locale}/blog`} className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('business.blog')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-black text-white mb-4 uppercase tracking-wider">{t('business.supportAndTerms')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href={`/${locale}/support`} className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('common.helpCenter')}</Link></li>
              <li><Link href={`/${locale}/terms`} className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('common.terms')}</Link></li>
              <li><Link href={`/${locale}/privacy`} className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('common.privacy')}</Link></li>
              <li><Link href={`/${locale}/contact`} className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('common.contactUs')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10"><Mail size={16} /></div>
              <a href="mailto:mnmknk.eg@gmail.com" className="font-bold text-sm md:text-base text-slate-300 hover:text-white transition-colors">mnmknk.eg@gmail.com</a>
            </div>
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10"><Phone size={16} /></div>
              <a href="tel:01067461059" className="font-bold text-sm md:text-base text-slate-300 hover:text-white transition-colors">01067461059</a>
            </div>
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse md:justify-end' : 'md:justify-end'}`}>
              <a href="mailto:mnmknk.eg@gmail.com" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-[#00E5FF]/40 hover:bg-white/15" aria-label={t('common.email', 'Email')}><Mail size={16} /></a>
              <a href="https://wa.me/201067461059" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-emerald-400/40 hover:bg-white/15" aria-label={t('common.whatsapp', 'WhatsApp')}><WhatsAppIcon size={16} /></a>
              <a href="https://www.facebook.com/profile.php?id=61587556276694" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-blue-400/40 hover:bg-white/15" aria-label={t('common.facebook', 'Facebook')}><Facebook size={16} /></a>
            </div>
          </div>
        </div>
        <div className={`mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm`}>
          <p>© {new Date().getFullYear()} MNMKNK. {t('common.allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
}
