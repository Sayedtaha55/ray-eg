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

const normalizeColor = (value: unknown, fallback: string) => {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (raw.startsWith('#')) return raw;
  if (/^[0-9a-fA-F]{3,8}$/.test(raw)) return `#${raw}`;
  return raw;
};

const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?.*)?$/i.test(String(url || '').trim());

const StorefrontShowcaseSection: React.FC<StorefrontShowcaseSectionProps> = ({ shops, offers, shopProductsById = {}, loading = false, onOpenShop }) => {
  const slidersRef = useRef<Record<string, HTMLDivElement | null>>({});

  const approvedShops = useMemo(
    () =>
      (Array.isArray(shops) ? shops : []).filter((s) => {
        const status = String((s as any)?.status || '').trim().toLowerCase();
        if (!status) return Boolean((s as any)?.id);
        return status === 'approved';
      }),
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
          const logo = String((shop as any)?.logoUrl || (shop as any)?.logo_url || '').trim();
          const design = (shop as any)?.pageDesign || (shop as any)?.page_design || {};
          const primaryColor = normalizeColor((design as any)?.primaryColor, '#0f172a');
          const secondaryColor = normalizeColor((design as any)?.secondaryColor, '#334155');
          const pageBgColor = normalizeColor((design as any)?.pageBackgroundColor || (design as any)?.backgroundColor, '#f8fafc');
          const backgroundImageUrl = String((design as any)?.backgroundImageUrl || '').trim();
          const bannerUrl = String((design as any)?.bannerUrl || '').trim();
          const bannerPosterUrl = String((design as any)?.bannerPosterUrl || '').trim();
          const previewBannerUrl = isVideoUrl(bannerUrl) ? (bannerPosterUrl || '') : bannerUrl;
          const bannerPosX = Number((design as any)?.bannerPosX);
          const bannerPosY = Number((design as any)?.bannerPosY);
          const bannerPosition = `${Number.isFinite(bannerPosX) ? bannerPosX : 50}% ${Number.isFinite(bannerPosY) ? bannerPosY : 50}%`;
          const headerTextColor = normalizeColor((design as any)?.headerTextColor, '#0f172a');
          const shopProducts = Array.isArray(shopProductsById[String(shop.id)]) ? shopProductsById[String(shop.id)] : [];
          const hasProducts = shopProducts.length > 0;

          return (
            <article key={shop.id} className="rounded-[2rem] border border-slate-100 bg-white p-4 md:p-6 shadow-sm">
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
                      <img
                        src={logo}
                        alt={shop.name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-slate-200 shadow-sm"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <Store size={18} />
                      </div>
                    )}
                    <div className="text-right">
                      <h3 className="text-slate-900 font-black text-sm md:text-base line-clamp-1">{shop.name}</h3>
                      <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{shop.city} - {shop.governorate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => onOpenShop(shop)}
                    className="w-full rounded-2xl p-4 text-right mb-3 border border-slate-200 hover:opacity-95 transition-opacity overflow-hidden relative"
                    style={{
                      backgroundColor: pageBgColor,
                      backgroundImage: backgroundImageUrl ? `url("${backgroundImageUrl}")` : undefined,
                      backgroundSize: backgroundImageUrl ? 'cover' : undefined,
                      backgroundPosition: backgroundImageUrl ? 'center' : undefined,
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}cc, ${secondaryColor}cc)` }}
                    />
                    {previewBannerUrl ? (
                      <div
                        className="absolute left-0 right-0 top-0 h-14 md:h-16 opacity-70 pointer-events-none"
                        style={{
                          backgroundImage: `url("${previewBannerUrl}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: bannerPosition,
                        }}
                      />
                    ) : null}
                    <p className="relative text-white font-black text-sm">معاينة تصميم المتجر</p>
                    <p className="relative text-white/85 text-xs mt-1">الألوان + الخلفية + البنر من إعدادات المتجر الحقيقية</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenShop(shop)}
                    className="w-full mb-3 px-4 py-2.5 rounded-xl text-right text-xs md:text-sm font-black border border-slate-200 bg-white/90 hover:bg-white transition-colors"
                    style={{
                      color: headerTextColor,
                      boxShadow: `inset 0 0 0 1px ${primaryColor}22`,
                      background: `linear-gradient(90deg, ${primaryColor}12, ${secondaryColor}10)`,
                    }}
                  >
                    زر الترويسة — الكلام اللي بيكون فوق البنر
                  </button>

                  <div className="flex items-center justify-start mb-3">
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
