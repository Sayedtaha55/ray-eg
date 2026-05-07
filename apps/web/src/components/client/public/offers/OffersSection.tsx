'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { useT } from '@/i18n/useT';
import { Loader2, TrendingUp } from 'lucide-react';
import OfferCard, { type OfferCardModel } from './OfferCard';
import { clientFetch } from '@/lib/api/client';

function OfferSkeleton() {
  return (
    <div className="bg-white p-3 sm:p-4 md:p-5 rounded-[2rem] md:rounded-[3rem] border border-slate-50 min-w-0">
      <div className="relative aspect-[4/5] rounded-[1.5rem] md:rounded-[2.5rem] mb-4 md:mb-6 bg-slate-100 animate-pulse" />
      <div className="flex items-center justify-between gap-2 mb-4 flex-row-reverse">
        <div className="h-5 md:h-6 w-full max-w-[70%] bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-5 md:h-6 w-12 md:w-16 rounded-full bg-slate-100 animate-pulse shrink-0" />
      </div>
      <div className="h-4 md:h-5 w-full mb-3 bg-slate-100 rounded-xl animate-pulse" />
      <div className="h-12 w-full rounded-2xl bg-slate-100 animate-pulse" />
    </div>
  );
}

export default function OffersSection() {
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1];
  const activeLocale: Locale = isValidLocale(locale || '') ? (locale as Locale) : 'ar';
  const prefix = `/${activeLocale}`;
  const t = useT();

  const PAGE_SIZE = 12;
  const MAX_RENDERED = 48;

  const [offers, setOffers] = useState<OfferCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const offersLenRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchPage = async (skip: number) => {
    const res = await clientFetch<unknown>(`/api/v1/offers?take=${PAGE_SIZE}&skip=${skip}`);
    return Array.isArray(res) ? (res as OfferCardModel[]) : [];
  };

  useEffect(() => {
    let canceled = false;

    const loadFirst = async () => {
      setLoading(true);
      setHasMore(true);
      hasMoreRef.current = true;
      offersLenRef.current = 0;

      try {
        const list = await fetchPage(0);
        if (canceled) return;

        const capped = list.slice(0, MAX_RENDERED);
        setOffers(capped);
        offersLenRef.current = capped.length;

        const nextHasMore = list.length >= PAGE_SIZE;
        setHasMore(nextHasMore);
        hasMoreRef.current = nextHasMore;
      } catch {
        if (canceled) return;
        setOffers([]);
        setHasMore(false);
        hasMoreRef.current = false;
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    loadFirst();

    return () => {
      canceled = true;
      try {
        observerRef.current?.disconnect();
      } catch {}
      observerRef.current = null;
    };
  }, []);

  const loadMore = async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const list = await fetchPage(offersLenRef.current);
      setOffers((prev) => {
        const merged = [...prev, ...list];
        const capped = merged.length > MAX_RENDERED ? merged.slice(merged.length - MAX_RENDERED) : merged;
        offersLenRef.current = capped.length;
        return capped;
      });

      const nextHasMore = list.length >= PAGE_SIZE;
      setHasMore(nextHasMore);
      hasMoreRef.current = nextHasMore;
    } catch {
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    if (!hasMore) return;

    try {
      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (!first?.isIntersecting) return;
          loadMore();
        },
        { root: null, rootMargin: '900px 0px', threshold: 0 },
      );
      observerRef.current.observe(sentinel);
    } catch {
    }

    return () => {
      try {
        observerRef.current?.disconnect();
      } catch {}
      observerRef.current = null;
    };
  }, [hasMore, offers.length]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-12">
          {Array.from({ length: 6 }).map((_, idx) => (
            <OfferSkeleton key={idx} />
          ))}
        </div>
      );
    }

    if (!offers.length) {
      return <div className="col-span-full py-20 text-center text-slate-500 font-bold">{t('offers.empty', 'No active offers currently.')}</div>;
    }

    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 lg:gap-12">
        {offers.map((offer) => (
          <OfferCard key={String(offer.id)} offer={offer} />
        ))}
      </div>
    );
  }, [loading, offers]);

  return (
    <section className="mb-16 md:mb-24">
      <div className="flex items-center justify-between mb-8 md:mb-20 flex-row-reverse px-2">
        <h2 className="text-xl md:text-3xl lg:text-5xl font-black tracking-tighter">{t('home.offersTitle', 'Latest Price Drops')}</h2>
        <Link
          href={`${prefix}/offers`}
          className="flex items-center gap-2 text-slate-600 font-black text-xs md:text-sm hover:text-black transition-all group"
        >
          {t('home.viewAll', 'View All')} <TrendingUp className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
        </Link>
      </div>

      {content}

      {hasMore && <div ref={sentinelRef} className="h-10" aria-hidden="true" />}

      {hasMore && (
        <div className="mt-10 md:mt-16 flex items-center justify-center">
          <button
            type="button"
            onClick={loadMore}
            className="px-8 py-3 md:px-10 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
            disabled={loadingMore}
          >
            {loadingMore ? <Loader2 className="animate-spin" size={18} /> : null}
            <span>{loadingMore ? t('common.loading', 'Loading...') : t('common.loadMore', 'Load More')}</span>
          </button>
        </div>
      )}
    </section>
  );
}
