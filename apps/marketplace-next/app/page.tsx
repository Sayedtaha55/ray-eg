import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Search, MapPin, Tag, Store, Star, TrendingUp, Sparkles, Zap, ShieldCheck, Globe, ShoppingBag, Heart } from 'lucide-react';
import { getShops, getOffers, getSeasonalOffers } from '@/lib/services';
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
  const [shops, offers, seasonalOffers] = await Promise.all([
    getShops(24),
    getOffers(),
    getSeasonalOffers(),
  ]);
  const featuredShops = shops.slice(0, 8);
  const trendingShops = shops.slice(8, 16);
  const featuredOffers = offers.slice(0, 8);
  const activeSeasonal = seasonalOffers.filter(s => s.status === 'active' || new Date(s.endDate) >= new Date()).slice(0, 3);

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
    <div className="overflow-hidden">
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
            <span className="text-white/80 text-xs md:text-sm font-semibold">
              المنصة الأولى للتجارة الذكية في مصر
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white mb-6 animate-fade-up">
            من <span className="text-gradient">مكانك</span>
            <br />
            <span className="text-3xl md:text-5xl lg:text-6xl text-white/40">إلى العالمية</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-2xl text-white/50 max-w-2xl mx-auto mb-12 font-semibold animate-fade-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            اكتشف عالم المتاجر والمنتجات والخدمات من حولك. وجهتك الشاملة لكل ما تحتاجه في مكان واحد.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-10 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <form action="/dalil" method="GET" className="relative group">
              <input
                type="text"
                name="search"
                placeholder="عن ماذا تبحث اليوم؟ (مطعم، محل ملابس، طبيب...)"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 md:py-6 pr-14 pl-36 text-white font-semibold text-base md:text-lg placeholder:text-white/20 focus:bg-white/10 focus:border-brand-cyan/40 transition-all outline-none shadow-2xl"
              />
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30 group-focus-within:text-brand-cyan transition-colors" />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 px-8 py-3.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm md:text-base hover:shadow-glow-cyan transition-all active:scale-95"
              >
                بحث
              </button>
            </form>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {[
              { label: 'الخريطة', href: '/map', icon: MapPin, color: 'text-brand-cyan' },
              { label: 'العروض', href: '/offers', icon: Tag, color: 'text-amber-400' },
              { label: 'الدليل', href: '/dalil', icon: Store, color: 'text-brand-purple' },
            ].map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <link.icon className={`w-5 h-5 ${link.color} group-hover:scale-110 transition-transform`} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 md:gap-16 max-w-3xl mx-auto mt-20 animate-fade-up border-t border-white/5 pt-12" style={{ animationDelay: '0.4s' }}>
            {[
              { value: `${shops.length}+`, label: 'متجر نشط', icon: Store, color: 'text-brand-cyan' },
              { value: '13', label: 'قطاع نشاط', icon: TrendingUp, color: 'text-brand-purple' },
              { value: '24/7', label: 'دعم تقني', icon: Zap, color: 'text-amber-400' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3 opacity-50 group-hover:opacity-100 transition-opacity`} />
                <div className="text-3xl md:text-5xl font-bold text-white tracking-tight">{stat.value}</div>
                <div className="text-xs md:text-sm text-white/30 font-semibold mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-brand-black to-transparent" />
      </section>

      {/* Activities Grid */}
      <section className="py-24 bg-white dark:bg-brand-black relative">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 text-right">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 text-brand-cyan rounded-full font-semibold text-xs mb-4">
                <Globe className="w-3 h-3" />
                شامل جميع القطاعات
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                استكشف <span className="text-gradient">الأنشطة التجارية</span>
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg max-w-md leading-relaxed">
              من مكانك يجمع لك أفضل المتاجر والخدمات في مصر مقسمة حسب تخصصها لتصل لطلبك في ثوانٍ.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/activity/${activity.id}`}
                className="group relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-brand-cyan/20 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="text-5xl group-hover:scale-110 transition-transform duration-500">{activity.icon}</div>
                <div className="text-center">
                  <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white mb-1">
                    {activity.label.ar}
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">اكتشف الآن</span>
                </div>
                {/* Decoration */}
                <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-brand-cyan/0 group-hover:bg-brand-cyan/20 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-12">
            <div className="text-right">
              <div className="flex items-center gap-2 mb-3 justify-end">
                <Star className="w-5 h-5 text-brand-cyan fill-brand-cyan" />
                <span className="text-xs font-semibold text-brand-cyan">الأفضل تقييماً</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">متاجر مميزة</h2>
            </div>
            <Link href="/dalil" className="group flex items-center gap-3 text-brand-cyan font-semibold text-sm">
              <span className="border-b-2 border-brand-cyan/0 group-hover:border-brand-cyan transition-all">عرض جميع المتاجر</span>
              <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>

          {featuredShops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => <ShopCardSkeleton key={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* Seasonal Offers Banners */}
      {activeSeasonal.length > 0 && (
        <section className="py-16 bg-white dark:bg-brand-black">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-8">
              <div className="text-right">
                <div className="flex items-center gap-2 mb-3 justify-end">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">عروض موسمية</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">عروض خاصة لا تفوتها</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {activeSeasonal.map((offer) => (
                <Link
                  key={offer.id}
                  href="/offers"
                  className="group relative overflow-hidden rounded-2xl p-6 md:p-8 min-h-[160px] flex flex-col justify-between hover:scale-[1.02] transition-transform"
                  style={{ backgroundColor: offer.bannerColor || '#1A1A1A' }}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                  </div>
                  <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold mb-3">
                      {offer.occasion}
                    </span>
                    <h3 className="text-white font-black text-xl md:text-2xl mb-2">{offer.name}</h3>
                    {offer.description && <p className="text-white/70 text-sm font-semibold line-clamp-2">{offer.description}</p>}
                  </div>
                  <div className="relative z-10 flex items-center justify-between mt-4">
                    <span className="text-white font-black text-2xl">
                      {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `${offer.discountValue} ج.م`}
                    </span>
                    <span className="text-white/60 text-xs font-semibold">
                      حتى {new Date(offer.endDate).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Offers Section */}
      {featuredOffers.length > 0 && (
        <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-12">
              <div className="text-right">
                <div className="flex items-center gap-2 mb-3 justify-end">
                  <Tag className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">خصومات حصرية</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">أحدث العروض</h2>
              </div>
              <Link href="/offers" className="group flex items-center gap-3 text-amber-400 font-semibold text-sm">
                <span className="border-b-2 border-amber-400/0 group-hover:border-amber-400 transition-all">عرض جميع العروض</span>
                <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredOffers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA For Merchants */}
      <section className="py-32 bg-brand-black relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-cyan/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-purple/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight">
            حول مشروعك إلى <br />
            <span className="text-gradient">قصة نجاح رقمية</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-3xl mx-auto font-semibold leading-relaxed">
            انضم لآلاف التجار الذين وثقوا في من مكانك لتوسيع أعمالهم. نوفر لك أدوات التسويق والبيع والذكاء الاصطناعي في لوحة تحكم واحدة.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href={`${siteConfig.dashboardUrl}/#/signup`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl bg-brand-gradient text-white font-semibold text-lg hover:shadow-glow-cyan transition-all hover:scale-105 active:scale-95"
            >
              <Store className="w-6 h-6" />
              سجل نشاطك الآن
            </Link>
            <Link
              href="/business"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all"
            >
              <Zap className="w-5 h-5 text-brand-cyan" />
              اكتشف حلول الأعمال
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Products/Shops */}
      {trendingShops.length > 0 && (
        <section className="py-24 bg-white dark:bg-brand-black">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-12">
              <div className="text-right">
                <div className="flex items-center gap-2 mb-3 justify-end">
                  <TrendingUp className="w-5 h-5 text-brand-purple" />
                  <span className="text-xs font-semibold text-brand-purple">الأكثر طلباً</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">متاجر رائجة</h2>
              </div>
              <Link href="/dalil" className="group flex items-center gap-3 text-brand-purple font-semibold text-sm">
                <span>عرض الكل</span>
                <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {trendingShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20">
         <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { title: 'أمان تام', desc: 'حماية كاملة لبياناتك ومعاملاتك التجارية باستخدام أحدث تقنيات التشفير.', icon: ShieldCheck, color: 'text-green-500' },
                 { title: 'سهولة الاستخدام', desc: 'واجهة بسيطة وسهلة تتيح لك الوصول لكل الخدمات بأقل مجهود.', icon: Sparkles, color: 'text-brand-cyan' },
                 { title: 'دعم محلي', desc: 'فريق عمل مصري متواجد لدعمك وتلبية احتياجاتك على مدار الساعة.', icon: Heart, color: 'text-red-500' },
               ].map((feature, i) => (
                 <div key={i} className="text-center group">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all">
                       <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">{feature.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
