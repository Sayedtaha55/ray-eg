import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { ApiService } from '@/services/api.service';
import { Offer } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useCartSound } from '@/hooks/useCartSound';
import HomeHero from './home/HomeHero';

const OffersSection = lazy(() => import('./home/OffersSection'));
const DevCategoryCarousel = lazy(() => import('./home/DevCategoryCarousel'));

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

  const nextCategory = () => {
    setCurrentCategoryIndex((prev) => prev + 1);
  };

  const prevCategory = () => {
    setCurrentCategoryIndex((prev) => prev - 1);
  };

  const offersLenRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreOffersRef = useRef(true);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMoreOffersRef = useRef<(() => void) | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedSentinelRef = useRef<HTMLDivElement | null>(null);
  const MAX_RENDERED_OFFERS = 48;
  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

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
        <Suspense fallback={null}>
          <DevCategoryCarousel
            currentCategoryIndex={currentCategoryIndex}
            setCurrentCategoryIndex={setCurrentCategoryIndex}
            nextCategory={nextCategory}
            prevCategory={prevCategory}
          />
        </Suspense>
      )}

      <Suspense fallback={<div className="min-h-[55vh]" /> }>
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
      </Suspense>

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
