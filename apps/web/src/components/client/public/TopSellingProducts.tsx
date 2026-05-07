'use client';

import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { clientFetch } from '@/lib/api/client';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  imageUrl?: string;
  shopId?: string;
  shopName?: string;
  slug?: string;
}

const fetcher = (path: string) => clientFetch<Product[]>(path);

export default function TopSellingProductsSection() {
  const t = useT();
  const { locale, dir } = useLocale();
  const isRtl = dir === 'rtl';
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: products, error } = useSWR(
    '/v1/products?limit=12&sort=popular',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );

  const scroll = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (error || !products || products.length === 0) return null;

  return (
    <section className="mb-16 md:mb-24">
      <div className={`flex items-center justify-between mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 bg-[#00E5FF] rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{t('home.topSelling.title', 'Top Selling')}</h2>
            <p className="text-slate-400 text-xs font-bold">{t('home.topSelling.subtitle', 'Most popular products this week')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll(isRtl ? 300 : -300)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll(isRtl ? -300 : 300)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`flex gap-4 overflow-x-auto scrollbar-hide pb-4 ${isRtl ? 'flex-row-reverse' : ''}`}
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((p) => {
          const imgSrc = p.image || p.imageUrl || '';
          return (
            <Link
              key={p.id}
              href={`/${locale}/product/${p.id}`}
              className="shrink-0 w-44 sm:w-52 group"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-[0_8px_24px_-8px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all">
                <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="208px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TrendingUp className="text-slate-200" size={32} />
                    </div>
                  )}
                </div>
                <div className={`p-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <p className="font-black text-sm truncate">{p.name}</p>
                  <p className="text-[#00E5FF] font-black text-xs mt-1">{t('common.currency', 'EGP')} {p.price}</p>
                  {p.shopName && <p className="text-slate-400 text-[10px] font-bold mt-1 truncate">{p.shopName}</p>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
