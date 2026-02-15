import React, { useEffect, useMemo, useState } from 'react';

import { Store, ArrowLeft, TrendingUp, PackageCheck, BellRing } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import type { ShopGallery } from '@/types';

const { Link } = ReactRouterDOM as any;

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
    <>
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

        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-[#00E5FF]/18 blur-[90px] opacity-90" />
          <div className="absolute -bottom-32 -right-24 w-[620px] h-[620px] rounded-full bg-[#BD00FF]/18 blur-[100px] opacity-80" />
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full bg-white/6 blur-[120px] opacity-60" />
        </div>

        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 pt-36 pb-20 md:pt-44 md:pb-28">
            <div className="text-center max-w-4xl mx-auto">
              <div>
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 rounded-full text-[#00E5FF] font-black text-xs uppercase tracking-widest mb-10 border border-white/10">
                  <TrendingUp className="w-4 h-4" />
                  انضم لنكون من الأوائل — التسجيل مجاني
                </div>

                <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.9] text-white">
                  قم ببناء <br /> <span className="text-[#00E5FF]">علامتك التجارية.</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-200/80 mb-12 leading-relaxed font-medium max-w-3xl mx-auto">
                  منصة التجارة الشاملة لتجار العصر الجديد. صمم متجرك، أدر مخزونك، وقم ببيع منتجاتك من أي مكان باستخدام أقوى الأدوات التقنية.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <div className="w-full md:w-auto">
                    <Link
                      to="/business/onboarding"
                      className="block w-full md:w-auto bg-[#00E5FF] text-slate-900 px-14 py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.99]"
                    >
                      ابدأ تجربتك المجانية
                    </Link>
                  </div>
                  <button
                    type="button"
                    className="w-full md:w-auto border border-slate-200/30 text-white px-14 py-6 rounded-[2rem] font-black text-xl hover:bg-white hover:text-slate-900 transition-all backdrop-blur hover:scale-[1.01] active:scale-[0.99]"
                  >
                    شاهد العرض التوضيحي
                  </button>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-200/80">
                  <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <Store className="w-5 h-5 text-[#00E5FF]" />
                    <span className="font-black text-sm">متجر جاهز في دقائق</span>
                  </div>
                  <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <PackageCheck className="w-5 h-5 text-[#BD00FF]" />
                    <span className="font-black text-sm">إدارة منتجات سهلة</span>
                  </div>
                  <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <BellRing className="w-5 h-5 text-white" />
                    <span className="font-black text-sm">تنبيه فوري للطلبات</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="relative h-12" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-40 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 via-transparent to-[#BD00FF]/5 rounded-[4rem] blur-3xl -z-10" />
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

        <section className="bg-white rounded-[4rem] p-12 md:p-24 text-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#BD00FF]/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00E5FF]/10 to-transparent rounded-full blur-3xl" />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">
                  كل اللي تحتاجه لإدارة <span className="text-[#BD00FF]">متجرك.</span>
                </h2>
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
                <div className="mt-16">
                  <Link to="/business/dashboard" className="inline-flex items-center gap-3 font-black text-2xl text-[#BD00FF] hover:gap-6 transition-all group">
                     سجل متجرك الآن <ArrowLeft className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-12 bg-gradient-to-br from-[#BD00FF]/15 via-[#00E5FF]/10 to-[#BD00FF]/15 blur-[120px] rounded-full" />
                <div className="relative">
                  <img src="/images/business/dashboard-hero.png" className="relative rounded-[3rem] shadow-2xl border border-slate-100" alt="dashboard" />
                </div>
              </div>
           </div>
        </section>
      </div>

      <section className="bg-slate-900 py-16 border-y border-slate-800 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/5 via-transparent to-[#BD00FF]/5" />
        <div className="relative z-10">
          <p className="text-center text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">من مكانك للأعمال</p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#BD00FF] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#00E5FF]/25">
                م
              </div>
              <span className="text-white font-black text-2xl tracking-tight">MNMKNK</span>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-auto z-50">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF]/10 to-[#BD00FF]/10 rounded-2xl opacity-70" />
          <div className="hidden md:block relative z-10">
            <p className="text-white font-black text-sm">ابدأ الآن مجاناً</p>
            <p className="text-slate-400 text-xs">لا تحتاج بطاقة ائتمان</p>
          </div>
          <div className="relative z-10">
            <Link 
              to="/business/onboarding"
              className="bg-[#00E5FF] text-slate-900 px-6 py-3 rounded-xl font-black text-sm hover:bg-[#00d4e8] transition-colors whitespace-nowrap block shadow-lg shadow-[#00E5FF]/25 hover:scale-[1.03] active:scale-[0.99]"
            >
              ابدأ تجربتك
            </Link>
          </div>
        </div>
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
    </>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string, index?: number }> = ({ icon, title, description, index = 0 }) => (
  <div className="relative group hover:-translate-y-2 transition-transform">
    {/* Animated gradient border */}
    <div className="absolute -inset-[1px] rounded-[3rem] bg-gradient-to-r from-[#00E5FF] via-[#BD00FF] to-[#00E5FF] opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
    <div className="absolute -inset-[1px] rounded-[3rem] bg-gradient-to-r from-[#00E5FF] via-[#BD00FF] to-[#00E5FF] opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
    
    <div className="relative p-12 rounded-[3rem] bg-slate-800/40 border border-slate-700 group-hover:border-transparent transition-all">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="mb-8 p-5 bg-slate-900 rounded-2xl inline-block shadow-xl shadow-black/20 relative group-hover:scale-110 transition-transform">
        {icon}
      </div>
      
      <h3 className="text-3xl font-black mb-6 uppercase tracking-tight group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-slate-400 text-lg leading-relaxed font-medium group-hover:text-slate-300 transition-colors">
        {description}
      </p>
    </div>
  </div>
);

const BenefitItem: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="flex gap-6 flex-row-reverse group cursor-pointer hover:-translate-x-2 transition-transform">
     <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-900 group-hover:bg-[#00E5FF] group-hover:text-slate-900 transition-colors duration-300 shadow-lg shadow-slate-200/50 group-hover:scale-110 group-hover:rotate-3">
       {icon}
     </div>
     <div className="text-right">
        <h4 className="text-2xl font-black mb-2 group-hover:text-[#BD00FF] transition-colors duration-300">{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed group-hover:text-slate-700 transition-colors duration-300">{description}</p>
     </div>
  </div>
);

export default BusinessLanding;
