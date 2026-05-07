'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Eye, CalendarCheck, ShoppingCart } from 'lucide-react';
import { isValidLocale, type Locale } from '@/i18n/config';
import { useT } from '@/i18n/useT';

export interface OfferCardModel {
  id: string;
  title?: string;
  name?: string;
  imageUrl?: string;
  image_url?: string;
  newPrice?: number;
  new_price?: number;
  oldPrice?: number;
  old_price?: number;
  discount?: number;
  shopName?: string;
  shop_name?: string;
  shopSlug?: string;
  shop_slug?: string;
  shopId?: string;
  productId?: string;
  product_id?: string;
}

function getNumber(v: unknown, fallback = 0) {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function OfferCard({ offer }: { offer: OfferCardModel }) {
  const pathname = usePathname();
  const localeSeg = pathname?.split('/')?.[1];
  const activeLocale: Locale = isValidLocale(localeSeg || '') ? (localeSeg as Locale) : 'ar';
  const prefix = `/${activeLocale}`;
  const t = useT();
  const router = useRouter();
  const title = String(offer.title || offer.name || '').trim();
  const imageUrl = String(offer.imageUrl || offer.image_url || '').trim();
  const newPrice = getNumber(offer.newPrice ?? offer.new_price, 0);
  const oldPrice = getNumber(offer.oldPrice ?? offer.old_price, 0);
  const shopName = String(offer.shopName || offer.shop_name || '').trim();
  const discount = getNumber(offer.discount, 0) || (oldPrice > 0 && newPrice > 0 && oldPrice > newPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0);

  const productId = String(offer.productId || offer.product_id || offer.id || '').trim();
  const shopSlug = String(offer.shopSlug || offer.shop_slug || '').trim();

  const handleNavigate = () => {
    if (productId && shopSlug) {
      router.push(`${prefix}/shop/${shopSlug}/product/${productId}?from=offers`);
      return;
    }
    router.push(`${prefix}/product/${productId || offer.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div
      className="group bg-white p-3 md:p-5 rounded-[2rem] md:rounded-[3rem] border border-slate-50 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500"
    >
      <div
        onClick={handleNavigate}
        className="relative aspect-[4/5] rounded-[1.8rem] md:rounded-[2.5rem] overflow-hidden mb-4 md:mb-6 bg-slate-50 cursor-pointer"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-[2s]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <ShoppingCart className="w-10 h-10" />
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3 md:top-5 md:left-5 bg-[#BD00FF] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-xl shadow-purple-500/30">-{discount}%</div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Eye size={24} className="text-white drop-shadow-lg sm:w-8 sm:h-8" />
        </div>
      </div>
      <div className="px-1 md:px-3 text-right">
        <h3 className="text-sm md:text-xl lg:text-2xl font-black mb-3 md:mb-6 line-clamp-1 leading-tight">{title || t('common.offer', 'Offer')}</h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:flex-row-reverse">
          <div className="text-right">
            {oldPrice > 0 && newPrice > 0 && oldPrice > newPrice && (
              <p className="text-slate-300 line-through text-[9px] md:text-xs font-bold">{t('common.currency', 'EGP')} {oldPrice.toLocaleString(activeLocale === 'ar' ? 'ar-EG' : 'en-US')}</p>
            )}
            <p className="text-base md:text-2xl lg:text-3xl font-black text-[#BD00FF] tracking-tighter">{t('common.currency', 'EGP')} {newPrice.toLocaleString(activeLocale === 'ar' ? 'ar-EG' : 'en-US')}</p>
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <button
              type="button"
              aria-label={t('offers.booking', 'Book')}
              className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-[#00E5FF] rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-md"
            >
              <CalendarCheck size={16} className="md:w-5 md:h-5" />
            </button>
            <button
              type="button"
              aria-label={t('offers.addToCart', 'Add to Cart')}
              onClick={handleAddToCart}
              className="w-8 h-8 md:w-10 md:h-12 bg-slate-900 text-white rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-md"
            >
              <ShoppingCart size={18} className="md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
