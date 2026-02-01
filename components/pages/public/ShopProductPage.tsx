import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarCheck, Heart, Home, Loader2, Share2, ShoppingCart, Truck, ShieldCheck, Package } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { RayDB } from '@/constants';
import { Offer, Product, Shop, ShopDesign } from '@/types';
import ReservationModal from '../shared/ReservationModal';

const { useParams, useNavigate, Link, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const hexToRgba = (hex: string, alpha: number) => {
  const raw = String(hex || '').replace('#', '').trim();
  const normalized = raw.length === 3 ? raw.split('').map((c) => `${c}${c}`).join('') : raw;
  if (normalized.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const coerceBoolean = (value: any, fallback: boolean) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
};

const coerceNumber = (value: any, fallback: number) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const ShopProductPage: React.FC = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [shop, setShop] = useState<Shop | null>(null);
  const [design, setDesign] = useState<ShopDesign | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const favs = RayDB.getFavorites();
      return favs.includes(String(id || ''));
    } catch {
      return false;
    }
  });
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        if (!slug || !id) {
          setError(true);
          return;
        }

        const [shopRes, productRes, offerRes] = await Promise.allSettled([
          ApiService.getShopBySlug(String(slug)),
          ApiService.getProductById(String(id)),
          ApiService.getOfferByProductId(String(id)),
        ]);

        const s = shopRes.status === 'fulfilled' ? shopRes.value : null;
        const p = productRes.status === 'fulfilled' ? productRes.value : null;

        if (!s || !p) {
          setError(true);
          return;
        }

        setShop(JSON.parse(JSON.stringify(s)));

        const d = (s as any).pageDesign || {
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
            return userShopId && userShopId === String((s as any)?.id || '').trim();
          } catch {
            return false;
          }
        })();

        if (canApplyPreview) {
          try {
            const rawPreview = localStorage.getItem('ray_builder_preview_design');
            const parsed = rawPreview ? JSON.parse(rawPreview) : null;
            const previewDesign = parsed && typeof parsed === 'object' ? parsed : null;
            if (previewDesign) setDesign({ ...d, ...previewDesign } as any);
            else setDesign(d);
          } catch {
            setDesign(d);
          }
        } else {
          setDesign(d);
        }

        const shopIdFromProduct = String((p as any)?.shopId || (p as any)?.shop_id || '');
        if (shopIdFromProduct && String((s as any)?.id || '') && shopIdFromProduct !== String((s as any)?.id || '')) {
          setError(true);
          return;
        }

        setProduct(p);

        if (offerRes.status === 'fulfilled' && offerRes.value) {
          setOffer(offerRes.value as any);
        }

        // Removed: favorites check was moved to state initializer
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
    window.scrollTo(0, 0);
  }, [slug, id]);

  useEffect(() => {
    const applyPreview = () => {
      const sid = String((shop as any)?.id || '').trim();
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
        setDesign((prev) => (prev ? ({ ...prev, ...previewDesign } as any) : (previewDesign as any)));
      } catch {
      }
    };

    applyPreview();
    window.addEventListener('ray-builder-preview-update', applyPreview);
    return () => window.removeEventListener('ray-builder-preview-update', applyPreview);
  }, [shop?.id]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    return offer ? (offer as any).newPrice : (product as any).price;
  }, [offer, product]);

  const elementsVisibility = (((design as any)?.elementsVisibility || {}) as Record<string, any>) || {};
  const isVisible = useCallback((key: string, fallback: boolean = true) => {
    if (!elementsVisibility || typeof elementsVisibility !== 'object') return fallback;
    if (!(key in elementsVisibility)) return fallback;
    return coerceBoolean(elementsVisibility[key], fallback);
  }, [elementsVisibility]);

  const primaryColor = String((design as any)?.primaryColor || '#00E5FF');
  const layout = String((design as any)?.layout || 'modern');
  const isBold = layout === 'bold';
  const isMinimal = layout === 'minimal';

  const pageBgColor = String((design as any)?.pageBackgroundColor || (design as any)?.backgroundColor || '#FFFFFF');
  const pageBgImage = String((design as any)?.backgroundImageUrl || '');

  const headerTextColor = String((design as any)?.headerTextColor || '#0F172A');
  const headerBackgroundColor = String((design as any)?.headerBackgroundColor || pageBgColor);
  const headerBackgroundImageUrl = String((design as any)?.headerBackgroundImageUrl || '');
  const headerOpacity = coerceNumber((design as any)?.headerOpacity, 95) / 100;
  const headerTransparent = coerceBoolean((design as any)?.headerTransparent, false);
  const headerBg = headerTransparent
    ? hexToRgba(headerBackgroundColor, headerOpacity)
    : headerBackgroundColor;

  const footerTextColor = String((design as any)?.footerTextColor || (isBold ? '#FFFFFF' : '#0F172A'));
  const footerBackgroundColor = String(
    (design as any)?.footerBackgroundColor || (isBold ? '#0F172A' : isMinimal ? '#FFFFFF' : '#F8FAFC')
  );
  const footerOpacity = coerceNumber((design as any)?.footerOpacity, 100) / 100;
  const footerTransparent = coerceBoolean((design as any)?.footerTransparent, false);
  const footerBg = footerTransparent ? 'transparent' : footerBackgroundColor;

  const showHeaderNavHome = isVisible('headerNavHome', true);
  const showHeaderNavGallery = isVisible('headerNavGallery', true);
  const showHeaderNavInfo = isVisible('headerNavInfo', true);
  const showHeaderNav = showHeaderNavHome || showHeaderNavGallery || showHeaderNavInfo;
  const showHeaderShareButton = isVisible('headerShareButton', true);
  const showFooter = isVisible('footer', true);
  const showFooterQuickLinks = isVisible('footerQuickLinks', true);
  const showFooterContact = isVisible('footerContact', true);

  const showProductTabs = isVisible('productTabs', true);
  const showProductShareButton = isVisible('productShareButton', true);
  const showProductQuickSpecs = isVisible('productQuickSpecs', true);

  const showPrice = isVisible('productCardPrice', true);
  const showStock = isVisible('productCardStock', true);
  const showAddToCart = isVisible('productCardAddToCart', true);
  const showReserve = isVisible('productCardReserve', true);

  const handleToggleFavorite = () => {
    if (!product) return;
    const state = RayDB.toggleFavorite(String((product as any)?.id || ''));
    setIsFavorite(state);
  };

  const handleAddToCart = () => {
    if (!product || !shop) return;
    RayDB.addToCart({
      ...product,
      price: currentPrice,
      quantity: 1,
      shopId: (shop as any)?.id,
      shopName: (shop as any)?.name,
    });
  };

  const handleShare = async () => {
    try {
      const href = window.location.href;
      if ((navigator as any)?.share) {
        await (navigator as any).share({
          title: String((product as any)?.name || 'منتج'),
          text: String((product as any)?.name || 'منتج'),
          url: href,
        });
        return;
      }
      const clipboard = (navigator as any)?.clipboard;
      if (clipboard?.writeText) clipboard.writeText(href);
    } catch {
    }
  };

  const shopLogoSrc = String((shop as any)?.logoUrl || (shop as any)?.logo_url || '').trim();
  const productImageSrc = String((product as any)?.imageUrl || (product as any)?.image_url || '').trim();
  const productDescription = String((product as any)?.description || (product as any)?.details || '').trim();

  const shopPrefix = String(location?.pathname || '').startsWith('/shop/') ? '/shop' : '/s';

  const quickSpecs = useMemo(
    () => [
      { label: 'القسم', value: String((product as any)?.category || 'عام') },
      { label: 'المخزون', value: typeof (product as any)?.stock === 'number' ? String((product as any).stock) : '—' },
    ],
    [(product as any)?.category, (product as any)?.stock],
  );

  const prefersReducedMotion = useReducedMotion();

  const TabContent = useMemo(() => {
    if (activeTab === 'details') {
      return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h3 className="font-black text-sm mb-2">التفاصيل</h3>
          <p className="text-sm font-bold text-slate-600 leading-relaxed">
            {productDescription || 'لا يوجد تفاصيل إضافية بعد.'}
          </p>
        </div>
      );
    }
    if (activeTab === 'specs') {
      return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h3 className="font-black text-sm mb-2">المواصفات</h3>
          <p className="text-sm font-bold text-slate-600 leading-relaxed">سيتم إضافة المواصفات قريباً.</p>
        </div>
      );
    }
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <h3 className="font-black text-sm mb-2">الشحن</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-row-reverse">
            <Truck className="text-slate-300" />
            <span className="text-sm font-bold text-slate-600">شحن سريع (قد يختلف حسب المنطقة)</span>
          </div>
          <div className="flex items-center gap-3 flex-row-reverse">
            <ShieldCheck className="text-slate-300" />
            <span className="text-sm font-bold text-slate-600">ضمان وجودة</span>
          </div>
          <div className="flex items-center gap-3 flex-row-reverse">
            <Package className="text-slate-300" />
            <span className="text-sm font-bold text-slate-600">تغليف آمن</span>
          </div>
        </div>
      </div>
    );
  }, [activeTab, productDescription]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <Loader2 className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  if (error || !shop || !design || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <Home className="w-16 h-16 text-slate-300 mb-6" />
        <h2 className="text-2xl font-black mb-4">عفواً، المنتج غير متاح</h2>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      dir="rtl"
      style={{
        backgroundColor: pageBgColor,
        backgroundImage: pageBgImage ? `url(${pageBgImage})` : undefined,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <header
        className={`sticky top-0 z-[120] backdrop-blur-lg border-b transition-all duration-500 ${
          headerTransparent ? 'border-transparent' : 'border-slate-100'
        }`}
        style={{
          backgroundColor: headerBg,
          backgroundImage: headerBackgroundImageUrl ? `url(${headerBackgroundImageUrl})` : undefined,
          backgroundRepeat: headerBackgroundImageUrl ? 'no-repeat' : undefined,
          backgroundSize: headerBackgroundImageUrl ? 'cover' : undefined,
          backgroundPosition: headerBackgroundImageUrl ? 'center' : undefined,
          color: headerTextColor,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`${shopPrefix}/${String(slug)}`)}
              className="p-3 md:p-4 hover:bg-slate-100/60 rounded-xl md:rounded-2xl transition-all active:scale-95"
              style={{ color: headerTextColor }}
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {showHeaderNav && (
              <nav className="hidden md:flex items-center gap-6 md:gap-8">
                {showHeaderNavHome && (
                  <Link
                    to={`${shopPrefix}/${String(slug)}?tab=products`}
                    className="text-xs md:text-sm font-black transition-opacity hover:opacity-80"
                    style={{ color: headerTextColor, opacity: 0.75 }}
                  >
                    المعروضات
                  </Link>
                )}
                {showHeaderNavGallery && (
                  <Link
                    to={`${shopPrefix}/${String(slug)}?tab=gallery`}
                    className="text-xs md:text-sm font-black transition-opacity hover:opacity-80"
                    style={{ color: headerTextColor, opacity: 0.75 }}
                  >
                    معرض الصور
                  </Link>
                )}
                {showHeaderNavInfo && (
                  <Link
                    to={`${shopPrefix}/${String(slug)}?tab=info`}
                    className="text-xs md:text-sm font-black transition-opacity hover:opacity-80"
                    style={{ color: headerTextColor, opacity: 0.75 }}
                  >
                    معلومات المتجر
                  </Link>
                )}
              </nav>
            )}

            <div className="flex items-center gap-2 md:gap-3">
              {(showHeaderShareButton || showProductShareButton) && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 md:p-2.5 bg-slate-900 text-white rounded-full font-black text-[9px] md:text-xs transition-all shadow-sm hover:bg-black"
                >
                  <Share2 size={14} className="md:w-4 md:h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 md:px-12 py-8 md:py-14">
        {showProductTabs && (
          <div className="flex items-center justify-end mb-6">
            <div className="inline-flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'details' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                التفاصيل
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'specs' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                المواصفات
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('shipping')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'shipping' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                الشحن
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row-reverse gap-6 md:gap-10">
          <div className="w-full md:w-[420px]">
            <div className="aspect-square rounded-[2rem] bg-slate-100 border border-slate-200 shadow-sm overflow-hidden">
              {productImageSrc ? (
                <img src={productImageSrc} className="w-full h-full object-cover" alt={String((product as any)?.name || 'product')} />
              ) : null}
            </div>
            {shopLogoSrc && showStock && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span className="text-xs font-black text-slate-600">{(product as any)?.stock > 0 ? 'متوفر' : 'غير متوفر'}</span>
                </div>
                <img src={shopLogoSrc} className="w-8 h-8 rounded-full object-cover border border-slate-100" alt={shop.name} />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4 text-right">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black" style={{ color: primaryColor }}>
                {String((product as any)?.name || '')}
              </h1>
              {productDescription ? (
                <p className="text-sm md:text-base font-bold text-slate-500">{productDescription}</p>
              ) : (
                <p className="text-sm md:text-base font-bold text-slate-500">وصف المنتج سيتم إضافته قريباً.</p>
              )}
            </div>

            {showPrice && (
              <div className="flex items-center justify-between flex-row-reverse">
                <span className="text-xl md:text-2xl font-black text-slate-900">ج.م {currentPrice}</span>
                {offer && (
                  <span className="text-xs font-black text-slate-400 line-through">ج.م {String((product as any)?.price || '')}</span>
                )}
              </div>
            )}

            {(showAddToCart || showProductShareButton) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {showAddToCart && (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="px-6 py-3 rounded-2xl text-white font-black text-sm shadow-xl transition-all hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <ShoppingCart size={16} /> إضافة للسلة
                    </span>
                  </button>
                )}

                {showProductShareButton && (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="px-6 py-3 rounded-2xl font-black text-sm border border-slate-200 bg-white text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Share2 size={16} /> مشاركة
                    </span>
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {showReserve ? (
                <button
                  type="button"
                  onClick={() => setIsResModalOpen(true)}
                  className="px-6 py-3 rounded-2xl font-black text-sm bg-slate-900 text-white shadow-sm transition-all hover:bg-black"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <CalendarCheck size={16} /> حجز
                  </span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`px-6 py-3 rounded-2xl font-black text-sm border shadow-sm transition-all ${isFavorite ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'}`}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} /> {isFavorite ? 'في المفضلة' : 'مفضلة'}
                </span>
              </button>
            </div>

            {showProductQuickSpecs && (
              <div className="border border-slate-100 rounded-[1.5rem] bg-white p-5 space-y-3">
                <h3 className="font-black text-sm text-slate-900">مواصفات سريعة</h3>
                <div className="space-y-2">
                  {quickSpecs.map((s) => (
                    <div key={s.label} className="flex items-center justify-between flex-row-reverse text-sm">
                      <span className="font-black text-slate-500">{s.label}</span>
                      <span className="font-bold text-slate-900">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {prefersReducedMotion ? (
                TabContent
              ) : (
                <MotionDiv
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-slate-100 rounded-2xl p-5"
                >
                  {activeTab === 'details' ? (
                    <>
                      <h3 className="font-black text-sm mb-2">التفاصيل</h3>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed">
                        {productDescription || 'لا يوجد تفاصيل إضافية بعد.'}
                      </p>
                    </>
                  ) : activeTab === 'specs' ? (
                    <>
                      <h3 className="font-black text-sm mb-2">المواصفات</h3>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed">سيتم إضافة المواصفات قريباً.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-black text-sm mb-2">الشحن</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <Truck className="text-slate-300" />
                          <span className="text-sm font-bold text-slate-600">شحن سريع (قد يختلف حسب المنطقة)</span>
                        </div>
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <ShieldCheck className="text-slate-300" />
                          <span className="text-sm font-bold text-slate-600">ضمان وجودة</span>
                        </div>
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <Package className="text-slate-300" />
                          <span className="text-sm font-bold text-slate-600">تغليف آمن</span>
                        </div>
                      </div>
                    </>
                  )}
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

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
          style={{ backgroundColor: footerBg, color: footerTextColor, opacity: footerTransparent ? 1 : footerOpacity }}
        >
          <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  {shopLogoSrc ? (
                    <img src={shopLogoSrc} className="w-8 h-8 rounded-full border-2 border-white shadow-md object-cover" alt={shop.name} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100" />
                  )}
                  <h4 className={`font-black ${isBold ? 'text-lg' : 'text-base'}`} style={{ color: footerTextColor }}>
                    {shop.name}
                  </h4>
                </div>
                <p className="text-xs md:text-sm font-bold leading-relaxed" style={{ opacity: 0.8 }}>
                  منصة متكاملة لتقديم أفضل الخدمات والمنتجات بجودة عالية.
                </p>
              </div>

              {showFooterQuickLinks && (
                <div className="text-center md:text-right">
                  <h5 className="font-black mb-3 text-sm md:text-base" style={{ color: footerTextColor }}>روابط سريعة</h5>
                  <div className="space-y-2">
                    <Link
                      to={`${shopPrefix}/${String(slug)}?tab=products`}
                      className="block text-xs md:text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ color: footerTextColor, opacity: 0.8 }}
                    >
                      المعروضات
                    </Link>
                    <Link
                      to={`${shopPrefix}/${String(slug)}?tab=gallery`}
                      className="block text-xs md:text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ color: footerTextColor, opacity: 0.8 }}
                    >
                      معرض الصور
                    </Link>
                    <Link
                      to={`${shopPrefix}/${String(slug)}?tab=info`}
                      className="block text-xs md:text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ color: footerTextColor, opacity: 0.8 }}
                    >
                      معلومات المتجر
                    </Link>
                  </div>
                </div>
              )}

              {showFooterContact && (
                <div className="text-center md:text-right">
                  <h5 className="font-black mb-3 text-sm md:text-base" style={{ color: footerTextColor }}>تواصل معنا</h5>
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm font-bold" style={{ color: footerTextColor, opacity: 0.8 }}>
                      {String((shop as any)?.phone || 'جاري تحديث رقم الهاتف')}
                    </p>
                    <p className="text-xs md:text-sm font-bold" style={{ color: footerTextColor, opacity: 0.8 }}>
                      {String((shop as any)?.addressDetailed || `${(shop as any)?.city || ''}, ${(shop as any)?.governorate || ''}`)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`pt-6 border-t text-center text-xs md:text-sm font-bold ${
                isBold ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}
              style={{ color: footerTextColor, opacity: 0.75 }}
            >
              <p>جميع الحقوق محفوظة © {new Date().getFullYear()} {shop.name} • تطوير بواسطة منصة تست</p>
            </div>
          </div>
        </footer>
      )}

      <ReservationModal
        isOpen={isResModalOpen}
        onClose={() => setIsResModalOpen(false)}
        item={{
          id: String((product as any)?.id || ''),
          name: String((product as any)?.name || ''),
          image: productImageSrc,
          price: currentPrice,
          shopId: String((shop as any)?.id || ''),
          shopName: String((shop as any)?.name || ''),
        }}
      />
    </div>
  );
};

export default ShopProductPage;
