import { Metadata } from 'next';
import { Tag, TrendingUp } from 'lucide-react';
import { getOffers } from '@/lib/services';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';

export const metadata: Metadata = {
  title: 'العروض',
  description: 'اكتشف أحدث العروض والخصومات من المتاجر على منصة من مكانك',
  alternates: { canonical: '/offers' },
  openGraph: { title: 'العروض - من مكانك', description: 'اكتشف أحدث العروض والخصومات من المتاجر على منصة من مكانك', url: '/offers', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'العروض - من مكانك', description: 'اكتشف أحدث العروض والخصومات من المتاجر على منصة من مكانك' },
};

export const revalidate = 300;

export default async function OffersPage() {
  const offers = await getOffers();

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-brand-cyan/10 rounded-xl flex items-center justify-center">
          <Tag className="w-7 h-7 text-brand-cyan" />
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">العروض</h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm md:text-base mt-1">أحدث الخصومات والعروض من المتاجر</p>
        </div>
      </div>

      {offers.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {offers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      )}
    </div>
  );
}
