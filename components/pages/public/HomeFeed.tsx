import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { ApiService } from '@/services/api.service';
import { Offer, Product, Shop } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useCartSound } from '@/hooks/useCartSound';
import HomeHero from './home/HomeHero';
import StorefrontShowcaseSection from './home/StorefrontShowcaseSection';

const OffersSection = lazy(() => import('./home/OffersSection'));
const DevCategoryCarousel = lazy(() => import('./home/DevCategoryCarousel'));

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

  const nextCategory = React.useCallback(() => {
    setCurrentCategoryIndex((prev) => prev + 1);
  }, []);

  const prevCategory = React.useCallback(() => {
    setCurrentCategoryIndex((prev) => prev - 1);
  }, []);

  const offersLenRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreOffersRef = useRef(true);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMoreOffersRef = useRef<(() => void) | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedSentinelRef = useRef<HTMLDivElement | null>(null);
  const previewCacheRef = useRef<Record<string, Product[]>>({});
  const latestLoadIdRef = useRef(0);
  const MAX_RENDERED_OFFERS = 48;
  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    const PAGE_SIZE = 12;
    const loadShopPreviews = async (shopsList: Shop[], loadId: number) => {
      const approvedShops = shopsList
        .filter((shop: any) => String(shop?.status || '').trim().toLowerCase() === 'approved')
        .slice(0, 8);
      const previewShopIds = approvedShops.map((shop: any) => String(shop?.id || '')).filter(Boolean);
      if (!previewShopIds.length) {
        if (latestLoadIdRef.current === loadId) setShopProductsById({});
        return;
      }

      const cached: Record<string, Product[]> = {};
      const missingShopIds: string[] = [];
      for (const shopId of previewShopIds) {
        const cachedProducts = previewCacheRef.current[shopId];
        if (Array.isArray(cachedProducts)) cached[shopId] = cachedProducts;
        else missingShopIds.push(shopId);
      }

      if (latestLoadIdRef.current === loadId) {
        setShopProductsById(cached);
      }

      if (!missingShopIds.length) return;

      const previews = await Promise.all(
        missingShopIds.map(async (shopId) => {
          try {
            const products = await ApiService.getProducts(shopId, { page: 1, limit: 4 });
            const list = Array.isArray(products) ? products.filter((p: any) => (p?.isActive ?? true)).slice(0, 4) : [];
            return { shopId, list: list as Product[] };
          } catch {
            return { shopId, list: [] as Product[] };
          }
        }),
      );

      const fetched = previews.reduce<Record<string, Product[]>>((acc, { shopId, list }) => {
        if (!shopId) return acc;
        acc[shopId] = list;
        return acc;
      }, {});
      previewCacheRef.current = { ...previewCacheRef.current, ...fetched };

      if (latestLoadIdRef.current === loadId) {
        setShopProductsById((prev) => ({ ...prev, ...fetched }));
      }
    };

    const loadData = async () => {
      const loadId = Date.now();
      latestLoadIdRef.current = loadId;
      setLoading(true);
      setLoadingShops(true);

      try {
        const [offersData, shopsData] = await Promise.all([
          ApiService.getOffers({ take: PAGE_SIZE, skip: 0 }),
          ApiService.getShops('approved', { take: 100 }),
        ]);

        const offersList = Array.isArray(offersData) ? offersData : [];
        setOffers(offersList);

        const nextHasMore = offersList.length >= PAGE_SIZE;
        offersLenRef.current = offersList.length;
        hasMoreOffersRef.current = nextHasMore;
        setHasMoreOffers(nextHasMore);

        const shopsList = Array.isArray(shopsData)
          ? shopsData
          : (Array.isArray((shopsData as any)?.items) ? (shopsData as any).items : []);

        const mapVisibleShops = shopsList.filter((shop: any) => {
          const status = String(shop?.status || '').trim().toLowerCase();
          if (status !== 'approved') return false;
          const publicDisabled =
            typeof shop?.publicDisabled !== 'undefined'
              ? Boolean(shop.publicDisabled)
              : typeof shop?.public_disabled !== 'undefined'
                ? Boolean(shop.public_disabled)
                : false;
          if (publicDisabled) return false;
          return typeof shop?.latitude === 'number' && typeof shop?.longitude === 'number';
        });
        if (latestLoadIdRef.current === loadId) {
          setShops(mapVisibleShops);
          setLoadingShops(false);
        }

        loadShopPreviews(mapVisibleShops, loadId).catch(() => {
          if (latestLoadIdRef.current === loadId) setShopProductsById({});
        });
      } catch {
        if (latestLoadIdRef.current === loadId) {
          setOffers([]);
          offersLenRef.current = 0;
          hasMoreOffersRef.current = false;
          setHasMoreOffers(false);
          setShops([]);
          setShopProductsById({});
          setLoadingShops(false);
        }
      } finally {
        if (latestLoadIdRef.current === loadId) {
          setLoading(false);
        }
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

    loadData();
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

  const handleOpenShop = React.useCallback((shop: Shop) => {
    const slug = String((shop as any)?.slug || '').trim();
    if (!slug) return;
    navigate(`/s/${slug}`);
  }, [navigate]);

  const handleLoadMoreOffers = React.useCallback(() => {
    loadMoreOffersRef.current?.();
  }, []);

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

      <StorefrontShowcaseSection
        shops={shops}
        offers={offers}
        shopProductsById={shopProductsById}
        loading={loadingShops}
        onOpenShop={handleOpenShop}
      />

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
          loadMoreOffers={handleLoadMoreOffers}
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
