
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { ApiService } from '@/services/api.service';
import { Offer } from '@/types';
import { Sparkles, TrendingUp, Loader2, MapPin, Utensils, ShoppingBag, ShoppingCart, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/common/ui';
import { useCartSound } from '@/hooks/useCartSound';

// Sub-components
import OfferCard from './home/OfferCard';

// Lazy load heavy global components
const ReservationModal = lazy(() => import('../shared/ReservationModal'));

const MotionDiv = motion.div as any;


const HomeFeed: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreOffers, setHasMoreOffers] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const navigate = useNavigate();
  const { playSound } = useCartSound();

  const categories = [
    {
      id: 'restaurants',
      name: 'عروض المطاعم',
      desc: 'أفضل عروض المطاعم والمطابخ',
      icon: Utensils,
      cardClass: 'bg-orange-500',
      gradientClass: 'from-orange-400 to-orange-600',
    },
    {
      id: 'fashion',
      name: 'عروض الأزياء',
      desc: 'ملابس وأحذية بأسعار مميزة',
      icon: ShoppingBag,
      cardClass: 'bg-purple-500',
      gradientClass: 'from-purple-400 to-purple-600',
    },
    {
      id: 'supermarket',
      name: 'عروض السوبر ماركت',
      desc: 'منتجات بقالة ومواد غذائية',
      icon: ShoppingCart,
      cardClass: 'bg-green-500',
      gradientClass: 'from-green-400 to-green-600',
    },
  ];

  const nextCategory = () => {
    setCurrentCategoryIndex((prev) => (prev + 1) % categories.length);
  };

  const prevCategory = () => {
    setCurrentCategoryIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const offersLenRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreOffersRef = useRef(true);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMoreOffersRef = useRef<(() => void) | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedSentinelRef = useRef<HTMLDivElement | null>(null);
  const MAX_RENDERED_OFFERS = 48;
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

    const scheduleInitialLoad = () => {
      if (typeof window === 'undefined') {
        loadData();
        return;
      }

      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(loadData, { timeout: 700 });
        return;
      }

      setTimeout(loadData, 0);
    };

    scheduleInitialLoad();
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

  useEffect(() => {
    const observer = observerRef.current;
    const sentinel = loadMoreSentinelRef.current;
    if (!observer || !sentinel || !hasMoreOffers) return;

    try {
      if (observedSentinelRef.current && observedSentinelRef.current !== sentinel) {
        observer.unobserve(observedSentinelRef.current);
      }
      observer.observe(sentinel);
      observedSentinelRef.current = sentinel;
    } catch {
    }

    return () => {
      try {
        observer.unobserve(sentinel);
      } catch {
      }
    };
  }, [hasMoreOffers, offers.length]);

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
                loadMoreOffersRef.current?.();
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
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-black text-white rounded-full font-black text-[9px] md:text-[10px] md:text-xs uppercase tracking-[0.2em] mb-6 md:mb-10 shadow-2xl"
         >
            <Sparkles className="w-3 h-3 text-[#00E5FF] fill-current" />
            عروض حصرية
         </MotionDiv>
         <h1 className="text-2xl md:text-4xl lg:text-8xl font-black tracking-tighter mb-4 md:mb-8 leading-[0.85]">من مكانك<br/><span className="text-cyan-700">دليل المحلات والمطاعم.</span></h1>
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

      {import.meta.env.DEV && (
        <section className="mb-16 md:mb-24">
          <div className="flex flex-col items-center text-center mb-8 md:mb-12">
            <h2 className="text-xl md:text-3xl lg:text-5xl font-black tracking-tighter mb-4">استكشف العروض حسب الفئة</h2>
            <p className="text-slate-600 text-sm md:text-lg font-bold max-w-2xl">اختر الفئة اللي تهمك وشوف أحدث العروض المتخصصة</p>
          </div>
          <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            {/* Left Arrow */}
            <button
              onClick={prevCategory}
              className="hidden sm:flex w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 transition-all items-center justify-center text-slate-600 hover:text-slate-900 shadow-md"
              aria-label="السابق"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Category Card */}
            <div className="flex-1 max-w-md">
              <Link
                to={`/offers/${categories[currentCategoryIndex].id}`}
                className={`group relative ${categories[currentCategoryIndex].cardClass} text-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-center transition-all hover:scale-105 hover:shadow-2xl overflow-hidden block`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${categories[currentCategoryIndex].gradientClass} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
                <div className="relative z-10">
                  {React.createElement(categories[currentCategoryIndex].icon, {
                    className: 'w-16 h-16 md:w-20 md:h-20 mx-auto mb-4',
                  })}
                  <h3 className="text-2xl md:text-3xl font-black mb-2">{categories[currentCategoryIndex].name}</h3>
                  <p className="text-base md:text-lg opacity-90">{categories[currentCategoryIndex].desc}</p>
                </div>
              </Link>
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextCategory}
              className="hidden sm:flex w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 transition-all items-center justify-center text-slate-600 hover:text-slate-900 shadow-md"
              aria-label="التالي"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Arrow Buttons */}
          <div className="flex justify-center gap-4 mt-6 sm:hidden">
            <button
              onClick={prevCategory}
              className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 transition-all items-center justify-center text-slate-700 hover:text-slate-900 shadow-md"
              aria-label="السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={nextCategory}
              className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 transition-all items-center justify-center text-slate-700 hover:text-slate-900 shadow-md"
              aria-label="التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Category Indicators */}
          <div className="flex justify-center gap-1 mt-6">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCategoryIndex(index)}
                className={`h-11 min-w-11 px-2 flex items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] ${
                  index === currentCategoryIndex ? 'bg-slate-900/10' : 'bg-transparent hover:bg-slate-100'
                }`}
                aria-label={`الفئة ${index + 1}`}
                aria-current={index === currentCategoryIndex ? 'true' : undefined}
              >
                <span
                  className={`block h-3 rounded-full transition-all ${
                    index === currentCategoryIndex ? 'bg-slate-900 w-8' : 'bg-slate-400 w-3'
                  }`}
                />
              </button>
            ))}
          </div>
          </div>
        </section>
      )}

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
            <div className="col-span-full py-20 text-center text-slate-500 font-bold">لا توجد عروض نشطة حالياً.</div>
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
