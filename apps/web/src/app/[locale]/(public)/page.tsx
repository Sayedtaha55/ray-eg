import { type Metadata } from 'next';
import dynamic from 'next/dynamic';
import HomeBanners from '@/components/client/public/HomeBanners';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'من مكانك — دليل المحلات والعروض' : 'MNMKNK — Local Business & Offers Guide',
    description: isAr
      ? 'اكتشف أفضل المطاعم والمحلات والعروض في منطقتك. اطلب أونلاين أو احجز بسهولة.'
      : 'Discover the best restaurants, shops, and offers near you. Order online or book easily.',
    openGraph: {
      title: isAr ? 'من مكانك — دليل المحلات والعروض' : 'MNMKNK — Local Business & Offers Guide',
      description: isAr
        ? 'اكتشف أفضل المطاعم والمحلات والعروض في منطقتك.'
        : 'Discover the best restaurants, shops, and offers near you.',
      siteName: 'MNMKNK',
      type: 'website',
      locale: isAr ? 'ar_EG' : 'en_US',
    },
  };
}

const CategoryOffersSection = dynamic(() => import('@/components/client/public/CategoryOffersSection'), {
  loading: () => <div className="h-64 md:h-96 animate-pulse bg-slate-100 rounded-[2rem] mb-16 md:mb-24" />,
});
const TopSellingProducts = dynamic(() => import('@/components/client/public/TopSellingProducts'), {
  loading: () => <div className="h-64 md:h-96 animate-pulse bg-slate-100 rounded-[2rem] mb-16 md:mb-24" />,
});
const TopVisitedShops = dynamic(() => import('@/components/client/public/TopVisitedShops'), {
  loading: () => <div className="h-48 md:h-64 animate-pulse bg-slate-100 rounded-[2rem] mb-16 md:mb-24" />,
});
const StorefrontShowcase = dynamic(() => import('@/components/client/public/StorefrontShowcase'), {
  loading: () => <div className="h-48 md:h-64 animate-pulse bg-slate-100 rounded-[2rem] mb-16 md:mb-24" />,
});
const OffersSection = dynamic(() => import('@/components/client/public/offers/OffersSection'), {
  loading: () => <div className="h-64 md:h-96 animate-pulse bg-slate-100 rounded-[2rem] mb-16 md:mb-24" />,
});

export default function HomePage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 md:py-12 relative">
      <HomeBanners />
      <CategoryOffersSection />
      <TopSellingProducts />
      <TopVisitedShops />
      <StorefrontShowcase />
      <OffersSection />
    </div>
  );
}
