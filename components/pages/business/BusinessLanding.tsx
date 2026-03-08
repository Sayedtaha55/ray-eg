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
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />

        <div aria-hidden className="absolute inset-0 pointer-events-none hidden md:block">
          <div className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-[#00E5FF]/18 blur-[90px] opacity-90" />
          <div className="absolute -bottom-32 -right-24 w-[620px] h-[620px] rounded-full bg-[#BD00FF]/18 blur-[100px] opacity-80" />
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full bg-white/6 blur-[120px] opacity-60" />
        </div>

        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-24 pb-16 md:pt-44 md:pb-28">
            <div className="text-center max-w-4xl mx-auto">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[#00E5FF] font-black text-xs uppercase tracking-widest mb-8 md:mb-10 border border-white/10">
                  <TrendingUp className="w-4 h-4" />
                  انضم لنكون من الأوائل — التسجيل مجاني
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-9xl font-black tracking-tighter mb-8 md:mb-10 leading-[0.95] md:leading-[0.9] text-white">
                  قم ببناء <br /> <span className="text-[#00E5FF]">علامتك التجارية.</span>
                </h1>

                <p className="text-lg sm:text-xl md:text-2xl text-slate-200/80 mb-10 md:mb-12 leading-relaxed font-medium max-w-3xl mx-auto">
                  منصة التجارة الشاملة لتجار العصر الجديد. صمم متجرك، أدر مخزونك، وقم ببيع منتجاتك من أي مكان باستخدام أقوى الأدوات التقنية.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <div className="w-full md:w-auto">
                    <Link
                      to="/business/onboarding"
                      className="block w-full md:w-auto bg-[#00E5FF] text-slate-900 px-10 md:px-14 py-5 md:py-6 rounded-[2rem] font-black text-lg md:text-xl shadow-lg md:shadow-2xl shadow-cyan-500/15 md:shadow-cyan-500/20"
                    >
                      ابدأ تجربتك المجانية
                    </Link>
                  </div>
                  <button
                    type="button"
                    className="w-full md:w-auto border border-slate-200/30 text-white px-10 md:px-14 py-5 md:py-6 rounded-[2rem] font-black text-lg md:text-xl md:backdrop-blur"
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

      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-20">

        <div className="relative h-12" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-24 md:mb-40 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 via-transparent to-[#BD00FF]/5 rounded-[3rem] md:rounded-[4rem] blur-2xl md:blur-3xl -z-10" />
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

        <section className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-8 sm:p-10 md:p-24 text-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#BD00FF]/10 to-transparent rounded-full blur-3xl hidden md:block" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00E5FF]/10 to-transparent rounded-full blur-3xl hidden md:block" />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 md:mb-8">
                  كل اللي تحتاجه لإدارة <span className="text-[#BD00FF]">متجرك.</span>
                </h2>
                <div className="space-y-8 md:space-y-10">
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
                <div className="mt-12 md:mt-16">
                  <Link to="/business/dashboard" className="inline-flex items-center gap-3 font-black text-xl md:text-2xl text-[#BD00FF]">
                     سجل متجرك الآن <ArrowLeft className="w-7 h-7 md:w-8 md:h-8" />
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-12 bg-gradient-to-br from-[#BD00FF]/15 via-[#00E5FF]/10 to-[#BD00FF]/15 blur-[120px] rounded-full hidden md:block" />
                <div className="relative">
                  <img src="/images/business/dashboard-hero.png" className="relative rounded-[2rem] md:rounded-[3rem] shadow-xl md:shadow-2xl border border-slate-100" alt="dashboard" />
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
                <li><Link to="/courier" className="hover:text-[#00E5FF] transition-colors">تسجيل مندوب توصيل</Link></li>
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
  <div className="relative">
    <div className="relative p-8 sm:p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] bg-slate-800/40 border border-slate-700">
      <div className="mb-6 md:mb-8 p-4 md:p-5 bg-slate-900 rounded-2xl inline-block shadow-lg md:shadow-xl shadow-black/20 relative">
        {icon}
      </div>
      
      <h3 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 uppercase tracking-tight">
        {title}
      </h3>
      <p className="text-slate-400 text-base md:text-lg leading-relaxed font-medium">
        {description}
      </p>
    </div>
  </div>
);

const BenefitItem: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="flex gap-5 md:gap-6 flex-row-reverse">
     <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-900 shadow-md md:shadow-lg shadow-slate-200/40 md:shadow-slate-200/50">
       {icon}
     </div>
     <div className="text-right">
        <h4 className="text-xl md:text-2xl font-black mb-2">{title}</h4>
        <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">{description}</p>
     </div>
  </div>
);

export default BusinessLanding;
