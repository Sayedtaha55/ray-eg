import React from 'react';
import { ChevronLeft, ChevronRight, FileText, Store } from 'lucide-react';
import { Offer, Product, Shop } from '@/types';
import { coerceBoolean } from '../ShopProfile/utils';
import SmartImage from '@/components/common/ui/SmartImage';

interface StorefrontShopCardProps {
  shop: Shop;
  shopOffers: Offer[];
  shopProducts: Product[];
  onOpenShop: (shop: Shop) => void;
}

const normalizeColor = (value: unknown, fallback: string) => {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (raw.startsWith('#')) return raw;
  if (/^[0-9a-fA-F]{3,8}$/.test(raw)) return `#${raw}`;
  return raw;
};

const StorefrontShopCard: React.FC<StorefrontShopCardProps> = ({ shop, shopOffers, shopProducts, onOpenShop }) => {
  const sliderRef = React.useRef<HTMLDivElement | null>(null);
  const logo = String((shop as any)?.logoUrl || (shop as any)?.logo_url || '').trim();
  const design = (shop as any)?.pageDesign || (shop as any)?.page_design || {};
  const elementsVisibility = (((design as any)?.elementsVisibility || {}) as Record<string, any>) || {};

  const isVisible = (key: string, fallback: boolean = true) => {
    if (!elementsVisibility || typeof elementsVisibility !== 'object') return fallback;
    if (!(key in elementsVisibility)) return fallback;
    return coerceBoolean((elementsVisibility as any)[key], fallback);
  };

  const showPrice = isVisible('productCardPrice', true);
  const primaryColor = normalizeColor((design as any)?.primaryColor, '#0f172a');
  const secondaryColor = normalizeColor((design as any)?.secondaryColor, '#334155');

  const hasProducts = shopProducts.length > 0;
  const isPharmacy = String((shop as any)?.category || '').trim().toUpperCase() === 'HEALTH';
  const whatsappRaw = String((shop as any)?.layoutConfig?.whatsapp || '').trim() || String((shop as any)?.phone || '').trim();
  const whatsappDigits = whatsappRaw ? whatsappRaw.replace(/[^\d]/g, '') : '';

  const prescriptionHref = React.useMemo(() => {
    if (!whatsappDigits) return '';
    const base = `https://wa.me/${whatsappDigits}`;
    try {
      const u = new URL(base);
      u.searchParams.set('text', `مرحبا ${shop?.name || ''}، عايز أضيف روشتة`);
      return u.toString();
    } catch {
      return base;
    }
  }, [whatsappDigits, shop?.name]);

  return (
    <article className="rounded-[2rem] border border-slate-100 bg-white p-4 md:p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="flex items-center justify-between flex-row-reverse">
          <button
            type="button"
            onClick={() => onOpenShop(shop)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs md:text-sm hover:bg-slate-800 transition-colors"
          >
            عرض المزيد
          </button>

          <div className="flex items-center gap-3 flex-row-reverse">
            {logo ? (
              <SmartImage
                src={logo}
                alt={shop.name}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-200 shadow-sm"
                imgClassName="object-cover"
                optimizeVariant="thumb"
              />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <Store size={18} />
              </div>
            )}
            <div className="text-right">
              <div className="flex items-center gap-2">
                <h3 className="text-slate-900 font-black text-sm md:text-base line-clamp-1">{shop.name}</h3>
                <button
                  type="button"
                  onClick={() => onOpenShop(shop)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-black border border-slate-200 bg-white/80 hover:bg-white transition-colors text-slate-600"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${primaryColor}22`,
                    background: `linear-gradient(90deg, ${primaryColor}12, ${secondaryColor}10)`,
                  }}
                >
                  زيارة المحل
                </button>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{shop.city} - {shop.governorate}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-start mb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center"
                onClick={() => sliderRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                aria-label="يمين"
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center"
                onClick={() => sliderRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                aria-label="يسار"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-3 overflow-x-auto no-scrollbar pb-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {hasProducts ? shopProducts.slice(0, 4).map((product: any) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onOpenShop(shop)}
                className="shrink-0 w-[160px] md:w-[190px] text-right rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="aspect-[4/3] bg-slate-100">
                  {String(product?.imageUrl || '').trim() ? (
                    <SmartImage
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full"
                      imgClassName="object-cover"
                      optimizeVariant="md"
                    />
                  ) : null}
                </div>
                <div className="p-3">
                  <p className="font-black text-xs text-slate-900 line-clamp-1">{product.name}</p>
                  {showPrice && Number(product.price || 0) > 0 ? (
                    <p className="text-[11px] text-cyan-600 font-black mt-1">ج.م {Number(product.price).toLocaleString('ar-EG')}</p>
                  ) : null}
                </div>
              </button>
            )) : isPharmacy ? (
              prescriptionHref ? (
                <a
                  href={prescriptionHref}
                  key={`${shop.id}-rx`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 w-[160px] md:w-[190px] text-right rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors flex flex-col items-center justify-center gap-2"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <FileText size={32} className="text-slate-300" />
                  <p className="text-slate-700 text-xs font-black text-center">إرسال روشتة</p>
                  <p className="text-slate-400 text-[10px] font-bold text-center">عبر واتساب</p>
                </a>
              ) : (
                <button
                  type="button"
                  key={`${shop.id}-rx`}
                  onClick={() => onOpenShop(shop)}
                  className="shrink-0 w-[160px] md:w-[190px] text-right rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors flex flex-col items-center justify-center gap-2"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <FileText size={32} className="text-slate-300" />
                  <p className="text-slate-700 text-xs font-black text-center">إرسال روشتة</p>
                </button>
              )
            ) : shopOffers.length ? shopOffers.slice(0, 4).map((offer) => {
              const hasPrice = Number(offer.newPrice || 0) > 0;
              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => onOpenShop(shop)}
                  className="shrink-0 w-[160px] md:w-[190px] text-right rounded-2xl border border-slate-100 bg-white overflow-hidden hover:shadow-md transition-shadow"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="aspect-[4/3] bg-slate-100 relative">
                    {offer.imageUrl ? (
                      <SmartImage
                        src={offer.imageUrl}
                        alt={offer.title}
                        className="w-full h-full"
                        imgClassName="object-cover"
                        optimizeVariant="md"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Store size={32} />
                      </div>
                    )}
                    {hasPrice && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-white/90 text-[10px] font-black text-slate-700 shadow-sm">
                        ج.م {Number(offer.newPrice).toLocaleString('ar-EG')}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-black text-xs text-slate-900 line-clamp-1">{offer.title}</p>
                    {hasPrice ? null : <p className="text-[10px] text-slate-400 mt-1">عرض خاص</p>}
                  </div>
                </button>
              );
            }) : (
              <button
                type="button"
                onClick={() => onOpenShop(shop)}
                className="shrink-0 w-[160px] md:w-[190px] text-right rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors flex flex-col items-center justify-center gap-2"
                style={{ scrollSnapAlign: 'start' }}
              >
                <Store size={32} className="text-slate-300" />
                <p className="text-slate-400 text-xs font-bold text-center">تصفح المتجر</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default React.memo(StorefrontShopCard);
