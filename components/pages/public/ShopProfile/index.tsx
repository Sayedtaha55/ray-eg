import React, { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
import { RayDB } from '@/constants';
import { Shop, Product, ShopDesign, Offer, Category, ShopGallery } from '@/types';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Users,
  Loader2,
  AlertCircle,
  Home,
  Menu,
  ShoppingCart,
  User,
  FilePlus,
} from 'lucide-react';
import { useToast } from '@/components/common/feedback/Toaster';
import { ApiService } from '@/services/api.service';
import { Skeleton } from '@/components/common/ui';
import { PurchaseModeButton } from '@/components/common/PurchaseModeButton';
import { coerceBoolean, coerceNumber, hexToRgba, isVideoUrl } from './utils';
import { shopHasWhatsApp, shopHasVoiceOrdering } from '@/utils/shopApps';
import { useCartSound } from '@/hooks/useCartSound';
import CartDrawer from '@/components/pages/shared/CartDrawer';
import { CartIconWithAnimation } from '@/components/common/CartIconWithAnimation';

// New Sub-components
import ProfileHeader from './ProfileHeader';
import ProfileFooter from './ProfileFooter';
import TabRenderer from './TabRenderer';

// Lazy load heavy components
const ReservationModal = lazy(() => import('../../shared/ReservationModal'));


const { useParams, useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const ShopProfile: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const location = useLocation();
  const [shop, setShop] = useState<Shop | null>(null);
  const [currentDesign, setCurrentDesign] = useState<ShopDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bannerReady, setBannerReady] = useState(false);
  const [pageBgReady, setPageBgReady] = useState(false);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [galleryImages, setGalleryImages] = useState<ShopGallery[]>([]);
  const [imageMapLinkedProductIds, setImageMapLinkedProductIds] = useState<Set<string>>(new Set());
  const [hasActiveImageMap, setHasActiveImageMap] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'gallery' | 'info'>('products');
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(t('shopProfile.all'));
  const [hasFollowed, setHasFollowed] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [selectedProductForRes, setSelectedProductForRes] = useState<any | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { playSound } = useCartSound();

  const [isCartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const hasSalesModule = useMemo(() => {
    const raw = (shop as any)?.layoutConfig?.enabledModules;
    if (!Array.isArray(raw)) return false;
    return raw.some((x: any) => String(x || '').trim() === 'sales');
  }, [shop]);

  const hasReservationsModule = useMemo(() => {
    const raw = (shop as any)?.layoutConfig?.enabledModules;
    if (!Array.isArray(raw)) return false;
    return raw.some((x: any) => String(x || '').trim() === 'reservations');
  }, [shop]);

  useEffect(() => {
    const syncCart = () => {
      try {
        const next = RayDB.getCart();
        setCartItems(Array.isArray(next) ? next : []);
      } catch {
        setCartItems([]);
      }
    };
    syncCart();
    window.addEventListener('cart-updated', syncCart);
    return () => window.removeEventListener('cart-updated', syncCart);
  }, []);

  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [productsTabLoading, setProductsTabLoading] = useState(false);
  const [productsTabError, setProductsTabError] = useState<string | null>(null);
  const [galleryTabLoading, setGalleryTabLoading] = useState(false);
  const [galleryTabError, setGalleryTabError] = useState<string | null>(null);

  const prefersReducedMotion = useReducedMotion();
  const productsPagingRef = useRef({ page: 1, limit: 24, hasMore: true, loadingMore: false });
  const tabLoadStateRef = useRef<Record<string, { loaded: boolean; inFlight: boolean }>>({});

  const dedupeProductsById = useCallback((items: any[]) => {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const p of Array.isArray(items) ? items : []) {
      const id = String((p as any)?.id || '').trim();
      if (!id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(p);
    }
    return out as any[];
  }, []);

  const mergeDedupeProductsById = useCallback((prev: any[], next: any[]) => {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const p of [...(Array.isArray(prev) ? prev : []), ...(Array.isArray(next) ? next : [])]) {
      const id = String((p as any)?.id || '').trim();
      if (!id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(p);
    }
    return out as any[];
  }, []);

  const reloadSeqRef = useRef(0);
  const lastShopIdRef = useRef<string>('');

  const syncData = useCallback(async (opts?: { silent?: boolean }) => {
      const silent = Boolean(opts?.silent);
      const seq = ++reloadSeqRef.current;
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }
      if (!silent) {
        setLoading(true);
        setError(false);
      }
      try {
        const currentShopData = await ApiService.getShopBySlug(slug);
        if (reloadSeqRef.current !== seq) return;
        if (currentShopData) {
          const nextShopId = String((currentShopData as any)?.id || '').trim();
          const prevShopId = String(lastShopIdRef.current || '').trim();
          const shopChanged = Boolean(prevShopId && nextShopId && prevShopId !== nextShopId);
          if (nextShopId) lastShopIdRef.current = nextShopId;

          setShop(JSON.parse(JSON.stringify(currentShopData)));
          const design = currentShopData.pageDesign || {
            layout: 'modern',
            primaryColor: '#00E5FF',
            secondaryColor: '#BD00FF',
          };
          const allowBuilderPreview = (() => {
            try {
              const params = new URLSearchParams(String(location?.search || ''));
              return params.get('builderPreview') === '1';
            } catch {
              return false;
            }
          })();
          const canApplyPreview = (() => {
            try {
              const rawUser = localStorage.getItem('ray_user');
              if (!rawUser) return false;
              const user = JSON.parse(rawUser);
              const userShopId = String(user?.shopId || user?.shop_id || '').trim();
              if (!allowBuilderPreview) return false;
              return userShopId && userShopId === String(currentShopData?.id || '').trim();
            } catch {
              return false;
            }
          })();

          if (canApplyPreview) {
            try {
              const rawPreview = localStorage.getItem('ray_builder_preview_design');
              const parsed = rawPreview ? JSON.parse(rawPreview) : null;
              const previewDesign = parsed && typeof parsed === 'object' ? parsed : null;
              if (previewDesign) {
                setCurrentDesign({ ...design, ...previewDesign });
              } else {
                setCurrentDesign(design);
              }
            } catch {
              setCurrentDesign(design);
            }
          } else {
            setCurrentDesign(design);
          }

          if (!silent || shopChanged) {
            productsPagingRef.current = { page: 1, limit: 24, hasMore: true, loadingMore: false };
            tabLoadStateRef.current = {};
            setProducts([]);
            setOffers([]);
            setGalleryImages([]);
            setHasMoreProducts(true);
            setLoadingMoreProducts(false);
            setProductsTabLoading(false);
            setProductsTabError(null);
            setGalleryTabLoading(false);
            setGalleryTabError(null);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('ShopProfile syncData error:', err);
        setError(true);
      } finally {
        if (!silent) setLoading(false);
      }
    }, [slug, location?.search]);

  useEffect(() => {
    syncData({ silent: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [syncData]);

  useEffect(() => {
    if (!slug) return;

    const onRefresh = () => {
      try {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      } catch {
      }
      syncData({ silent: true });
    };

    window.addEventListener('ray-db-update', onRefresh);

    const onStorage = (e: StorageEvent) => {
      if (e && e.key && e.key !== 'ray_db_update_ts') return;
      onRefresh();
    };
    window.addEventListener('storage', onStorage);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('ray-db');
        bc.onmessage = () => onRefresh();
      }
    } catch {
      bc = null;
    }

    const onImageMapEvent = (e: Event) => {
      const ce = e as CustomEvent;
      const detail = (ce as any)?.detail;
      const targetSlug = detail && typeof detail === 'object' ? String((detail as any)?.slug || '').trim() : '';
      const targetShopId = detail && typeof detail === 'object' ? String((detail as any)?.shopId || (detail as any)?.shop_id || '').trim() : '';
      if (targetSlug && targetSlug !== String(slug)) return;
      const currentShopId = String((shop as any)?.id || '').trim();
      if (targetShopId && currentShopId && targetShopId !== currentShopId) return;
      onRefresh();
    };
    window.addEventListener('ray-image-map:refresh', onImageMapEvent as any);

    let bcImageMap: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bcImageMap = new BroadcastChannel('ray-image-map');
        bcImageMap.onmessage = (msg) => {
          try {
            const data = (msg as any)?.data;
            const targetSlug = data && typeof data === 'object' ? String(data?.slug || '').trim() : '';
            const targetShopId = data && typeof data === 'object' ? String(data?.shopId || data?.shop_id || '').trim() : '';
            if (targetSlug && targetSlug !== String(slug)) return;
            const currentShopId = String((shop as any)?.id || '').trim();
            if (targetShopId && currentShopId && targetShopId !== currentShopId) return;
          } catch {
          }
          onRefresh();
        };
      }
    } catch {
      bcImageMap = null;
    }

    const timer = window.setInterval(() => {
      onRefresh();
    }, 12_000);

    return () => {
      window.removeEventListener('ray-db-update', onRefresh);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('ray-image-map:refresh', onImageMapEvent as any);
      window.clearInterval(timer);
      try { bc?.close(); } catch { }
      try { bcImageMap?.close(); } catch { }
    };
  }, [slug, syncData, shop]);

  const normalizeText = (v: any) => {
    const s = typeof v === 'string' ? v : v == null ? '' : String(v);
    return s.trim();
  };

  const isImageMapProduct = (p: any) => {
    const raw = p?.category;
    const cat = typeof raw === 'string'
      ? raw
      : typeof raw?.name === 'string'
        ? raw.name
        : typeof raw?.slug === 'string'
          ? raw.slug
          : '';
    const normalized = String(cat || '').trim().toUpperCase();
    return normalized === '__IMAGE_MAP__' || normalized.includes('IMAGE_MAP');
  };

  useEffect(() => {
    const s = normalizeText(slug);
    if (!s) {
      setImageMapLinkedProductIds(new Set());
      setHasActiveImageMap(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const map = await ApiService.getActiveShopImageMap(s);
        if (!mounted) return;
        setHasActiveImageMap(!!map);
        const hs = Array.isArray((map as any)?.hotspots) ? (map as any).hotspots : [];
        const ids = new Set<string>();
        hs.forEach((h: any) => {
          const pid = normalizeText(h?.productId ?? h?.product_id ?? h?.product?.id);
          if (pid) ids.add(pid);
        });
        setImageMapLinkedProductIds(ids);
      } catch {
        if (!mounted) return;
        setImageMapLinkedProductIds(new Set());
        setHasActiveImageMap(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    const applyPreview = () => {
      const sid = String(shop?.id || '').trim();
      if (!sid) return;
      try {
        const params = new URLSearchParams(String(location?.search || ''));
        if (params.get('builderPreview') !== '1') return;
        const rawUser = localStorage.getItem('ray_user');
        if (!rawUser) return;
        const user = JSON.parse(rawUser);
        const userShopId = String(user?.shopId || user?.shop_id || '').trim();
        if (!userShopId || userShopId !== sid) return;

        const rawPreview = localStorage.getItem('ray_builder_preview_design');
        const parsed = rawPreview ? JSON.parse(rawPreview) : null;
        const previewDesign = parsed && typeof parsed === 'object' ? parsed : null;
        if (!previewDesign) return;
        setCurrentDesign((prev) => (prev ? ({ ...prev, ...previewDesign } as any) : (previewDesign as any)));
      } catch {}
    };

    applyPreview();
    window.addEventListener('ray-builder-preview-update', applyPreview);
    return () => window.removeEventListener('ray-builder-preview-update', applyPreview);
  }, [location?.search, shop?.id]);

  const retryProductsTab = async () => {
    const shopId = String(shop?.id || '').trim();
    if (!shopId) return;
    const key = `products:${shopId}`;
    tabLoadStateRef.current[key] = { loaded: false, inFlight: false };
    setProductsTabError(null);
    setActiveCategory(t('shopProfile.all'));
    setActiveTab('products');
    try {
      setProductsTabLoading(true);
      const page = 1;
      const limit = productsPagingRef.current.limit;
      productsPagingRef.current.page = 1;
      const [prodData, shopOffers] = await Promise.all([
        ApiService.getProducts(shopId, { page, limit }),
        ApiService.getOffers({ take: 100, skip: 0, shopId }),
      ]);
      const list = (Array.isArray(prodData) ? prodData : []).filter((p: any) => {
        if (!p) return false;
        if (isImageMapProduct(p)) return false;
        const id = normalizeText((p as any)?.id);
        if (id && imageMapLinkedProductIds.has(id)) return false;
        return true;
      });
      setProducts(dedupeProductsById(list));
      productsPagingRef.current.hasMore = list.length >= limit;
      setHasMoreProducts(list.length >= limit);
      setOffers(Array.isArray(shopOffers) ? shopOffers : []);
      tabLoadStateRef.current[key] = { loaded: true, inFlight: false };
    } catch (err: any) {
      setProductsTabError(String(err?.message || t('shopProfile.loadProductsFailed')));
      tabLoadStateRef.current[key] = { loaded: false, inFlight: false };
    } finally {
      setProductsTabLoading(false);
    }
  };

  const retryGalleryTab = async () => {
    const shopId = String(shop?.id || '').trim();
    if (!shopId) return;
    const key = `gallery:${shopId}`;
    tabLoadStateRef.current[key] = { loaded: false, inFlight: false };
    setGalleryTabError(null);
    setActiveTab('gallery');
    try {
      setGalleryTabLoading(true);
      const galleryData = await ApiService.getShopGallery(shopId);
      setGalleryImages(Array.isArray(galleryData) ? galleryData : []);
      tabLoadStateRef.current[key] = { loaded: true, inFlight: false };
    } catch (err: any) {
      setGalleryTabError(String(err?.message || t('shopProfile.loadGalleryFailed')));
      tabLoadStateRef.current[key] = { loaded: false, inFlight: false };
    } finally {
      setGalleryTabLoading(false);
    }
  };

  useEffect(() => {
    const ensureTabData = async () => {
      const shopId = String(shop?.id || '').trim();
      if (!shopId) return;

      const tab = activeTab;
      const key = `${tab}:${shopId}`;
      const state = tabLoadStateRef.current[key] || { loaded: false, inFlight: false };
      if (state.loaded || state.inFlight) return;
      tabLoadStateRef.current[key] = { ...state, inFlight: true };

      try {
        if (tab === 'products') {
          await retryProductsTab();
        } else if (tab === 'gallery') {
          await retryGalleryTab();
        }
        tabLoadStateRef.current[key] = { loaded: true, inFlight: false };
      } catch (err: any) {
        tabLoadStateRef.current[key] = { loaded: false, inFlight: false };
      }
    };

    ensureTabData();
  }, [activeTab, shop?.id, imageMapLinkedProductIds]);

  const loadMoreProducts = async () => {
    const shopId = String(shop?.id || '').trim();
    if (!shopId) return;
    if (productsPagingRef.current.loadingMore) return;
    if (!productsPagingRef.current.hasMore) return;

    productsPagingRef.current.loadingMore = true;
    setLoadingMoreProducts(true);
    try {
      const nextPage = productsPagingRef.current.page + 1;
      const limit = productsPagingRef.current.limit;
      const next = await ApiService.getProducts(shopId, { page: nextPage, limit });
      const list = (Array.isArray(next) ? next : []).filter((p: any) => {
        if (!p) return false;
        if (isImageMapProduct(p)) return false;
        const id = normalizeText((p as any)?.id);
        if (id && imageMapLinkedProductIds.has(id)) return false;
        return true;
      });
      setProducts((prev) => mergeDedupeProductsById(prev as any[], list));
      productsPagingRef.current.page = nextPage;
      productsPagingRef.current.hasMore = list.length >= limit;
      setHasMoreProducts(list.length >= limit);
    } catch (err: any) {
      addToast(String(err?.message || t('shopProfile.loadMoreFailed')), 'error');
    } finally {
      productsPagingRef.current.loadingMore = false;
      setLoadingMoreProducts(false);
    }
  };

  const handleShare = async () => {
    if (!shop) return;
    const shareData = {
      title: shop.name,
      text: `${t('shopProfile.shareText')}: ${shop.name}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        addToast(t('shopProfile.linkCopied'), 'info');
      }
    } catch (e) {}
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of products) {
      cats.add(String((p as any)?.category || t('shopProfile.general')));
    }
    return [t('shopProfile.all'), ...Array.from(cats)];
  }, [products, t]);

  const offersByProductId = useMemo(() => {
    const map = new Map<string, Offer>();
    for (const o of offers) {
      const pid = String((o as any)?.productId || '').trim();
      if (pid) map.set(pid, o);
    }
    return map;
  }, [offers]);

  const handleAddToCart = useCallback(
    (prod: Product, price: number) => {
      if (!shop) return;
      if (!hasSalesModule) return;
      const isRestaurant = shop?.category === Category.RESTAURANT;
      const menuVariants = isRestaurant
        ? (Array.isArray((prod as any)?.menuVariants)
          ? (prod as any).menuVariants
          : (Array.isArray((prod as any)?.menu_variants) ? (prod as any).menu_variants : []))
        : [];
      const hasMenuVariants = Array.isArray(menuVariants) && menuVariants.length > 0;
      if (hasMenuVariants) {
        navigate(`/shop/${String((shop as any)?.slug || '')}/product/${String((prod as any)?.id || '')}`);
        return;
      }
      setAddedItemId((prod as any)?.id);
      RayDB.addToCart({ ...prod, price, quantity: 1, shopId: shop.id, shopName: shop.name });
      playSound();
      setTimeout(() => setAddedItemId(null), 1500);
      try {
        const { getCartSessionId } = require('@/lib/cart-session');
        (ApiService as any).trackCartEventPublic?.({
          shopId: shop.id,
          productId: (prod as any)?.id,
          event: 'add_to_cart',
          sessionId: getCartSessionId(),
          quantity: 1,
          unitPrice: price,
        });
      } catch {}
    },
    [shop, hasSalesModule, playSound, navigate]
  );

  const handleReserve = useCallback(
    (data: any) => {
      if (!shop) return;
      const isRestaurant = shop?.category === Category.RESTAURANT;
      const prod = (data as any) || {};
      const menuVariants = isRestaurant
        ? (Array.isArray((prod as any)?.menuVariants)
          ? (prod as any).menuVariants
          : (Array.isArray((prod as any)?.menu_variants) ? (prod as any).menu_variants : []))
        : [];
      const hasMenuVariants = Array.isArray(menuVariants) && menuVariants.length > 0;
      if (hasMenuVariants) {
        navigate(`/shop/${String((shop as any)?.slug || '')}/product/${String((prod as any)?.id || '')}`);
        return;
      }
      setSelectedProductForRes({ ...data, shopId: shop.id, shopName: shop.name });
    },
    [shop, navigate]
  );

  const handleFollow = useCallback(async () => {
    if (!shop || followLoading || hasFollowed) return;

    const token = (() => {
      try {
        return localStorage.getItem('ray_token') || '';
      } catch {
        return '';
      }
    })();
    if (!token) {
      const q = new URLSearchParams();
      q.set('returnTo', `${location.pathname}${location.search || ''}`);
      q.set('followShopId', String(shop.id));
      addToast(t('shopProfile.loginToFollow'), 'info');
      navigate(`/login?${q.toString()}`);
      return;
    }

    setFollowLoading(true);
    try {
      await ApiService.followShop(shop.id);
      setHasFollowed(true);
    } catch (err: any) {
      const status = typeof err?.status === 'number' ? err.status : undefined;
      const msg = String(err?.message || '').toLowerCase();
      if (status === 401 || msg.includes('unauthorized')) {
        const q = new URLSearchParams();
        q.set('returnTo', `${location.pathname}${location.search || ''}`);
        q.set('followShopId', String(shop.id));
        addToast(t('shopProfile.loginToFollow'), 'info');
        navigate(`/login?${q.toString()}`);
        return;
      }
      addToast(t('shopProfile.followFailed'), 'error');
    } finally {
      setFollowLoading(false);
    }
  }, [addToast, followLoading, hasFollowed, location.pathname, location.search, navigate, shop]);

  useEffect(() => {
    const url = String(currentDesign?.bannerUrl || '').trim();
    if (!url || isVideoUrl(url)) {
      setBannerReady(true);
      return;
    }
    let done = false;
    setBannerReady(false);
    try {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { if (!done) setBannerReady(true); };
      img.onerror = () => { if (!done) setBannerReady(true); };
      img.src = url;
    } catch {
      setBannerReady(true);
    }
    return () => { done = true; };
  }, [currentDesign?.bannerUrl]);

  useEffect(() => {
    const url = String((currentDesign as any)?.backgroundImageUrl || '').trim();
    if (!url) {
      setPageBgReady(true);
      return;
    }
    let done = false;
    setPageBgReady(false);
    try {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { if (!done) setPageBgReady(true); };
      img.onerror = () => { if (!done) setPageBgReady(true); };
      img.src = url;
    } catch {
      setPageBgReady(true);
    }
    return () => { done = true; };
  }, [(currentDesign as any)?.backgroundImageUrl]);

  if (loading) return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-full" />
            <div>
              <Skeleton className="h-6 md:h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
        <Skeleton className="w-full h-[220px] md:h-[320px] rounded-[2.5rem] mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-[1.5rem] p-4">
              <Skeleton className="aspect-[4/3] rounded-2xl mb-4" />
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-28 mb-4" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (shop && (shop as any)?.publicDisabled === true) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-slate-300 mb-8" />
      <h2 className="text-2xl md:text-3xl font-black mb-4">{t('shopProfile.disabledTitle')}</h2>
      <p className="text-sm md:text-base font-bold text-slate-500 max-w-xl mb-8 leading-relaxed">
        {t('shopProfile.disabledDesc')}
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-4 rounded-2xl bg-slate-900 text-white font-black text-sm"
        >
          {t('shopProfile.refresh')}
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-black text-sm"
        >
          {t('shopProfile.homePage')}
        </button>
      </div>
    </div>
  );

  if (error || !shop || !currentDesign) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-slate-300 mb-8" />
      <h2 className="text-2xl md:text-3xl font-black mb-4">{t('shopProfile.unavailableTitle')}</h2>
      <button onClick={() => navigate('/')} className="px-8 py-4 md:px-10 md:py-5 bg-slate-900 text-white rounded-full font-black flex items-center gap-3 shadow-xl">
        <Home size={20} /> {t('shopProfile.backHome')}
      </button>
    </div>
  );

  const isBold = currentDesign.layout === 'bold';
  const pageBgColor = currentDesign.pageBackgroundColor || (currentDesign as any).backgroundColor || '#FFFFFF';
  const pageBgImage = String((currentDesign as any).backgroundImageUrl || '');
  const headerBackgroundColor = String(currentDesign.headerBackgroundColor || '#FFFFFF');
  const headerOpacity = coerceNumber((currentDesign as any).headerOpacity, 95) / 100;
  const headerTransparent = coerceBoolean((currentDesign as any).headerTransparent, false);
  const headerBg = headerTransparent ? hexToRgba(headerBackgroundColor, headerOpacity) : headerBackgroundColor;
  const headerTextColor = String(currentDesign.headerTextColor || '#0F172A');

  const elementsVisibility = ((currentDesign as any)?.elementsVisibility || {}) as Record<string, any>;
  const isVisible = (key: string, fallback: boolean = true) => {
    if (!elementsVisibility || typeof elementsVisibility !== 'object') return fallback;
    if (!(key in elementsVisibility)) return fallback;
    return coerceBoolean(elementsVisibility[key], fallback);
  };

  const showFooter = isVisible('footer', true);
  const showMobileBottomNav = showFooter && isVisible('mobileBottomNav', true);
  const showMobileBottomNavHome = isVisible('mobileBottomNavHome', true);
  const mobileBottomSafeSpaceClass = hasSalesModule && showMobileBottomNav ? 'pb-40 md:pb-12' : 'pb-12';
  const showMobileBottomNavCart = isVisible('mobileBottomNavCart', true);
  const showMobileBottomNavAccount = isVisible('mobileBottomNavAccount', true);

  const whatsappFabClassName = showMobileBottomNav
    ? 'fixed bottom-28 left-6 z-[360] md:bottom-10 md:left-10'
    : 'fixed bottom-6 left-6 z-[360] md:bottom-10 md:left-10';

  const showFloatingChatButton = isVisible('floatingChatButton', true) && shopHasWhatsApp(shop);
  const whatsappRaw = String((shop as any)?.layoutConfig?.whatsapp || '').trim() || String(shop.phone || '').trim();
  const whatsappDigits = whatsappRaw ? whatsappRaw.replace(/[^\d]/g, '') : '';
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`${t('shopProfile.whatsappGreeting')} ${shop.name}`)}` : '';

  const isPharmacy = String((shop as any)?.category || '').trim().toUpperCase() === 'HEALTH';
  const prescriptionHref = (() => {
    const base = String(whatsappHref || '').trim();
    if (!base) return '';
    try {
      const u = new URL(base);
      u.searchParams.set('text', `${t('shopProfile.whatsappGreeting')} ${shop?.name || ''}${t('shopProfile.addressSeparator')}${t('shopProfile.prescriptionMsg')}`);
      return u.toString();
    } catch {
      return base;
    }
  })();

  const lowEndDevice = (() => {
    try {
      const mem = typeof (navigator as any)?.deviceMemory === 'number' ? Number((navigator as any).deviceMemory) : undefined;
      const cores = typeof navigator?.hardwareConcurrency === 'number' ? Number(navigator.hardwareConcurrency) : undefined;
      if (typeof mem === 'number' && mem > 0 && mem <= 4) return true;
      if (typeof cores === 'number' && cores > 0 && cores <= 4) return true;
      return false;
    } catch {
      return false;
    }
  })();

  const disableCardMotion = Boolean(prefersReducedMotion) || lowEndDevice || products.length > 30;

  const footerBackgroundColor = String(currentDesign.footerBackgroundColor || (isBold ? '#0F172A' : '#F8FAFC'));
  const footerTransparent = coerceBoolean((currentDesign as any).footerTransparent, false);
  const footerBg = footerTransparent ? 'transparent' : footerBackgroundColor;
  const footerTextColor = String(currentDesign.footerTextColor || (isBold ? '#FFFFFF' : '#0F172A'));

  const WhatsAppIcon = (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M19.11 17.48c-.28-.14-1.64-.81-1.9-.9-.25-.1-.43-.14-.62.14-.18.28-.71.9-.88 1.09-.16.18-.32.2-.6.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.38-1.63-1.54-1.9-.16-.28-.02-.43.12-.57.13-.13.28-.32.43-.48.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.48-.07-.14-.62-1.5-.86-2.06-.23-.55-.46-.48-.62-.49h-.53c-.18 0-.48.07-.73.35-.25.28-.96.94-.96 2.29s.98 2.65 1.11 2.83c.14.18 1.93 2.95 4.67 4.13.65.28 1.16.45 1.56.57.65.2 1.24.17 1.7.1.52-.08 1.64-.67 1.87-1.31.23-.65.23-1.2.16-1.31-.07-.12-.25-.18-.53-.32z" />
      <path d="M26.72 5.28A14.92 14.92 0 0 0 16.02 0C7.18 0 0 7.18 0 16.02c0 2.82.74 5.57 2.14 7.99L0 32l8.2-2.09a15.9 15.9 0 0 0 7.82 2c8.84 0 16.02-7.18 16.02-15.9 0-4.27-1.66-8.29-4.32-10.73zm-10.7 24.1a13.2 13.2 0 0 1-6.73-1.84l-.48-.28-4.87 1.24 1.3-4.74-.31-.49a13.14 13.14 0 0 1-2.01-7.25c0-7.22 5.88-13.1 13.1-13.1 3.5 0 6.78 1.36 9.23 3.83a12.92 12.92 0 0 1 3.86 9.27c0 7.22-5.88 13.36-13.09 13.36z" />
    </svg>
  );

  return (
    <div id="shop-profile-root" className="min-h-screen relative" style={{ backgroundColor: pageBgColor }}>
      {pageBgImage && (
        <img
          key={pageBgImage}
          src={pageBgImage}
          alt=""
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 w-full h-full object-cover"
          style={{ opacity: pageBgReady ? 1 : 0 }}
          loading="lazy"
          decoding="async"
          onLoad={() => setPageBgReady(true)}
          onError={() => setPageBgReady(true)}
        />
      )}

      {hasSalesModule && showFooter ? (
        <div className="fixed top-24 right-4 z-[320] hidden md:block">
          <CartIconWithAnimation count={cartItems.length} onClick={() => setCartOpen(true)} />
        </div>
      ) : null}

      <ProfileHeader
        shop={shop}
        currentDesign={currentDesign}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isHeaderMenuOpen={isHeaderMenuOpen}
        setIsHeaderMenuOpen={setIsHeaderMenuOpen}
        hasFollowed={hasFollowed}
        followLoading={followLoading}
        handleFollow={handleFollow}
        handleShare={handleShare}
        isVisible={isVisible}
        prefersReducedMotion={!!prefersReducedMotion}
        headerBg={headerBg}
        headerTextColor={headerTextColor}
        bannerReady={bannerReady}
        purchaseModeButton={
          hasActiveImageMap &&
          isVisible('purchaseModeButton', true) &&
          String(shop?.category || '').toUpperCase() !== 'RESTAURANT' ? (
            <PurchaseModeButton
              onClick={() => navigate(`/shop/${String(slug || '').trim()}/image-map`)}
              className="shadow-2xl"
            />
          ) : null
        }
      />

      {isPharmacy && prescriptionHref ? (
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8" dir="rtl">
          <div className="flex justify-center pt-6 md:pt-8">
            <a
              href={prescriptionHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm md:text-base text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
              style={{ backgroundColor: String(currentDesign?.primaryColor || '').trim() || '#00E5FF' }}
            >
              <FilePlus size={18} /> {t('shopProfile.prescriptionMsg')}
            </a>
          </div>
        </div>
      ) : null}

      <main
        className={`relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 ${mobileBottomSafeSpaceClass}`}
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 900px' }}
        dir="rtl"
      >
        <TabRenderer
          activeTab={activeTab}
          shop={shop}
          currentDesign={currentDesign}
          products={products}
          offersByProductId={offersByProductId}
          activeCategory={activeCategory}
          categories={categories}
          setActiveCategory={setActiveCategory}
          productsTabLoading={productsTabLoading}
          productsTabError={productsTabError}
          retryProductsTab={retryProductsTab}
          loadMoreProducts={loadMoreProducts}
          hasMoreProducts={hasMoreProducts}
          loadingMoreProducts={loadingMoreProducts}
          handleAddToCart={handleAddToCart}
          addedItemId={addedItemId}
          handleReserve={handleReserve}
          disableCardMotion={disableCardMotion}
          allowAddToCart={hasSalesModule}
          allowReserve={hasReservationsModule}
          galleryTabLoading={galleryTabLoading}
          galleryTabError={galleryTabError}
          galleryImages={galleryImages}
          retryGalleryTab={retryGalleryTab}
          isVisible={isVisible}
          whatsappHref={whatsappHref}
        />
      </main>

      {showMobileBottomNav ? <div aria-hidden="true" className="h-6 md:hidden" /> : null}

      <ProfileFooter 
        shop={shop}
        currentDesign={currentDesign}
        footerBg={footerBg}
        footerTextColor={footerTextColor}
        isVisible={isVisible}
        isBold={isBold}
      />

      {hasSalesModule ? (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems as any}
          onRemove={(lineId: string) => {
            try {
              RayDB.removeFromCart(lineId);
            } catch {
            }
          }}
          onUpdateQuantity={(lineId: string, delta: number) => {
            try {
              RayDB.updateCartItemQuantity(lineId, delta);
            } catch {
            }
          }}
        />
      ) : null}

      {showMobileBottomNav ? (
        <div className="fixed bottom-0 left-0 right-0 z-[350] md:hidden">
          <div className="mx-auto max-w-[1400px] px-4 pb-4">
            <div className={`rounded-[1.6rem] bg-white/96 ${disableCardMotion ? '' : 'backdrop-blur-sm'} border border-slate-100 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.45)] overflow-hidden`}>
              <div className="grid grid-cols-3">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className={`py-3.5 flex flex-col items-center justify-center gap-1 font-black text-[10px] ${showMobileBottomNavHome ? '' : 'hidden'} ${activeTab === 'products' ? 'text-slate-900 bg-slate-50' : 'text-slate-500'}`}
                >
                  <Home size={18} />
                  {t('shopProfile.home')}
                </button>

                {hasSalesModule ? (
                  <button
                    type="button"
                    onClick={() => setCartOpen(true)}
                    className={`relative py-3.5 flex flex-col items-center justify-center gap-1 font-black text-[10px] ${showMobileBottomNavCart ? '' : 'hidden'} text-slate-500`}
                  >
                    <ShoppingCart size={18} />
                    {t('shopProfile.cart')}
                    {Array.isArray(cartItems) && cartItems.length > 0 ? (
                      <span className="absolute top-2 right-6 w-5 h-5 rounded-full bg-[#BD00FF] text-white text-[10px] font-black flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    ) : null}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    try {
                      const raw = localStorage.getItem('ray_user');
                      const user = raw ? JSON.parse(raw) : null;
                      if (user) {
                        navigate('/profile');
                      } else {
                        navigate('/login');
                      }
                    } catch {
                      navigate('/login');
                    }
                  }}
                  className={`py-3.5 flex flex-col items-center justify-center gap-1 font-black text-[10px] ${showMobileBottomNavAccount ? '' : 'hidden'} text-slate-500`}
                >
                  <User size={18} />
                  {t('shopProfile.account')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {showFloatingChatButton && whatsappHref
          ? (disableCardMotion
            ? (
              <div className={whatsappFabClassName}>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
                >
                  <WhatsAppIcon.type {...WhatsAppIcon.props} width={28} height={28} className="md:hidden" />
                  <WhatsAppIcon.type {...WhatsAppIcon.props} width={32} height={32} className="hidden md:block" />
                </a>
              </div>
            )
            : (
              <MotionDiv
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={whatsappFabClassName}
              >
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
                >
                  <WhatsAppIcon.type {...WhatsAppIcon.props} width={28} height={28} className="md:hidden" />
                  <WhatsAppIcon.type {...WhatsAppIcon.props} width={32} height={32} className="hidden md:block" />
                </a>
              </MotionDiv>
            ))
          : null}
      </AnimatePresence>

      <Suspense fallback={null}>
        <ReservationModal
          isOpen={!!selectedProductForRes}
          onClose={() => setSelectedProductForRes(null)}
          item={selectedProductForRes ? {
            id: selectedProductForRes.id,
            name: selectedProductForRes.name,
            image: selectedProductForRes.imageUrl || selectedProductForRes.image_url,
            price: selectedProductForRes.price,
            shopId: shop.id,
            shopName: shop.name
          } : null}
        />
      </Suspense>
    </div>
  );
};

export default ShopProfile;
