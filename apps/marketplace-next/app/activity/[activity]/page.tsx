import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';
import { getProductsByActivity } from '@/lib/services';
import { ProductCard } from '@/components/ProductCard';
import { activities } from '@/lib/config';

export const revalidate = 300;

interface Props {
  params: Promise<{ activity: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { activity } = await params;
  const config = activities.find((a) => a.id === activity);
  const title = config ? `${config.label.ar} - الأقسام` : 'قسم غير موجود';
  const description = `استكشف منتجات ${config?.label.ar || ''} على منصة من مكانك`;
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
  // الأقسام تعرض منتجات بالبطاقة الموحدة — مش بطاقات متاجر
  const products = await getProductsByActivity(activity, 24);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-16">
      <Link
        href="/"
        className="flex items-center gap-2 text-brand-cyan font-semibold text-sm mb-6 hover:gap-3 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        العودة للرئيسية
      </Link>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-xl overflow-hidden">
          <Image
            src={config?.image || '/images/activities/cars.svg'}
            alt={config?.label.ar || 'قسم'}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            {config?.label.ar || 'قسم'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm md:text-base mt-1">
            منتجات في قسم {config?.label.ar}
          </p>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold text-lg">لا توجد منتجات في هذا القسم حالياً</p>
          <Link
            href="/offers"
            className="inline-flex items-center gap-2 mt-4 text-brand-cyan font-semibold text-sm hover:underline"
          >
            تصفح كل المنتجات
          </Link>
        </div>
      )}
    </div>
  );
}
