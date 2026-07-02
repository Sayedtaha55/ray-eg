import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image-utils';

interface OfferCardProps {
  offer: any;
  idx: number;
  navigate: (url: string) => void;
  setSelectedItem?: (item: any) => void;
  playSound: () => void | Promise<void>;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, idx, navigate, playSound }) => {
  const { t } = useTranslation();
  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const handleNavigate = () => {
    const productId = String(offer.productId || offer.id || '').trim();
    const shopSlug = String(offer.shopSlug || '').trim();
    if (productId && shopSlug) {
      navigate(`/shop/${shopSlug}/product/${productId}?from=offers`);
      return;
    }
    navigate(`/product/${productId || offer.id}`);
  };

  const handleAddToCart = () => {
    playSound();
    const event = new CustomEvent('add-to-cart', {
      detail: {
        ...offer,
        id: offer.productId || offer.id,
        productId: offer.productId,
        shopId: offer.shopId,
        shopName: offer.shopName,
        name: offer.title,
        price: offer.newPrice,
        quantity: 1,
        __skipSound: true,
      }
    });
    window.dispatchEvent(event);
  };

  const discountValue = Number(offer.discount || 0);
  const originalPrice = Number(offer.oldPrice || 0);
  const currentPrice = Number(offer.newPrice || 0);
  const hasDiscount = discountValue > 0;
  const hasPrice = currentPrice > 0;

  return (
    <div
      onClick={handleNavigate}
      className={`group relative bg-white rounded-[2rem] md:rounded-[3rem] border-2 border-slate-100 hover:border-purple-300 cursor-pointer overflow-hidden ${!prefersReducedMotion ? 'transition-all duration-300 hover:shadow-[0_40px_80px_-20px_rgba(189,0,255,0.15)] hover:scale-[1.02]' : ''
        }`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] rounded-t-[2rem] md:rounded-t-[3rem] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <img
          loading={idx === 0 ? 'eager' : 'lazy'}
          fetchPriority={idx === 0 ? 'high' : 'auto'}
          decoding="async"
          src={getOptimizedImageUrl(offer.imageUrl, 'md')}
          alt={offer.title}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== offer.imageUrl) {
              img.src = offer.imageUrl;
            }
          }}
          className={`w-full h-full object-cover ${!prefersReducedMotion ? 'group-hover:scale-110 transition-transform duration-[2s]' : ''}`}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 md:top-5 md:left-5 flex flex-col gap-2">
          {hasDiscount && (
            <div className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-[#BD00FF] to-purple-700 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-xl shadow-purple-500/40 border border-purple-400">
              -{discountValue}%
            </div>
          )}
          {hasPrice && originalPrice > currentPrice && (
            <div className="px-2.5 py-1 md:px-3 md:py-1.5 bg-white/95 backdrop-blur-sm text-slate-700 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black shadow-lg border border-slate-200">
              وفر {(originalPrice - currentPrice).toLocaleString('ar-EG')} جنيه
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 md:top-5 md:right-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button
            type="button"
            aria-label="إضافة للمفضلة"
            onClick={(event) => { event.stopPropagation(); }}
            className="w-8 h-8 md:w-10 md:h-10 bg-white/95 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center hover:bg-white transition-all shadow-lg border border-slate-200 hover:scale-110"
          >
            <Heart className="w-4 h-4 md:w-5 md:h-5 text-slate-700" />
          </button>
          <button
            type="button"
            aria-label="مشاركة"
            onClick={(event) => { event.stopPropagation(); }}
            className="w-8 h-8 md:w-10 md:h-10 bg-white/95 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center hover:bg-white transition-all shadow-lg border border-slate-200 hover:scale-110"
          >
            <Share2 className="w-4 h-4 md:w-5 md:h-5 text-slate-700" />
          </button>
        </div>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border border-slate-200">
            <Eye size={24} className="text-slate-900 md:w-8 md:h-8" />
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            type="button"
            aria-label={t('home.topSelling.addToCart')}
            onClick={(event) => { event.stopPropagation(); handleAddToCart(); }}
            className="w-full py-3 md:py-4 bg-gradient-to-r from-[#BD00FF] to-purple-700 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 hover:from-purple-700 hover:to-[#BD00FF] transition-all shadow-xl hover:shadow-purple-500/50 hover:scale-105"
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            {t('home.topSelling.addToCart', 'أضف للسلة')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-5 text-right">
        <h3 className="text-sm md:text-xl lg:text-2xl font-black mb-3 md:mb-4 line-clamp-2 leading-tight text-slate-900 group-hover:text-purple-700 transition-colors">
          {offer.title}
        </h3>

        {/* Price Section */}
        <div className="flex items-end justify-between gap-2 mb-3">
          <div className="text-left space-y-1">
            {hasPrice && originalPrice > currentPrice && (
              <p className="text-slate-400 line-through text-[10px] md:text-xs font-bold">
                {t('home.topSelling.currency')} {originalPrice.toLocaleString('ar-EG')}
              </p>
            )}
            {hasPrice ? (
              <p className="text-lg md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[#BD00FF] to-purple-700 bg-clip-text text-transparent tracking-tighter">
                {t('home.topSelling.currency')} {currentPrice.toLocaleString('ar-EG')}
              </p>
            ) : (
              <p className="text-xs md:text-sm text-purple-600 font-black">{t('home.stores.specialOffer', 'عرض خاص')}</p>
            )}
          </div>
        </div>

        {/* Shop Info */}
        {offer.shopName && (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] md:text-xs text-slate-600 font-bold truncate">{offer.shopName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(OfferCard);