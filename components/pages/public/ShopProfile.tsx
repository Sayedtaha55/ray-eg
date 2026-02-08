import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { RayDB } from '@/constants';
import { Shop, Product, ShopDesign, Offer, Category, ShopGallery } from '@/types';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Star, ChevronRight, X, Users, 
  Eye, Loader2, AlertCircle, Home, Share2, Utensils, ShoppingBag, 
  Info, Clock, MapPin, Phone, Menu, ShoppingCart, User
} from 'lucide-react';
import ReservationModal from '../shared/ReservationModal';
import CartDrawer from '../shared/CartDrawer';
import ShopGalleryComponent from '@/components/features/shop/ShopGallery';
import { useToast } from '@/components/common/feedback/Toaster';
import { ApiService } from '@/services/api.service';
import { Skeleton } from '@/components/common/ui';
import ProductCard from './ShopProfile/ProductCard';
import InfoItem from './ShopProfile/InfoItem';
import NavTab from './ShopProfile/NavTab';
import { isVideoUrl, hexToRgba, coerceBoolean, coerceNumber, scopeCss } from './ShopProfile/utils';
import { useCartSound } from '@/hooks/useCartSound';
import { CartIconWithAnimation } from '@/components/common/CartIconWithAnimation';

const { useParams, useNavigate, useLocation } = ReactRouterDOM as any;
const MotionImg = motion.img as any;
const MotionDiv = motion.div as any;

const DEFAULT_SHOP_DESIGN: ShopDesign = {
  layout: 'modern',
  primaryColor: '#00E5FF',
  secondaryColor: '#BD00FF',
  bannerUrl: '/placeholder-banner.jpg',
} as any;

// Helper to update meta tags for sharing
const updateShopMetaTags = (shop: any) => {
  if (typeof document === 'undefined') return;
  
  const title = `${shop.name} | MNMKNK`;
  const description = (shop as any)?.description || `تسوق من ${shop.name}. اكتشف أفضل المنتجات والعروض.`;
  const image = shop.logoUrl || (shop as any)?.bannerUrl || '/brand/logo.png';
  
  document.title = title;
  
  // Update or create meta tags
  const setMeta = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };
  
  const setNameMeta = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };
  
  setNameMeta('description', description);
  setMeta('og:title', title);
  setMeta('og:description', description);
  setMeta('og:image', image);
  setMeta('og:type', 'business.business');
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  setMeta('twitter:image', image);
 };

const ShopProfile: React.FC = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [shop, setShop] = React.useState<Shop | null>(null);
  const [currentDesign, setCurrentDesign] = React.useState<ShopDesign>(DEFAULT_SHOP_DESIGN);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [isCartOpen, setCartOpen] = React.useState(false);
  const [cartItems, setCartItems] = React.useState<any[]>([]);
  const [spatialMode, setSpatialMode] = React.useState(false);
  const [addedItemId, setAddedItemId] = React.useState<string | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [galleryImages, setGalleryImages] = React.useState<ShopGallery[]>([]);
  const [activeTab, setActiveTab] = React.useState<'products' | 'gallery' | 'info'>('products');
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState('الكل');
  const [hasFollowed, setHasFollowed] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);
  const [selectedProductForRes, setSelectedProductForRes] = React.useState<any | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { playSound } = useCartSound();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('ray_user');
        if (savedUser) setUser(JSON.parse(savedUser));
        else setUser(null);
      } catch {
        setUser(null);
      }
    };
    const syncCart = () => {
      try {
        setCartItems(RayDB.getCart());
      } catch {
        setCartItems([]);
      }
    };
    checkAuth();
    syncCart();
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('cart-updated', syncCart);
    return () => {
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('cart-updated', syncCart);
    };
  }, []);

  const [hasMoreProducts, setHasMoreProducts] = React.useState(true);
  const [loadingMoreProducts, setLoadingMoreProducts] = React.useState(false);
  const [productsTabLoading, setProductsTabLoading] = React.useState(false);
  const [productsTabError, setProductsTabError] = React.useState<string | null>(null);
  const [galleryTabLoading, setGalleryTabLoading] = React.useState(false);
  const [galleryTabError, setGalleryTabError] = React.useState<string | null>(null);

  const prefersReducedMotion = useReducedMotion();

  const productsPagingRef = useRef({ page: 1, limit: 24, hasMore: true, loadingMore: false });
  const tabLoadStateRef = useRef<Record<string, { loaded: boolean; inFlight: boolean }>>({});

  const pageUrl = `https://mnmknk.com${location.pathname}`;
  const title = `${shop?.name} | ${shop?.category === 'RESTAURANT' ? 'مطعم' : 'متجر'} في ${shop?.city}`;
  const shopDescription = String((shop as any)?.description || '').trim();
  const description = shopDescription ? shopDescription.substring(0, 160) : `استكشف ${shop?.name}، أفضل ${shop?.category === 'RESTAURANT' ? 'مطعم' : 'متجر'} في ${shop?.city} يقدم مجموعة واسعة من المنتجات والخدمات.`;
  const imageUrl = shop?.logoUrl || currentDesign?.bannerUrl || 'https://mnmknk.com/images/default-banner.jpg';

  const schema = {
    '@context': 'https://schema.org',
    '@type': shop?.category === 'RESTAURANT' ? 'Restaurant' : 'LocalBusiness',
    name: shop?.name,
    description: shopDescription,
    image: imageUrl,
    url: pageUrl,
    telephone: shop?.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: shop?.addressDetailed,
      addressLocality: shop?.city,
      addressRegion: shop?.governorate,
      addressCountry: 'EG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: shop?.latitude,
      longitude: shop?.longitude,
    },
    openingHours: shop?.openingHours,
  };

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
          
          // Track visit with session-level deduplication
          const shopId = String(currentShopData?.id || '').trim();
          if (shopId) {
            const sessionKey = `visited_shop_${shopId}`;
            const hasVisitedThisSession = sessionStorage.getItem(sessionKey);
            if (!hasVisitedThisSession) {
              // First visit this session - track it
              ApiService.incrementVisitors(shopId).catch(() => {});
              sessionStorage.setItem(sessionKey, 'true');
            }
          }
          
          // Fallback to default design if pageDesign is missing or invalid
          const design = currentShopData.pageDesign || DEFAULT_SHOP_DESIGN;
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
                setCurrentDesign({ ...(design as any), ...(previewDesign as any) } as any);
              } else {
                setCurrentDesign(design as any);
              }
            } catch {
              setCurrentDesign(design as any);
            }
          } else {
            setCurrentDesign(design as any);
          }

          // Reset lazy-load state
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
      } catch {
      }
    };

    applyPreview();
    window.addEventListener('ray-builder-preview-update', applyPreview);
    return () => window.removeEventListener('ray-builder-preview-update', applyPreview);
  }, [shop?.id]);

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
          setProductsTabError(null);
          setProductsTabLoading(true);
          const page = productsPagingRef.current.page;
          const limit = productsPagingRef.current.limit;
          const [prodData, shopOffers] = await Promise.all([
            ApiService.getProducts(shopId, { page, limit }),
            ApiService.getOffers({ take: 100, skip: 0, shopId }),
          ]);
          const list = Array.isArray(prodData) ? prodData : [];
          setProducts(list);
          productsPagingRef.current.hasMore = list.length >= limit;
          setHasMoreProducts(list.length >= limit);
          setOffers(Array.isArray(shopOffers) ? shopOffers : []);
        } else if (tab === 'gallery') {
          setGalleryTabError(null);
          setGalleryTabLoading(true);
          const galleryData = await ApiService.getShopGallery(shopId);
          setGalleryImages(Array.isArray(galleryData) ? galleryData : []);
        }
        tabLoadStateRef.current[key] = { loaded: true, inFlight: false };
      } catch (err: any) {
        if (tab === 'products') {
          setProductsTabError(String(err?.message || 'فشل تحميل المنتجات'));
        } else if (tab === 'gallery') {
          setGalleryTabError(String(err?.message || 'فشل تحميل معرض الصور'));
        }
        tabLoadStateRef.current[key] = { loaded: false, inFlight: false };
      } finally {
        if (tab === 'products') {
          setProductsTabLoading(false);
        } else if (tab === 'gallery') {
          setGalleryTabLoading(false);
        }
      }
    };

    ensureTabData();
  }, [activeTab, shop?.id]);

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
      const list = Array.isArray(prodData) ? prodData : [];
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
      const list = Array.isArray(next) ? next : [];
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
      text: `شوفوا المحل ده على منصة تست: ${shop.name}`,
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

  const customCssRaw = typeof (currentDesign as any)?.customCss === 'string' ? String((currentDesign as any).customCss) : '';
  const scopedCustomCss = useMemo(() => {
    return customCssRaw ? scopeCss(customCssRaw, '#shop-profile-root') : '';
  }, [customCssRaw]);

  const uncategorizedLabel = 'عام';
  const getProductCategory = (p: Product) => {
    const c = String((p as any)?.category || uncategorizedLabel).trim();
    return c || uncategorizedLabel;
  };

  const sectionCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of products) {
      const c = getProductCategory(p);
      if (c !== uncategorizedLabel) cats.add(c);
    }
    return Array.from(cats);
  }, [products]);

  const hasSections = sectionCategories.length > 0;

  const uncategorizedProducts = useMemo(() => {
    return products.filter((p) => getProductCategory(p) === uncategorizedLabel);
  }, [products]);

  useEffect(() => {
    if (!hasSections) return;
    if (activeCategory === 'الكل') return;
    if (sectionCategories.includes(String(activeCategory))) return;
    setActiveCategory('الكل');
  }, [activeCategory, hasSections, sectionCategories]);

  const filteredProducts = useMemo(() => {
    if (!hasSections) {
      if (activeCategory === 'الكل') return products;
      return products.filter((p) => getProductCategory(p) === String(activeCategory));
    }

    if (activeCategory === 'الكل') return uncategorizedProducts;
    return products.filter((p) => getProductCategory(p) === String(activeCategory));
  }, [activeCategory, hasSections, products, uncategorizedProducts]);

  const offersByProductId = useMemo(() => {
    const map = new Map<string, Offer>();
    for (const o of offers) {
      const pid = String((o as any)?.productId || '').trim();
      if (pid) map.set(pid, o);
    }
    return map;
  }, [offers]);

  const handleAddToCart = useCallback((prod: Product, price: number) => {
    if (!shop) return;
    const isRestaurant = shop?.category === Category.RESTAURANT;
    const menuVariants = isRestaurant
      ? (Array.isArray((prod as any)?.menuVariants)
        ? (prod as any).menuVariants
        : (Array.isArray((prod as any)?.menu_variants) ? (prod as any).menu_variants : []))
      : [];
    const hasMenuVariants = Array.isArray(menuVariants) && menuVariants.length > 0;
    if (hasMenuVariants) {
      try {
        navigate(`/shop/${String((shop as any)?.slug || '')}/product/${String((prod as any)?.id || '')}`);
      } catch {
      }
      return;
    }
    setAddedItemId((prod as any)?.id);
    RayDB.addToCart({ ...prod, price, quantity: 1, shopId: shop.id, shopName: shop.name });
    playSound();
    setTimeout(() => setAddedItemId(null), 1500);
  }, [shop, playSound]);

  const handleReserve = useCallback((data: any) => {
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
      try {
        navigate(`/shop/${String((shop as any)?.slug || '')}/product/${String((prod as any)?.id || '')}`);
      } catch {
      }
      return;
    }
    setSelectedProductForRes({ ...data, shopId: shop.id, shopName: shop.name });
  }, [shop]);

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

  const schemaJson = useMemo(() => {
    try {
      return JSON.stringify(schema);
    } catch {
      return '';
    }
  }, [
    pageUrl,
    shop?.name,
    shopDescription,
    imageUrl,
    shop?.phone,
    shop?.addressDetailed,
    shop?.city,
    shop?.governorate,
    shop?.latitude,
    shop?.longitude,
    shop?.openingHours,
    shop?.category,
  ]);

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
            <div key={`shop-prod-skel-${idx}`} className="bg-white border border-slate-100 rounded-[1.5rem] p-4">
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

  if (error || !shop) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <title>المتجر غير متاح</title>
      <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-slate-300 mb-8" />
      <h2 className="text-2xl md:text-3xl font-black mb-4">المحل غير متاح حالياً</h2>
      <button onClick={() => navigate('/')} className="px-8 py-4 md:px-10 md:py-5 bg-slate-900 text-white rounded-full font-black flex items-center gap-3 shadow-xl"><Home size={20} /> العودة للرئيسية</button>
    </div>
  );

  const isRestaurant = shop.category === Category.RESTAURANT;
  const isBold = currentDesign.layout === 'bold';
  const isMinimal = currentDesign.layout === 'minimal';
  const pageBgColor = currentDesign.pageBackgroundColor || (currentDesign as any).backgroundColor;
  const pageBgImage = String((currentDesign as any).backgroundImageUrl || '');
  const productDisplayMode = (currentDesign.productDisplay || ((currentDesign as any).productDisplayStyle === 'list' ? 'list' : undefined) || 'cards') as any;

  const headerTextColor = String(currentDesign.headerTextColor || '#0F172A');
  const headerBackgroundColor = String(currentDesign.headerBackgroundColor || '#FFFFFF');
  const headerBackgroundImageUrl = String((currentDesign as any).headerBackgroundImageUrl || '');
  const headerOpacity = coerceNumber((currentDesign as any).headerOpacity, 95) / 100;
  const headerTransparent = coerceBoolean((currentDesign as any).headerTransparent, false);
  const headerBg = headerTransparent
    ? hexToRgba(headerBackgroundColor, headerOpacity)
    : headerBackgroundColor;

  const footerTextColor = String(currentDesign.footerTextColor || (isBold ? '#FFFFFF' : '#0F172A'));
  const footerBackgroundColor = String(
    currentDesign.footerBackgroundColor || (isBold ? '#0F172A' : isMinimal ? '#FFFFFF' : '#F8FAFC')
  );
  const footerOpacity = coerceNumber((currentDesign as any).footerOpacity, 100) / 100;
  const footerTransparent = coerceBoolean((currentDesign as any).footerTransparent, false);
  const footerBg = footerTransparent ? 'transparent' : footerBackgroundColor;

  const elementsVisibility = ((currentDesign as any)?.elementsVisibility || {}) as Record<string, any>;
  const isVisible = (key: string, fallback: boolean = true) => {
    if (!elementsVisibility || typeof elementsVisibility !== 'object') return fallback;
    if (!(key in elementsVisibility)) return fallback;
    return coerceBoolean(elementsVisibility[key], fallback);
  };

  const showHeaderNavHome = isVisible('headerNavHome', true);
  const showHeaderNavGallery = isVisible('headerNavGallery', true);
  const showHeaderNavInfo = isVisible('headerNavInfo', true);
  const showHeaderNav = showHeaderNavHome || showHeaderNavGallery || showHeaderNavInfo;
  const showHeaderChatButton = isVisible('headerChatButton', true);
  const showHeaderShareButton = isVisible('headerShareButton', true);
  const showFloatingChatButton = isVisible('floatingChatButton', true);
  const showShopFollowersCount = isVisible('shopFollowersCount', true);
  const showShopFollowButton = isVisible('shopFollowButton', true);
  const showFooter = isVisible('footer', true);
  const showFooterQuickLinks = isVisible('footerQuickLinks', true);
  const showFooterContact = isVisible('footerContact', true);
  const showMobileBottomNav = isVisible('mobileBottomNav', true);
  const showMobileBottomNavHome = isVisible('mobileBottomNavHome', true);
  const showMobileBottomNavCart = isVisible('mobileBottomNavCart', true);
  const showMobileBottomNavAccount = isVisible('mobileBottomNavAccount', true);

  const disableCardMotion = Boolean(prefersReducedMotion) || filteredProducts.length > 30;

  const shopLogoSrc = String(shop.logoUrl || (shop as any).logo_url || '').trim();
  const bannerPosterUrl = String((currentDesign as any)?.bannerPosterUrl || '');

  const removeFromCart = (lineId: string) => {
    try {
      RayDB.removeFromCart(lineId);
    } catch {
    }
  };

  const updateCartItemQuantity = (lineId: string, delta: number) => {
    try {
      RayDB.updateCartItemQuantity(lineId, delta);
    } catch {
    }
  };

  const whatsappRaw = String((shop as any)?.layoutConfig?.whatsapp || '').trim() || String(shop.phone || '').trim();
  const whatsappDigits = whatsappRaw ? whatsappRaw.replace(/[^\d]/g, '') : '';
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`مرحبا ${shop.name}`)}`
    : '';

  const WhatsAppIcon = (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M19.11 17.48c-.28-.14-1.64-.81-1.9-.9-.25-.1-.43-.14-.62.14-.18.28-.71.9-.88 1.09-.16.18-.32.2-.6.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.38-1.63-1.54-1.9-.16-.28-.02-.43.12-.57.13-.13.28-.32.43-.48.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.48-.07-.14-.62-1.5-.86-2.06-.23-.55-.46-.48-.62-.49h-.53c-.18 0-.48.07-.73.35-.25.28-.96.94-.96 2.29s.98 2.65 1.11 2.83c.14.18 1.93 2.95 4.67 4.13.65.28 1.16.45 1.56.57.65.2 1.24.17 1.7.1.52-.08 1.64-.67 1.87-1.31.23-.65.23-1.2.16-1.31-.07-.12-.25-.18-.53-.32z" />
      <path d="M26.72 5.28A14.92 14.92 0 0 0 16.02 0C7.18 0 0 7.18 0 16.02c0 2.82.74 5.57 2.14 7.99L0 32l8.2-2.09a15.9 15.9 0 0 0 7.82 2c8.84 0 16.02-7.18 16.02-15.9 0-4.27-1.66-8.29-4.32-10.73zm-10.7 24.1a13.2 13.2 0 0 1-6.73-1.84l-.48-.28-4.87 1.24 1.3-4.74-.31-.49a13.14 13.14 0 0 1-2.01-7.25c0-7.22 5.88-13.1 13.1-13.1 3.5 0 6.78 1.36 9.23 3.83a12.92 12.92 0 0 1 3.86 9.27c0 7.22-5.88 13.36-13.09 13.36z" />
    </svg>
  );

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <script type="application/ld+json">{schemaJson}</script>
      <div
        id="shop-profile-root"
        className={`min-h-screen text-right font-sans overflow-x-hidden ${isMinimal ? 'bg-slate-50' : 'bg-white'} pb-24 lg:pb-0`}
        dir="rtl"
        style={
          (pageBgColor || pageBgImage)
            ? ({
              backgroundColor: pageBgColor,
              backgroundImage: pageBgImage ? `url("${pageBgImage}")` : undefined,
              backgroundSize: pageBgImage ? 'cover' : undefined,
              backgroundPosition: pageBgImage ? 'center' : undefined,
              backgroundRepeat: pageBgImage ? 'no-repeat' : undefined,
            } as any)
            : undefined
        }
      >
        {scopedCustomCss ? <style>{scopedCustomCss}</style> : null}

        <header className={`sticky top-0 z-[120] backdrop-blur-lg border-b transition-all duration-500 ${
          isBold ? 'border-slate-200 bg-white/95' : isMinimal ? 'bg-white/90 border-slate-100' : 'bg-white/95 border-slate-100'
        }`} style={{
          backgroundColor: headerBg,
          color: headerTextColor,
          backgroundImage: (!headerTransparent && headerBackgroundImageUrl) ? `url("${headerBackgroundImageUrl}")` : undefined,
          backgroundSize: (!headerTransparent && headerBackgroundImageUrl) ? 'cover' : undefined,
          backgroundPosition: (!headerTransparent && headerBackgroundImageUrl) ? 'center' : undefined,
          backgroundRepeat: (!headerTransparent && headerBackgroundImageUrl) ? 'no-repeat' : undefined,
        }}>
          <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                {shopLogoSrc ? (
                  <img
                    src={shopLogoSrc}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-md object-cover"
                    alt={shop.name}
                  />
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-md bg-slate-100" />
                )}
                <div>
                  <h3 className={`font-black ${isBold ? 'text-lg md:text-2xl' : 'text-sm md:text-lg'}`} style={{ color: currentDesign.primaryColor }}>
                    {shop.name}
                  </h3>
                  <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {shop.category} • {shop.city}
                  </p>
                </div>
              </div>
            
            {showHeaderNav && (
              <nav className="hidden md:flex items-center gap-6 md:gap-8">
                {showHeaderNavHome && (
                  <NavTab 
                    active={activeTab === 'products'} 
                    onClick={() => setActiveTab('products')} 
                    label={isRestaurant ? "المنيو" : "المعروضات"} 
                    primaryColor={currentDesign.primaryColor} 
                    layout={currentDesign.layout} 
                  />
                )}
                {showHeaderNavGallery && (
                  <NavTab 
                    active={activeTab === 'gallery'} 
                    onClick={() => setActiveTab('gallery')} 
                    label="معرض الصور" 
                    primaryColor={currentDesign.primaryColor} 
                    layout={currentDesign.layout} 
                  />
                )}
                {showHeaderNavInfo && (
                  <NavTab 
                    active={activeTab === 'info'} 
                    onClick={() => setActiveTab('info')} 
                    label="معلومات المتجر" 
                    primaryColor={currentDesign.primaryColor} 
                    layout={currentDesign.layout} 
                  />
                )}
              </nav>
            )}
            
            <div className="flex items-center gap-2 md:gap-3">
              {(showHeaderNav || showHeaderShareButton) && (
                <button
                  onClick={() => setIsHeaderMenuOpen((v) => !v)}
                  className="md:hidden p-2 md:p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border pointer-events-auto active:scale-90 transition-transform"
                  style={{ borderColor: `${headerTextColor}15` }}
                  aria-label="القائمة"
                >
                  {isHeaderMenuOpen ? <X size={16} /> : <Menu size={16} />}
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="hidden md:inline-flex p-2 md:p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border pointer-events-auto active:scale-90 transition-transform"
                style={{ borderColor: `${headerTextColor}15` }}
              >
                <ChevronRight size={16} className="md:w-4 md:h-4" />
              </button>
              {showHeaderChatButton && whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden md:inline-flex p-2 md:p-2.5 rounded-full font-black text-[9px] md:text-xs transition-all shadow-sm border-4 border-white"
                  style={{ backgroundColor: currentDesign.primaryColor, color: '#000', borderColor: `${currentDesign.primaryColor}20` }}
                >
                  <span className="sr-only">واتساب</span>
                  {WhatsAppIcon}
                </a>
              )}
              {showHeaderShareButton && (
                <button 
                  onClick={handleShare}
                  className="hidden md:inline-flex p-2 md:p-2.5 bg-slate-900 text-white rounded-full font-black text-[9px] md:text-xs transition-all shadow-sm hover:bg-black"
                >
                  <Share2 size={14} className="md:w-4 md:h-4" />
                </button>
              )}
            </div>
          </div>

          {(showHeaderNav || showHeaderShareButton) && isHeaderMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-[110] md:hidden"
                onClick={() => setIsHeaderMenuOpen(false)}
              />
              <div className="md:hidden mt-3 relative z-[121]">
                <div className="rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-md shadow-lg overflow-hidden">
                  {showHeaderNavHome && (
                    <button
                      onClick={() => { setActiveTab('products'); setIsHeaderMenuOpen(false); }}
                      className={`w-full text-right px-4 py-3 font-black text-sm transition-colors ${activeTab === 'products' ? 'bg-slate-50' : 'bg-transparent'}`}
                      style={{ color: headerTextColor }}
                    >
                      {isRestaurant ? 'المنيو' : 'المعروضات'}
                    </button>
                  )}
                  {showHeaderNavGallery && (
                    <button
                      onClick={() => { setActiveTab('gallery'); setIsHeaderMenuOpen(false); }}
                      className={`w-full text-right px-4 py-3 font-black text-sm transition-colors ${activeTab === 'gallery' ? 'bg-slate-50' : 'bg-transparent'}`}
                      style={{ color: headerTextColor }}
                    >
                      معرض الصور
                    </button>
                  )}
                  {showHeaderNavInfo && (
                    <button
                      onClick={() => { setActiveTab('info'); setIsHeaderMenuOpen(false); }}
                      className={`w-full text-right px-4 py-3 font-black text-sm transition-colors ${activeTab === 'info' ? 'bg-slate-50' : 'bg-transparent'}`}
                      style={{ color: headerTextColor }}
                    >
                      معلومات المتجر
                    </button>
                  )}
                  {showHeaderShareButton && (
                    <button
                      onClick={() => { handleShare(); setIsHeaderMenuOpen(false); }}
                      className="w-full text-right px-4 py-3 font-black text-sm transition-colors bg-transparent"
                      style={{ color: headerTextColor }}
                    >
                      مشاركة
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </header>
      
      {/* Dynamic Navigation UI */}
      {showFloatingChatButton && whatsappHref && (
        <div className="fixed bottom-24 right-4 z-[150] flex flex-col gap-4 items-end md:hidden">
           <a
             href={whatsappHref}
             target="_blank"
             rel="noreferrer"
             className="w-12 h-12 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all border-2 border-white"
             style={{ backgroundColor: currentDesign.primaryColor, color: '#000' }}
           >
              <span className="sr-only">واتساب</span>
              <span className="scale-100">{WhatsAppIcon}</span>
           </a>
        </div>
      )}

      {/* Hero Section */}
      <section className={`relative transition-all duration-1000 overflow-hidden bg-slate-900 ${
        isBold ? 'h-[45vh] md:h-[85vh] m-0 md:m-6 md:rounded-[4.5rem] shadow-2xl' : isMinimal ? 'h-[25vh] md:h-[45vh]' : 'h-[35vh] md:h-[60vh]'
      }`}>
        {isVideoUrl(currentDesign.bannerUrl) ? (
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={bannerPosterUrl || undefined}
          >
            <source src={currentDesign.bannerUrl} type="video/mp4" />
          </video>
        ) : (
          <MotionImg initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 15 }} src={currentDesign.bannerUrl} className="w-full h-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {false && (
        <div className="absolute bottom-6 md:bottom-10 left-0 right-0 flex justify-center px-6">
           <button onClick={() => setSpatialMode(true)} className="bg-white/95 backdrop-blur-sm text-slate-900 px-6 py-3 md:px-8 md:py-4 rounded-full font-black text-xs md:text-base flex items-center gap-2 md:gap-3 shadow-2xl active:scale-95 transition-all border border-slate-100 hover:gap-5">
             <Eye size={16} className="md:w-5 md:h-5 text-[#00E5FF] animate-pulse" />
           </button>
        </div>
        )}
      </section>

      {/* Brand Header */}
      <div className={`max-w-[1400px] mx-auto px-4 md:px-12 relative z-10 pb-16 md:pb-24 ${isBold ? '-mt-16 md:-mt-48' : '-mt-10 md:-mt-24'}`}>
        <div className={`flex flex-col items-center md:items-end md:flex-row-reverse gap-4 md:gap-16 ${isMinimal ? 'md:items-center' : ''}`}>
          <MotionDiv 
            initial={{ y: 30, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className={`bg-white p-1 md:p-1.5 shadow-2xl shrink-0 ring-4 ring-white ${isBold ? 'rounded-[2rem] md:rounded-[3rem] w-24 h-24 md:w-64 md:h-64 rotate-3' : isMinimal ? 'rounded-xl md:rounded-2xl w-20 h-20 md:w-48 md:h-48' : 'rounded-full w-24 h-24 md:w-56 md:h-56'}`}
          >
            {shopLogoSrc ? (
              <img src={shopLogoSrc} className={`w-full h-full object-cover ${isBold ? 'rounded-[1.8rem] md:rounded-[2.5rem]' : isMinimal ? 'rounded-lg md:rounded-xl' : 'rounded-full'}`} alt={shop.name} />
            ) : (
              <div className={`w-full h-full bg-slate-100 ${isBold ? 'rounded-[1.8rem] md:rounded-[2.5rem]' : isMinimal ? 'rounded-lg md:rounded-xl' : 'rounded-full'}`} />
            )}
          </MotionDiv>
          
          <div className={`flex-1 text-center md:text-right ${isMinimal ? 'md:text-center' : ''}`}>
            <div className={`flex items-center justify-center md:justify-start gap-2 mb-2 md:mb-3 flex-row-reverse ${isMinimal ? 'md:justify-center' : ''}`}>
               {isRestaurant ? <Utensils size={14} className="md:w-4 md:h-4 text-[#BD00FF]" /> : <ShoppingBag size={14} className="md:w-4 md:h-4 text-[#00E5FF]" />}
               <span className="text-slate-400 font-black text-[9px] md:text-xs uppercase tracking-widest">{shop.category} • {shop.city}</span>
            </div>
            <h1 className={`font-black tracking-tighter mb-4 md:mb-5 leading-tight ${isBold ? 'text-3xl md:text-8xl lg:text-[10rem]' : isMinimal ? 'text-2xl md:text-6xl' : 'text-3xl md:text-7xl'}`} style={{ color: currentDesign.primaryColor }}>{shop.name}</h1>
            
            <div className={`flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 mb-8 ${isMinimal ? 'md:justify-center' : ''}`}>
              <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 md:px-5 md:py-2 rounded-full border border-slate-100 flex items-center gap-1.5 md:gap-2 shadow-sm">
                 <Star size={12} className="md:w-[14px] md:h-[14px] text-amber-400 fill-current" />
                 <span className="font-black text-xs md:text-sm">{shop.rating}</span>
              </div>
              {showShopFollowersCount && (
                <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 md:px-5 md:py-2 rounded-full border border-slate-100 flex items-center gap-1.5 md:gap-2 shadow-sm">
                   <Users size={12} className="md:w-[14px] md:h-[14px] text-slate-400" />
                   <span className="font-black text-xs md:text-sm">{shop.followers?.toLocaleString() || 0}</span>
                </div>
              )}
              {showShopFollowButton && (
                <button 
                  onClick={handleFollow}
                  disabled={followLoading || hasFollowed}
                  className={`px-6 py-1.5 md:px-8 md:py-2.5 rounded-full font-black text-[11px] md:text-sm transition-all shadow-xl active:scale-95 disabled:opacity-60 ${hasFollowed ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}
                >
                  {hasFollowed ? 'متابع' : followLoading ? '...' : 'متابعة المتجر'}
                </button>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'products' ? (
            <MotionDiv key="products-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {hasSections ? (
                <div className="mb-8 md:mb-10">
                  {activeCategory === 'الكل' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                      {sectionCategories.map((cat) => {
                        const cover = products.find((p) => getProductCategory(p) === cat);
                        const coverSrc =
                          (cover as any)?.imageUrl ||
                          (cover as any)?.image_url ||
                          (currentDesign as any)?.bannerUrl ||
                          (shop as any)?.logoUrl ||
                          (shop as any)?.logo_url;
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className="text-right group"
                          >
                            <div className="relative aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100">
                              {coverSrc ? (
                                <img loading="lazy" src={coverSrc} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={cat} />
                              ) : (
                                <div className="w-full h-full bg-slate-100" />
                              )}
                              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />
                              <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 left-3 md:left-4">
                                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl md:rounded-2xl font-black text-xs md:text-base text-slate-900">
                                  {cat}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-6 md:mb-10">
                      <button
                        type="button"
                        onClick={() => setActiveCategory('الكل')}
                        className="px-6 py-3 bg-white border border-slate-100 rounded-2xl font-black text-xs md:text-sm text-slate-700 hover:bg-slate-50 transition-all"
                      >
                        رجوع للأقسام
                      </button>
                      <div className="font-black text-lg md:text-2xl text-slate-900">{activeCategory}</div>
                    </div>
                  )}
                </div>
              ) : null}
              
              <div className={`${productDisplayMode === 'list' ? 'flex flex-col gap-3 md:gap-4' : productDisplayMode === 'minimal' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6' : `grid gap-3 md:gap-8 ${isMinimal ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}`}>
                {productsTabLoading && products.length === 0 ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <div key={`prod-skel-${idx}`} className="bg-white border border-slate-100 rounded-[1.5rem] p-4">
                      <Skeleton className="aspect-[4/3] rounded-2xl mb-4" />
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-28 mb-4" />
                      <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                  ))
                ) : productsTabError ? (
                  <div className="col-span-full py-16 md:py-24 text-center text-slate-500 font-bold border-2 border-dashed border-slate-100 rounded-[2rem] md:rounded-[3rem]">
                    <AlertCircle size={40} className="md:w-12 md:h-12 mx-auto mb-4 text-slate-300" />
                    <div className="text-sm md:text-base mb-6">{productsTabError}</div>
                    <button
                      type="button"
                      onClick={retryProductsTab}
                      className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm md:text-base hover:bg-black transition-all"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full py-16 md:py-24 text-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-[2rem] md:rounded-[3rem]">
                    <Info size={40} className="md:w-12 md:h-12 mx-auto mb-4 opacity-20" />
                    {hasSections && activeCategory === 'الكل' ? 'لا توجد منتجات بدون قسم حالياً.' : 'لا توجد أصناف في هذا القسم حالياً.'}
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      design={currentDesign!} 
                      offer={offersByProductId.get(String(p.id))}
                      shopCategory={shop?.category}
                      onAdd={handleAddToCart}
                      isAdded={addedItemId === p.id} 
                      onReserve={handleReserve}
                      disableMotion={disableCardMotion}
                    />
                  ))
                )}
              </div>

              {filteredProducts.length > 0 && hasMoreProducts && (
                <div className="mt-10 md:mt-14 flex items-center justify-center">
                  <button
                    onClick={loadMoreProducts}
                    disabled={loadingMoreProducts}
                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl disabled:opacity-60"
                  >
                    {loadingMoreProducts ? <Loader2 className="animate-spin" size={18} /> : null}
                    <span>{loadingMoreProducts ? 'تحميل...' : 'تحميل المزيد'}</span>
                  </button>
                </div>
              )}
            </MotionDiv>
          ) : activeTab === 'gallery' ? (
            <MotionDiv key="gallery-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-8 md:mb-10">
                <h2 className={`font-black mb-4 md:mb-6 ${isBold ? 'text-2xl md:text-4xl' : 'text-xl md:text-3xl'}`} style={{ color: currentDesign.primaryColor }}>
                  معرض {shop.name}
                </h2>
                <p className="text-slate-600 text-sm md:text-base">
                  استكشف صور ومعارض من {shop.name}
                </p>
              </div>
              {galleryTabLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <Skeleton key={`gallery-skel-${idx}`} className="aspect-square rounded-xl md:rounded-2xl" />
                  ))}
                </div>
              ) : galleryTabError ? (
                <div className="py-16 md:py-24 text-center text-slate-500 font-bold border-2 border-dashed border-slate-100 rounded-[2rem] md:rounded-[3rem]">
                  <AlertCircle size={40} className="md:w-12 md:h-12 mx-auto mb-4 text-slate-300" />
                  <div className="text-sm md:text-base mb-6">{galleryTabError}</div>
                  <button
                    type="button"
                    onClick={retryGalleryTab}
                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm md:text-base hover:bg-black transition-all"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : (
                <ShopGalleryComponent 
                  images={galleryImages}
                  shopName={shop.name}
                  primaryColor={currentDesign.primaryColor}
                  layout={currentDesign.layout}
                />
              )}
            </MotionDiv>
          ) : (
            <MotionDiv key="info-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
              <div className={`p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 space-y-6 md:space-y-8 ${isMinimal ? 'bg-white' : 'bg-slate-50'}`}>
                  <h3 className="text-xl md:text-2xl font-black mb-4">تفاصيل التواصل</h3>
                  <div className="grid grid-cols-1 gap-5 md:gap-6">
                    <InfoItem 
                      icon={<MapPin className="md:w-5 md:h-5 text-[#00E5FF]" />} 
                      title="العنوان" 
                      value={shop.addressDetailed || `${shop.city}, ${shop.governorate}`} 
                    />
                    <InfoItem 
                      icon={<Phone className="md:w-5 md:h-5 text-[#BD00FF]" />} 
                      title="رقم الهاتف" 
                      value={whatsappRaw || shop.phone || 'يرجى التواصل عبر واتساب'} 
                    />
                    <InfoItem 
                      icon={<Clock className="md:w-5 md:h-5 text-slate-400" />} 
                      title="مواعيد العمل" 
                      value={shop.openingHours || 'من ١٠ صباحاً - ١٢ مساءً'} 
                    />
                  </div>

                  {/* Embedded Map */}
                  {typeof shop.latitude === 'number' && typeof shop.longitude === 'number' && (
                    <div className="mt-6">
                      <h4 className="font-black text-sm md:text-base mb-3" style={{ color: currentDesign.primaryColor }}>الموقع على الخريطة</h4>
                      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                        <iframe
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${shop.longitude - 0.005},${shop.latitude - 0.005},${shop.longitude + 0.005},${shop.latitude + 0.005}&layer=mapnik&marker=${shop.latitude},${shop.longitude}`}
                          width="100%"
                          height="250"
                          style={{ border: 0 }}
                          title={`موقع ${shop.name} على الخريطة`}
                          loading="lazy"
                        />
                      </div>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${shop.latitude}&mlon=${shop.longitude}#map=16/${shop.latitude}/${shop.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-xs md:text-sm font-black text-[#00E5FF] hover:underline"
                      >
                        <MapPin size={14} />
                        فتح في خرائط OpenStreetMap
                      </a>
                    </div>
                  )}
                </div>
               <div className={`p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 flex flex-col justify-center items-center text-center space-y-6 ${isMinimal ? 'bg-white' : 'bg-slate-50'}`}>
                  <div className={`w-16 h-16 md:w-24 md:h-24 bg-white rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-xl mb-2 ${isBold ? 'rotate-6' : ''}`}>
                     <span className="text-green-500">{WhatsAppIcon}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black">تواصل عبر واتساب</h3>
                  <p className="text-slate-500 font-bold text-sm md:text-xl max-w-xs mx-auto mb-10 md:mb-16 leading-relaxed px-4">
                    تواصل مباشرة مع صاحب النشاط عبر واتساب للحصول على رد سريع.
                  </p>
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full md:w-auto px-8 py-4 md:px-10 md:py-5 bg-green-500 text-white rounded-2xl md:rounded-[1.5rem] font-black text-sm md:text-base flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-transform active:scale-95"
                    >
                      <span className="text-white">{WhatsAppIcon}</span> فتح واتساب
                    </a>
                  ) : (
                    <div className="w-full md:w-auto px-8 py-4 md:px-10 md:py-5 bg-slate-200 text-slate-600 rounded-2xl md:rounded-[1.5rem] font-black text-sm md:text-base">
                      لا يوجد رقم واتساب بعد
                    </div>
                  )}
               </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>

      {/* Reservation Modal */}
      <ReservationModal 
        isOpen={!!selectedProductForRes} 
        onClose={() => setSelectedProductForRes(null)} 
        item={selectedProductForRes ? {
          id: selectedProductForRes.id,
          name: selectedProductForRes.name,
          image: selectedProductForRes.imageUrl || (selectedProductForRes as any).image_url,
          price: selectedProductForRes.price,
          shopId: selectedProductForRes.shopId,
          shopName: selectedProductForRes.shopName
        } : null}
      />

      {showMobileBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-[160] px-4 pb-4 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] px-2">
              <div className="flex items-stretch justify-between gap-1" dir="rtl">
                {showMobileBottomNavHome && (
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all text-slate-500 hover:bg-slate-50 hover:text-black"
                  >
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] font-black">الرئيسية</span>
                  </button>
                )}

                {showMobileBottomNavCart && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all text-slate-500 hover:bg-slate-50 hover:text-black">
                    <CartIconWithAnimation 
                      count={cartItems.length}
                      onClick={() => setCartOpen(true)}
                    />
                    <span className="text-[10px] font-black">السلة</span>
                  </div>
                )}

                {showMobileBottomNavAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      if (user) {
                        const role = String(user?.role || '').toLowerCase();
                        navigate(role === 'merchant' ? '/business/dashboard' : '/profile');
                        return;
                      }
                      const q = new URLSearchParams();
                      q.set('returnTo', `${location.pathname}${location.search || ''}`);
                      navigate(`/login?${q.toString()}`);
                    }}
                    className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all text-slate-500 hover:bg-slate-50 hover:text-black"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-black">حسابي</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateCartItemQuantity}
      />

      {/* Spatial Discovery Overlay */}
      <AnimatePresence>
        {spatialMode && (
          <MotionDiv key="spatial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 md:p-8 text-center text-white">
             <div className="relative mb-8 md:mb-12">
               <div className="w-20 h-20 md:w-24 md:h-24 border-[4px] md:border-[6px] rounded-full border-white/5 border-t-[#00E5FF] animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 border-[4px] md:border-[6px] rounded-full border-white/5 border-t-[#BD00FF] animate-spin-reverse" />
               </div>
             </div>
             <h2 className="text-3xl md:text-7xl font-black mb-4 md:mb-6 tracking-tighter">جاري تهيئة الشعاع المكاني...</h2>
             <p className="text-slate-400 font-bold text-sm md:text-xl max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed px-4">
               استعد لتجربة تسوق ثورية. ستتمكن قريباً من المشي داخل "{shop.name}" واختيار منتجاتك بشكل ثلاثي الأبعاد بالكامل من منزلك.
             </p>
             <button onClick={() => setSpatialMode(false)} className="px-10 py-4 md:px-16 md:py-6 bg-white text-black rounded-full font-black text-lg md:text-2xl active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">العودة للواقع</button>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Site-like Footer */}
      {showFooter && (
        <footer
          className={`mt-16 md:mt-24 border-t transition-all duration-500 ${
            footerTransparent
              ? 'bg-transparent border-transparent'
              : isBold
                ? 'bg-slate-900 border-slate-700'
                : isMinimal
                  ? 'bg-white border-slate-100'
                  : 'bg-slate-50 border-slate-200'
          }`}
          style={{ backgroundColor: footerBg, color: footerTextColor }}
        >
          <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
              {/* Brand */}
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <img 
                    src={((shop.logoUrl || (shop as any).logo_url || '').trim() || undefined)} 
                    className="w-8 h-8 rounded-full border-2 border-white shadow-md object-cover" 
                    alt={shop.name}
                  />
                  <h4 className={`font-black ${isBold ? 'text-lg' : 'text-base'}`} style={{ color: footerTextColor }}>
                    {shop.name}
                  </h4>
                </div>
                <p className="text-xs md:text-sm font-bold leading-relaxed" style={{ opacity: 0.8 }}>
                  منصة متكاملة لتقديم أفضل الخدمات والمنتجات بجودة عالية.
                </p>
              </div>

              {/* Quick Links */}
              {showFooterQuickLinks && (
                <div className="text-center md:text-right">
                  <h5 className="font-black mb-3 text-sm md:text-base" style={{ color: footerTextColor }}>روابط سريعة</h5>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('products')}
                      className="block text-xs md:text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ color: footerTextColor, opacity: 0.8 }}
                    >
                      {isRestaurant ? "المنيو" : "المعروضات"}
                    </button>
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className="block text-xs md:text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ color: footerTextColor, opacity: 0.8 }}
                    >
                      معرض الصور
                    </button>
                    <button
                      onClick={() => setActiveTab('info')}
                      className="block text-xs md:text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ color: footerTextColor, opacity: 0.8 }}
                    >
                      معلومات المتجر
                    </button>
                  </div>
                </div>
              )}

              {/* Contact */}
              {showFooterContact && (
                <div className="text-center md:text-right">
                  <h5 className="font-black mb-3 text-sm md:text-base" style={{ color: footerTextColor }}>تواصل معنا</h5>
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm font-bold" style={{ color: footerTextColor, opacity: 0.8 }}>
                      {shop.phone || 'جاري تحديث رقم الهاتف'}
                    </p>
                    <p className="text-xs md:text-sm font-bold" style={{ color: footerTextColor, opacity: 0.8 }}>
                      جاري تحديث البريد الإلكتروني
                    </p>
                    <p className="text-xs md:text-sm font-bold" style={{ color: footerTextColor, opacity: 0.8 }}>
                      {shop.addressDetailed || `${shop.city}, ${shop.governorate}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Copyright */}
            <div className={`pt-6 border-t text-center text-xs md:text-sm font-bold ${
              isBold ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
            }`} style={{ color: footerTextColor, opacity: 0.75 }}>
              <p>جميع الحقوق محفوظة © {new Date().getFullYear()} {shop.name} • تطوير بواسطة منصة تست</p>
            </div>
          </div>
        </footer>
      )}
    </div> 
  </>
  );
};

export default ShopProfile;
