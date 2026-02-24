
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { ApiService } from '@/services/api.service';
import { Offer } from '@/types';
import { Sparkles, TrendingUp, Loader2, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { Skeleton } from '@/components/common/ui';
import { useCartSound } from '@/hooks/useCartSound';

// Sub-components
import OfferCard from './home/OfferCard';
import FeedbackWidget from './home/FeedbackWidget';

// Lazy load heavy global components
const ReservationModal = lazy(() => import('../shared/ReservationModal'));

const { Link, useNavigate } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;


const HomeFeed: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreOffers, setHasMoreOffers] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const navigate = useNavigate();
  const { playSound } = useCartSound();

  const offersLenRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreOffersRef = useRef(true);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMoreOffersRef = useRef<(() => void) | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const MAX_RENDERED_OFFERS = 48;
  
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState('');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const PAGE_SIZE = 12;
    const loadData = async () => {
      setLoading(true);
      try {
        const offersData = await ApiService.getOffers({ take: PAGE_SIZE, skip: 0 });
        setOffers(offersData);

        const nextHasMore = Array.isArray(offersData) && offersData.length >= PAGE_SIZE;
        offersLenRef.current = Array.isArray(offersData) ? offersData.length : 0;
        hasMoreOffersRef.current = nextHasMore;
        setHasMoreOffers(nextHasMore);
      } catch (e) {
        // Failed to fetch data - handled silently
      } finally {
        setLoading(false);
      }
    };

    const loadMoreOffers = async () => {
      if (loadingMoreRef.current || !hasMoreOffersRef.current) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
      try {
        const next = await ApiService.getOffers({ take: PAGE_SIZE, skip: offersLenRef.current });
        const list = Array.isArray(next) ? next : [];
        setOffers((prev) => {
          const merged = [...prev, ...list];
          // Cap DOM nodes for weak devices by keeping only the most recent items
          const capped = merged.length > MAX_RENDERED_OFFERS ? merged.slice(merged.length - MAX_RENDERED_OFFERS) : merged;
          offersLenRef.current = capped.length;
          return capped;
        });
        const nextHasMore = list.length >= PAGE_SIZE;
        hasMoreOffersRef.current = nextHasMore;
        setHasMoreOffers(nextHasMore);
      } catch {
      } finally {
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    };

    loadMoreOffersRef.current = () => {
      loadMoreOffers();
    };

    loadData();
    window.addEventListener('ray-db-update', loadData);

    // IntersectionObserver instead of scroll listener
    try {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (!first?.isIntersecting) return;
          loadMoreOffersRef.current?.();
        },
        { root: null, rootMargin: '900px 0px', threshold: 0 },
      );
      if (loadMoreSentinelRef.current) {
        observerRef.current.observe(loadMoreSentinelRef.current);
      }
    } catch {
    }
    return () => {
      window.removeEventListener('ray-db-update', loadData);
      try {
        observerRef.current?.disconnect();
        observerRef.current = null;
      } catch {
      }
    };
  }, []);

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackLoading(true);
    try {
      const userStr = localStorage.getItem('ray_user');
      const user = userStr ? JSON.parse(userStr) : null;

      await ApiService.saveFeedback({
        text: feedbackText,
        userName: user?.name,
        userEmail: user?.email
      });

      setFeedbackResponse('شكراً ليك يا بطل، اقتراحك وصل وهنراجعه قريب!');
    } catch (e) {
      setFeedbackResponse('حصل مشكلة بسيطة بس اقتراحك وصل لمهندسينا!');
    } finally {
      setFeedbackLoading(false);
      setFeedbackText('');
    }
  };

  if (loading) return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-12 relative">
      <div className="flex flex-col items-center text-center mb-10 md:mb-20">
        <Skeleton className="h-9 w-44 rounded-full mb-10" />
        <Skeleton className="h-12 md:h-20 w-[min(720px,90%)] mb-4" />
        <Skeleton className="h-12 md:h-20 w-[min(560px,85%)] mb-8" />
        <Skeleton className="h-6 w-[min(520px,85%)] mb-4" />
        <Skeleton className="h-6 w-[min(420px,80%)] mb-10" />
        <Skeleton className="h-14 w-44 rounded-2xl" />
      </div>

      <section className="mb-24">
        <div className="flex items-center justify-between mb-12 md:mb-20 flex-row-reverse px-2">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-12">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`offer-skel-${idx}`} className="bg-white p-5 rounded-[3rem] border border-slate-50">
              <Skeleton className="relative aspect-[4/5] rounded-[2.5rem] mb-6" />
              <div className="flex items-center justify-between mb-4 flex-row-reverse">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-56 mb-3" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          ))}
        </div>
        {hasMoreOffers && (
          <div className="mt-10 md:mt-16 flex items-center justify-center">
            <button
              type="button"
              aria-label="تحميل المزيد من العروض"
              onClick={() => {
                try {
                  const evt = new Event('scroll');
                  window.dispatchEvent(evt);
                } catch {
                }
              }}
              className="px-8 py-3 md:px-10 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
              disabled={loadingMore}
            >
              {loadingMore ? <Loader2 className="animate-spin" size={18} /> : null}
              <span>{loadingMore ? 'تحميل...' : 'تحميل المزيد'}</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 md:py-12 relative">
      <div className="flex flex-col items-center text-center mb-8 md:mb-20">
         <MotionDiv 
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-black text-white rounded-full font-black text-[9px] md:text-[10px] md:text-xs uppercase tracking-[0.2em] mb-6 md:mb-10 shadow-2xl"
         >
            <Sparkles className="w-3 h-3 text-[#00E5FF] fill-current" />
            عروض حصرية
         </MotionDiv>
         <h1 className="text-2xl md:text-4xl lg:text-8xl font-black tracking-tighter mb-4 md:mb-8 leading-[0.85]">من مكانك<br/><span className="text-[#00E5FF]">دليل المحلات والمطاعم.</span></h1>
         <p className="text-slate-600 text-sm md:text-lg md:text-2xl font-bold max-w-2xl px-4 leading-relaxed mb-8 md:mb-12">
            منصة من مكانك لاكتشاف أفضل المحلات والمطاعم القريبة منك مع العروض والتقييمات.
         </p>

         <Link
           to="/map"
           className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base hover:bg-black transition-all shadow-xl"
         >
           الخريطة <MapPin className="w-4 h-4" />
         </Link>
      </div>

      {/* Offers Grid */}
      <section className="mb-16 md:mb-24">
        <div className="flex items-center justify-between mb-8 md:mb-20 flex-row-reverse px-2">
           <h2 className="text-xl md:text-3xl lg:text-5xl font-black tracking-tighter">أحدث الانفجارات السعرية</h2>
           <Link to="/map" className="flex items-center gap-2 text-slate-600 font-black text-xs md:text-sm hover:text-black transition-all group">
             مشاهدة الكل <TrendingUp className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
           </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 lg:gap-12">
          {offers.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-300 font-bold">لا توجد عروض نشطة حالياً.</div>
          ) : offers.map((offer, idx) => (
            <div key={offer.id} className="cv-auto">
              <OfferCard
              offer={offer}
              idx={idx}
              navigate={navigate}
              setSelectedItem={setSelectedItem}
                playSound={playSound}
              />
            </div>
          ))}
        </div>

        {/* Sentinel for IntersectionObserver pagination */}
        {hasMoreOffers && (
          <div ref={loadMoreSentinelRef} className="h-10" aria-hidden="true" />
        )}

        {hasMoreOffers && (
          <div className="mt-10 md:mt-16 flex items-center justify-center">
            <button
              type="button"
              aria-label="تحميل المزيد من العروض"
              onClick={() => loadMoreOffersRef.current?.()}
              className="px-8 py-3 md:px-10 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
              disabled={loadingMore}
            >
              {loadingMore ? <Loader2 className="animate-spin" size={18} /> : null}
              <span>{loadingMore ? 'تحميل...' : 'تحميل المزيد'}</span>
            </button>
          </div>
        )}
      </section>

      <FeedbackWidget />

      <Suspense fallback={null}>
        <ReservationModal 
          isOpen={!!selectedItem} 
          onClose={() => setSelectedItem(null)} 
          item={selectedItem ? {
            id: selectedItem.id,
            name: selectedItem.title,
            image: selectedItem.imageUrl,
            price: selectedItem.newPrice,
            shopId: selectedItem.shopId,
            shopName: selectedItem.shopName
          } : null} 
        />
      </Suspense>
    </div>
  );
};

export default HomeFeed;
