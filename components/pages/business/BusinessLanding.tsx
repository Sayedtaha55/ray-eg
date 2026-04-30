import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Store, ArrowLeft, TrendingUp, PackageCheck, BellRing,
  Layout, BarChart3, Smartphone, Zap, Shield, Clock,
  Users, Globe, ChevronLeft, Star, CheckCircle2,
  Mail, Phone, Facebook, ArrowUp, ChevronUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import type { ShopGallery } from '@/types';

const { Link } = ReactRouterDOM as any;

const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.007.688 3.866 1.86 5.367L3 22l5.633-1.76c1.413.747 3.046 1.172 4.367 1.172 5.523 0 10-4.145 10-9.26C23 6.145 17.523 2 12 2Z" fill="currentColor" opacity="0.22" />
    <path d="M12 3.5c4.66 0 8.5 3.46 8.5 7.76 0 4.3-3.84 7.76-8.5 7.76-1.25 0-2.81-.39-4.1-1.12l-.42-.24-3.25 1.02.92-3.06-.27-.4C4.13 14.2 3.5 12.78 3.5 11.26 3.5 6.96 7.34 3.5 12 3.5Z" stroke="currentColor" strokeWidth="1.3" />
    <path d="M9.4 8.5c-.2-.45-.4-.47-.58-.48h-.5c-.17 0-.45.06-.68.3-.23.25-.9.86-.9 2.09 0 1.23.92 2.42 1.05 2.59.13.17 1.78 2.72 4.34 3.7 2.13.82 2.56.66 3.02.62.46-.04 1.5-.6 1.71-1.18.21-.57.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3-.25-.13-1.5-.71-1.73-.8-.23-.09-.4-.13-.57.13-.17.26-.66.8-.81.96-.15.17-.3.19-.56.06-.25-.13-1.07-.38-2.03-1.2-.75-.63-1.25-1.4-1.4-1.64-.15-.25-.02-.38.12-.5.11-.1.25-.26.38-.39.13-.13.17-.22.25-.37.08-.15.04-.28-.02-.39-.06-.11-.52-1.23-.72-1.68Z" fill="currentColor" />
  </svg>
);

const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return progress;
};

const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
};

const RevealSection: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className, id }) => {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      id={id}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className || ''}`}
    >
      {children}
    </div>
  );
};

const BusinessLanding: React.FC = () => {
  const { t } = useTranslation();
  const featuredShopId = String(import.meta.env.VITE_FEATURED_SHOP_ID || '').trim();
  const [heroVideo, setHeroVideo] = useState<ShopGallery | null>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useScrollProgress();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const fallbackHero = useMemo(
    () => ({
      webm: '/videos/business-hero.webm',
      mp4: '/videos/business-hero.mp4',
      poster: '/videos/business-hero-poster.webp',
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    if (!featuredShopId) {
      setHeroVideo(null);
      return () => {
        cancelled = true;
      };
    }

    ApiService.getShopGallery(featuredShopId)
      .then((items: any) => {
        if (cancelled) return;
        const list = Array.isArray(items) ? (items as ShopGallery[]) : [];
        const firstVideo = list.find((x) => String((x as any)?.mediaType || '').toUpperCase() === 'VIDEO') || null;
        setHeroVideo(firstVideo);
      })
      .catch(() => {
        if (cancelled) return;
        setHeroVideo(null);
      });

    return () => {
      cancelled = true;
    };
  }, [featuredShopId]);

  const heroMp4 = heroVideo?.imageUrl ? String(heroVideo.imageUrl) : fallbackHero.mp4;
  const heroPoster = heroVideo?.thumbUrl ? String(heroVideo.thumbUrl) : fallbackHero.poster;
  const hasDynamicHero = Boolean(heroVideo?.imageUrl);

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handler = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
    <div className="text-right" dir="rtl">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[90] h-1 bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-l from-[#00E5FF] to-[#BD00FF] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      {/* Hero Section - preserved with video */}
      <div className="relative min-h-[86vh] md:min-h-[92vh] bg-slate-950 overflow-hidden flex items-center">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={heroPoster}
        >
          {!hasDynamicHero && <source src={fallbackHero.webm} type="video/webm" />}
          <source src={heroMp4} type="video/mp4" />
          {!hasDynamicHero && <source src={fallbackHero.mp4} type="video/mp4" />}
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#FAFAF7]" />

        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-24 pb-16 md:pt-44 md:pb-28">
            <div className="text-center max-w-4xl mx-auto">
              <div>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white font-black text-xs uppercase tracking-widest mb-8 md:mb-10 border border-white/15">
                  <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
                  {t('business.hero.badge')}
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-9xl font-black tracking-tighter mb-8 md:mb-10 leading-[0.95] md:leading-[0.9] text-white">
                  {t('business.hero.title1')} <br /> <span className="text-[#00E5FF]">{t('business.hero.title2')}</span>
                </h1>

                <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-10 md:mb-12 leading-relaxed font-medium max-w-3xl mx-auto">
                  {t('business.landingDesc')}
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                  <div className="w-full md:w-auto">
                    <Link
                      to="/business/onboarding"
                      className="block w-full md:w-auto bg-[#00E5FF] text-slate-900 px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 transition-shadow"
                    >
                      {t('business.startFreeTrial')}
                    </Link>
                  </div>
                  <button
                    type="button"
                    className="w-full md:w-auto bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl hover:bg-white/20 transition-colors"
                  >
                    {t('business.watchDemo')}
                  </button>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 text-white/70">
                  <HeroPill icon={<Store className="w-4 h-4" />} text={t('business.hero.storeReady')} />
                  <HeroPill icon={<PackageCheck className="w-4 h-4" />} text={t('business.hero.easyProducts')} />
                  <HeroPill icon={<BellRing className="w-4 h-4" />} text={t('business.hero.instantAlert')} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <RevealSection>
      <section className="bg-[#FAFAF7] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <StatItem value="10+" label={t('business.stats.activities')} />
            <StatItem value="24/7" label={t('business.stats.support')} />
            <StatItem value="99.9%" label={t('business.stats.uptime')} />
            <StatItem value="30s" label={t('business.stats.storeTime')} />
          </div>
        </div>
      </section>
      </RevealSection>

      {/* What We Offer - Feature Grid */}
      <RevealSection>
      <section className="bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#00E5FF]/10 text-[#0097A7] rounded-full text-xs font-black uppercase tracking-widest mb-4">{t('business.features.badge')}</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900">
              {t('business.features.title1')} <span className="text-[#0097A7]">{t('business.features.title2')}</span>
            </h2>
            <p className="mt-4 text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              {t('business.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            <OfferCard
              icon={<Layout className="w-6 h-6" />}
              title={t('business.features.pageBuilder')}
              description={t('business.features.pageBuilderDesc')}
              accent="cyan"
            />
            <OfferCard
              icon={<PackageCheck className="w-6 h-6" />}
              title={t('business.features.productMgmt')}
              description={t('business.features.productMgmtDesc')}
              accent="purple"
            />
            <OfferCard
              icon={<BellRing className="w-6 h-6" />}
              title={t('business.features.instantNotif')}
              description={t('business.features.instantNotifDesc')}
              accent="cyan"
            />
            <OfferCard
              icon={<BarChart3 className="w-6 h-6" />}
              title={t('business.features.analytics')}
              description={t('business.features.analyticsDesc')}
              accent="purple"
            />
            <OfferCard
              icon={<Smartphone className="w-6 h-6" />}
              title={t('business.features.mobileExp')}
              description={t('business.features.mobileExpDesc')}
              accent="cyan"
            />
            <OfferCard
              icon={<Shield className="w-6 h-6" />}
              title={t('business.features.security')}
              description={t('business.features.securityDesc')}
              accent="purple"
            />
          </div>
        </div>
      </section>
      </RevealSection>

      {/* How It Works - Steps */}
      <RevealSection>
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#00E5FF]/10 text-[#0097A7] rounded-full text-xs font-black uppercase tracking-widest mb-4">{t('business.steps.badge')}</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900">
              {t('business.steps.title1')} <span className="text-[#0097A7]">{t('business.steps.title2')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <StepCard
              step="1"
              title={t('business.steps.step1Title')}
              description={t('business.steps.step1Desc')}
              icon={<Zap className="w-7 h-7" />}
            />
            <StepCard
              step="2"
              title={t('business.steps.step2Title')}
              description={t('business.steps.step2Desc')}
              icon={<Layout className="w-7 h-7" />}
            />
            <StepCard
              step="3"
              title={t('business.steps.step3Title')}
              description={t('business.steps.step3Desc')}
              icon={<Store className="w-7 h-7" />}
            />
          </div>

          <div className="mt-12 md:mt-16 text-center">
            <Link
              to="/business/onboarding"
              className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl hover:bg-slate-800 transition-colors"
            >
              {t('business.startNowFree')}
              <ArrowLeft className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>
      </RevealSection>

      {/* Dashboard Preview Section */}
      <RevealSection>
      <section className="bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#00E5FF]/10 text-[#0097A7] rounded-full text-xs font-black uppercase tracking-widest mb-4">{t('business.dashboard.badge')}</span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6 md:mb-8">
                {t('business.dashboard.title1')} <span className="text-[#0097A7]">{t('business.dashboard.title2')}</span>
              </h2>
              <div className="space-y-5 md:space-y-6">
                <CheckItem text={t('business.dashboard.check1')} />
                <CheckItem text={t('business.dashboard.check2')} />
                <CheckItem text={t('business.dashboard.check3')} />
                <CheckItem text={t('business.dashboard.check4')} />
              </div>
              <div className="mt-10 md:mt-14">
                <Link to="/business/onboarding" className="inline-flex items-center gap-3 font-black text-xl md:text-2xl text-[#0097A7] hover:text-[#00796B] transition-colors">
                  {t('business.registerStore')} <ArrowLeft className="w-7 h-7 md:w-8 md:h-8" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#00E5FF]/8 via-transparent to-[#BD00FF]/8 rounded-[2rem] blur-2xl hidden md:block" />
              <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-slate-100 overflow-hidden">
                <img src="/images/business/dashboard-hero.png" className="w-full" alt={t('business.dashboard.altImg')} />
              </div>
            </div>
          </div>
        </div>
      </section>
      </RevealSection>

      {/* Industries / Activities */}
      <RevealSection>
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#00E5FF]/10 text-[#0097A7] rounded-full text-xs font-black uppercase tracking-widest mb-4">{t('business.industries.badge')}</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900">
              {t('business.industries.title1')} <span className="text-[#0097A7]">{t('business.industries.title2')}</span>
            </h2>
            <p className="mt-4 text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              {t('business.industries.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <IndustryPill icon={<Store className="w-5 h-5" />} label={t('business.industries.generalStores')} />
            <IndustryPill icon={<PackageCheck className="w-5 h-5" />} label={t('business.industries.supermarket')} />
            <IndustryPill icon={<Globe className="w-5 h-5" />} label={t('business.industries.restaurants')} />
            <IndustryPill icon={<Smartphone className="w-5 h-5" />} label={t('business.industries.electronics')} />
            <IndustryPill icon={<Users className="w-5 h-5" />} label={t('business.industries.clinics')} />
            <IndustryPill icon={<Shield className="w-5 h-5" />} label={t('business.industries.pharmacies')} />
            <IndustryPill icon={<Clock className="w-5 h-5" />} label={t('business.industries.hotelBookings')} />
            <IndustryPill icon={<Star className="w-5 h-5" />} label={t('business.industries.fashion')} />
            <IndustryPill icon={<BarChart3 className="w-5 h-5" />} label={t('business.industries.realEstate')} />
            <IndustryPill icon={<Zap className="w-5 h-5" />} label={t('business.industries.cars')} />
            <IndustryPill icon={<Layout className="w-5 h-5" />} label={t('business.industries.services')} />
            <IndustryPill icon={<BellRing className="w-5 h-5" />} label={t('business.industries.other')} />
          </div>
        </div>
      </section>
      </RevealSection>

      {/* About Us Section */}
      <RevealSection id="about">
      <section ref={aboutRef} className="bg-slate-900 text-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#00E5FF]/15 text-[#00E5FF] rounded-full text-xs font-black uppercase tracking-widest mb-4">{t('business.about.badge')}</span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 md:mb-8">
                {t('business.about.title1')} <span className="text-[#00E5FF]">{t('business.about.title2')}</span>
              </h2>
              <p className="text-white/70 text-lg md:text-xl leading-relaxed font-medium mb-6">
                {t('business.about.desc1')}
              </p>
              <p className="text-white/60 text-base md:text-lg leading-relaxed font-medium mb-8">
                {t('business.about.desc2')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/business/onboarding"
                  className="inline-flex items-center justify-center gap-2 bg-[#00E5FF] text-slate-900 px-8 py-4 rounded-2xl font-black text-base hover:bg-[#00D4EE] transition-colors"
                >
                  {t('business.startFreeTrial')}
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-base hover:bg-white/5 transition-colors"
                >
                  {t('common.contactUs')}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              <AboutCard icon={<Globe className="w-8 h-8" />} title={t('business.about.arabicPlatform')} description={t('business.about.arabicPlatformDesc')} />
              <AboutCard icon={<Zap className="w-8 h-8" />} title={t('business.about.easeOfUse')} description={t('business.about.easeOfUseDesc')} />
              <AboutCard icon={<Shield className="w-8 h-8" />} title={t('business.about.globalSecurity')} description={t('business.about.globalSecurityDesc')} />
              <AboutCard icon={<Users className="w-8 h-8" />} title={t('business.about.continuousSupport')} description={t('business.about.continuousSupportDesc')} />
            </div>
          </div>
        </div>
      </section>
      </RevealSection>

      {/* CTA Section */}
      <RevealSection>
      <section className="bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
          <div className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#00E5FF]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#BD00FF]/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 md:mb-6">
                {t('business.readyToStart')}
              </h2>
              <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-8 md:mb-10 font-medium">
                {t('business.noCreditCard')}
              </p>
              <div className="max-w-3xl mx-auto mb-8 md:mb-10">
                <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-sm p-6 md:p-7 text-right" dir="rtl">
                  <div className="flex flex-col md:flex-row-reverse md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/15 text-amber-300 font-black text-xs">
                        {t('business.mapListingCta.badge')}
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                        {t('business.mapListingCta.title')}
                      </h3>
                      <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed">
                        {t('business.mapListingCta.subtitle')}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Link
                        to="/map/add-listing"
                        className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 text-white rounded-2xl font-black text-base hover:bg-amber-600 transition-colors w-full md:w-auto"
                      >
                        {t('business.mapListingCta.button')}
                        <ArrowLeft className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/business/onboarding"
                  className="inline-flex items-center gap-3 bg-[#00E5FF] text-slate-900 px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl hover:bg-[#00D4EE] transition-colors"
                >
                  {t('business.startFreeNow')}
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <button
                  type="button"
                  onClick={scrollToAbout}
                  className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-5 rounded-2xl font-black text-lg hover:bg-white/5 transition-colors"
                >
                  {t('business.getToKnowUs')}
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      </RevealSection>

      {/* Floating Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-[85] md:hidden pointer-events-none">
        <div className="px-4 pb-4 pt-12 bg-gradient-to-t from-black/40 via-black/20 to-transparent pointer-events-auto">
          <Link
            to="/business/onboarding"
            className="block w-full bg-[#00E5FF] text-slate-900 py-4 rounded-2xl font-black text-base text-center shadow-lg shadow-cyan-500/25"
          >
            {t('business.startFreeNow')}
          </Link>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`fixed bottom-20 md:bottom-8 left-6 z-[85] w-11 h-11 rounded-xl bg-slate-900/80 backdrop-blur-sm text-white flex items-center justify-center shadow-lg border border-white/10 transition-all duration-300 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        aria-label={t('common.backToTop')}
      >
        <ChevronUp size={20} />
      </button>

      {/* Business Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-300">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-[#00E5FF] rounded-xl flex items-center justify-center overflow-hidden">
                  <img src="/brand/logo.png" className="w-full h-full object-contain" alt="" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white uppercase">MNMKNK</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm">
                {t('business.platformDesc')}
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-black text-white mb-4 uppercase tracking-wider">{t('business.product')}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/business/onboarding" className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('business.createStore')}</Link></li>
                <li><Link to="/courier" className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('business.courierSignup')}</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-black text-white mb-4 uppercase tracking-wider">{t('business.company')}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><button type="button" onClick={scrollToAbout} className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('common.aboutUs')}</button></li>
                <li><Link to="/" className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('common.home')}</Link></li>
                <li><Link to="/blog" className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('business.blog')}</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-black text-white mb-4 uppercase tracking-wider">{t('business.supportAndTerms')}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/support" className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('common.helpCenter')}</Link></li>
                <li><Link to="/terms" className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('common.terms')}</Link></li>
                <li><Link to="/privacy" className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('common.privacy')}</Link></li>
                <li><Link to="/contact" className="text-slate-400 hover:text-[#00E5FF] transition-colors">{t('common.contactUs')}</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-10 pt-8 border-t border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 flex-row-reverse">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10">
                  <Mail size={16} />
                </div>
                <a href="mailto:mnmknk.eg@gmail.com" className="font-bold text-sm md:text-base text-slate-300 hover:text-white transition-colors">
                  mnmknk.eg@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 flex-row-reverse">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/10">
                  <Phone size={16} />
                </div>
                <a href="tel:01067461059" className="font-bold text-sm md:text-base text-slate-300 hover:text-white transition-colors">
                  01067461059
                </a>
              </div>
              <div className="flex items-center gap-3 flex-row-reverse md:justify-end">
                <a
                  href="mailto:mnmknk.eg@gmail.com"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-[#00E5FF]/40 hover:bg-white/15 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(0,229,255,0.25)]"
                  aria-label="Gmail"
                >
                  <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
                <a
                  href="https://wa.me/201067461059"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-emerald-400/40 hover:bg-white/15 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(16,185,129,0.25)]"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon size={16} />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61587556276694"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 text-white flex items-center justify-center transition-all ring-1 ring-white/10 hover:ring-blue-400/40 hover:bg-white/15 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(96,165,250,0.25)]"
                  aria-label="Facebook"
                >
                  <Facebook size={16} className="sm:w-[18px] sm:h-[18px]" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} MNMKNK. {t('common.allRightsReserved')}</p>
            <p className="font-medium">{t('brand.nameBusiness')}</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

const HeroPill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="px-4 py-2.5 rounded-xl bg-white/8 backdrop-blur-sm border border-white/10 flex items-center gap-2.5">
    <span className="text-[#00E5FF]">{icon}</span>
    <span className="font-bold text-sm">{text}</span>
  </div>
);

const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-1">{value}</div>
    <div className="text-slate-400 text-sm font-medium">{label}</div>
  </div>
);

const OfferCard: React.FC<{ icon: React.ReactNode; title: string; description: string; accent: 'cyan' | 'purple' }> = ({ icon, title, description, accent }) => (
  <div className="group bg-white rounded-2xl p-6 md:p-8 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${accent === 'cyan' ? 'bg-[#00E5FF]/10 text-[#0097A7]' : 'bg-[#BD00FF]/10 text-[#9C27B0]'}`}>
      {icon}
    </div>
    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">{description}</p>
  </div>
);

const StepCard: React.FC<{ step: string; title: string; description: string; icon: React.ReactNode }> = ({ step, title, description, icon }) => (
  <div className="text-center md:text-right">
    <div className="flex items-center gap-4 mb-5 md:justify-start justify-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-900 text-[#00E5FF] flex items-center justify-center font-black text-2xl">
        {step}
      </div>
      <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 text-[#0097A7] flex items-center justify-center">
        {icon}
      </div>
    </div>
    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">{description}</p>
  </div>
);

const CheckItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex gap-3 items-start flex-row-reverse">
    <CheckCircle2 className="w-5 h-5 text-[#0097A7] shrink-0 mt-0.5" />
    <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">{text}</p>
  </div>
);

const IndustryPill: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex flex-col items-center gap-2.5 p-4 md:p-5 bg-[#FAFAF7] rounded-2xl border border-slate-100 hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/5 transition-colors cursor-default">
    <div className="text-[#0097A7]">{icon}</div>
    <span className="text-xs md:text-sm font-bold text-slate-600 text-center">{label}</span>
  </div>
);

const AboutCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white/5 rounded-2xl p-5 md:p-6 border border-white/10">
    <div className="text-[#00E5FF] mb-3">{icon}</div>
    <h4 className="text-lg font-black text-white mb-1.5">{title}</h4>
    <p className="text-white/50 text-sm font-medium">{description}</p>
  </div>
);

export default BusinessLanding;
