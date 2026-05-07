'use client';

import { Info, Target, Rocket, Users, AlertTriangle, Cpu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { useT } from '@/i18n/useT';

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );
}

export default function AboutPage() {
  const pathname = usePathname();
  const localeSeg = pathname?.split('/')?.[1];
  const activeLocale: Locale = isValidLocale(localeSeg || '') ? (localeSeg as Locale) : 'ar';
  const dir = activeLocale === 'ar' ? 'rtl' : 'ltr';
  const t = useT();
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 text-right" dir={dir}>
      <div className="text-center mb-24">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest mb-8">
          <Info className="w-4 h-4 text-[#00E5FF]" />
          {t('about.badge', 'MNMKNK Story')}
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-tight">
          {t('about.title', 'We Build')}
          <br />
          <span className="text-[#00E5FF]">{t('about.titleHighlight', 'The Future of Commerce.')}</span>
        </h1>
        <p className="text-slate-400 text-xl md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed">
          {t('about.desc', 'MNMKNK is an Egyptian platform to discover the best shops and restaurants near you with offers, reviews, and a simple fast experience.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
        <div className="p-12 bg-slate-50 rounded-[3.5rem] space-y-6">
          <Target className="w-12 h-12 text-[#BD00FF]" />
          <h3 className="text-3xl font-black">{t('about.vision', 'Our Vision')}</h3>
          <p className="text-slate-500 font-bold leading-loose">
            {t('about.visionDesc', 'Every shop in Egypt can own a world-class digital storefront and smart management system in minutes, without technical complexity.')}
          </p>
        </div>
        <div className="p-12 bg-slate-900 text-white rounded-[3.5rem] space-y-6">
          <Cpu className="w-12 h-12 text-[#00E5FF]" />
          <h3 className="text-3xl font-black">{t('about.tech', 'Our Tech')}</h3>
          <p className="text-slate-400 font-bold leading-loose">
            {t('about.techDesc', 'We use the latest AI (Gemini) to guarantee real offers and a personalized shopping experience for every user.')}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 p-12 md:p-20 rounded-[4rem] text-center mb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <AlertTriangle size={120} className="text-amber-500" />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-amber-900 mb-8 flex items-center justify-center gap-4">
            {t('about.betaTitle', 'We are in Beta')} <AlertTriangle className="text-amber-500" />
          </h2>
          <p className="text-amber-800 text-lg md:text-xl font-bold leading-loose max-w-3xl mx-auto">
            {t('about.betaDesc', 'MNMKNK is currently in Beta Test. Some features may not perform at their best yet, and we are working around the clock to improve the experience. Your feedback and suggestions fuel us to be the best version always.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-900"><Rocket /></div>
          <h4 className="font-black text-xl">{t('about.speed', 'Super Fast')}</h4>
        </div>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-900"><Users /></div>
          <h4 className="font-black text-xl">{t('about.team', 'Egyptian Team')}</h4>
        </div>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-900"><ShieldCheck /></div>
          <h4 className="font-black text-xl">{t('about.security', 'Full Security')}</h4>
        </div>
      </div>
    </div>
  );
}
