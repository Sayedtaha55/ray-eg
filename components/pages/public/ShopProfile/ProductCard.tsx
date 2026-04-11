import React, { useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarCheck, Check, Eye, Heart, Plus, Zap } from 'lucide-react';
import SmartImage from '@/components/common/ui/SmartImage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RayDB } from '@/constants';
import { Category, Offer, Product, ShopDesign } from '@/types';
import { coerceBoolean, hexToRgba } from './utils';

const { useParams, useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const ProductCard = React.memo(function ProductCard({
  product,
  design,
  offer,
  onAdd,
  isAdded,
  onReserve,
  disableMotion,
  shopCategory,
  allowAddToCart,
  allowReserve,
  isPreview,
  onProductClick,
}: {
  product: Product;
  design: ShopDesign;
  offer?: Offer;
  onAdd: (p: Product, price: number) => void;
  isAdded: boolean;
  onReserve: (p: any) => void;
  disableMotion?: boolean;
  shopCategory?: Category;
  allowAddToCart?: boolean;
  allowReserve?: boolean;
  isPreview?: boolean;
  onProductClick?: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isLowEndDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    return isMobile && (cores <= 4 || memory <= 4);
  }, []);

  const [imageReady, setImageReady] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(() => {
    return false;
  });
  const navigate = useNavigate();
  const { slug } = useParams();
  const location = useLocation();

  const elementsVisibility = (((design as any)?.elementsVisibility || {}) as Record<string, any>) || {};
  const isVisible = (key: string, fallback: boolean = true) => {
    if (!elementsVisibility || typeof elementsVisibility !== 'object') return fallback;
    if (!(key in elementsVisibility)) return fallback;
    return coerceBoolean(elementsVisibility[key], fallback);
  };

  const showPrice = isVisible('productCardPrice', true);
  const showStock = isVisible('productCardStock', true);
  const showAddToCart = isVisible('productCardAddToCart', true) && (allowAddToCart ?? true);
  const showReserve = isVisible('productCardReserve', true) && (allowReserve ?? true);

  const productDisplay = (design.productDisplay || ((design as any).productDisplayStyle === 'list' ? 'list' : undefined)) as (
    | ShopDesign['productDisplay']
    | undefined
  );
  const displayMode = productDisplay || (design.layout === 'minimal' ? 'minimal' : 'cards');
  const isList = displayMode === 'list';
  const isCardless = displayMode === 'minimal';

  const isMinimal = design.layout === 'minimal' || isCardless;
  const isModern = design.layout === 'modern';
  const isBold = design.layout === 'bold';

  const primaryColor = String((design as any)?.primaryColor || '').trim() || '#00E5FF';
  const secondaryColor = String((design as any)?.secondaryColor || '').trim() || '#BD00FF';
  const buttonShape = String((design as any)?.buttonShape || '').trim() || '';
  const buttonPadding = String((design as any)?.buttonPadding || '').trim() || '';
  const buttonPreset = String((design as any)?.buttonPreset || 'primary').trim();
  const imageAspectRatio = String((design as any)?.imageAspectRatio || 'square').trim();
  const imageFitMode = String((design as any)?.imageFitMode || 'adaptive').trim();

  const imageAspectClass = imageAspectRatio === 'portrait'
    ? 'aspect-[2/3]'
    : imageAspectRatio === 'landscape'
      ? 'aspect-[3/2]'
      : 'aspect-square';
  const [autoImageFit, setAutoImageFit] = useState<'cover' | 'contain'>('cover');
  const effectiveImageFit: 'cover' | 'contain' =
    imageFitMode === 'contain' ? 'contain' : imageFitMode === 'cover' ? 'cover' : autoImageFit;

  const overlayBgHex = String((design as any)?.productCardOverlayBgColor || '').trim() || '#0F172A';
  const overlayOpacityPctRaw = typeof (design as any)?.productCardOverlayOpacity === 'number'
    ? (design as any).productCardOverlayOpacity
    : Number((design as any)?.productCardOverlayOpacity);
  const overlayOpacityPct = Number.isFinite(overlayOpacityPctRaw) ? Math.max(0, Math.min(100, overlayOpacityPctRaw)) : 70;
  const overlayBg = hexToRgba(overlayBgHex, overlayOpacityPct / 100);
  const titleColor = String((design as any)?.productCardTitleColor || '').trim() || '#FFFFFF';
  const priceColor = String((design as any)?.productCardPriceColor || '').trim() || '#FFFFFF';

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const favs = await RayDB.getFavorites();
      if (cancelled) return;
      setIsFavorite(favs.includes(String(product.id)));
    })();
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const toggleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const state = await RayDB.toggleFavorite(product.id);
    if (state?.requiresAuth) {
      navigate(`/login?next=${encodeURIComponent(String(location?.pathname || '/'))}`);
      return;
    }
    if (state?.failed) return;
    setIsFavorite(Boolean(state?.isFavorite));
  };

  const currentPrice = offer ? offer.newPrice : product.price;
  const isFashion = shopCategory === Category.FASHION;

  const fashionSizePriceRows = useMemo(() => {
    if (!isFashion) return [] as Array<{ label: string; price: number }>;
    const raw = (product as any)?.sizes;
    if (!Array.isArray(raw)) return [];
    const rows = raw
      .map((s: any) => {
        if (!s || typeof s !== 'object') return null;
        const label = String(s?.label || s?.name || s?.size || s?.id || '').trim();
        if (!label) return null;
        const pRaw = typeof s?.price === 'number' ? s.price : Number(s?.price);
        const price = Number.isFinite(pRaw) && pRaw >= 0 ? pRaw : NaN;
        if (!Number.isFinite(price)) return null;
        return { label, price };
      })
      .filter(Boolean) as Array<{ label: string; price: number }>;
    return rows;
  }, [isFashion, (product as any)?.sizes]);

  const fashionHasDifferentSizePrices = useMemo(() => {
    if (!isFashion) return false;
    if (!Array.isArray(fashionSizePriceRows) || fashionSizePriceRows.length < 2) return false;
    const rounded = fashionSizePriceRows.map((r) => Math.round(Number(r.price) * 100) / 100);
    return new Set(rounded).size > 1;
  }, [isFashion, fashionSizePriceRows]);

  const offerDiscountPct = useMemo(() => {
    const d = typeof (offer as any)?.discount === 'number' ? (offer as any).discount : Number((offer as any)?.discount);
    return Number.isFinite(d) ? d : 0;
  }, [offer]);

  const applyDiscountPercent = (price: number) => {
    const disc = offerDiscountPct;
    if (!Number.isFinite(disc) || disc <= 0) return price;
    const next = price * (1 - disc / 100);
    return Math.round(next * 100) / 100;
  };

  const fashionSizePriceRowsAfterDiscount = useMemo(() => {
    if (!isFashion) return [] as Array<{ label: string; price: number }>;
    return fashionSizePriceRows.map((r) => ({ label: r.label, price: applyDiscountPercent(r.price) }));
  }, [isFashion, fashionSizePriceRows, offerDiscountPct]);

  const fashionMinPrice = useMemo(() => {
    if (!isFashion) return null;
    const rows = fashionSizePriceRowsAfterDiscount;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const values = rows.map((r) => Number(r.price)).filter((n) => Number.isFinite(n) && n >= 0);
    if (values.length === 0) return null;
    return Math.min(...values);
  }, [isFashion, fashionSizePriceRowsAfterDiscount]);

  const reserveTextClass = (() => {
    const hex = String((design as any)?.primaryColor || '').trim();
    const raw = hex.replace('#', '');
    const normalized = raw.length === 3 ? raw.split('').map((c) => `${c}${c}`).join('') : raw;
    if (normalized.length !== 6) return 'text-black';
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    if (![r, g, b].every((n) => Number.isFinite(n))) return 'text-black';
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq < 140 ? 'text-white' : 'text-black';
  })();

  const buttonPresetCls = (() => {
    if (buttonPreset === 'ghost') return 'border border-white/30 bg-white/10 backdrop-blur text-white';
    if (buttonPreset === 'premium') return 'bg-gradient-to-l from-fuchsia-600 to-indigo-600 text-white shadow-lg';
    if (buttonPreset === 'urgent') return 'bg-gradient-to-l from-rose-600 to-orange-500 text-white shadow-lg';
    return '';
  })();
  const usePrimarySolidColor = buttonPreset === 'primary' || !buttonPreset;

  const trackStock =
    typeof (product as any)?.trackStock === 'boolean'
      ? (product as any).trackStock
      : typeof (product as any)?.track_stock === 'boolean'
        ? (product as any).track_stock
        : true;
  const rawStock = typeof (product as any)?.stock === 'number' ? (product as any).stock : undefined;
  const stockLabel = !trackStock ? 'متاح' : (rawStock ?? 0) <= 0 ? 'نفد' : String(rawStock);
  const stockCls = !trackStock
    ? 'bg-emerald-50 text-emerald-700'
    : (rawStock ?? 0) <= 0
      ? 'bg-slate-900 text-white'
      : (rawStock ?? 0) < 5
        ? 'bg-red-500 text-white'
        : 'bg-white/90 text-slate-900';

  const descriptionLine = useMemo(() => {
    const d = typeof (product as any)?.description === 'string' ? String((product as any).description).trim() : '';
    return d;
  }, [(product as any)?.description]);

  const goToProduct = () => {
    if (isPreview && onProductClick) {
      onProductClick();
      return;
    }
    const sid = String(slug || '').trim();
    if (sid) {
      const prefix = String(location?.pathname || '').startsWith('/shop/') ? '/shop' : '/s';
      navigate(`${prefix}/${sid}/product/${product.id}`);
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const openImagePreview = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const src = String(product.imageUrl || (product as any).image_url || '').trim();
    if (!src) return;
    setImagePreviewOpen(true);
  };

  const Wrapper: any = disableMotion ? 'div' : MotionDiv;
  const motionProps = disableMotion || isLowEndDevice ? {} : { 
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }, 
    animate: { opacity: 1, y: 0 } 
  };

  if (isCardless) {
    return (
      <>
        <Wrapper
          {...motionProps}
          className="group relative transition-all duration-500 overflow-hidden"
        >
          <div onClick={goToProduct} className={`relative overflow-hidden cursor-pointer ${imageAspectClass}`}>
          {!imageReady && <div className="absolute inset-0 animate-pulse bg-slate-100" />}
          <SmartImage
            src={product.imageUrl || (product as any).image_url}
            alt={product.name}
            className="w-full h-full"
            imgClassName={`w-full h-full ${effectiveImageFit === 'contain' ? 'object-contain bg-slate-50' : 'object-cover'} ${!isLowEndDevice ? 'group-hover:scale-110 transition-transform duration-[1s]' : ''} ${imageReady ? 'opacity-100' : 'opacity-0'}`}
            optimizeVariant="md"
            fallbackSrc="/brand/logo.png"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            style={{ transitionProperty: 'opacity, transform' }}
            imgProps={{
              onLoad: () => setImageReady(true),
              onError: () => setImageReady(true),
            }}
          />

          {offer && (
            <div className="absolute top-3 left-3 bg-slate-900/80 text-white px-3 py-1 rounded-full font-black text-[10px] shadow-lg">
              Sale
            </div>
          )}

          <button
            onClick={toggleFav}
            className={`absolute top-3 right-3 p-1.5 sm:p-2 md:p-2.5 transition-all z-10 shadow-sm ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-slate-900'
            } rounded-full`}
          >
            <Heart size={11} className="sm:w-3 sm:h-3 md:w-[14px] md:h-[14px]" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          {showStock && (
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full font-black text-[10px] shadow-lg ${stockCls}`}>
              {stockLabel}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 backdrop-blur-sm px-4 py-3" style={{ background: overlayBg }}>
            <p
              className="font-black text-[11px] md:text-sm tracking-wide uppercase line-clamp-1 text-center"
              style={{ color: titleColor }}
            >
              {product.name}
            </p>
            {showPrice && (
              <div className="mt-1 flex items-center justify-center gap-3">
                {offer ? <span className="text-white/70 line-through text-[10px] font-bold">ج.م {product.price}</span> : null}
                <span className="font-black text-sm md:text-base" style={{ color: priceColor }}>
                  {isFashion && typeof fashionMinPrice === 'number' ? `يبدأ من ج.م ${fashionMinPrice}` : `ج.م ${currentPrice}`}
                </span>
              </div>
            )}

            {showPrice && isFashion && fashionHasDifferentSizePrices && fashionSizePriceRowsAfterDiscount.length > 0 && (
              <div className="mt-1 flex flex-wrap justify-center gap-2 text-white/90 text-[9px] font-black">
                {fashionSizePriceRowsAfterDiscount.slice(0, 4).map((r) => (
                  <span key={r.label} className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                    {r.label}: {r.price}
                  </span>
                ))}
                {fashionSizePriceRowsAfterDiscount.length > 4 ? (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                    +{fashionSizePriceRowsAfterDiscount.length - 4}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>
        </Wrapper>

        <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
          <DialogContent dir="rtl" className="overflow-hidden">
            <DialogHeader>
              <DialogTitle>صورة المنتج</DialogTitle>
            </DialogHeader>

            <div className="p-4 bg-slate-50">
              <img
                src={String(product.imageUrl || (product as any).image_url || '')}
                alt=""
                className="w-full max-h-[75vh] object-contain rounded-2xl bg-white"
                loading="lazy"
                decoding="async"
              />
              <div className="mt-4 flex items-center justify-between flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setImagePreviewOpen(false);
                    goToProduct();
                  }}
                  className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm"
                >
                  فتح صفحة المنتج
                </button>
                <button
                  type="button"
                  onClick={() => setImagePreviewOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-900 font-black text-sm"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Wrapper
        {...motionProps}
        className={`group relative transition-all duration-500 overflow-hidden ${
          isList
            ? 'flex flex-row-reverse items-stretch gap-3 md:gap-4 p-3 md:p-4 bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2rem]'
            : isCardless
              ? 'flex flex-row-reverse items-stretch gap-3 md:gap-4 py-3 md:py-4 border-b border-slate-100 bg-transparent rounded-none'
              : `bg-white flex flex-col h-full ${
                  isBold
                    ? 'rounded-[1.8rem] md:rounded-[2.5rem] border-2 shadow-2xl p-2 md:p-2.5'
                    : isModern
                      ? 'rounded-[1.2rem] md:rounded-[1.5rem] border border-slate-100 shadow-lg p-1.5'
                      : 'rounded-none border-b border-slate-100 p-0 shadow-none'
                }`
        }`}
        style={{ borderColor: isBold ? design.primaryColor : isModern ? `${design.primaryColor}15` : undefined }}
      >
        <div
          onClick={goToProduct}
          className={`relative overflow-hidden cursor-pointer ${
            isList || isCardless
              ? 'w-28 h-28 md:w-36 md:h-36 rounded-2xl shrink-0'
              : `${imageAspectClass} ${isBold ? 'rounded-[1.4rem] md:rounded-[2rem]' : isModern ? 'rounded-[1rem]' : 'rounded-none'}`
          }`}
        >
          {!imageReady && <div className="absolute inset-0 animate-pulse bg-slate-100" />}
          {(product.imageUrl || (product as any).image_url) ? (
            <img
              loading="lazy"
              decoding="async"
              src={product.imageUrl || (product as any).image_url}
              className={`w-full h-full ${effectiveImageFit === 'contain' ? 'object-contain bg-slate-50' : 'object-cover'} ${!isLowEndDevice ? 'group-hover:scale-110 transition-transform duration-[1s]' : ''} ${imageReady ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionProperty: 'opacity, transform' }}
              alt={product.name}
              onLoad={(e) => {
                setImageReady(true);
                if (imageFitMode !== 'adaptive') return;
                const w = e.currentTarget.naturalWidth || 0;
                const h = e.currentTarget.naturalHeight || 0;
                if (!w || !h) return;
                const ratio = w / h;
                setAutoImageFit(ratio > 1.9 || ratio < 0.56 ? 'contain' : 'cover');
              }}
              onError={() => setImageReady(true)}
            />
          ) : null}

          {offer && (
            <div
              className="absolute top-2 right-2 text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full font-black text-[8px] md:text-[10px] shadow-lg flex items-center gap-1 z-10"
              style={{ backgroundColor: secondaryColor }}
            >
              <Zap size={8} fill="currentColor" className="md:w-[10px] md:h-[10px]" /> {offer.discount}%
            </div>
          )}

          <div className="absolute inset-0 bg-black/5 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl">
              <Eye size={12} className="sm:w-[14px] sm:h-[14px] md:w-4 md:h-4" />
            </div>
          </div>

          <button
            type="button"
            aria-label="معاينة الصورة"
            onClick={openImagePreview}
            className="absolute inset-0"
            style={{ background: 'transparent' }}
          />

          <button
            type="button"
            aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            onClick={toggleFav}
            className={`absolute top-2 left-2 p-1.5 sm:p-2 md:p-2.5 transition-all z-10 shadow-sm ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-slate-900'
            } rounded-full`}
          >
            <Heart size={11} className="sm:w-3 sm:h-3 md:w-[14px] md:h-[14px]" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          {showStock && (
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full font-black text-[9px] md:text-[10px] shadow-lg ${stockCls}`}>
              {stockLabel}
            </div>
          )}
        </div>

      <div
        className={`${
          isList || isCardless
            ? 'flex-1 flex flex-col text-right'
            : `p-2 md:p-4 flex flex-col flex-1 text-right ${isMinimal ? 'items-end' : ''}`
        }`}
      >
        <h4
          className={`font-black mb-2 line-clamp-2 leading-tight text-slate-800 ${
            isBold ? 'text-base md:text-xl' : 'text-xs md:text-base'
          }`}
        >
          {product.name}
        </h4>

        {descriptionLine ? (
          <p className="-mt-1 mb-2 text-[10px] md:text-[11px] font-bold text-slate-500 line-clamp-2">
            {descriptionLine}
          </p>
        ) : null}

        <div className="mt-auto w-full">
          {showPrice && (
            <div
              className={`flex items-center justify-between flex-row-reverse mb-2 md:mb-3 ${isMinimal ? 'flex-col items-end gap-1' : ''}`}
            >
              <div className="text-right">
                {offer && <p className="text-slate-300 line-through text-[8px] md:text-[10px] font-bold">ج.م {product.price}</p>}
                <span
                  className={`font-black tracking-tighter ${isBold ? 'text-base md:text-2xl' : 'text-sm md:text-xl'}`}
                  style={{ color: offer ? secondaryColor : primaryColor }}
                >
                  {isFashion && typeof fashionMinPrice === 'number' ? `يبدأ من ج.م ${fashionMinPrice}` : `ج.م ${currentPrice}`}
                </span>
              </div>
            </div>
          )}

          {showPrice && isFashion && fashionHasDifferentSizePrices && fashionSizePriceRowsAfterDiscount.length > 0 && (
            <div className="w-full mb-2 md:mb-3">
              <div className="flex flex-wrap justify-end gap-2">
                {fashionSizePriceRowsAfterDiscount.slice(0, 6).map((r) => (
                  <div
                    key={r.label}
                    className="px-2 py-1 rounded-full bg-slate-50 border border-slate-100 text-[9px] md:text-[10px] font-black text-slate-700"
                  >
                    {r.label} • {r.price}
                  </div>
                ))}
                {fashionSizePriceRowsAfterDiscount.length > 6 ? (
                  <div className="px-2 py-1 rounded-full bg-slate-50 border border-slate-100 text-[9px] md:text-[10px] font-black text-slate-700">
                    +{fashionSizePriceRowsAfterDiscount.length - 6}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {(showAddToCart || showReserve) && (
            <div className="flex gap-1.5 md:gap-2">
              {showAddToCart && (
                <button
                  type="button"
                  aria-label={isAdded ? "تمت الإضافة للسلة" : "إضافة للسلة"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(product, currentPrice);
                  }}
                  className={`flex-1 py-2 md:py-3 flex items-center justify-center gap-1.5 md:gap-2 transition-all active:scale-90 text-white ${
                    isBold ? 'rounded-xl md:rounded-[1.2rem]' : isModern ? 'rounded-lg md:rounded-xl' : 'rounded-none'
                  } ${buttonShape} ${buttonPresetCls} ${isAdded ? 'bg-green-600' : ''} shadow-md`}
                  style={isAdded || !usePrimarySolidColor ? undefined : { backgroundColor: primaryColor }}
                >
                  {isAdded ? <Check size={11} className="sm:w-3 sm:h-3" /> : <Plus size={11} className="sm:w-3 sm:h-3" />}
                  <span className="text-[9px] md:text-[11px] font-black uppercase">{isAdded ? 'تم' : 'للسلة'}</span>
                </button>
              )}
              {showReserve && (
                <button
                  type="button"
                  aria-label="حجز المنتج"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReserve({ ...product, price: currentPrice });
                  }}
                  className={`flex-1 py-2 md:py-3 ${reserveTextClass} flex items-center justify-center gap-1.5 md:gap-2 font-black text-[9px] md:text-[11px] uppercase transition-all active:scale-95 shadow-md ${
                    isBold ? 'rounded-xl md:rounded-[1.2rem]' : isModern ? 'rounded-lg md:rounded-xl' : 'rounded-none'
                  } ${buttonShape} ${buttonPadding} ${buttonPresetCls}`}
                  style={usePrimarySolidColor ? { backgroundColor: primaryColor } : undefined}
                >
                  <CalendarCheck size={11} className="sm:w-3 sm:h-3" /> حجز
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      </Wrapper>

      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent dir="rtl" className="overflow-hidden">
          <DialogHeader>
            <DialogTitle>صورة المنتج</DialogTitle>
          </DialogHeader>

          <div className="p-4 bg-slate-50">
            <img
              src={String(product.imageUrl || (product as any).image_url || '')}
              alt=""
              className="w-full max-h-[75vh] object-contain rounded-2xl bg-white"
              loading="lazy"
              decoding="async"
            />
            <div className="mt-4 flex items-center justify-between flex-row-reverse gap-3">
              <button
                type="button"
                onClick={() => {
                  setImagePreviewOpen(false);
                  goToProduct();
                }}
                className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm"
              >
                فتح صفحة المنتج
              </button>
              <button
                type="button"
                onClick={() => setImagePreviewOpen(false)}
                className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-900 font-black text-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default ProductCard;
