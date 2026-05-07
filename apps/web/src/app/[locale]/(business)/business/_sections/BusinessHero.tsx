'use client';

import Link from 'next/link';
import { Store, ArrowLeft, TrendingUp, PackageCheck, BellRing } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

const HeroPill = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="px-4 py-2.5 rounded-xl bg-white/8 backdrop-blur-sm border border-white/10 flex items-center gap-2.5">
    <span className="text-[#00E5FF]">{icon}</span><span className="font-bold text-sm">{text}</span>
  </div>
);

export default function BusinessHero() {
  const t = useT();
  const { locale, dir } = useLocale();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowLeft;

  return (
    <div className="relative min-h-[86vh] md:min-h-[92vh] bg-slate-950 overflow-hidden flex items-center">
      <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" poster="/videos/business-hero-poster.webp">
        <source src="/videos/business-hero.webm" type="video/webm" />
        <source src="/videos/business-hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#FAFAF7]" />
      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-24 pb-16 md:pt-44 md:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white font-black text-xs uppercase tracking-widest mb-8 md:mb-10 border border-white/15">
              <TrendingUp className="w-4 h-4 text-[#00E5FF]" />{t('business.heroBadge')}
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-9xl font-black tracking-tighter mb-8 md:mb-10 leading-[0.95] md:leading-[0.9] text-white">
              {t('business.heroTitle1')} <br /> <span className="text-[#00E5FF]">{t('business.heroTitle2')}</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-10 md:mb-12 leading-relaxed font-medium max-w-3xl mx-auto">{t('business.landingDesc')}</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
              <Link href={`/${locale}/business/signup`} className="block w-full md:w-auto bg-[#00E5FF] text-slate-900 px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 transition-shadow text-center">
                {t('business.startFreeTrial')}
              </Link>
              <button type="button" className="w-full md:w-auto bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl hover:bg-white/20 transition-colors">
                {t('business.watchDemo')}
              </button>
            </div>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 text-white/70">
              <HeroPill icon={<Store className="w-4 h-4" />} text={t('business.heroStoreReady')} />
              <HeroPill icon={<PackageCheck className="w-4 h-4" />} text={t('business.heroEasyProducts')} />
              <HeroPill icon={<BellRing className="w-4 h-4" />} text={t('business.heroInstantAlert')} />
            </div>
          </div>
        </div>
      </div>
      {/* Floating Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-[85] md:hidden pointer-events-none">
        <div className="px-4 pb-4 pt-12 bg-gradient-to-t from-black/40 via-black/20 to-transparent pointer-events-auto">
          <Link href={`/${locale}/business/signup`} className="block w-full bg-[#00E5FF] text-slate-900 py-4 rounded-2xl font-black text-base text-center shadow-lg shadow-cyan-500/25">
            {t('business.startFreeNow')}
          </Link>
        </div>
      </div>
    </div>
  );
}
