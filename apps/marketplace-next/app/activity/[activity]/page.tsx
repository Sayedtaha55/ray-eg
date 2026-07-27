import { Metadata } from 'next';
import Link from 'next/link';
import { Store, ArrowLeft } from 'lucide-react';
import { getShops } from '@/lib/services';
import { ShopCard } from '@/components/ShopCard';
import { activities } from '@/lib/config';

export const revalidate = 300;

interface Props { params: Promise<{ activity: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { activity } = await params;
  const config = activities.find((a) => a.id === activity);
  const title = config ? `${config.label.ar} - الأنشطة` : 'نشاط غير موجود';
  const description = `استكشف متاجر ${config?.label.ar || ''} على منصة من مكانك`;
  return {
    title,
    description,
    alternates: { canonical: `/activity/${activity}` },
    openGraph: { title, description, url: `/activity/${activity}`, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export async function generateStaticParams() {
  return activities.map((a) => ({ activity: a.id }));
}

export default async function ActivityPage({ params }: Props) {
  const { activity } = await params;
  const config = activities.find((a) => a.id === activity);
  const shops = await getShops(100);
  const filtered = shops.filter((s) => s.activity === activity || s.category === activity);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-16">
      <Link href="/" className="flex items-center gap-2 text-brand-cyan font-black text-sm mb-6 hover:gap-3 transition-all">
        <ArrowLeft className="w-4 h-4" />
        العودة للرئيسية
      </Link>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-brand-cyan/10 rounded-4xl flex items-center justify-center text-3xl">
          {config?.icon || '📦'}
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">{config?.label.ar || 'نشاط'}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base mt-1">متاجر في قطاع {config?.label.ar}</p>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
        </div>
      ) : (
        <div className="text-center py-20">
          <Store className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-black text-lg">لا توجد متاجر في هذا القطاع حالياً</p>
          <Link href="/dalil" className="inline-flex items-center gap-2 mt-4 text-brand-cyan font-black text-sm hover:underline">
            تصفح كل المتاجر
          </Link>
        </div>
      )}
    </div>
  );
}
