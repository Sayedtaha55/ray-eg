'use client';

import Link from 'next/link';
import { ArrowLeft, Zap, Layout, Store } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { Reveal } from './Reveal';

const StepCard = ({ step, title, description, icon }: { step: string; title: string; description: string; icon: React.ReactNode }) => {
  const { dir } = useLocale();
  return (
    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
      <div className="flex items-center gap-4 mb-5 justify-center md:justify-start">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-[#00E5FF] flex items-center justify-center font-black text-2xl">{step}</div>
        <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 text-[#0097A7] flex items-center justify-center">{icon}</div>
      </div>
      <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">{description}</p>
    </div>
  );
};

export default function BusinessSteps() {
  const t = useT();
  const { locale, dir } = useLocale();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowLeft;

  return (
    <Reveal>
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#00E5FF]/10 text-[#0097A7] rounded-full text-xs font-black uppercase tracking-widest mb-4">{t('business.stepsBadge')}</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900">{t('business.stepsTitle1')} <span className="text-[#0097A7]">{t('business.stepsTitle2')}</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <StepCard step="1" title={t('business.step1Title')} description={t('business.step1Desc')} icon={<Zap className="w-7 h-7" />} />
            <StepCard step="2" title={t('business.step2Title')} description={t('business.step2Desc')} icon={<Layout className="w-7 h-7" />} />
            <StepCard step="3" title={t('business.step3Title')} description={t('business.step3Desc')} icon={<Store className="w-7 h-7" />} />
          </div>
          <div className="mt-12 md:mt-16 text-center">
            <Link href={`/${locale}/business/signup`} className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl hover:bg-slate-800 transition-colors">
              {t('business.startNowFree')} <Arrow className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
