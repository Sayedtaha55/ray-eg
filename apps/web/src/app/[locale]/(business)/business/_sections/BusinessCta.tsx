'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { Reveal } from './Reveal';

export default function BusinessCta() {
  const t = useT();
  const { locale, dir } = useLocale();
  const isRtl = dir === 'rtl';

  return (
    <Reveal>
      <section className="bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
          <div className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#00E5FF]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#BD00FF]/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 md:mb-6">{t('business.readyToStart')}</h2>
              <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-8 md:mb-10 font-medium">{t('business.noCreditCard')}</p>
              <div className="max-w-3xl mx-auto mb-8 md:mb-10">
                <div className={`rounded-3xl border border-white/15 bg-white/5 backdrop-blur-sm p-6 md:p-7 ${isRtl ? 'text-right' : 'text-left'}`} dir={dir}>
                  <div className={`flex flex-col md:flex-row ${isRtl ? 'md:flex-row-reverse' : ''} md:items-center md:justify-between gap-4`}>
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/15 text-amber-300 font-black text-xs">
                        {t('business.mapListingBadge')}
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">{t('business.mapListingTitle')}</h3>
                      <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed">{t('business.mapListingSubtitle')}</p>
                    </div>
                    <div className="shrink-0">
                      <Link href={`/${locale}/map`} className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 text-white rounded-2xl font-black text-base hover:bg-amber-600 transition-colors w-full md:w-auto">
                        {t('business.mapListingButton')} <ArrowLeft className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={`/${locale}/business/signup`} className="inline-flex items-center gap-3 bg-[#00E5FF] text-slate-900 px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl hover:bg-[#00D4EE] transition-colors">
                  {t('business.startFreeNow')} <ArrowLeft className="w-6 h-6" />
                </Link>
                <a href="#about" className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-5 rounded-2xl font-black text-lg hover:bg-white/5 transition-colors">
                  {t('business.getToKnowUs')} <ChevronLeft className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
