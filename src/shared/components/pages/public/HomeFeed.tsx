import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { ApiService } from '@/services/api.service';
import { Offer, Product, Shop } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useCartSound } from '@/hooks/useCartSound';
import HomeHero from './home/HomeHero';
import StorefrontShowcaseSection from './home/StorefrontShowcaseSection';

const OffersSection = lazy(() => import('./home/OffersSection'));
const DevCategoryCarousel = lazy(() => import('./home/DevCategoryCarousel'));

const HOME_CACHE_KEY = 'ray_home_feed_cache_v1';

type HomeFeedCache = {
  offers: Offer[];
  shops: Shop[];
  shopProductsById: Record<string, Product[]>;
  savedAt: number;
};

function readHomeFeedCache(): HomeFeedCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(HOME_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const savedAt = Number(parsed?.savedAt || 0);
    if (!savedAt || Date.now() - savedAt > 1000 * 60 * 60 * 24) return null;
    return {
      offers: Array.isArray(parsed?.offers) ? parsed.offers : [],
      shops: Array.isArray(parsed?.shops) ? parsed.shops : [],
      shopProductsById: parsed?.shopProductsById && typeof parsed.shopProductsById === 'object' ? parsed.shopProductsById : {},
      savedAt,
    };
  } catch {
    return null;
  }
}

function writeHomeFeedCache(next: Partial<HomeFeedCache>) {
  if (typeof window === 'undefined') return;
  try {
    const current = readHomeFeedCache();
    const merged: HomeFeedCache = {
      offers: next.offers || current?.offers || [],
      shops: next.shops || current?.shops || [],
      shopProductsById: next.shopProductsById || current?.shopProductsById || {},
      savedAt: Date.now(),
    };
    window.localStorage.setItem(HOME_CACHE_KEY, JSON.stringify(merged));
  } catch {
  }
}

const HomeFeed: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingShops, setLoadingShops] = useState(true);
  const [shopProductsById, setShopProductsById] = useState<Record<string, Product[]>>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreOffers, setHasMoreOffers] = useState(true);
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

  const handleLoadMoreOffers = useCallback(() => {
    loadMoreOffersRef.current?.();
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
  const hasHydratedCacheRef = useRef(false);
  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (hasHydratedCacheRef.current) return;
    hasHydratedCacheRef.current = true;
    const cached = readHomeFeedCache();
    if (!cached) return;
    if (cached.offers.length) {
      setOffers(cached.offers);
      offersLenRef.current = cached.offers.length;
      setLoading(false);
    }
    if (cached.shops.length) {
      setShops(cached.shops);
      setLoadingShops(false);
    }
    if (Object.keys(cached.shopProductsById || {}).length) {
      previewCacheRef.current = cached.shopProductsById;
      setShopProductsById(cached.shopProductsById);
    }
  }, []);

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
        setShopProductsById((prev) => {
          const next = { ...prev, ...fetched };
          writeHomeFeedCache({ shopProductsById: next });
          return next;
        });
      }
    };

    const loadData = async () => {
      const loadId = Date.now();
      latestLoadIdRef.current = loadId;
      const cachedAtStart = readHomeFeedCache();
      const hasCachedAtStart = Boolean(cachedAtStart && (cachedAtStart.offers.length || cachedAtStart.shops.length));
      if (!hasCachedAtStart) {
        setLoading(true);
        setLoadingShops(true);
      }

      try {
        const [offersData, shopsData] = await Promise.all([
          ApiService.getOffers({ take: PAGE_SIZE, skip: 0 }),
          ApiService.getShops('approved', { take: 100 }),
        ]);

        const offersList = Array.isArray(offersData) ? offersData : [];
        setOffers(offersList);
        if (offersList.length) writeHomeFeedCache({ offers: offersList });

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
          if (mapVisibleShops.length) writeHomeFeedCache({ shops: mapVisibleShops });
          setLoadingShops(false);
        }

        loadShopPreviews(mapVisibleShops, loadId).catch(() => {
          if (latestLoadIdRef.current === loadId) setShopProductsById({});
        });
      } catch {
        if (latestLoadIdRef.current === loadId) {
          const cached = readHomeFeedCache();
          if (cached && (cached.offers.length || cached.shops.length)) {
            setOffers(cached.offers);
            offersLenRef.current = cached.offers.length;
            hasMoreOffersRef.current = false;
            setHasMoreOffers(false);
            setShops(cached.shops);
            setShopProductsById(cached.shopProductsById || {});
            previewCacheRef.current = cached.shopProductsById || {};
            setLoading(false);
            setLoadingShops(false);
            return;
          }

          hasMoreOffersRef.current = false;
          setHasMoreOffers(false);
          // Keep the skeleton visible on first-load network failures instead of showing scary empty/error states.
          setLoading(true);
          setLoadingShops(true);
        }
      } finally {
        if (latestLoadIdRef.current === loadId) {
          const hasCachedUi = offersLenRef.current > 0 || Object.keys(previewCacheRef.current || {}).length > 0;
          if (hasCachedUi || (typeof navigator !== 'undefined' && navigator.onLine !== false)) {
            setLoading(false);
          }
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
          writeHomeFeedCache({ offers: capped });
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
    window.addEventListener('online', loadData);

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
      window.removeEventListener('online', loadData);
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
          playSound={playSound}
          loadMoreSentinelRef={loadMoreSentinelRef}
          loadMoreOffers={handleLoadMoreOffers}
        />
      </Suspense>

    </div>
  );
};

export default HomeFeed;
