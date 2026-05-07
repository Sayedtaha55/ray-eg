'use client';

import { useRef, useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Store, FileText } from 'lucide-react';
import { isValidLocale, type Locale } from '@/i18n/config';
import { useT } from '@/i18n/useT';
import { clientFetch } from '@/lib/api/client';

interface Shop {
  id: string;
  name: string;
  slug: string;
  category: string;
  city?: string;
  governorate?: string;
  logoUrl?: string;
  status: string;
  phone?: string;
  layoutConfig?: { whatsapp?: string };
  pageDesign?: {
    primaryColor?: string;
    secondaryColor?: string;
    elementsVisibility?: Record<string, any>;
  };
}

interface Offer {
  id: string;
  title: string;
  newPrice: number;
  oldPrice?: number;
  imageUrl?: string;
  shopId: string;
  shopName?: string;
}

const fetcher = (url: string) => clientFetch(url);

function normalizeColor(value: unknown, fallback: string): string {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (raw.startsWith('#')) return raw;
  if (/^[0-9a-fA-F]{3,8}$/.test(raw)) return `#${raw}`;
  return raw;
}

function coerceBoolean(val: unknown, fallback = true): boolean {
  if (val === true || val === 'true') return true;
  if (val === false || val === 'false') return false;
  return fallback;
}

export default function StorefrontShowcase() {
  const pathname = usePathname();
  const localeSeg = pathname?.split('/')?.[1];
  const activeLocale: Locale = isValidLocale(localeSeg || '') ? (localeSeg as Locale) : 'ar';
  const prefix = `/${activeLocale}`;
  const dir = activeLocale === 'ar' ? 'rtl' : 'ltr';
  const t = useT();
  const router = useRouter();

  const { data: shopsData, error: shopsError } = useSWR('/api/v1/shops?status=approved&take=100', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const { data: offersData } = useSWR('/api/v1/offers?take=24', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const rawShops: Shop[] = Array.isArray(shopsData) ? shopsData : (shopsData as any)?.items || [];
  const offers: Offer[] = Array.isArray(offersData) ? offersData : [];

  const approvedShops = useMemo(
    () =>
      rawShops.filter((s) => {
        const status = String(s.status || '').trim().toLowerCase();
        if (!status) return Boolean(s.id);
        return status === 'approved';
      }),
    [rawShops],
  );

  const offersByShopId = useMemo(() => {
    const map = new Map<string, Offer[]>();
    for (const offer of offers) {
      const sid = String(offer.shopId || '').trim();
      if (!sid) continue;
      if (!map.has(sid)) map.set(sid, []);
      if ((map.get(sid)?.length || 0) < 12) {
        map.get(sid)!.push(offer);
      }
    }
    return map;
  }, [offers]);

  const slidersRef = useRef<Record<string, HTMLDivElement | null>>({});

  const loading = !shopsData && !shopsError;

  if (shopsError && !rawShops.length) {
    return (
      <section className="mb-16 md:mb-24">
        <p className="text-slate-400 text-center py-8">{t('home.shopsError', 'Failed to load shops — make sure the backend is running')}</p>
      </section>
    );
  }

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
    <section className="mb-16 md:mb-24" dir={dir}>
      <div className="flex items-center justify-between flex-row-reverse mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{t('home.shopsTitle', 'Available Shops Now')}</h2>
        </div>
      </div>

      <div className="space-y-5 md:space-y-7">
        {approvedShops.slice(0, 8).map((shop) => {
          const shopOffers = offersByShopId.get(String(shop.id)) || [];
          const logo = String(shop.logoUrl || '').trim();
          const design = shop.pageDesign || {};
          const elementsVisibility = design.elementsVisibility || {};
          const isVisible = (key: string, fallback: boolean = true) => {
            if (!elementsVisibility || typeof elementsVisibility !== 'object') return fallback;
            if (!(key in elementsVisibility)) return fallback;
            return coerceBoolean(elementsVisibility[key], fallback);
          };
          const showPrice = isVisible('productCardPrice', true);
          const primaryColor = normalizeColor(design.primaryColor, '#0f172a');
          const secondaryColor = normalizeColor(design.secondaryColor, '#334155');
          const isPharmacy = String(shop.category || '').trim().toUpperCase() === 'HEALTH';
          const whatsappRaw = String(shop.layoutConfig?.whatsapp || shop.phone || '').trim();
          const whatsappDigits = whatsappRaw ? whatsappRaw.replace(/[^\d]/g, '') : '';
          const prescriptionText = `${t('offers.whatsappGreeting', 'Hello, I want to add a prescription')} ${shop.name || ''}`.trim();
          const prescriptionHref = whatsappDigits ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(prescriptionText)}` : '';
          const currency = t('common.currency', 'EGP');
          const priceLocale = activeLocale === 'ar' ? 'ar-EG' : 'en-US';

          return (
            <article key={shop.id} className="rounded-[2rem] border border-slate-100 bg-white p-4 md:p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:gap-5">
                <div className="flex items-center justify-between flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => {
                      const slug = String(shop.slug || '').trim();
                      if (slug) router.push(`${prefix}/shop/${slug}`);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs md:text-sm hover:bg-slate-800 transition-colors"
                  >
                    {t('home.viewMore', 'View More')}
                  </button>

                  <div className="flex items-center gap-3 flex-row-reverse">
                    {logo ? (
                      <Image
                        src={logo}
                        alt={shop.name}
                        width={48}
                        height={48}
                        sizes="48px"
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-slate-200 shadow-sm"
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
                          onClick={() => {
                            const slug = String(shop.slug || '').trim();
                            if (slug) router.push(`${prefix}/shop/${slug}`);
                          }}
                          className="px-2 py-0.5 rounded-md text-[10px] font-black border border-slate-200 bg-white/80 hover:bg-white transition-colors text-slate-600"
                          style={{
                            boxShadow: `inset 0 0 0 1px ${primaryColor}22`,
                            background: `linear-gradient(90deg, ${primaryColor}12, ${secondaryColor}10)`,
                          }}
                        >
                          {t('home.visitShop', 'Visit Shop')}
                        </button>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{shop.city || ''}{shop.city && shop.governorate ? ' - ' : ''}{shop.governorate || ''}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center justify-start mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center"
                        onClick={() => slidersRef.current[String(shop.id)]?.scrollBy({ left: 320, behavior: 'smooth' })}
                        aria-label={t('common.next', 'Next')}
                      >
                        <ChevronRight size={18} />
                      </button>
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center"
                        onClick={() => slidersRef.current[String(shop.id)]?.scrollBy({ left: -320, behavior: 'smooth' })}
                        aria-label={t('common.previous', 'Previous')}
                      >
                        <ChevronLeft size={18} />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={(el) => { slidersRef.current[String(shop.id)] = el; }}
                    className="flex gap-3 overflow-x-auto no-scrollbar pb-2"
                    style={{ scrollSnapType: 'x mandatory' }}
                  >
                    {isPharmacy && prescriptionHref ? (
                      <a
                        href={prescriptionHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 w-[160px] md:w-[190px] text-right rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors flex flex-col items-center justify-center gap-2"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <FileText size={32} className="text-slate-300" />
                        <p className="text-slate-700 text-xs font-black text-center">{t('home.sendPrescription', 'Send Prescription')}</p>
                        <p className="text-slate-400 text-[10px] font-bold text-center">{t('home.viaWhatsApp', 'via WhatsApp')}</p>
                      </a>
                    ) : shopOffers.length ? shopOffers.slice(0, 4).map((offer) => {
                      const hasPrice = Number(offer.newPrice || 0) > 0;
                      return (
                        <button
                          key={offer.id}
                          type="button"
                          onClick={() => {
                            const slug = String(shop.slug || '').trim();
                            if (slug) router.push(`${prefix}/shop/${slug}`);
                          }}
                          className="shrink-0 w-[160px] md:w-[190px] text-right rounded-2xl border border-slate-100 bg-white overflow-hidden hover:shadow-md transition-shadow"
                          style={{ scrollSnapAlign: 'start' }}
                        >
                          <div className="aspect-[4/3] bg-slate-100 relative">
                            {offer.imageUrl ? (
                              <Image src={offer.imageUrl} alt={offer.title || ''} fill sizes="160px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Store size={32} />
                              </div>
                            )}
                            {hasPrice && (
                              <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-white/90 text-[10px] font-black text-slate-700 shadow-sm">
                                {currency} {Number(offer.newPrice).toLocaleString(priceLocale)}
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="font-black text-xs text-slate-900 line-clamp-1">{offer.title}</p>
                            {hasPrice ? null : <p className="text-[10px] text-slate-400 mt-1">{t('common.specialOffer', 'Special Offer')}</p>}
                          </div>
                        </button>
                      );
                    }) : (
                      <button
                        type="button"
                        onClick={() => {
                          const slug = String(shop.slug || '').trim();
                          if (slug) router.push(`${prefix}/shop/${slug}`);
                        }}
                        className="shrink-0 w-[160px] md:w-[190px] text-right rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors flex flex-col items-center justify-center gap-2"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <Store size={32} className="text-slate-300" />
                        <p className="text-slate-400 text-xs font-bold text-center">{t('home.browseShop', 'Browse Shop')}</p>
                      </button>
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
}
