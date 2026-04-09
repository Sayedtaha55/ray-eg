import React, { useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { Offer, Product, Shop } from '@/types';

interface StorefrontShowcaseSectionProps {
  shops: Shop[];
  offers: Offer[];
  shopProductsById?: Record<string, Product[]>;
  loading?: boolean;
  onOpenShop: (shop: Shop) => void;
}

const StorefrontShowcaseSection: React.FC<StorefrontShowcaseSectionProps> = ({ shops, offers, shopProductsById = {}, loading = false, onOpenShop }) => {
  const slidersRef = useRef<Record<string, HTMLDivElement | null>>({});

  const approvedShops = useMemo(
    () => (Array.isArray(shops) ? shops : []).filter((s) => String((s as any)?.status || '').toLowerCase() === 'approved'),
    [shops],
  );

  const offersByShopId = useMemo(() => {
    const map = new Map<string, Offer[]>();
    for (const offer of Array.isArray(offers) ? offers : []) {
      const sid = String((offer as any)?.shopId || '').trim();
      if (!sid) continue;
      if (!map.has(sid)) map.set(sid, []);
      if ((map.get(sid) || []).length < 12) {
        map.get(sid)!.push(offer);
      }
    }
    return map;
  }, [offers]);

  if (loading) {
    return (
      <section className="mb-16 md:mb-24">
        <div className="h-8 w-56 bg-slate-100 rounded-xl animate-pulse mb-8" />
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-[2rem] border border-slate-100 bg-white p-4 md:p-6">
              <div className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!approvedShops.length) return null;

  return (
    <section className="mb-16 md:mb-24" dir="rtl">
      <div className="flex items-center justify-between flex-row-reverse mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">المتاجر المتاحة الآن</h2>
          <p className="text-slate-500 font-bold text-sm mt-1">صورة المتجر + منتجات مختارة، وبضغطة واحدة تفتح المتجر كامل.</p>
        </div>
      </div>

      <div className="space-y-5 md:space-y-7">
        {approvedShops.slice(0, 8).map((shop) => {
          const shopOffers = offersByShopId.get(String(shop.id)) || [];
          const banner = String((shop as any)?.pageDesign?.bannerUrl || '').trim() || String((shop as any)?.logoUrl || '').trim();
          const logo = String((shop as any)?.logoUrl || '').trim();
          const shopProducts = Array.isArray(shopProductsById[String(shop.id)]) ? shopProductsById[String(shop.id)] : [];
          const hasProducts = shopProducts.length > 0;

          return (
            <article key={shop.id} className="rounded-[2rem] border border-slate-100 bg-white p-4 md:p-6 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-stretch">
                <div className="lg:col-span-4">
                  <button
                    type="button"
                    onClick={() => onOpenShop(shop)}
                    className="relative w-full h-full min-h-[180px] md:min-h-[220px] rounded-2xl overflow-hidden group"
                  >
                    {banner ? (
                      <img src={banner} alt={shop.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400"><Store size={32} /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
                    <div className="absolute bottom-4 right-4 left-4 text-right">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        {logo ? <img src={logo} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/80 shadow-md" loading="lazy" /> : null}
                        <h3 className="text-white font-black text-base md:text-lg line-clamp-1">{shop.name}</h3>
                      </div>
                      <p className="text-white/80 text-xs mt-1 line-clamp-1">{shop.city} - {shop.governorate}</p>
                    </div>
                  </button>
                </div>

                <div className="lg:col-span-8 flex flex-col">
                  <div className="flex items-center justify-between flex-row-reverse mb-3">
                    <button
                      type="button"
                      onClick={() => onOpenShop(shop)}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs md:text-sm hover:bg-slate-800 transition-colors"
                    >
                      عرض المزيد
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center"
                        onClick={() => slidersRef.current[String(shop.id)]?.scrollBy({ left: 320, behavior: 'smooth' })}
                        aria-label="يمين"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center"
                        onClick={() => slidersRef.current[String(shop.id)]?.scrollBy({ left: -320, behavior: 'smooth' })}
                        aria-label="يسار"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={(el) => {
                      slidersRef.current[String(shop.id)] = el;
                    }}
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
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : null}
                        </div>
                        <div className="p-3">
                          <p className="font-black text-xs text-slate-900 line-clamp-1">{product.name}</p>
                          <p className="text-[11px] text-cyan-600 font-black mt-1">ج.م {Number(product.price || 0).toLocaleString('ar-EG')}</p>
                        </div>
                      </button>
                    )) : shopOffers.length ? shopOffers.slice(0, 4).map((offer) => (
                      <button
                        key={offer.id}
                        type="button"
                        onClick={() => onOpenShop(shop)}
                        className="shrink-0 w-[160px] md:w-[190px] text-right rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <div className="aspect-[4/3] bg-slate-100">
                          {offer.imageUrl ? (
                            <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : null}
                        </div>
                        <div className="p-3">
                          <p className="font-black text-xs text-slate-900 line-clamp-1">{offer.title}</p>
                          <p className="text-[11px] text-cyan-600 font-black mt-1">ج.م {Number(offer.newPrice || 0).toLocaleString('ar-EG')}</p>
                        </div>
                      </button>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-slate-400 text-sm w-full">
                        سيتم إضافة منتجات المتجر هنا قريبًا
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(StorefrontShowcaseSection);
