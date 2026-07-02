import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, FileText, Store, ExternalLink, TrendingUp, Verified } from 'lucide-react';
import { Offer, Product, Shop } from '@/types';
import { coerceBoolean } from '../ShopProfile/utils';

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
  const { t } = useTranslation();
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
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div className="h-10 w-64 bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl animate-pulse" />
          <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-[2rem] border border-slate-200 bg-white p-5 md:p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-slate-100 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-40 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-4 w-32 bg-slate-50 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="h-52 bg-slate-50 rounded-3xl animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!approvedShops.length) return null;

  return (
    <section className="mb-16 md:mb-24">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 md:mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 bg-gradient-to-b from-cyan-500 to-purple-600 rounded-full" />
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{t('home.stores.title')}</h2>
            <p className="text-xs md:text-sm text-slate-500 font-bold mt-1">{t('home.stores.subtitle', 'اكتشف أفضل المتاجر')}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-600">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-bold">{approvedShops.length} {t('home.stores.count', 'متجر')}</span>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        {approvedShops.slice(0, 8).map((shop) => {
          const shopOffers = offersByShopId.get(String(shop.id)) || [];
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
          const isPharmacy = String((shop as any)?.category || '').trim().toUpperCase() === 'HEALTH';
          const whatsappRaw = String((shop as any)?.layoutConfig?.whatsapp || '').trim() || String((shop as any)?.phone || '').trim();
          const whatsappDigits = whatsappRaw ? whatsappRaw.replace(/[^\d]/g, '') : '';
          const prescriptionHref = (() => {
            if (!whatsappDigits) return '';
            const base = `https://wa.me/${whatsappDigits}`;
            try {
              const u = new URL(base);
              u.searchParams.set('text', t('home.stores.whatsappPrescription', { shopName: shop?.name || '' }));
              return u.toString();
            } catch {
              return base;
            }
          })();

          return (
            <article key={shop.id} className="group rounded-[2rem] border border-slate-200 bg-white p-5 md:p-8 shadow-sm hover:shadow-2xl hover:border-slate-300 transition-all duration-300">
              {/* Shop Header */}
              <div className="flex items-center justify-between flex-row-reverse mb-5">
                <div className="flex items-center gap-3 flex-row-reverse">
                  {logo ? (
                    <div className="relative">
                      <img
                        src={logo}
                        alt={shop.name}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-slate-200 shadow-md"
                        loading="lazy"
                      />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <Verified className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 border-2 border-slate-200">
                      <Store size={28} />
                    </div>
                  )}
                  <div className="text-right">
                    <h3 className="text-base md:text-xl font-black text-slate-900 line-clamp-1 group-hover:text-cyan-700 transition-colors">{shop.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] md:text-xs text-slate-500 font-bold">{shop.city} - {shop.governorate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenShop(shop)}
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs md:text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {t('home.stores.showMore')}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenShop(shop)}
                    className="sm:hidden w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all"
                    aria-label={t('home.stores.showMore')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Products/Offers Slider */}
              <div className="flex flex-col">
                {/* Navigation Buttons */}
                <div className="flex items-center justify-start mb-4">
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-slate-300 hover:shadow-sm transition-all"
                      onClick={() => slidersRef.current[String(shop.id)]?.scrollBy({ left: -320, behavior: 'smooth' })}
                      aria-label={t('home.stores.scrollRight')}
                    >
                      <ChevronRight size={18} className="text-slate-700" />
                    </button>
                    <button
                      type="button"
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-slate-300 hover:shadow-sm transition-all"
                      onClick={() => slidersRef.current[String(shop.id)]?.scrollBy({ left: 320, behavior: 'smooth' })}
                      aria-label={t('home.stores.scrollLeft')}
                    >
                      <ChevronLeft size={18} className="text-slate-700" />
                    </button>
                  </div>
                </div>

                {/* Slider */}
                <div
                  ref={(el) => {
                    slidersRef.current[String(shop.id)] = el;
                  }}
                  className="flex gap-3.5 overflow-x-auto no-scrollbar pb-3"
                  style={{ scrollSnapType: 'x mandatory' }}
                >
                  {hasProducts ? shopProducts.slice(0, 4).map((product: any) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => onOpenShop(shop)}
                      className="shrink-0 w-[160px] md:w-[190px] text-right rounded-3xl border-2 border-slate-100 bg-gradient-to-b from-white to-slate-50 overflow-hidden hover:border-slate-200 hover:shadow-xl transition-all"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                        {String(product?.imageUrl || '').trim() ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Store size={40} />
                          </div>
                        )}
                        {showPrice && Number(product.price || 0) > 0 && (
                          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-white/95 text-[10px] font-black text-slate-700 shadow-lg border border-slate-200">
                            {t('home.topSelling.currency')} {Number(product.price).toLocaleString('ar-EG')}
                          </div>
                        )}
                      </div>
                      <div className="p-3.5">
                        <p className="font-black text-xs text-slate-900 line-clamp-2 leading-tight">{product.name}</p>
                      </div>
                    </button>
                  )) : isPharmacy ? (
                    prescriptionHref ? (
                      <a
                        href={prescriptionHref}
                        key={`${shop.id}-rx`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 w-[160px] md:w-[190px] text-right rounded-3xl border-2 border-dashed border-slate-300 bg-gradient-to-b from-white to-slate-50 p-6 hover:border-slate-400 transition-all flex flex-col items-center justify-center gap-3"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
                          <FileText size={32} className="text-cyan-600" />
                        </div>
                        <p className="text-slate-800 text-sm font-black text-center leading-tight">{t('home.stores.sendPrescription')}</p>
                        <p className="text-slate-500 text-[10px] font-bold text-center">{t('home.stores.viaWhatsApp')}</p>
                      </a>
                    ) : (
                      <button
                        type="button"
                        key={`${shop.id}-rx`}
                        onClick={() => onOpenShop(shop)}
                        className="shrink-0 w-[160px] md:w-[190px] text-right rounded-3xl border-2 border-dashed border-slate-300 bg-gradient-to-b from-white to-slate-50 p-6 hover:border-slate-400 transition-all flex flex-col items-center justify-center gap-3"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <FileText size={32} className="text-slate-500" />
                        </div>
                        <p className="text-slate-700 text-sm font-black text-center leading-tight">{t('home.stores.sendPrescription')}</p>
                      </button>
                    )
                  ) : shopOffers.length ? shopOffers.slice(0, 4).map((offer) => {
                    const hasPrice = Number(offer.newPrice || 0) > 0;
                    return (
                      <button
                        key={offer.id}
                        type="button"
                        onClick={() => onOpenShop(shop)}
                        className="shrink-0 w-[160px] md:w-[190px] text-right rounded-3xl border-2 border-slate-100 bg-white overflow-hidden hover:border-slate-200 hover:shadow-xl transition-all group/card"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                          {offer.imageUrl ? (
                            <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                              <Store size={40} />
                            </div>
                          )}
                          {hasPrice && (
                            <div className="absolute top-2 left-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white text-[10px] font-black shadow-xl border border-purple-500">
                              {t('home.topSelling.currency')} {Number(offer.newPrice).toLocaleString('ar-EG')}
                            </div>
                          )}
                        </div>
                        <div className="p-3.5">
                          <p className="font-black text-xs text-slate-900 line-clamp-2 leading-tight">{offer.title}</p>
                          {!hasPrice && <p className="text-[10px] text-purple-600 font-bold mt-1.5">{t('home.stores.specialOffer')}</p>}
                        </div>
                      </button>
                    );
                  }) : (
                    <button
                      type="button"
                      onClick={() => onOpenShop(shop)}
                      className="shrink-0 w-[160px] md:w-[190px] text-right rounded-3xl border-2 border-dashed border-slate-300 bg-gradient-to-b from-white to-slate-50 p-8 hover:border-slate-400 transition-all flex flex-col items-center justify-center gap-3"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <Store size={32} className="text-slate-500" />
                      </div>
                      <p className="text-slate-600 text-sm font-black text-center">{t('home.stores.browseStore')}</p>
                    </button>
                  )}
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