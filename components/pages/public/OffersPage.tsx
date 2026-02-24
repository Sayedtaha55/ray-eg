
import React, { useEffect, useRef, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { Offer } from '@/types';
import { TrendingUp, Eye, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getOptimizedImageUrl } from '@/lib/image-utils';
import { Skeleton } from '@/components/common/ui';

const { useNavigate } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const OffersPage: React.FC = () => {
  const navigate = useNavigate();
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
        const data = await ApiService.getOffers({ take: PAGE_SIZE, skip: 0 });
        const list = Array.isArray(data) ? data : [];
        setOffers(list);
        setHasMore(list.length >= PAGE_SIZE);
        pagingRef.current.skip = list.length;
      } catch {
        setOffers([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadFirst();
    window.addEventListener('ray-db-update', loadFirst);
    return () => window.removeEventListener('ray-db-update', loadFirst);
  }, []);

  const loadMore = async () => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    try {
      const { take, skip } = pagingRef.current;
      const next = await ApiService.getOffers({ take, skip });
      const list = Array.isArray(next) ? next : [];
      setOffers((prev) => {
        const merged = [...prev, ...list];
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

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-12 relative" dir="rtl">
      <div className="flex flex-col items-center text-center mb-10 md:mb-16">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-[#BD00FF]" />
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter">العروض</h1>
        </div>
        <p className="text-slate-400 font-bold">أحدث العروض النشطة — تحميل تدريجي لتخفيف الضغط</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {loading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <div key={`offer-skel-${idx}`} className="bg-white p-5 rounded-[3rem] border border-slate-50">
              <Skeleton className="relative aspect-[4/5] rounded-[2.5rem] mb-6" />
              <div className="flex items-center justify-between mb-4 flex-row-reverse">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-56 mb-3" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          ))
        ) : offers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-300 font-bold">لا توجد عروض نشطة حالياً.</div>
        ) : (
          offers.map((offer: any, idx: number) => (
            <div
              key={offer.id}
              className={`cv-auto group bg-white p-5 rounded-[3rem] border border-slate-50 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 ${
                idx < visibleIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div
                onClick={() => {
                  const productId = String((offer as any).productId || offer.id || '').trim();
                  const shopSlug = String((offer as any).shopSlug || '').trim();
                  if (productId && shopSlug) {
                    navigate(`/shop/${shopSlug}/product/${productId}?from=offers`);
                    return;
                  }
                  navigate(`/product/${productId || offer.id}`);
                }}
                className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 bg-slate-50 cursor-pointer"
              >
                <img
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  decoding="async"
                  src={getOptimizedImageUrl(offer.imageUrl, 'md')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                  alt={offer.title}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (offer.imageUrl && img.src !== offer.imageUrl) img.src = offer.imageUrl;
                  }}
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
                    <p className="text-slate-300 line-through text-xs font-bold">ج.م {offer.oldPrice}</p>
                    <p className="text-2xl md:text-3xl font-black text-[#BD00FF] tracking-tighter">ج.م {offer.newPrice}</p>
                  </div>
                  <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2">
                    <TrendingUp size={16} />
                    {offer.shopName || 'متجر'}
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
            <span>{loadingMore ? 'تحميل...' : 'تحميل المزيد'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default OffersPage;
