'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronUp } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import BusinessHeader from './_sections/BusinessHeader';
import BusinessHero from './_sections/BusinessHero';

const BusinessFeatures = dynamic(() => import('./_sections/BusinessFeatures'));
const BusinessSteps = dynamic(() => import('./_sections/BusinessSteps'));
const BusinessDashboard = dynamic(() => import('./_sections/BusinessDashboard'));
const BusinessIndustries = dynamic(() => import('./_sections/BusinessIndustries'));
const BusinessAbout = dynamic(() => import('./_sections/BusinessAbout'));
const BusinessCta = dynamic(() => import('./_sections/BusinessCta'));
const BusinessFooter = dynamic(() => import('./_sections/BusinessFooter'));

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = () => { const d = document.documentElement.scrollHeight - window.innerHeight; setP(d > 0 ? (window.scrollY / d) * 100 : 0); };
    window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h);
  }, []);
  return p;
}

export default function BusinessLandingPage() {
  const { dir } = useLocale();
  const t = useT();
  const scrollProgress = useScrollProgress();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);

  useEffect(() => {
    const h = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div dir={dir}>
      <div className="fixed top-0 left-0 right-0 z-[90] h-1 bg-transparent pointer-events-none">
        <div className="h-full bg-gradient-to-l from-[#00E5FF] to-[#BD00FF] transition-[width] duration-150 ease-out" style={{ width: `${scrollProgress}%` }} />
      </div>
      <BusinessHeader />
      <BusinessHero />
      <BusinessFeatures />
      <BusinessSteps />
      <BusinessDashboard />
      <BusinessIndustries />
      <BusinessAbout />
      <BusinessCta />
      <BusinessFooter />
      <button type="button" onClick={scrollToTop} className={`fixed bottom-20 md:bottom-8 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-[85] w-11 h-11 rounded-xl bg-slate-900/80 backdrop-blur-sm text-white flex items-center justify-center shadow-lg border border-white/10 transition-all duration-300 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} aria-label={t('common.backToTop', 'Back to top')}>
        <ChevronUp size={20} />
      </button>
    </div>
  );
}
