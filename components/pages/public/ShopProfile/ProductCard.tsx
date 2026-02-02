import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, Check, Eye, Heart, Plus, Zap } from 'lucide-react';
import { RayDB } from '@/constants';
import { Offer, Product, ShopDesign } from '@/types';
import { coerceBoolean } from './utils';

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
}: {
  product: Product;
  design: ShopDesign;
  offer?: Offer;
  onAdd: (p: Product, price: number) => void;
  isAdded: boolean;
  onReserve: (p: any) => void;
  disableMotion?: boolean;
}) {
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const favs = RayDB.getFavorites();
      return Array.isArray(favs) ? favs.includes(product.id) : false;
    } catch {
      return false;
    }
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
  const showAddToCart = isVisible('productCardAddToCart', true);
  const showReserve = isVisible('productCardReserve', true);

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

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const state = RayDB.toggleFavorite(product.id);
    setIsFavorite(state);
  };

  const currentPrice = offer ? offer.newPrice : product.price;

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

  const goToProduct = () => {
    const sid = String(slug || '').trim();
    if (sid) {
      const prefix = String(location?.pathname || '').startsWith('/shop/') ? '/shop' : '/s';
      navigate(`${prefix}/${sid}/product/${product.id}`);
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const Wrapper: any = disableMotion ? 'div' : MotionDiv;
  const motionProps = disableMotion ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  if (isCardless) {
    return (
      <Wrapper
        {...motionProps}
        className="group relative transition-all duration-500 overflow-hidden bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100"
      >
        <div onClick={goToProduct} className="relative overflow-hidden cursor-pointer aspect-[4/5] md:aspect-[3/4]">
          <img
            loading="lazy"
            decoding="async"
            src={product.imageUrl || (product as any).image_url}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1s]"
            alt={product.name}
          />

          {offer && (
            <div className="absolute top-3 left-3 bg-slate-900/80 text-white px-3 py-1 rounded-full font-black text-[10px] shadow-lg">
              Sale
            </div>
          )}

          <button
            onClick={toggleFav}
            className={`absolute top-3 right-3 p-2 md:p-2.5 transition-all z-10 shadow-sm ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-slate-900'
            } rounded-full`}
          >
            <Heart size={12} className="md:w-[14px] md:h-[14px]" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          {showStock && (
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full font-black text-[10px] shadow-lg ${stockCls}`}>
              {stockLabel}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 backdrop-blur-sm px-4 py-3">
            <p className="text-white font-black text-[11px] md:text-sm tracking-wide uppercase line-clamp-1 text-center">
              {product.name}
            </p>
            {showPrice && (
              <div className="mt-1 flex items-center justify-center gap-3">
                {offer ? <span className="text-white/70 line-through text-[10px] font-bold">ج.م {product.price}</span> : null}
                <span className="text-white font-black text-sm md:text-base">ج.م {currentPrice}</span>
              </div>
            )}
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
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
            : `aspect-square ${isBold ? 'rounded-[1.4rem] md:rounded-[2rem]' : isModern ? 'rounded-[1rem]' : 'rounded-none'}`
        }`}
      >
        <img
          loading="lazy"
          decoding="async"
          src={product.imageUrl || (product as any).image_url}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1s]"
          alt={product.name}
        />

        {offer && (
          <div className="absolute top-2 right-2 bg-[#BD00FF] text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-full font-black text-[8px] md:text-[10px] shadow-lg flex items-center gap-1 z-10">
            <Zap size={8} fill="currentColor" className="md:w-[10px] md:h-[10px]" /> {offer.discount}%
          </div>
        )}

        <div className="absolute inset-0 bg-black/5 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl">
            <Eye size={14} className="md:w-4 md:h-4" />
          </div>
        </div>

        <button
          onClick={toggleFav}
          className={`absolute top-2 left-2 p-2 md:p-2.5 transition-all z-10 shadow-sm ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-slate-900'
          } rounded-full`}
        >
          <Heart size={12} className="md:w-[14px] md:h-[14px]" fill={isFavorite ? 'currentColor' : 'none'} />
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

        <div className="mt-auto w-full">
          {showPrice && (
            <div
              className={`flex items-center justify-between flex-row-reverse mb-2 md:mb-3 ${isMinimal ? 'flex-col items-end gap-1' : ''}`}
            >
              <div className="text-right">
                {offer && <p className="text-slate-300 line-through text-[8px] md:text-[10px] font-bold">ج.م {product.price}</p>}
                <span
                  className={`font-black tracking-tighter ${isBold ? 'text-base md:text-2xl' : 'text-sm md:text-xl'}`}
                  style={{ color: offer ? '#BD00FF' : design.primaryColor }}
                >
                  ج.م {currentPrice}
                </span>
              </div>
            </div>
          )}

          {(showAddToCart || showReserve) && (
            <div className="flex gap-1.5 md:gap-2">
              {showAddToCart && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(product, currentPrice);
                  }}
                  className={`flex-1 py-2 md:py-3 flex items-center justify-center gap-1.5 md:gap-2 transition-all active:scale-90 ${
                    isAdded ? 'bg-green-500' : 'bg-slate-900'
                  } text-white ${
                    isBold ? 'rounded-xl md:rounded-[1.2rem]' : isModern ? 'rounded-lg md:rounded-xl' : 'rounded-none'
                  } shadow-md`}
                >
                  {isAdded ? <Check size={12} /> : <Plus size={12} />}
                  <span className="text-[9px] md:text-[11px] font-black uppercase">{isAdded ? 'تم' : 'للسلة'}</span>
                </button>
              )}
              {showReserve && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReserve({ ...product, price: currentPrice });
                  }}
                  className={`flex-1 py-2 md:py-3 ${reserveTextClass} flex items-center justify-center gap-1.5 md:gap-2 font-black text-[9px] md:text-[11px] uppercase transition-all active:scale-95 shadow-md ${
                    isBold ? 'rounded-xl md:rounded-[1.2rem]' : isModern ? 'rounded-lg md:rounded-xl' : 'rounded-none'
                  }`}
                  style={{ backgroundColor: design.primaryColor }}
                >
                  <CalendarCheck size={12} /> حجز
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
});

export default ProductCard;
