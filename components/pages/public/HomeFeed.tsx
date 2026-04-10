import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { ApiService } from '@/services/api.service';
import { Offer, Product, Shop } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useCartSound } from '@/hooks/useCartSound';
import HomeHero from './home/HomeHero';

const OffersSection = lazy(() => import('./home/OffersSection'));
const DevCategoryCarousel = lazy(() => import('./home/DevCategoryCarousel'));
const StorefrontShowcaseSection = lazy(() => import('./home/StorefrontShowcaseSection'));

const ReservationModal = lazy(() => import('../shared/ReservationModal'));

const HomeFeed: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingShops, setLoadingShops] = useState(true);
  const [shopProductsById, setShopProductsById] = useState<Record<string, Product[]>>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreOffers, setHasMoreOffers] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const navigate = useNavigate();
  const { playSound } = useCartSound();

  const nextCategory = useCallback(() => {
    setCurrentCategoryIndex((prev) => prev + 1);
  }, []);

  const prevCategory = useCallback(() => {
    setCurrentCategoryIndex((prev) => prev - 1);
  }, []);

  const handleOpenShop = useCallback((shop: Shop) => {
    const slug = String((shop as any)?.slug || '').trim();
    if (!slug) return;
    navigate(`/s/${slug}`);
  }, [navigate]);

  const offersLenRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreOffersRef = useRef(true);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const MAX_RENDERED_OFFERS = 48;
  const PAGE_SIZE = 12;
  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const loadData = useCallback(async () => {
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

    // Load shops in parallel
    setLoadingShops(true);
    try {
      const shopsData = await ApiService.getShops('approved', { take: 100 });
      const shopsList = Array.isArray(shopsData)
        ? shopsData
        : (Array.isArray((shopsData as any)?.items) ? (shopsData as any).items : []);
      setShops(shopsList);

      const approvedShops = shopsList.slice(0, 8);

      const previews = await Promise.all(
        approvedShops.map(async (shop: any) => {
          try {
            const products = await ApiService.getProducts(String(shop?.id || ''), { page: 1, limit: 4 });
            const list = Array.isArray(products) ? products.filter((p: any) => (p?.isActive ?? true)) : [];
            return { shopId: String(shop?.id || ''), list: list.slice(0, 4) as Product[] };
          } catch {
            return { shopId: String(shop?.id || ''), list: [] as Product[] };
          }
        }),
      );

      const byShopId = previews.reduce<Record<string, Product[]>>((acc, { shopId, list }) => {
        if (!shopId) return acc;
        acc[shopId] = list;
        return acc;
      }, {});
      setShopProductsById(byShopId);
    } catch {
      setShops([]);
      setShopProductsById({});
    } finally {
      setLoadingShops(false);
    }
  }, []);

  const loadMoreOffers = useCallback(async () => {
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
  }, []);

  useEffect(() => {
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

    return () => {
      window.removeEventListener('ray-db-update', loadData);
    };
  }, [loadData]);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasMoreOffers) return;

    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    try {
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMoreOffers();
          }
        },
        { rootMargin: '900px 0px', threshold: 0 },
      );

      observerRef.current.observe(sentinel);
    } catch {
    }

    return () => {
      try {
        observerRef.current?.disconnect();
      } catch {
      }
    };
  }, [loadMoreOffers, hasMoreOffers, offers.length]);

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

      <Suspense fallback={null}>
        <StorefrontShowcaseSection
          shops={shops}
          offers={offers}
          shopProductsById={shopProductsById}
          loading={loadingShops}
          onOpenShop={handleOpenShop}
        />
      </Suspense>

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
          loadMoreOffers={loadMoreOffers}
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
