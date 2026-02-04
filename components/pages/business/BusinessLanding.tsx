
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, ArrowLeft, TrendingUp, PackageCheck, BellRing } from 'lucide-react';
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
                قم ببناء <br/> <span className="text-[#00E5FF]">علامتك التجارية.</span>
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

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-40">
          <FeatureCard 
            icon={<Store className="w-10 h-10 text-[#00E5FF]" />}
            title="مصمم الصفحات الذكي"
            description="اسحب وأفلت لتبني واجهة متجر تعكس هوية علامتك التجارية بلمسات احترافية دون الحاجة لمبرمج."
          />
          <FeatureCard 
            icon={<PackageCheck className="w-10 h-10 text-[#BD00FF]" />}
            title="إدارة المنتجات والطلبات"
            description="أضف منتجاتك، حدّث المخزون، وتابع الطلبات من لوحة تحكم واحدة بشكل واضح وسريع."
          />
          <FeatureCard 
            icon={<BellRing className="w-10 h-10 text-white" />}
            title="تنبيه فوري للتاجر"
            description="رنّة إشعار تلقائية عند وصول طلب أو حجز جديد حتى لا يفوتك أي عميل."
          />
        </div>

        {/* Stats Section */}
        <section className="bg-white rounded-[4rem] p-12 md:p-24 text-slate-900">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">كل اللي تحتاجه لإدارة <span className="text-[#BD00FF]">متجرك.</span></h2>
                <div className="space-y-10">
                   <BenefitItem 
                    icon={<Store className="w-6 h-6" />}
                    title="لوحة تحكم واضحة للتاجر"
                    description="تابع متجرك من مكان واحد: المنتجات، الطلبات، والحجوزات — بدون تعقيد."
                   />
                   <BenefitItem 
                    icon={<PackageCheck className="w-6 h-6" />}
                    title="إدارة الطلبات والحجوزات"
                    description="استقبل الطلبات والحجوزات، وحدّث حالتها بسهولة من داخل لوحة التحكم."
                   />
                   <BenefitItem 
                    icon={<BellRing className="w-6 h-6" />}
                    title="تنبيه فوري عند طلب/حجز جديد"
                    description="رنّة إشعار للتاجر عند وصول طلب أو حجز جديد حتى لا يفوتك أي عميل."
                   />
                </div>
                <Link to="/business/dashboard" className="mt-16 inline-flex items-center gap-3 font-black text-2xl text-[#BD00FF] hover:gap-6 transition-all group">
                   سجل متجرك الآن <ArrowLeft className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-[#BD00FF]/10 blur-[100px] rounded-full" />
                <img src="/images/business/dashboard-hero.png" className="relative rounded-[3rem] shadow-2xl border border-slate-100" alt="dashboard" />
              </div>
           </div>
        </section>
      </div>

      {/* Business Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-300">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-black text-white mb-4">MNMKNK</h3>
              <p className="text-slate-400 leading-relaxed">
                منصة متكاملة لتجار العصر الجديد. صمم متجرك، أدر منتجاتك، واربح بسهولة.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-black text-white mb-4">روابط سريعة</h4>
              <ul className="space-y-2">
                <li><Link to="/shops" className="hover:text-[#00E5FF] transition-colors">المحلات</Link></li>
                <li><Link to="/restaurants" className="hover:text-[#00E5FF] transition-colors">المطاعم</Link></li>
                <li><Link to="/" className="hover:text-[#00E5FF] transition-colors">الرئيسية</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-black text-white mb-4">الدعم والشروط</h4>
              <ul className="space-y-2">
                <li><Link to="/business/courier-signup" className="hover:text-[#00E5FF] transition-colors">تسجيل مندوب توصيل</Link></li>
                <li><a href="#" className="hover:text-[#00E5FF] transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-[#00E5FF] transition-colors">شروط الخدمة</a></li>
                <li><a href="#" className="hover:text-[#00E5FF] transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-[#00E5FF] transition-colors">تواصل معنا</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            <p> {new Date().getFullYear()} MNMKNK. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
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

export default BusinessLanding;
