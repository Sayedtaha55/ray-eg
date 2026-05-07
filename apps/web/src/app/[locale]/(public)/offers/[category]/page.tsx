'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Eye, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';

interface Offer {
  id: string;
  title: string;
  imageUrl: string;
  discount: number;
  oldPrice: number;
  newPrice: number;
  shopName?: string;
  productId?: string;
  shopSlug?: string;
}

const categoryTitleKey: Record<string, string> = {
  restaurants: 'offers.restaurants',
  fashion: 'offers.fashion',
  supermarket: 'offers.supermarket',
};

export default function CategoryOffersPage() {
  const router = useRouter();
  const params = useParams();
  const locale = String((params as any).locale || 'ar');
  const prefix = `/${locale}`;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const t = useT();
  const category = String(params.category || '');
  const catTitle = categoryTitleKey[category] ? t(categoryTitleKey[category], category) : null;

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [visibleIdx, setVisibleIdx] = useState(8);
  useEffect(() => {
    const handleScroll = () => {
      if (visibleIdx >= offers.length) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setVisibleIdx(prev => Math.min(offers.length, prev + 8));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [offers.length, visibleIdx]);

  const pagingRef = useRef({ take: 16, skip: 0 });

  useEffect(() => {
    const PAGE_SIZE = 16;
    pagingRef.current = { take: PAGE_SIZE, skip: 0 };

    const loadFirst = async () => {
      setLoading(true);
      setHasMore(true);
      try {
        const data = await clientFetch<unknown>(`/api/v1/offers?take=16&skip=0&category=${category}`);
        const list = Array.isArray(data) ? data : [];
        setOffers(list as Offer[]);
        setHasMore(list.length >= PAGE_SIZE);
        pagingRef.current.skip = list.length;
      } catch {
        setOffers([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    if (category) loadFirst();
  }, [category]);

  const loadMore = async () => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    try {
      const { take, skip } = pagingRef.current;
      const next = await clientFetch<unknown>(`/api/v1/offers?take=${take}&skip=${skip}&category=${category}`);
      const list = Array.isArray(next) ? next : [];
      setOffers((prev) => {
        const merged = [...prev, ...(list as Offer[])];
        pagingRef.current.skip = merged.length;
        return merged;
      });
      setHasMore(list.length >= take);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  if (!catTitle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8" dir={dir}>
        <h1 className="text-3xl font-black">{t('offers.categoryNotFound', 'Category not found')}</h1>
        <Link href={`${prefix}/offers`} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all">
          {t('offers.backToOffers', 'Back to Offers')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir={dir}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-12 relative">
        <div className="flex flex-col items-center text-center mb-10 md:mb-16">
          <Link href={`${prefix}/offers`} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-4 hover:text-black transition-colors">
            <ArrowRight size={16} /> {t('offers.title', 'Offers')}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-[#BD00FF]" />
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter">{catTitle}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {loading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <div key={`offer-skel-${idx}`} className="bg-white p-5 rounded-[3rem] border border-slate-50">
              <div className="relative aspect-[4/5] rounded-[2.5rem] mb-6 bg-slate-100 animate-pulse" />
              <div className="flex items-center justify-between mb-4 flex-row-reverse">
                <div className="h-6 w-40 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
              </div>
              <div className="h-5 w-56 mb-3 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-12 w-full rounded-2xl bg-slate-100 animate-pulse" />
            </div>
          ))
        ) : offers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 font-bold">{t('offers.empty', 'No active offers currently.')}</div>
        ) : (
          offers.map((offer, idx) => (
            <div
              key={offer.id}
              className={`cv-auto group bg-white p-5 rounded-[3rem] border border-slate-50 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 ${
                idx < visibleIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div
                onClick={() => {
                  const productId = String(offer.productId || offer.id || '').trim();
                  const shopSlug = String(offer.shopSlug || '').trim();
                  if (productId && shopSlug) {
                    router.push(`${prefix}/shop/${shopSlug}/product/${productId}?from=offers`);
                    return;
                  }
                  router.push(`${prefix}/product/${productId || offer.id}`);
                }}
                className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 bg-slate-50 cursor-pointer"
              >
                <Image
                  src={offer.imageUrl}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={idx === 0}
                  className="object-cover group-hover:scale-110 transition-transform duration-[2s]"
                />
                <div className="absolute top-5 left-5 bg-[#BD00FF] text-white px-4 py-2 rounded-2xl font-black text-sm shadow-xl shadow-purple-500/30">-{offer.discount}%</div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye size={32} className="text-white drop-shadow-lg" />
                </div>
              </div>
              <div className="px-3 text-right">
                <h3 className="text-xl md:text-2xl font-black mb-4 line-clamp-1 leading-tight">{offer.title}</h3>
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right">
                    <p className="text-slate-300 line-through text-xs font-bold">{t('common.currency', 'EGP')} {Number(offer.oldPrice || 0).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}</p>
                    <p className="text-2xl md:text-3xl font-black text-[#BD00FF] tracking-tighter">{t('common.currency', 'EGP')} {Number(offer.newPrice || 0).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}</p>
                  </div>
                  <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2">
                    <TrendingUp size={16} />
                    {offer.shopName || t('offers.shopLabel', 'Shop')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

        {offers.length > 0 && hasMore && (
          <div className="mt-10 md:mt-16 flex items-center justify-center">
            <button
              onClick={loadMore}
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl disabled:opacity-60"
              disabled={loadingMore}
            >
              {loadingMore ? <Loader2 className="animate-spin" size={18} /> : null}
              <span>{loadingMore ? t('common.loading', 'Loading...') : t('common.loadMore', 'Load More')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
