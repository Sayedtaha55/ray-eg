import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Search, MapPin, Tag, Store, Star, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { getShops } from '@/lib/services';
import { activities, siteConfig } from '@/lib/config';
import { ShopCard } from '@/components/ShopCard';
import { ProductCard } from '@/components/ProductCard';
import { ShopCardSkeleton, ProductCardSkeleton } from '@/components/Skeleton';

export const metadata: Metadata = {
  title: `${siteConfig.name} - ${siteConfig.nameArabic}`,
  description: siteConfig.description,
  alternates: { canonical: '/' },
};

export const revalidate = 300;

export default async function HomePage() {
  const shops = await getShops(100);
  const featuredShops = shops.slice(0, 8);
  const trendingShops = shops.slice(8, 16);

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${siteConfig.name} - ${siteConfig.nameArabic}`,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'ar',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/dalil?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    alternateName: siteConfig.nameArabic,
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/logo.png`,
    description: siteConfig.description,
    sameAs: [
      'https://www.facebook.com/MNMKNK',
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-brand-black">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-cyan/10 to-brand-purple/10 rounded-full blur-[150px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-6 text-center py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            <span className="text-white/80 text-xs md:text-sm font-bold">
              منصة تسويق متكاملة للأنشطة التجارية
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 animate-fade-up">
            من <span className="text-gradient">مكانك</span>
            <br />
            <span className="text-3xl md:text-5xl lg:text-6xl text-white/60">إلي العالمية</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 font-bold animate-fade-up" style={{ animationDelay: '0.1s' }}>
            اكتشف المتاجر والمنتجات والعروض القريبة منك — أو ابدأ نشاطك التجاري وانطلق بعملك
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <form action="/dalil" method="GET" className="relative">
              <input
                type="text"
                name="search"
                placeholder="ابحث عن متجر، منتج، أو خدمة..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 md:py-5 pr-14 pl-32 text-white font-bold text-base md:text-lg placeholder:text-white/30 focus:bg-white/10 focus:border-brand-cyan/30 transition-all outline-none"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 px-5 py-3 rounded-xl bg-brand-gradient text-white font-black text-sm hover:shadow-glow-cyan transition-all"
              >
                بحث
              </button>
            </form>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/map"
              className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all"
            >
              <MapPin className="w-4 h-4 text-brand-cyan" />
              الخريطة
            </Link>
            <Link
              href="/offers"
              className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all"
            >
              <Tag className="w-4 h-4 text-amber-400" />
              العروض
            </Link>
            <Link
              href="/dalil"
              className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all"
            >
              <Store className="w-4 h-4 text-brand-purple" />
              الدليل
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: `${shops.length}+`, label: 'متجر نشط', icon: Store },
              { value: '13', label: 'قطاع نشاط', icon: TrendingUp },
              { value: '∞', label: 'فرص نمو', icon: Zap },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-5 h-5 text-brand-cyan mx-auto mb-2" />
                <div className="text-2xl md:text-4xl font-black text-white">{stat.value}</div>
                <div className="text-xs md:text-sm text-white/40 font-bold mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-brand-black to-transparent" />
      </section>

      {/* Activities */}
      <section className="py-16 md:py-24 bg-white dark:bg-brand-black">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              استكشف <span className="text-gradient">الأنشطة</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-lg">
              اختر القطاع اللي يهمك واكتشف المتاجر والخدمات
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 md:gap-4">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/activity/${activity.id}`}
                className="group flex flex-col items-center gap-2 p-4 md:p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-brand-cyan/20 hover:shadow-brand transition-all"
              >
                <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">{activity.icon}</span>
                <span className="text-[10px] md:text-xs font-black text-slate-700 dark:text-slate-300 text-center">
                  {activity.label.ar}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Shops */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-brand-cyan fill-brand-cyan" />
                <span className="text-xs font-black uppercase tracking-widest text-brand-cyan">مميزة</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">متاجر مميزة</h2>
            </div>
            <Link href="/dalil" className="flex items-center gap-2 text-brand-cyan font-black text-sm hover:gap-3 transition-all">
              عرض الكل
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>

          {featuredShops.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => <ShopCardSkeleton key={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA Business */}
      <section className="py-20 md:py-32 bg-brand-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-cyan/10 via-transparent to-brand-purple/10" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
            هل لديك نشاط تجاري؟
          </h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto font-bold">
            انضم لآلاف التجار على منصتنا وابدأ رحلتك في عالم التسويق الرقمي
          </p>
          <Link
            href="/business"
            className="inline-flex items-center gap-3 px-8 md:px-12 py-4 md:py-5 rounded-2xl bg-brand-gradient text-white font-black text-base md:text-lg hover:shadow-glow-cyan transition-all shadow-lg"
          >
            <Store className="w-6 h-6" />
            ابدأ نشاطك مع MNMKNK
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </Link>
        </div>
      </section>

      {/* Trending Shops */}
      {trendingShops.length > 0 && (
        <section className="py-16 md:py-24 bg-white dark:bg-brand-black">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-brand-purple" />
                  <span className="text-xs font-black uppercase tracking-widest text-brand-purple">رائجة</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight">متاجر رائجة</h2>
              </div>
              <Link href="/dalil" className="flex items-center gap-2 text-brand-purple font-black text-sm hover:gap-3 transition-all">
                عرض الكل
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {trendingShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
