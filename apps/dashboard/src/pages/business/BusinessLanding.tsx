import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import {
  TrendingUp, ArrowLeft, Zap, ShoppingCart, BarChart3, Palette,
  Globe, Shield, Star, ChevronDown, Store,
  Smartphone, CreditCard, Truck, Users, Sparkles, Package,
  Building2, Utensils, Scissors, Stethoscope, Car, Home as HomeIcon,
  Wrench, GraduationCap, Dumbbell, Ticket, ShoppingBag,
  MessageSquare, Bell, LayoutDashboard, Settings,
  Rocket, Target, Award, Layers, Code2, Headphones,
  Image as ImageIcon, Quote, Eye, MapPin, TrendingDown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const { Link } = ReactRouterDOM as any;

/* ─────────────────────────────────────────────
   CSS Keyframe Animations (injected once)
   ───────────────────────────────────────────── */
const ANIMATION_STYLES = `
@keyframes bl-gradient-shift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}
@keyframes bl-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
@keyframes bl-float-slow {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(3deg); }
}
@keyframes bl-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes bl-fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes bl-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes bl-scale-in {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes bl-pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.15); }
  50% { box-shadow: 0 0 40px rgba(0, 229, 255, 0.35); }
}
@keyframes bl-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes bl-spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes bl-bounce-arrow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}
@keyframes bl-bar-grow {
  from { height: 0; }
  to { height: var(--bar-h); }
}
@keyframes bl-gradient-text {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes bl-dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
}
@keyframes bl-ken-burns {
  0% { transform: scale(1); }
  100% { transform: scale(1.12); }
}
.bl-anim-gradient { animation: bl-gradient-shift 8s ease-in-out infinite; }
.bl-anim-float { animation: bl-float 4s ease-in-out infinite; }
.bl-anim-float-slow { animation: bl-float-slow 6s ease-in-out infinite; }
.bl-anim-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  background-size: 200% 100%;
  animation: bl-shimmer 3s linear infinite;
}
.bl-anim-pulse-glow { animation: bl-pulse-glow 3s ease-in-out infinite; }
.bl-anim-spin-slow { animation: bl-spin-slow 20s linear infinite; }
.bl-anim-bounce { animation: bl-bounce-arrow 2s ease-in-out infinite; }
.bl-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.bl-reveal.bl-revealed { opacity: 1; transform: translateY(0); }
.bl-card-hover {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
}
.bl-card-hover:hover {
  transform: translateY(-4px);
}
/* Hero slide crossfade (each time React remounts the block via key=) */
.bl-hero-slide {
  animation: bl-fade-up 0.85s cubic-bezier(0.16, 1, 0.3, 1);
}
/* Gradient animated text for "world-class" emphasis */
.bl-gradient-text {
  background: linear-gradient(90deg, #00E5FF, #7C3AED, #00E5FF);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: bl-gradient-text 4s ease-in-out infinite;
}
/* Infinite marquee track */
.bl-marquee-track {
  display: flex;
  width: max-content;
  animation: bl-marquee 26s linear infinite;
}
.bl-marquee-track:hover { animation-play-state: paused; }
/* Hero progress dots */
.bl-hero-dot {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.bl-hero-dot.active {
  animation: bl-dot-pulse 1.6s ease-in-out infinite;
}
/* Any image inside .bl-img-zoom slowly zooms on hover — use for
   theme/screenshot cards so real <img> assets feel alive */
.bl-img-zoom { overflow: hidden; }
.bl-img-zoom img {
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease;
  will-change: transform;
}
.bl-img-zoom:hover img { transform: scale(1.08); }
/* Slow ambient zoom (Ken Burns) for hero/showcase stills, no hover needed */
.bl-ken-burns { animation: bl-ken-burns 14s ease-in-out infinite alternate; }
/* Subtle 3D tilt for feature/theme cards on hover */
.bl-tilt-card {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
}
.bl-tilt-card:hover {
  transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(-6px);
}
/* Hide scrollbar for horizontal carousels */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
/* Grayscale-to-color logo strip */
.bl-logo-mark {
  filter: grayscale(1) brightness(1.6) opacity(0.45);
  transition: filter 0.35s ease, opacity 0.35s ease, transform 0.35s ease;
}
.bl-logo-mark:hover {
  filter: grayscale(0) brightness(1) opacity(1);
  transform: translateY(-2px);
}
@media (prefers-reduced-motion: reduce) {
  .bl-anim-gradient, .bl-anim-float, .bl-anim-float-slow,
  .bl-anim-shimmer, .bl-anim-pulse-glow, .bl-anim-spin-slow,
  .bl-anim-bounce, .bl-reveal, .bl-hero-slide, .bl-gradient-text,
  .bl-marquee-track, .bl-hero-dot, .bl-ken-burns, .bl-tilt-card,
  .bl-img-zoom img {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

/* ─────────────────────────────────────────────
   Scroll Reveal Hook
   ───────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bl-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    const els = document.querySelectorAll('.bl-reveal');
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────
   Animated Counter
   ───────────────────────────────────────────── */
function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

/* ─────────────────────────────────────────────
   Reveal Section Wrapper
   ───────────────────────────────────────────── */
const RevealSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className = '', delay = 0,
}) => (
  <div
    className={`bl-reveal ${className}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    {children}
  </div>
);


/* ─────────────────────────────────────────────
   Main BusinessLanding Component
   ───────────────────────────────────────────── */
const BusinessLanding: React.FC = () => {
  const { t } = useTranslation();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroProgress, setHeroProgress] = useState(0);
  useScrollReveal();

  // Scroll handlers
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 600);
      if (statsRef.current && !statsStarted) {
        const rect = statsRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) setStatsStarted(true);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [statsStarted]);

  // Hero scroll progress — drives text-rise / fade as user scrolls
  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const sectionHeight = heroRef.current.offsetHeight;
      const scrollableDistance = sectionHeight - window.innerHeight;
      if (scrollableDistance <= 0) return;
      const scrolled = Math.max(0, -rect.top);
      setHeroProgress(Math.min(1, scrolled / scrollableDistance));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const marqueeItems = useMemo(() => [
    t('business.landing.marquee.0', 'أفضل الثيمات المطورة في العالم'),
    t('business.landing.marquee.1', 'تصميم عالمي المستوى'),
    t('business.landing.marquee.2', 'أداء فائق السرعة'),
    t('business.landing.marquee.3', 'دعم على مدار الساعة'),
    t('business.landing.marquee.4', 'أمان من الطراز الأول'),
  ], [t]);

  /* Theme showcase — real screenshots go here. Each item points at an
     <img>; swap the src for a real render of that theme. */
  const themeShowcase = useMemo(() => [
    { image: '/images/themes/theme-retail.jpg', tag: t('business.landing.themes.0.tag', 'الأكثر طلباً'), title: t('business.landing.themes.0.title', 'ثيم "متجر التجزئة"'), desc: t('business.landing.themes.0.desc', 'مثالي لعرض المنتجات بشبكة أنيقة وفلاتر سريعة') },
    { image: '/images/themes/theme-restaurant.jpg', tag: t('business.landing.themes.1.tag', 'جديد'), title: t('business.landing.themes.1.title', 'ثيم "المطاعم والكافيهات"'), desc: t('business.landing.themes.1.desc', 'قوائم طعام تفاعلية وحجز طاولات مدمج') },
    { image: '/images/themes/theme-services.jpg', tag: t('business.landing.themes.2.tag', 'مميز'), title: t('business.landing.themes.2.title', 'ثيم "الخدمات الاحترافية"'), desc: t('business.landing.themes.2.desc', 'صفحات حجز مواعيد وعرض أعمال أنيق') },
    { image: '/images/themes/theme-fashion.jpg', tag: t('business.landing.themes.3.tag', 'الأكثر تقييماً'), title: t('business.landing.themes.3.title', 'ثيم "الأزياء والموضة"'), desc: t('business.landing.themes.3.desc', 'تجربة تسوق بصرية غنية بالحركة والتفاصيل') },
  ], [t]);

  /* Partner / trusted-by logo strip — replace with real client marks */
  const partnerLogos = useMemo(() => [
    '/images/logos/partner-1.svg',
    '/images/logos/partner-2.svg',
    '/images/logos/partner-3.svg',
    '/images/logos/partner-4.svg',
    '/images/logos/partner-5.svg',
    '/images/logos/partner-6.svg',
  ], []);

  const features = useMemo(() => [
    { icon: ShoppingCart, title: t('business.landing.features.store'), desc: t('business.landing.features.storeDesc'), color: 'from-cyan-500 to-blue-500', span: 'md:col-span-2', image: '/images/features/store-preview.jpg' },
    { icon: BarChart3, title: t('business.landing.features.analytics'), desc: t('business.landing.features.analyticsDesc'), color: 'from-violet-500 to-purple-500', span: '', image: null },
    { icon: Palette, title: t('business.landing.features.builder'), desc: t('business.landing.features.builderDesc'), color: 'from-pink-500 to-rose-500', span: '', image: null },
    { icon: Globe, title: t('business.landing.features.channels'), desc: t('business.landing.features.channelsDesc'), color: 'from-emerald-500 to-teal-500', span: 'md:col-span-2', image: '/images/features/channels-preview.jpg' },
  ], [t]);

  const steps = useMemo(() => [
    { icon: Store, title: t('business.landing.steps.0.title'), desc: t('business.landing.steps.0.desc'), num: '01' },
    { icon: Palette, title: t('business.landing.steps.1.title'), desc: t('business.landing.steps.1.desc'), num: '02' },
    { icon: Rocket, title: t('business.landing.steps.2.title'), desc: t('business.landing.steps.2.desc'), num: '03' },
  ], [t]);

  const industries = useMemo(() => [
    { icon: Utensils, label: t('business.landing.industries.restaurants') },
    { icon: ShoppingBag, label: t('business.landing.industries.retail') },
    { icon: Scissors, label: t('business.landing.industries.salon') },
    { icon: Stethoscope, label: t('business.landing.industries.clinic') },
    { icon: Car, label: t('business.landing.industries.cars') },
    { icon: HomeIcon, label: t('business.landing.industries.realestate') },
    { icon: Wrench, label: t('business.landing.industries.services') },
    { icon: GraduationCap, label: t('business.landing.industries.education') },
    { icon: Dumbbell, label: t('business.landing.industries.fitness') },
    { icon: Ticket, label: t('business.landing.industries.events') },
    { icon: Package, label: t('business.landing.industries.wholesale') },
    { icon: Building2, label: t('business.landing.industries.corporate') },
  ], [t]);

  const growthPoints = useMemo(() => [
    { icon: Target, title: t('business.landing.growth.0.title'), desc: t('business.landing.growth.0.desc') },
    { icon: Zap, title: t('business.landing.growth.1.title'), desc: t('business.landing.growth.1.desc') },
    { icon: Award, title: t('business.landing.growth.2.title'), desc: t('business.landing.growth.2.desc') },
    { icon: Layers, title: t('business.landing.growth.3.title'), desc: t('business.landing.growth.3.desc') },
  ], [t]);

  const stats = useMemo(() => [
    { value: 50, suffix: '+', label: t('business.landing.stats.activities') },
    { value: 24, suffix: '/7', label: t('business.landing.stats.support') },
    { value: 99, suffix: '%', label: t('business.landing.stats.uptime') },
    { value: 3, suffix: 'x', label: t('business.landing.stats.growth') },
  ], [t]);

  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      {/* ═══════════════════════════════════════
          HERO SECTION — sticky video with text
          that rises and fades as you scroll.
          Video stays pinned underneath.
          ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative bg-slate-950" style={{ height: '150vh' }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden flex items-center justify-center">
          {/* Background video — stays fixed while text scrolls away */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            poster="/videos/business-hero-poster.webp"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/business-hero.mp4" type="video/mp4" />
            <source src="/videos/business-hero.webm" type="video/webm" />
          </video>

          {/* Subtle gradient for text readability at the start */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/30 to-slate-950/70 transition-opacity duration-300"
            style={{ opacity: Math.max(0, 1 - heroProgress * 1.5) }}
          />

          {/* Text content — rises and fades as you scroll down */}
          <div
            className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-5 md:px-6 text-center"
            style={{
              transform: `translateY(-${heroProgress * 30}vh)`,
              opacity: Math.max(0, 1 - heroProgress * 2.5),
            }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4 md:mb-8 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00E5FF]" />
              {t('business.landing.heroBadge')}
            </div>

            {/* Main heading */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-3 md:mb-6 leading-[1.05] text-white">
              {t('business.landing.heroTitle1')}
              <br />
              <span className="bl-gradient-text">{t('business.landing.heroTitle2')}</span>
            </h1>

            {/* Sub heading */}
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight mb-2 md:mb-4">
              {t('business.landing.heroSubtitle')} <span className="text-[#00E5FF]">{t('business.landing.heroSubtitleHighlight')}</span>
            </h2>

            {/* Description */}
            <p className="text-white/70 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 md:mb-10 leading-relaxed">
              {t('business.landing.heroDesc')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto mb-8">
              <Link
                to="/business/onboarding"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00E5FF] text-slate-900 px-6 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                {t('business.landing.heroCta')}
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base hover:bg-white/15 transition-all duration-300 cursor-pointer"
              >
                {t('business.landing.heroDemo')}
              </a>
              <Link
                to="/download-app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-[#00E5FF]/30 text-[#00E5FF] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base hover:bg-[#00E5FF]/10 transition-all duration-300 cursor-pointer"
              >
                <Smartphone className="w-5 h-5" />
                {t('business.landing.downloadApp', { defaultValue: 'تحميل تطبيق الديسكتوب' })}
              </Link>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: Shield, text: t('business.landing.trustPill1') },
                { icon: Zap, text: t('business.landing.trustPill2') },
                { icon: Headphones, text: t('business.landing.trustPill3') },
              ].map((item, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium"
                >
                  <item.icon className="w-4 h-4 text-[#00E5FF]" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator — only at the start */}
          {heroProgress < 0.1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block z-10">
              <ChevronDown className="w-6 h-6 text-white/40 bl-anim-bounce" />
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRUST MARQUEE — "world-class themes" claim,
          scrolling infinitely, pauses on hover
          ═══════════════════════════════════════ */}
      <section className="relative bg-white border-y border-slate-100 py-5 md:py-6 overflow-hidden">
        <div className="bl-marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-6 md:px-8 shrink-0">
              <span className="text-slate-600 font-bold text-sm md:text-base whitespace-nowrap">{item}</span>
              <Sparkles className="w-4 h-4 text-cyan-500 shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          THEME SHOWCASE — real screenshots. This is
          the section that backs up the "أفضل الثيمات
          المطورة في العالم" claim with actual visuals.
          Each card's <img src> is a placeholder —
          swap in real theme renders/screenshots.
          ═══════════════════════════════════════ */}
      <section className="relative bg-white py-20 md:py-32 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <RevealSection className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-bold uppercase tracking-widest mb-5">
              <Eye className="w-3.5 h-3.5" />
              {t('business.landing.themes.badge', 'شاهد الفرق بنفسك')}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              {t('business.landing.themes.title', 'نصمم')} <span className="text-cyan-600">{t('business.landing.themes.titleHighlight', 'أفضل الثيمات المطورة في العالم')}</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('business.landing.themes.subtitle', 'كل ثيم مبني بمعايير تصميم عالمية، ومُختبر على أعلى أداء وسرعة تحميل')}
            </p>
          </RevealSection>

          <div className="flex overflow-x-auto gap-5 md:gap-6 pb-4 snap-x snap-mandatory scrollbar-hide">
            {themeShowcase.map((theme, i) => (
              <RevealSection
                key={i}
                delay={i * 90}
                className="group relative rounded-3xl border border-slate-200 bg-white overflow-hidden flex-shrink-0 w-[85vw] sm:w-[45vw] md:w-[400px] snap-start shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                {/* Screenshot frame */}
                <div className="relative aspect-[16/10] bl-img-zoom bg-slate-100">
                  <img
                    src={theme.image}
                    alt={theme.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Graceful placeholder until a real screenshot is added
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <ImageIcon className="w-10 h-10 text-slate-300" />
                  </div>
                  {/* Overlay gradient + tag */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
                  <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-cyan-500 text-white text-xs font-black">
                    {theme.tag}
                  </span>
                  {/* View button on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm">
                      <Eye className="w-4 h-4" />
                      {t('business.landing.themes.preview', 'معاينة الثيم')}
                    </span>
                  </div>
                </div>
                {/* Caption */}
                <div className="p-5 md:p-6">
                  <h3 className="text-slate-900 font-bold text-lg mb-1.5">{theme.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{theme.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>

          <RevealSection className="text-center mt-10 md:mt-12">
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all duration-300 cursor-pointer"
            >
              {t('business.landing.themes.viewAll', 'استعراض جميع الثيمات')}
              <ArrowLeft className="w-4 h-4" />
            </a>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ABOUT SECTION
          ═══════════════════════════════════════ */}
      <section id="about" className="relative bg-slate-900 py-20 md:py-32 overflow-hidden z-20">
        {/* Background effects — hidden on mobile for performance */}
        <div className="hidden md:block absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/5 blur-[100px]" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950 to-transparent" />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 relative">
          <RevealSection className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              {t('business.landing.aboutSection.title')}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              {t('business.landing.aboutSection.subtitle')}
            </h2>
          </RevealSection>

          {/* Mission, Vision, Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
            {[
              {
                icon: Target,
                title: t('business.landing.aboutSection.missionTitle'),
                desc: t('business.landing.aboutSection.mission'),
                color: 'from-cyan-500 to-blue-500',
              },
              {
                icon: Award,
                title: t('business.landing.aboutSection.visionTitle'),
                desc: t('business.landing.aboutSection.vision'),
                color: 'from-violet-500 to-purple-500',
              },
              {
                icon: Users,
                title: t('business.landing.aboutSection.communityTitle'),
                desc: t('business.landing.aboutSection.community'),
                color: 'from-pink-500 to-rose-500',
              },
            ].map((item, i) => (
              <RevealSection key={i} delay={i * 120}>
                <div className={`group relative overflow-hidden rounded-3xl bg-slate-800/50 border border-white/10 p-6 md:p-8 transition-all duration-300 hover:border-white/20 hover:-translate-y-1`}>
                  <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />
                  <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${item.color} mb-5 shadow-lg`}>
                    <item.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-white/60 text-sm md:text-base leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>

          {/* Story */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <RevealSection>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-800/50 p-8 md:p-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="relative">
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                    {t('business.landing.aboutSection.storyTitle')}
                  </h3>
                  <p className="text-white/50 text-base leading-relaxed mb-6">
                    {t('business.landing.aboutSection.story')}
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{t('business.landing.aboutSection.founded')}</div>
                      <div className="text-white/40 text-xs">{t('business.landing.aboutSection.location')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealSection>
            <RevealSection delay={200}>
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                  {t('business.landing.aboutSection.whyUsTitle')}
                </h3>
                {[
                  { icon: Shield, label: t('business.landing.aboutSection.why1'), color: 'text-blue-400' },
                  { icon: Zap, label: t('business.landing.aboutSection.why2'), color: 'text-amber-400' },
                  { icon: Globe, label: t('business.landing.aboutSection.why3'), color: 'text-emerald-400' },
                  { icon: Headphones, label: t('business.landing.aboutSection.why4'), color: 'text-rose-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed">{item.label}</p>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRUSTED-BY LOGO STRIP — replace the SVGs
          in partnerLogos with real client/partner
          marks once available.
          ═══════════════════════════════════════ */}
      <section className="relative z-20 bg-white border-y border-slate-100 py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-7">
            {t('business.landing.partners.title', 'موثوق من أصحاب أعمال في كل مكان')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14">
            {partnerLogos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`partner-${i + 1}`}
                className="bl-logo-mark h-6 md:h-7 w-auto object-contain"
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES (Bento Grid)
          ═══════════════════════════════════════ */}
      <section id="features" className="relative z-20 bg-gradient-to-b from-white to-slate-50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <RevealSection className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold mb-6">
              <Zap className="w-4 h-4" />
              {t('business.landing.features.title')}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              {t('business.landing.features.title')}
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('business.landing.features.subtitle')}
            </p>
          </RevealSection>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, i) => (
              <RevealSection
                key={i}
                delay={i * 80}
                className={`group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-slate-300 ${feature.span}`}
              >
                {/* Glow on hover */}
                <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
                <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-5 shadow-lg`}>
                  <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  {feature.desc}
                </p>

                {/* Preview screenshot slot — only on the wide cards.
                    Replace the src with a real product screenshot. */}
                {feature.image && (
                  <div className="relative mt-5 rounded-2xl overflow-hidden border border-slate-200 bl-img-zoom aspect-[16/7] bg-slate-50">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fb) fb.style.display = 'flex';
                      }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    </div>
                  </div>
                )}
              </RevealSection>
            ))}
          </div>

          {/* Secondary features row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
            {[
              { icon: Smartphone, label: t('business.landing.features.mobile') },
              { icon: CreditCard, label: t('business.landing.features.payments') },
              { icon: Truck, label: t('business.landing.features.shipping') },
              { icon: Users, label: t('business.landing.features.customers') },
            ].map((item, i) => (
              <RevealSection
                key={i}
                delay={i * 60}
                className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <item.icon className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                <span className="text-slate-700 text-sm font-medium">{item.label}</span>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS — sticky section
          ═══════════════════════════════════════ */}
      <div className="relative z-20 bg-white">
        <section className="relative sticky top-0 min-h-[70vh] md:min-h-screen flex items-center py-12 md:py-32 overflow-hidden">
          {/* Background effects — hidden on mobile for performance */}
          <div className="hidden md:block absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/5 blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto px-5 sm:px-6 relative w-full">
            <RevealSection className="text-center mb-12 md:mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold mb-6">
                <Sparkles className="w-4 h-4" />
                {t('business.landing.steps.title')}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                {t('business.landing.steps.title')}
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                {t('business.landing.steps.subtitle')}
              </p>
            </RevealSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

              {steps.map((step, i) => (
                <RevealSection key={i} delay={i * 120} className="text-center">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white border border-slate-200 mb-6 mx-auto transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-slate-200/50 hover:border-cyan-300">
                    <step.icon className="w-7 h-7 md:w-8 md:h-8 text-cyan-600" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyan-500 text-white text-xs font-black flex items-center justify-center shadow-lg shadow-cyan-500/30">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════
          DASHBOARD PREVIEW — Scroll-stacking feature pages
          Each page is sticky and gets covered by the next
          ═══════════════════════════════════════ */}
      <div className="relative z-20 bg-white">
        {/* Intro header — shorter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 pt-12 md:pt-24 pb-6 md:pb-8 text-center">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold mb-4">
              <LayoutDashboard className="w-4 h-4" />
              {t('business.landing.dashboard.title')}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
              {t('business.landing.dashboard.title')}
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('business.landing.dashboard.subtitle')}
            </p>
          </RevealSection>
        </div>

        {/* Feature pages — each sticky, covered by the next */}
        {[
          {
            icon: ShoppingCart,
            title: t('business.landing.dashboard.pages.orders.title'),
            desc: t('business.landing.dashboard.pages.orders.desc'),
            image: '/images/dashboard/orders.jpg',
            color: 'from-cyan-500 to-blue-500',
            bg: 'bg-slate-50',
          },
          {
            icon: BarChart3,
            title: t('business.landing.dashboard.pages.analytics.title'),
            desc: t('business.landing.dashboard.pages.analytics.desc'),
            image: '/images/dashboard/analytics.jpg',
            color: 'from-violet-500 to-purple-500',
            bg: 'bg-white',
          },
          {
            icon: Package,
            title: t('business.landing.dashboard.pages.products.title'),
            desc: t('business.landing.dashboard.pages.products.desc'),
            image: '/images/dashboard/products.jpg',
            color: 'from-amber-500 to-orange-500',
            bg: 'bg-slate-50',
          },
          {
            icon: Users,
            title: t('business.landing.dashboard.pages.customers.title'),
            desc: t('business.landing.dashboard.pages.customers.desc'),
            image: '/images/dashboard/customers.jpg',
            color: 'from-emerald-500 to-green-500',
            bg: 'bg-white',
          },
          {
            icon: Palette,
            title: t('business.landing.dashboard.pages.design.title'),
            desc: t('business.landing.dashboard.pages.design.desc'),
            image: '/images/dashboard/design.jpg',
            color: 'from-pink-500 to-rose-500',
            bg: 'bg-slate-50',
          },
        ].map((page, i) => (
          <section
            key={i}
            className={`relative ${page.bg} sticky top-0 min-h-[70vh] md:min-h-screen flex items-center py-10 md:py-24 overflow-hidden`}
            style={{ zIndex: 30 + i }}
          >
            {/* Background glow — hidden on mobile for performance */}
            <div className={`hidden md:block absolute top-1/2 ${i % 2 === 0 ? 'left-0' : 'right-0'} w-[40vw] h-[40vw] rounded-full bg-gradient-to-br ${page.color} opacity-[0.04] blur-[100px]`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 relative w-full">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-16 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Text side */}
                <RevealSection className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${page.color} mb-4 md:mb-6 shadow-lg`}>
                    <page.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-3 md:mb-4">
                    {page.title}
                  </h3>
                  <p className="text-slate-500 text-sm md:text-lg leading-relaxed max-w-lg">
                    {page.desc}
                  </p>
                </RevealSection>

                {/* Image side — placeholder for user's screenshots/videos */}
                <RevealSection delay={150} className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 shadow-xl md:shadow-2xl bg-slate-100 aspect-[16/10]">
                    <img
                      src={page.image}
                      alt={page.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    {/* Placeholder until real screenshots are added */}
                    <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <div className="text-center">
                        <page.icon className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-2 md:mb-3" />
                        <p className="text-slate-400 text-xs md:text-sm font-medium">{page.title}</p>
                      </div>
                    </div>
                  </div>
                </RevealSection>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          INDUSTRIES
          ═══════════════════════════════════════ */}
      <section className="relative z-20 bg-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <RevealSection className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold mb-6">
              <Building2 className="w-4 h-4" />
              {t('business.landing.industries.title')}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              {t('business.landing.industries.title')}
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('business.landing.industries.subtitle')}
            </p>
          </RevealSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {industries.map((industry, i) => (
              <RevealSection
                key={i}
                delay={i * 50}
                className="group flex flex-col items-center justify-center gap-3 p-5 md:p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-cyan-50 transition-colors duration-300">
                  <industry.icon className="w-5 h-5 text-slate-500 group-hover:text-cyan-600 transition-colors duration-300" />
                </div>
                <span className="text-slate-600 text-xs md:text-sm font-medium text-center group-hover:text-slate-900 transition-colors">
                  {industry.label}
                </span>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          GROWTH SECTION
          ═══════════════════════════════════════ */}
      <section className="relative z-20 bg-gradient-to-b from-white to-slate-50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: content */}
            <div>
              <RevealSection>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold mb-6">
                  <TrendingUp className="w-4 h-4" />
                  {t('business.landing.growth.title')}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
                  {t('business.landing.growth.title')}
                </h2>
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                  {t('business.landing.growth.subtitle')}
                </p>
              </RevealSection>

              <div className="space-y-4">
                {growthPoints.map((point, i) => (
                  <RevealSection
                    key={i}
                    delay={i * 80}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                      <point.icon className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-bold text-base mb-1">{point.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{point.desc}</p>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>

            {/* Right: visual chart mockup */}
            <RevealSection delay={200}>
              <GrowthChartMockup />
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════ */}
      <section className="relative bg-slate-50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <RevealSection className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-bold mb-6">
              <Star className="w-4 h-4" />
              {t('business.landing.testimonials.title')}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              {t('business.landing.testimonials.title')}
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('business.landing.testimonials.subtitle')}
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { name: t('business.landing.testimonials.0.name'), role: t('business.landing.testimonials.0.role'), text: t('business.landing.testimonials.0.text'), rating: 5, avatar: '/images/testimonials/customer-1.jpg' },
              { name: t('business.landing.testimonials.1.name'), role: t('business.landing.testimonials.1.role'), text: t('business.landing.testimonials.1.text'), rating: 5, avatar: '/images/testimonials/customer-2.jpg' },
              { name: t('business.landing.testimonials.2.name'), role: t('business.landing.testimonials.2.role'), text: t('business.landing.testimonials.2.text'), rating: 5, avatar: '/images/testimonials/customer-3.jpg' },
            ].map((testimonial, i) => (
              <RevealSection
                key={i}
                delay={i * 100}
                className="relative p-6 md:p-8 rounded-3xl bg-white border border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Quote mark */}
                <Quote className="w-8 h-8 text-cyan-200 mb-2" />
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-cyan-500 text-cyan-500" />
                  ))}
                </div>
                {/* Text */}
                <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>
                {/* Author — real photo with graceful fallback to initials */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#00E5FF] to-blue-500 flex items-center justify-center text-slate-900 font-black text-sm">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="relative z-0">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold text-sm">{testimonial.name}</p>
                    <p className="text-slate-400 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ABOUT SECTION
          ═══════════════════════════════════════ */}
      <section className="relative z-20 bg-gradient-to-b from-slate-50 to-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <RevealSection>
              <div className="relative">
                {/* Decorative grid background */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-[0.07]"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,229,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                  }}
                />
                {/* Mock browser frame */}
                <div className="relative rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xl">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50">
                    <div className="w-3 h-3 rounded-full bg-red-400/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <div className="w-3 h-3 rounded-full bg-green-400/60" />
                    <div className="flex-1 mx-3 h-6 rounded-md bg-slate-100 flex items-center px-3">
                      <span className="text-slate-400 text-xs font-mono">mnmknk.com</span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 space-y-4">
                    <div className="h-8 w-3/4 rounded-lg bg-slate-200 bl-anim-shimmer" />
                    <div className="h-4 w-full rounded-md bg-slate-100" />
                    <div className="h-4 w-5/6 rounded-md bg-slate-100" />
                    <div className="flex gap-3 pt-2">
                      <div className="h-10 w-32 rounded-xl bg-cyan-100" />
                      <div className="h-10 w-28 rounded-xl bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-4">
                      <div className="h-20 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-slate-100" />
                      <div className="h-20 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-slate-100" />
                      <div className="h-20 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-slate-100" />
                    </div>
                  </div>
                </div>

                {/* Floating real photo — swap src for a founder/office/
                    storefront shot. Ken-Burns keeps it feeling alive. */}
                <div className="hidden md:block absolute -bottom-8 -left-8 w-40 lg:w-48 aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-2xl bl-anim-float-slow">
                  <img
                    src="/images/about/owner-photo.jpg"
                    alt={t('business.landing.about.photoAlt', 'أحد أصحاب الأعمال على منصتنا')}
                    className="absolute inset-0 w-full h-full object-cover bl-ken-burns"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (fb) fb.style.display = 'flex';
                    }}
                  />
                  <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-cyan-100 to-violet-100">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                </div>
              </div>
            </RevealSection>

            <div>
              <RevealSection>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
                  {t('business.landing.about.title')}
                </h2>
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                  {t('business.landing.about.subtitle')}
                </p>
              </RevealSection>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Code2, title: t('business.landing.about.0.title'), desc: t('business.landing.about.0.desc') },
                  { icon: Shield, title: t('business.landing.about.1.title'), desc: t('business.landing.about.1.desc') },
                  { icon: Rocket, title: t('business.landing.about.2.title'), desc: t('business.landing.about.2.desc') },
                  { icon: Headphones, title: t('business.landing.about.3.title'), desc: t('business.landing.about.3.desc') },
                ].map((item, i) => (
                  <RevealSection
                    key={i}
                    delay={i * 80}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <item.icon className="w-6 h-6 text-cyan-600 mb-3" />
                    <h3 className="text-slate-900 font-bold text-sm mb-2">{item.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                  </RevealSection>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRODUCTS SECTION
          ═══════════════════════════════════════ */}
      <section id="products" className="relative z-20 bg-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <RevealSection className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold mb-6">
              <Package className="w-4 h-4" />
              {t('business.landing.productsSection.title')}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              {t('business.landing.productsSection.title')}
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('business.landing.productsSection.subtitle')}
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: ShoppingCart,
                title: t('business.landing.productsSection.ecommerce'),
                desc: t('business.landing.productsSection.ecommerceDesc'),
                color: 'from-cyan-500 to-blue-500',
              },
              {
                icon: LayoutDashboard,
                title: t('business.landing.productsSection.dashboard'),
                desc: t('business.landing.productsSection.dashboardDesc'),
                color: 'from-violet-500 to-purple-500',
              },
              {
                icon: Palette,
                title: t('business.landing.productsSection.builder'),
                desc: t('business.landing.productsSection.builderDesc'),
                color: 'from-pink-500 to-rose-500',
              },
              {
                icon: BarChart3,
                title: t('business.landing.productsSection.analytics'),
                desc: t('business.landing.productsSection.analyticsDesc'),
                color: 'from-amber-500 to-orange-500',
              },
              {
                icon: Smartphone,
                title: t('business.landing.productsSection.mobile'),
                desc: t('business.landing.productsSection.mobileDesc'),
                color: 'from-emerald-500 to-green-500',
              },
              {
                icon: Shield,
                title: t('business.landing.productsSection.security'),
                desc: t('business.landing.productsSection.securityDesc'),
                color: 'from-slate-500 to-slate-600',
              },
            ].map((product, i) => (
              <RevealSection key={i} delay={i * 80}>
                <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-slate-300">
                  <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${product.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
                  <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${product.color} mb-5 shadow-lg`}>
                    <product.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                    {product.title}
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    {product.desc}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ SECTION
          ═══════════════════════════════════════ */}
      <section id="faq" className="relative z-20 bg-slate-50 py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <RevealSection className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-bold mb-6">
              <MessageSquare className="w-4 h-4" />
              {t('business.landing.faqSection.title')}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              {t('business.landing.faqSection.title')}
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('business.landing.faqSection.subtitle')}
            </p>
          </RevealSection>

          <div className="space-y-4">
            {[
              { q: t('business.landing.faqSection.q1'), a: t('business.landing.faqSection.a1') },
              { q: t('business.landing.faqSection.q2'), a: t('business.landing.faqSection.a2') },
              { q: t('business.landing.faqSection.q3'), a: t('business.landing.faqSection.a3') },
              { q: t('business.landing.faqSection.q4'), a: t('business.landing.faqSection.a4') },
              { q: t('business.landing.faqSection.q5'), a: t('business.landing.faqSection.a5') },
            ].map((faq, i) => (
              <RevealSection key={i} delay={i * 80}>
                <div className="group rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-sm transition-all">
                  <details className="group">
                    <summary className="flex items-center justify-between p-5 md:p-6 cursor-pointer list-none">
                      <span className="text-slate-900 font-bold text-sm md:text-base">{faq.q}</span>
                      <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-300" />
                    </summary>
                    <div className="px-5 md:px-6 pb-5 md:pb-6">
                      <p className="text-slate-500 text-sm md:text-base leading-relaxed">{faq.a}</p>
                    </div>
                  </details>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MAP REGISTRATION & SERVICES SECTION
          ═══════════════════════════════════════ */}
      <section id="map-register" className="relative z-20 bg-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <RevealSection className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold mb-6">
              <MapPin className="w-4 h-4" />
              {t('business.landing.mapSection.title')}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              {t('business.landing.mapSection.title')}
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('business.landing.mapSection.subtitle')}
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* External Site Registration Card */}
            <RevealSection>
              <div className="relative rounded-3xl bg-slate-50 border border-slate-200 p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 mb-5 shadow-lg">
                    <MapPin className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                    {t('business.landing.mapSection.registerTitle')}
                  </h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6">
                    {t('business.landing.mapSection.registerDesc')}
                  </p>

                  {/* Mock map preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-48 md:h-56 mb-6">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute -inset-4 rounded-full bg-cyan-400/20 animate-ping" />
                        <div className="relative w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-slate-600 text-xs font-medium">
                      {t('business.landing.mapSection.previewLabel')}
                    </div>
                  </div>

                  {/* Visitor stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { value: '1.2K', label: t('business.landing.mapSection.visitors') },
                      { value: '340', label: t('business.landing.mapSection.thisWeek') },
                      { value: '89', label: t('business.landing.mapSection.today') },
                    ].map((stat, i) => (
                      <div key={i} className="text-center p-3 rounded-xl bg-white border border-slate-200">
                        <div className="text-xl md:text-2xl font-black text-cyan-600">{stat.value}</div>
                        <div className="text-slate-400 text-xs mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/map/add-listing"
                    className="inline-flex items-center justify-center gap-2 w-full bg-cyan-500 text-white px-6 py-3.5 rounded-xl font-black text-sm hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                  >
                    <MapPin className="w-4 h-4" />
                    {t('business.landing.mapSection.registerBtn')}
                  </Link>
                </div>
              </div>
            </RevealSection>

            {/* What We Offer / Services */}
            <RevealSection delay={150}>
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                  {t('business.landing.mapSection.servicesTitle')}
                </h3>
                {[
                  { icon: Globe, title: t('business.landing.mapSection.service1Title'), desc: t('business.landing.mapSection.service1Desc') },
                  { icon: MapPin, title: t('business.landing.mapSection.service2Title'), desc: t('business.landing.mapSection.service2Desc') },
                  { icon: Eye, title: t('business.landing.mapSection.service3Title'), desc: t('business.landing.mapSection.service3Desc') },
                  { icon: TrendingUp, title: t('business.landing.mapSection.service4Title'), desc: t('business.landing.mapSection.service4Desc') },
                  { icon: Smartphone, title: t('business.landing.mapSection.service5Title'), desc: t('business.landing.mapSection.service5Desc') },
                ].map((service, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                      <service.icon className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h4 className="text-slate-900 font-bold text-sm mb-1">{service.title}</h4>
                      <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{service.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════ */}
      <section className="relative z-20 bg-slate-900 py-20 md:py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-gradient-radial from-cyan-500/10 via-violet-500/5 to-transparent blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center relative">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              {t('business.landing.cta.badge')}
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              {t('business.landing.cta.title')}
            </h2>
            <p className="text-white/60 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              {t('business.landing.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/business/onboarding"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cyan-500 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                {t('business.landing.cta.start')}
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/business/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/15 transition-all duration-300 cursor-pointer"
              >
                {t('business.landing.cta.login')}
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════ */}
      <footer className="relative z-20 bg-slate-900 border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-black text-lg">{t('business.landing.footer.brandName')}</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-4 max-w-xs">
                {t('business.landing.footer.tagline')}
              </p>
              <div className="flex gap-3">
                {[
                  { icon: MessageSquare, label: 'WhatsApp' },
                  { icon: Bell, label: 'Notifications' },
                  { icon: Headphones, label: 'Support' },
                ].map((social, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-300 cursor-pointer"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links columns */}
            {[
              {
                title: t('business.landing.footer.product'),
                links: [
                  { label: t('business.landing.footer.features'), href: '#features' },
                  { label: t('business.landing.footer.pricing'), href: '#' },
                  { label: t('business.landing.footer.builder'), href: '#' },
                  { label: t('business.landing.footer.dashboard'), href: '#' },
                ],
              },
              {
                title: t('business.landing.footer.company'),
                links: [
                  { label: t('business.landing.footer.about'), href: '#' },
                  { label: t('business.landing.footer.contact'), href: '#' },
                  { label: t('business.landing.footer.blog'), href: '#' },
                  { label: t('business.landing.footer.careers'), href: '#' },
                ],
              },
              {
                title: t('business.landing.footer.support'),
                links: [
                  { label: t('business.landing.footer.help'), href: '#' },
                  { label: t('business.landing.footer.docs'), href: '#' },
                  { label: t('business.landing.footer.privacy'), href: '#' },
                  { label: t('business.landing.footer.terms'), href: '#' },
                ],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-bold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href={link.href}
                        className="text-white/40 text-sm hover:text-cyan-400 transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs sm:text-sm">
              © {new Date().getFullYear()} {t('business.landing.footer.rights')}
            </p>
            <div className="flex items-center gap-4 text-white/30 text-xs">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {t('business.landing.footer.status')}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════
          BACK TO TOP + MOBILE STICKY CTA
          ═══════════════════════════════════════ */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 md:bottom-6 left-4 z-50 w-11 h-11 rounded-xl bg-[#00E5FF] text-slate-900 shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer"
          aria-label="Back to top"
        >
          <ChevronDown className="w-5 h-5 rotate-180" />
        </button>
      )}

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden p-3 bg-slate-950/90 backdrop-blur-lg border-t border-white/10">
        <Link
          to="/business/onboarding"
          className="flex items-center justify-center gap-2 w-full bg-[#00E5FF] text-slate-900 py-3.5 rounded-xl font-black text-base shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          {t('business.landing.cta.start')}
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   Stat Counter Component
   ───────────────────────────────────────────── */
const StatCounter: React.FC<{ target: number; suffix: string; start: boolean }> = ({
  target, suffix, start,
}) => {
  const value = useCountUp(target, 2000, start);
  return (
    <div className="text-4xl md:text-6xl font-black text-white tracking-tight">
      {value}
      <span className="text-[#00E5FF]">{suffix}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Dashboard Mockup (Pure CSS)
   ───────────────────────────────────────────── */
const DashboardMockup: React.FC = () => {
  const { t } = useTranslation();
  return (
  <div className="relative rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xl max-w-5xl mx-auto">
    {/* Browser top bar */}
    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50">
      <div className="w-3 h-3 rounded-full bg-red-400/60" />
      <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
      <div className="w-3 h-3 rounded-full bg-green-400/60" />
      <div className="flex-1 mx-3 h-6 rounded-md bg-slate-100 flex items-center px-3">
        <span className="text-slate-400 text-xs font-mono">app.mnmknk.com/dashboard</span>
      </div>
    </div>

    {/* Dashboard body */}
    <div className="flex min-h-[300px] md:min-h-[400px]">
      {/* Sidebar */}
      <div className="hidden sm:flex flex-col w-16 md:w-20 border-r border-slate-200 bg-slate-50 p-2 md:p-3 gap-2">
        {[
          { icon: LayoutDashboard, active: true },
          { icon: ShoppingCart },
          { icon: Users },
          { icon: BarChart3 },
          { icon: Palette },
          { icon: Settings },
        ].map((item, i) => (
          <div
            key={i}
            className={`w-full aspect-square rounded-lg flex items-center justify-center transition-colors ${
              item.active ? 'bg-cyan-50 text-cyan-600' : 'text-slate-300 hover:text-slate-500'
            }`}
          >
            <item.icon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 md:p-6 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-32 rounded-md bg-slate-200" />
            <div className="h-3 w-20 rounded-md bg-slate-100" />
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('business.landing.dashboard.sales'), value: '12,450', color: 'from-cyan-50 to-blue-50', valueColor: 'text-cyan-600' },
            { label: t('business.landing.dashboard.orders'), value: '348', color: 'from-violet-50 to-purple-50', valueColor: 'text-violet-600' },
            { label: t('business.landing.dashboard.customers'), value: '1,205', color: 'from-emerald-50 to-teal-50', valueColor: 'text-emerald-600' },
          ].map((card, i) => (
            <div
              key={i}
              className={`p-3 md:p-4 rounded-xl bg-gradient-to-br ${card.color} border border-slate-100`}
            >
              <p className="text-slate-400 text-[10px] md:text-xs mb-1">{card.label}</p>
              <p className={`${card.valueColor} font-black text-base md:text-2xl`}>{card.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500 text-[10px] font-bold">+12%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="h-3 w-24 rounded-md bg-slate-200" />
            <div className="flex gap-2">
              <div className="h-6 w-12 rounded-md bg-cyan-100" />
              <div className="h-6 w-12 rounded-md bg-slate-100" />
            </div>
          </div>
          {/* Bar chart */}
          <div className="flex items-end justify-between gap-1.5 md:gap-2 h-24 md:h-32">
            {[
              { h: '40%', color: 'bg-cyan-200' },
              { h: '65%', color: 'bg-cyan-300' },
              { h: '50%', color: 'bg-cyan-200' },
              { h: '80%', color: 'bg-cyan-400' },
              { h: '70%', color: 'bg-cyan-300' },
              { h: '95%', color: 'bg-cyan-500' },
              { h: '60%', color: 'bg-cyan-200' },
              { h: '85%', color: 'bg-cyan-400' },
              { h: '75%', color: 'bg-cyan-300' },
              { h: '90%', color: 'bg-cyan-500' },
            ].map((bar, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-md ${bar.color} transition-all duration-500`}
                style={{ height: bar.h }}
              />
            ))}
          </div>
        </div>

        {/* Table preview */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-2">
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-200" />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 w-3/4 rounded-md bg-slate-200" />
                <div className="h-2 w-1/2 rounded-md bg-slate-100" />
              </div>
              <div className="h-6 w-16 rounded-md bg-cyan-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};

/* ─────────────────────────────────────────────
   Growth Chart Mockup (Pure CSS)
   ───────────────────────────────────────────── */
const GrowthChartMockup: React.FC = () => {
  const { t } = useTranslation();
  return (
  <div className="relative rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-xl">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-slate-400 text-sm mb-1">{t('business.landing.growth.chart.title')}</p>
        <p className="text-slate-900 font-black text-2xl md:text-3xl">
          248% <span className="text-emerald-500 text-sm font-bold">↑</span>
        </p>
      </div>
      <div className="flex gap-2">
        {[t('business.landing.growth.chart.7d'), t('business.landing.growth.chart.30d'), t('business.landing.growth.chart.90d')].map((label, i) => (
          <div
            key={i}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              i === 1 ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>

    {/* Area chart (SVG) */}
    <div className="relative h-48 md:h-64">
      <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(15,23,42,0.05)" strokeWidth="1" />
        ))}
        {/* Area */}
        <path
          d="M0,180 L40,160 L80,140 L120,100 L160,120 L200,80 L240,60 L280,40 L320,50 L360,20 L400,10 L400,200 L0,200 Z"
          fill="url(#growthGradient)"
        />
        {/* Line */}
        <path
          d="M0,180 L40,160 L80,140 L120,100 L160,120 L200,80 L240,60 L280,40 L320,50 L360,20 L400,10"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dot at end */}
        <circle cx="400" cy="10" r="4" fill="#06b6d4" />
        <circle cx="400" cy="10" r="8" fill="#06b6d4" opacity="0.2" />
      </svg>
    </div>

    {/* Bottom stats */}
    <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
      {[
        { label: t('business.landing.growth.chart.revenue'), value: '48.2K', change: '+18%' },
        { label: t('business.landing.growth.chart.orders'), value: '1,240', change: '+24%' },
        { label: t('business.landing.growth.chart.customers'), value: '892', change: '+12%' },
      ].map((stat, i) => (
        <div key={i}>
          <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
          <p className="text-slate-900 font-bold text-base md:text-lg">{stat.value}</p>
          <p className="text-emerald-500 text-xs font-bold">{stat.change}</p>
        </div>
      ))}
    </div>
  </div>
  );
};

export default BusinessLanding;