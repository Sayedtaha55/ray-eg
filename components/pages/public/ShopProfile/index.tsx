import React, { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
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
} from 'lucide-react';
import { useToast } from '@/components/common/feedback/Toaster';
import { ApiService } from '@/services/api.service';
import { Skeleton } from '@/components/common/ui';
import { PurchaseModeButton } from '@/components/common/PurchaseModeButton';
import { coerceBoolean, coerceNumber, hexToRgba, isVideoUrl } from './utils';
import { useCartSound } from '@/hooks/useCartSound';

// New Sub-components
import ProfileHeader from './ProfileHeader';
import ProfileFooter from './ProfileFooter';
import TabRenderer from './TabRenderer';

// Lazy load heavy components
const ReservationModal = lazy(() => import('../../shared/ReservationModal'));


const { useParams, useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const ShopProfile: React.FC = () => {
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
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [hasFollowed, setHasFollowed] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [selectedProductForRes, setSelectedProductForRes] = useState<any | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { playSound } = useCartSound();

  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [productsTabLoading, setProductsTabLoading] = useState(false);
  const [productsTabError, setProductsTabError] = useState<string | null>(null);
  const [galleryTabLoading, setGalleryTabLoading] = useState(false);
  const [galleryTabError, setGalleryTabError] = useState<string | null>(null);

  const prefersReducedMotion = useReducedMotion();
  const productsPagingRef = useRef({ page: 1, limit: 24, hasMore: true, loadingMore: false });
  const tabLoadStateRef = useRef<Record<string, { loaded: boolean; inFlight: boolean }>>({});

  useEffect(() => {
    const syncData = async () => {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(false);
      try {
        const currentShopData = await ApiService.getShopBySlug(slug);
        if (currentShopData) {
          setShop(JSON.parse(JSON.stringify(currentShopData)));
          const design = currentShopData.pageDesign || {
            layout: 'modern',
            primaryColor: '#00E5FF',
            secondaryColor: '#BD00FF',
            bannerUrl: '/placeholder-banner.jpg',
          };
          const canApplyPreview = (() => {
            try {
              const rawUser = localStorage.getItem('ray_user');
              if (!rawUser) return false;
              const user = JSON.parse(rawUser);
              const userShopId = String(user?.shopId || user?.shop_id || '').trim();
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
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('ShopProfile syncData error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    syncData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

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
  }, [shop?.id]);

  const retryProductsTab = async () => {
    const shopId = String(shop?.id || '').trim();
    if (!shopId) return;
    const key = `products:${shopId}`;
    tabLoadStateRef.current[key] = { loaded: false, inFlight: false };
    setProductsTabError(null);
    setActiveCategory('الكل');
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
      setProducts(list);
      productsPagingRef.current.hasMore = list.length >= limit;
      setHasMoreProducts(list.length >= limit);
      setOffers(Array.isArray(shopOffers) ? shopOffers : []);
      tabLoadStateRef.current[key] = { loaded: true, inFlight: false };
    } catch (err: any) {
      setProductsTabError(String(err?.message || 'فشل تحميل المنتجات'));
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
      setGalleryTabError(String(err?.message || 'فشل تحميل معرض الصور'));
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
      setProducts((prev) => [...prev, ...list]);
      productsPagingRef.current.page = nextPage;
      productsPagingRef.current.hasMore = list.length >= limit;
      setHasMoreProducts(list.length >= limit);
    } catch (err: any) {
      addToast(String(err?.message || 'فشل تحميل المزيد من المنتجات'), 'error');
    } finally {
      productsPagingRef.current.loadingMore = false;
      setLoadingMoreProducts(false);
    }
  };

  const handleShare = async () => {
    if (!shop) return;
    const shareData = {
      title: shop.name,
      text: `شوفوا المحل ده على منصة من مكانك: ${shop.name}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        addToast('تم نسخ الرابط لمشاركته!', 'info');
      }
    } catch (e) {}
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of products) {
      cats.add(String((p as any)?.category || 'عام'));
    }
    return ['الكل', ...Array.from(cats)];
  }, [products]);

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
    },
    [shop, playSound, navigate]
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
      addToast('سجّل الدخول لمتابعة المتجر', 'info');
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
        addToast('سجّل الدخول لمتابعة المتجر', 'info');
        navigate(`/login?${q.toString()}`);
        return;
      }
      addToast('تعذر متابعة المتجر', 'error');
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

  if (error || !shop || !currentDesign) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-slate-300 mb-8" />
      <h2 className="text-2xl md:text-3xl font-black mb-4">المحل غير متاح حالياً</h2>
      <button onClick={() => navigate('/')} className="px-8 py-4 md:px-10 md:py-5 bg-slate-900 text-white rounded-full font-black flex items-center gap-3 shadow-xl">
        <Home size={20} /> العودة للرئيسية
      </button>
    </div>
  );

  const isBold = currentDesign.layout === 'bold';
  const pageBgColor = currentDesign.pageBackgroundColor || (currentDesign as any).backgroundColor;
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

  const showFloatingChatButton = isVisible('floatingChatButton', true);
  const whatsappRaw = String((shop as any)?.layoutConfig?.whatsapp || '').trim() || String(shop.phone || '').trim();
  const whatsappDigits = whatsappRaw ? whatsappRaw.replace(/[^\d]/g, '') : '';
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`مرحبا ${shop.name}`)}` : '';

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
      {pageBgImage && !lowEndDevice && (
        <img
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
      />

      <main className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12" dir="rtl">
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
          galleryTabLoading={galleryTabLoading}
          galleryTabError={galleryTabError}
          galleryImages={galleryImages}
          retryGalleryTab={retryGalleryTab}
          isVisible={isVisible}
          whatsappHref={whatsappHref}
        />
      </main>

      <ProfileFooter 
        shop={shop}
        currentDesign={currentDesign}
        footerBg={footerBg}
        footerTextColor={footerTextColor}
        isVisible={isVisible}
        isBold={isBold}
      />

      {hasActiveImageMap ? (
        <div className="fixed bottom-6 right-6 z-[150] md:bottom-10 md:right-10">
          <PurchaseModeButton
            onClick={() => navigate(`/shop/${String(slug || '').trim()}/image-map`)}
            className="shadow-2xl"
          />
        </div>
      ) : null}

      {/* Floating Action Button - Mobile */}
      <AnimatePresence>
        {showFloatingChatButton && whatsappHref
          ? (disableCardMotion
            ? (
              <div className="fixed bottom-6 left-6 z-[150] md:bottom-10 md:left-10">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
                >
                  <WhatsAppIcon.type {...WhatsAppIcon.props} width={32} height={32} />
                </a>
              </div>
            )
            : (
              <MotionDiv
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="fixed bottom-6 left-6 z-[150] md:bottom-10 md:left-10"
              >
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
                >
                  <WhatsAppIcon.type {...WhatsAppIcon.props} width={32} height={32} />
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
