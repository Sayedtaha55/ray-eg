import { Metadata } from 'next';
import Link from 'next/link';
import { Store } from 'lucide-react';
import { getShops } from '@/lib/services';
import { DalilClient } from '@/components/DalilClient';
import { activities, siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'دليل المتاجر',
  description: 'دليل المتاجر والأنشطة التجارية على منصة من مكانك',
  alternates: { canonical: '/dalil' },
  openGraph: { title: 'دليل المتاجر - من مكانك', description: 'دليل المتاجر والأنشطة التجارية على منصة من مكانك', url: '/dalil', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'دليل المتاجر - من مكانك', description: 'دليل المتاجر والأنشطة التجارية على منصة من مكانك' },
};

export const revalidate = 300;

export default async function DalilPage() {
  const shops = await getShops(100);

  const dalilLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'دليل المتاجر - من مكانك',
    url: `${siteConfig.url}/dalil`,
    description: 'دليل المتاجر والأنشطة التجارية على منصة من مكانك',
    isPartOf: { '@type': 'WebSite', name: siteConfig.name, url: siteConfig.url },
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dalilLd) }} />
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-brand-purple/10 rounded-3xl flex items-center justify-center">
          <Store className="w-7 h-7 text-brand-purple" />
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">دليل المتاجر</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base mt-1">استكشف جميع المتاجر المسجلة</p>
        </div>
      </div>

      {/* Activities quick links */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/dalil" className="px-4 py-2 rounded-xl text-xs font-black bg-brand-black text-white">الكل</Link>
        {activities.map((a) => (
          <Link key={a.id} href={`/activity/${a.id}`} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            {a.icon} {a.label.ar}
          </Link>
        ))}
      </div>

      <DalilClient shops={shops} />
    </div>
  );
}
