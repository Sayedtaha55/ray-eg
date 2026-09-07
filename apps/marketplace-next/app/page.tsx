import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Tag, TrendingUp, Star, Sparkles } from 'lucide-react';
import { getShops, getOffers, getSeasonalOffers } from '@/lib/services';
import { activities, siteConfig } from '@/lib/config';
import { ShopCard } from '@/components/ShopCard';
import { ProductCard } from '@/components/ProductCard';
import { ShopCardSkeleton, ProductCardSkeleton } from '@/components/Skeleton';
import { HeroSlider } from '@/components/HeroSlider';
import { AppDownloadBanner } from '@/components/AppDownloadBanner';

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
      <section className="relative w-full overflow-hidden bg-brand-black">
        {/* Banner Images Slider */}
        <div className="relative w-full h-[280px] sm:h-[340px] md:h-[420px] lg:h-[500px] overflow-hidden">
          <HeroSlider />
        </div>

        {/* Screen-reader only title for SEO */}
        <h1 className="sr-only">من مكانك - المنصة الأولى للتجارة الذكية في مصر</h1>
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

      {/* App Download Banner */}
      <AppDownloadBanner />

    </div>
  );
}
