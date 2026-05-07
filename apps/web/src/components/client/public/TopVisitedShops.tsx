'use client';

import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { clientFetch } from '@/lib/api/client';

interface Shop {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  category?: string;
  visitors?: number;
}

const fetcher = (path: string) => clientFetch<Shop[]>(path);

export default function TopVisitedShopsSection() {
  const t = useT();
  const { locale, dir } = useLocale();
  const isRtl = dir === 'rtl';
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: shops, error } = useSWR(
    '/v1/shops?take=12&sort=visitors',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );

  const scroll = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (error || !shops || shops.length === 0) return null;

  return (
    <section className="mb-16 md:mb-24">
      <div className={`flex items-center justify-between mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 bg-[#BD00FF] rounded-xl flex items-center justify-center">
            <Eye size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{t('home.topVisited.title', 'Most Visited')}</h2>
            <p className="text-slate-400 text-xs font-bold">{t('home.topVisited.subtitle', 'Popular stores this week')}</p>
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
        {shops.map((s) => {
          const imgSrc = s.banner || s.logo || '';
          return (
            <Link
              key={s.id}
              href={`/${locale}/shop/${s.slug || s.id}`}
              className="shrink-0 w-56 sm:w-64 group"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-[0_8px_24px_-8px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all">
                <div className="relative w-full h-32 bg-slate-50 overflow-hidden">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={s.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="256px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Eye className="text-slate-200" size={32} />
                    </div>
                  )}
                </div>
                <div className={`p-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <p className="font-black text-sm truncate">{s.name}</p>
                  {s.category && <p className="text-slate-400 text-[10px] font-bold mt-1">{s.category}</p>}
                  {s.visitors != null && (
                    <div className={`flex items-center gap-1 mt-2 text-slate-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <Eye size={12} />
                      <span className="text-[10px] font-bold">{s.visitors}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
