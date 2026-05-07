'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Utensils, ShoppingBag, ShoppingCart, Smartphone, Pill,
  Stethoscope, Hotel, Car, ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import { isValidLocale, type Locale } from '@/i18n/config';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import type { ComponentType } from 'react';

type Cat = {
  id: string;
  Icon: ComponentType<{ className?: string }>;
  accent: string;
  bg: string;
  border: string;
  nameKey: string;
  descKey: string;
  fallbackName: string;
  fallbackDesc: string;
};

const cats: Cat[] = [
  { id: 'restaurants', Icon: Utensils, accent: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', nameKey: 'offers.restaurants', descKey: 'offers.restaurantsDesc', fallbackName: 'Restaurants', fallbackDesc: 'Deals from top restaurants near you' },
  { id: 'fashion', Icon: ShoppingBag, accent: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', nameKey: 'offers.fashionShort', descKey: 'offers.fashionDesc', fallbackName: 'Fashion', fallbackDesc: 'Latest fashion offers and discounts' },
  { id: 'supermarket', Icon: ShoppingCart, accent: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', nameKey: 'offers.supermarket', descKey: 'offers.supermarketDesc', fallbackName: 'Supermarket', fallbackDesc: 'Grocery deals and weekly specials' },
  { id: 'electronics', Icon: Smartphone, accent: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', nameKey: 'business.electronics', descKey: 'home.catElectronicsDesc', fallbackName: 'Electronics', fallbackDesc: 'Tech gadgets and electronics deals' },
  { id: 'pharmacies', Icon: Pill, accent: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', nameKey: 'business.pharmacies', descKey: 'home.catPharmaciesDesc', fallbackName: 'Pharmacies', fallbackDesc: 'Health and pharmacy offers' },
  { id: 'clinics', Icon: Stethoscope, accent: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', nameKey: 'business.clinics', descKey: 'home.catClinicsDesc', fallbackName: 'Clinics', fallbackDesc: 'Medical clinics and healthcare' },
  { id: 'hotels', Icon: Hotel, accent: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', nameKey: 'business.hotelBookings', descKey: 'home.catHotelsDesc', fallbackName: 'Hotels', fallbackDesc: 'Hotel bookings and stays' },
  { id: 'cars', Icon: Car, accent: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', nameKey: 'business.cars', descKey: 'home.catCarsDesc', fallbackName: 'Cars', fallbackDesc: 'Car dealers and services' },
];

export default function CategoryOffersSection() {
  const pathname = usePathname();
  const localeSeg = pathname?.split('/')?.[1];
  const activeLocale: Locale = isValidLocale(localeSeg || '') ? (localeSeg as Locale) : 'ar';
  const prefix = `/${activeLocale}`;
  const t = useT();
  const { dir } = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isRtl = dir === 'rtl';
    const atStart = isRtl ? Math.round(el.scrollLeft) >= 0 : Math.round(el.scrollLeft) <= 0;
    const atEnd = isRtl
      ? Math.round(el.scrollLeft) <= -(el.scrollWidth - el.clientWidth - 4)
      : Math.round(el.scrollLeft) >= el.scrollWidth - el.clientWidth - 4;
    setCanScrollLeft(!atStart);
    setCanScrollRight(!atEnd);
  };

  const scroll = (direction: 'prev' | 'next') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 280;
    const delta = direction === 'next' ? (dir === 'rtl' ? -amount : amount) : dir === 'rtl' ? amount : -amount;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const ArrowPrev = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const ArrowNext = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <section className="mb-12 md:mb-20">
      <div className="flex items-end justify-between mb-6 md:mb-8 px-1">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00E5FF]/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#0097A7] mb-3">
            <Sparkles className="w-3 h-3" />
            {t('common.category', 'Category')}
          </div>
          <h2 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tighter text-slate-900">
            {t('home.categoryTitle', 'Explore Offers by Category')}
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-bold mt-1 max-w-lg">
            {t('home.categoryDesc', 'Choose the category you care about and see the latest specialized offers')}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('prev')}
            disabled={!canScrollLeft}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-600 transition-all"
            aria-label={t('common.previous', 'Previous')}
          >
            <ArrowPrev className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll('next')}
            disabled={!canScrollRight}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-600 transition-all"
            aria-label={t('common.next', 'Next')}
          >
            <ArrowNext className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cats.map((cat) => (
            <Link
              key={cat.id}
              href={`${prefix}/offers/${cat.id}`}
              className={`group snap-start flex-shrink-0 w-[11rem] md:w-[13rem] ${cat.bg} ${cat.border} border rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1`}
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${cat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <cat.Icon className={`w-7 h-7 md:w-8 md:h-8 ${cat.accent}`} />
              </div>
              <h3 className="font-black text-sm md:text-base text-slate-900 mb-1 leading-tight">
                {t(cat.nameKey, cat.fallbackName)}
              </h3>
              <p className="text-[11px] md:text-xs text-slate-500 font-bold leading-relaxed line-clamp-2">
                {t(cat.descKey, cat.fallbackDesc)}
              </p>
            </Link>
          ))}
        </div>

        {canScrollLeft && (
          <div className={`absolute top-0 bottom-2 w-12 bg-gradient-to-${dir === 'rtl' ? 'l' : 'r'} from-white/90 to-transparent pointer-events-none ${dir === 'rtl' ? 'right-0' : 'left-0'}`} />
        )}
        {canScrollRight && (
          <div className={`absolute top-0 bottom-2 w-12 bg-gradient-to-${dir === 'rtl' ? 'r' : 'l'} from-white/90 to-transparent pointer-events-none ${dir === 'rtl' ? 'left-0' : 'right-0'}`} />
        )}
      </div>
    </section>
  );
}
