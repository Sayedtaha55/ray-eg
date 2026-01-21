
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Zap, Smartphone, Globe, ArrowLeft, TrendingUp, Users, ShieldCheck, UtensilsCrossed, QrCode } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import type { ShopGallery } from '@/types';

const { Link } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const BusinessLanding: React.FC = () => {
  const featuredShopId = String(import.meta.env.VITE_FEATURED_SHOP_ID || '').trim();
  const [heroVideo, setHeroVideo] = useState<ShopGallery | null>(null);

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

  return (
    <div className="text-right" dir="rtl">
      {/* Hero Section */}
      <div className="relative min-h-[92vh] bg-slate-950 overflow-hidden flex items-center">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 pt-36 pb-20 md:pt-44 md:pb-28">
            <div className="text-center max-w-4xl mx-auto">
              <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 rounded-full text-[#00E5FF] font-black text-xs uppercase tracking-widest mb-10 border border-white/10"
              >
                <TrendingUp className="w-4 h-4" />
                انضم لأكثر من ١٠٠٠ علامة تجارية في مصر
              </MotionDiv>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.9] text-white"
              >
                قم ببناء <br/> <span className="text-[#00E5FF]">إمبراطوريتك.</span>
              </motion.h1>
              <p className="text-xl md:text-2xl text-slate-200/80 mb-12 leading-relaxed font-medium max-w-3xl mx-auto">
                منصة التجارة الشاملة لتجار العصر الجديد. صمم متجرك، أدر مخزونك، وقم ببيع منتجاتك من أي مكان باستخدام أقوى الأدوات التقنية.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link to="/business/dashboard" className="w-full md:w-auto bg-[#00E5FF] text-slate-900 px-14 py-6 rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-cyan-500/20">
                  ابدأ تجربتك المجانية
                </Link>
                <button className="w-full md:w-auto border border-slate-200/30 text-white px-14 py-6 rounded-[2rem] font-black text-xl hover:bg-white hover:text-slate-900 transition-all">
                  شاهد العرض التوضيحي
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* Restaurant Specific Section */}
        <section className="mb-40 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-slate-800/20 p-12 md:p-24 rounded-[4rem] border border-slate-800/50">
           <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-10 bg-[#BD00FF]/10 blur-[100px] rounded-full" />
              <div className="relative bg-white p-8 rounded-[3rem] shadow-2xl flex flex-col gap-6 scale-90 md:scale-100">
                 <div className="flex items-center justify-between flex-row-reverse border-b border-slate-50 pb-6">
                    <h4 className="font-black text-slate-900 text-2xl">منيو المطعم الرقمي</h4>
                    <QrCode className="text-[#BD00FF] w-10 h-10" />
                 </div>
                 {[1,2,3].map(i => (
                   <div key={i} className="flex items-center gap-4 flex-row-reverse">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-2">
                         <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
                         <div className="h-2 w-1/3 bg-slate-50 rounded-full" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-slate-100" />
                   </div>
                 ))}
                 <button className="w-full py-4 bg-[#BD00FF] text-white rounded-2xl font-black text-sm">إرسال للمطبخ</button>
              </div>
           </div>
           <div className="order-1 lg:order-2 text-right">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-[#BD00FF] mb-8 shadow-xl">
                <UtensilsCrossed size={32} />
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">نظام Ray <br/><span className="text-[#BD00FF]">للمطاعم.</span></h2>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">نظام متكامل لإدارة الطلبات، المنيو الرقمي، وحجوزات الطاولات. مصمم لزيادة سرعة الخدمة وتقليل الأخطاء في المطبخ.</p>
              <ul className="space-y-6 mb-12">
                 <li className="flex items-center gap-4 flex-row-reverse text-lg font-black"><CheckCircle2 className="text-[#BD00FF]" /> منيو QR تفاعلي للزبائن</li>
                 <li className="flex items-center gap-4 flex-row-reverse text-lg font-black"><CheckCircle2 className="text-[#BD00FF]" /> نظام إدارة الطاولات والحجوزات</li>
                 <li className="flex items-center gap-4 flex-row-reverse text-lg font-black"><CheckCircle2 className="text-[#BD00FF]" /> ربط مباشر مع المطبخ والكاشير</li>
              </ul>
              <Link to="/business/dashboard" className="inline-flex items-center gap-3 font-black text-2xl text-[#BD00FF] hover:gap-6 transition-all group">
                حول مطعمك للنظام الرقمي <ArrowLeft className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </Link>
           </div>
        </section>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-40">
          <FeatureCard 
            icon={<Store className="w-10 h-10 text-[#00E5FF]" />}
            title="مصمم الصفحات الذكي"
            description="اسحب وأفلت لتبني واجهة متجر تعكس هوية علامتك التجارية بلمسات احترافية دون الحاجة لمبرمج."
          />
          <FeatureCard 
            icon={<Smartphone className="w-10 h-10 text-[#BD00FF]" />}
            title="نظام POS متكامل"
            description="حول أي هاتف أو تابلت لنقطة بيع ذكية. تتبع مبيعاتك في المحل وفي المتجر أونلاين في نفس اللحظة."
          />
          <FeatureCard 
            icon={<Zap className="w-10 h-10 text-white" />}
            title="عروض الفلاش"
            description="أرسل إشعارات فورية لآلاف العملاء القريبين من موقعك. ارفع مبيعاتك في الأوقات التي تحتاجها."
          />
        </div>

        {/* Stats Section */}
        <section className="bg-white rounded-[4rem] p-12 md:p-24 text-slate-900">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">أدوات قوية لنمو <span className="text-[#BD00FF]">حقيقي.</span></h2>
                <div className="space-y-10">
                   <BenefitItem 
                    icon={<Users className="w-6 h-6" />}
                    title="وصول مباشر للعملاء"
                    description="تواصل مع ملايين المستخدمين النشطين على منصة Ray الذين يبحثون عن أفضل الصفقات يومياً."
                   />
                   <BenefitItem 
                    icon={<TrendingUp className="w-6 h-6" />}
                    title="تحليلات دقيقة"
                    description="افهم سلوك عملائك، تتبع المنتجات الأكثر طلباً، واحصل على توصيات ذكية لزيادة أرباحك."
                   />
                   <BenefitItem 
                    icon={<ShieldCheck className="w-6 h-6" />}
                    title="أمان وموثوقية"
                    description="نظام دفع آمن وبنية تحتية سحابية تضمن استقرار متجرك حتى في أوقات الذروة والطلبات العالية."
                   />
                </div>
                <Link to="/business/dashboard" className="mt-16 inline-flex items-center gap-3 font-black text-2xl text-[#BD00FF] hover:gap-6 transition-all group">
                   سجل متجرك الآن <ArrowLeft className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-[#BD00FF]/10 blur-[100px] rounded-full" />
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" className="relative rounded-[3rem] shadow-2xl border border-slate-100" alt="dashboard" />
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="p-12 rounded-[3rem] bg-slate-800/40 border border-slate-700 hover:border-[#00E5FF] transition-all group">
    <div className="mb-8 p-5 bg-slate-900 rounded-2xl inline-block group-hover:scale-110 transition-transform shadow-xl shadow-black/20">{icon}</div>
    <h3 className="text-3xl font-black mb-6 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-400 text-lg leading-relaxed font-medium">{description}</p>
  </div>
);

const BenefitItem: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="flex gap-6 flex-row-reverse">
     <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-900">{icon}</div>
     <div className="text-right">
        <h4 className="text-2xl font-black mb-2">{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
     </div>
  </div>
);

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default BusinessLanding;
