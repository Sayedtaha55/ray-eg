import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { ApiService } from '@/services/api.service';
import { Offer } from '@/types';
import { Utensils, ShoppingBag, ShoppingCart, ChevronRight, ChevronLeft } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCartSound } from '@/hooks/useCartSound';
import HomeHero from './home/HomeHero';
import OffersSection from './home/OffersSection';

const ReservationModal = lazy(() => import('../shared/ReservationModal'));

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
      } catch {
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

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 md:py-12 relative">
      <HomeHero prefersReducedMotion={prefersReducedMotion} />

      {import.meta.env.DEV && (
        <section className="mb-16 md:mb-24">
          <div className="flex flex-col items-center text-center mb-8 md:mb-12">
            <h2 className="text-xl md:text-3xl lg:text-5xl font-black tracking-tighter mb-4">استكشف العروض حسب الفئة</h2>
            <p className="text-slate-600 text-sm md:text-lg font-bold max-w-2xl">اختر الفئة اللي تهمك وشوف أحدث العروض المتخصصة</p>
          </div>
          <div className="relative max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={prevCategory}
                className="hidden sm:flex w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 transition-all items-center justify-center text-slate-600 hover:text-slate-900 shadow-md"
                aria-label="السابق"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="flex-1 max-w-md min-w-0">
                <Link
                  to={`/offers/${categories[currentCategoryIndex].id}`}
                  className={`group relative ${categories[currentCategoryIndex].cardClass} text-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12 text-center transition-all hover:scale-105 hover:shadow-2xl overflow-hidden block min-w-0`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${categories[currentCategoryIndex].gradientClass} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                  <div className="relative z-10">
                    {React.createElement(categories[currentCategoryIndex].icon, {
                      className: 'w-16 h-16 md:w-20 md:h-20 mx-auto mb-4',
                    })}
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 break-words">{categories[currentCategoryIndex].name}</h3>
                    <p className="text-sm sm:text-base md:text-lg opacity-90 break-words">{categories[currentCategoryIndex].desc}</p>
                  </div>
                </Link>
              </div>

              <button
                onClick={nextCategory}
                className="hidden sm:flex w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 transition-all items-center justify-center text-slate-600 hover:text-slate-900 shadow-md"
                aria-label="التالي"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

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

      <OffersSection
        loading={loading}
        loadingMore={loadingMore}
        hasMoreOffers={hasMoreOffers}
        offers={offers}
        navigate={navigate as any}
        setSelectedItem={setSelectedItem}
        playSound={playSound}
        loadMoreSentinelRef={loadMoreSentinelRef}
        loadMoreOffers={() => loadMoreOffersRef.current?.()}
      />

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
            shopName: selectedItem.shopName,
          } : null}
        />
      </Suspense>
    </div>
  );
};

export default HomeFeed;
