'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { Reveal } from './Reveal';

const CheckItem = ({ text }: { text: string }) => {
  const { dir } = useLocale();
  return (
    <div className={`flex gap-3 items-start ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
      <CheckCircle2 className="w-5 h-5 text-[#0097A7] shrink-0 mt-0.5" />
      <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">{text}</p>
    </div>
  );
};

export default function BusinessDashboard() {
  const t = useT();
  const { locale, dir } = useLocale();

  return (
    <Reveal>
      <section className="bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#00E5FF]/10 text-[#0097A7] rounded-full text-xs font-black uppercase tracking-widest mb-4">{t('business.dashboardBadge')}</span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6 md:mb-8">
                {t('business.dashboardTitle1')} <span className="text-[#0097A7]">{t('business.dashboardTitle2')}</span>
              </h2>
              <div className="space-y-5 md:space-y-6">
                <CheckItem text={t('business.dashboardCheck1')} />
                <CheckItem text={t('business.dashboardCheck2')} />
                <CheckItem text={t('business.dashboardCheck3')} />
                <CheckItem text={t('business.dashboardCheck4')} />
              </div>
              <div className="mt-10 md:mt-14">
                <Link href={`/${locale}/business/signup`} className="inline-flex items-center gap-3 font-black text-xl md:text-2xl text-[#0097A7] hover:text-[#00796B] transition-colors">
                  {t('business.registerStore')} <ArrowLeft className="w-7 h-7 md:w-8 md:h-8" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#00E5FF]/8 via-transparent to-[#BD00FF]/8 rounded-[2rem] blur-2xl hidden md:block" />
              <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-slate-100 overflow-hidden aspect-video">
                <Image src="/images/business/dashboard-hero.png" alt={t('business.dashboardAltImg')} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority={false} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
