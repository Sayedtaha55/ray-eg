'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  theme: 'cyan' | 'purple' | 'slate';
};

export default function HomeBanners() {
  const t = useT();
  const { locale, dir } = useLocale();

  const banners: Banner[] = useMemo(
    () => [
      {
        id: 'b1',
        badge: t('home.heroBadge', 'Exclusive Offers'),
        title: t('home.heroTitle', 'MNMKNK'),
        subtitle: t('home.heroSubtitle', 'Your Local Business Guide.'),
        ctaLabel: t('home.mapBtn', 'Map'),
        ctaHref: `/${locale}/map`,
        theme: 'cyan',
      },
      {
        id: 'b2',
        badge: t('nav.offers', 'Offers'),
        title: t('home.heroSubtitle', 'Your Local Business Guide.'),
        subtitle: t('home.heroDesc', 'Discover the best shops and restaurants near you with offers and reviews.'),
        ctaLabel: t('nav.offers', 'Offers'),
        ctaHref: `/${locale}/offers`,
        theme: 'purple',
      },
      {
        id: 'b3',
        badge: t('nav.map', 'Map'),
        title: t('home.heroTitle', 'MNMKNK'),
        subtitle: t('home.heroDesc', 'Discover the best shops and restaurants near you with offers and reviews.'),
        ctaLabel: t('nav.map', 'Map'),
        ctaHref: `/${locale}/map`,
        theme: 'slate',
      },
    ],
    [locale, t],
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const count = banners.length;

  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  useEffect(() => {
    if (paused) return;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      next();
    }, 4500);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [index, paused]);

  const trackStyle: React.CSSProperties = {
    transform: `translateX(${dir === 'rtl' ? index * 100 : -index * 100}%)`,
  };

  const ArrowPrev = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const ArrowNext = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <section
      className="mb-8 md:mb-14"
      dir={dir}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-[1.75rem] md:rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.12)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-l from-[#00E5FF] to-[#BD00FF] transition-[width] duration-300"
            style={{ width: `${((index + 1) / count) * 100}%` }}
          />
        </div>

        <div className="relative">
          <div className="flex transition-transform duration-700 ease-out" style={trackStyle}>
            {banners.map((b) => (
              <div key={b.id} className="min-w-full">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  <div className="md:col-span-6 p-6 md:p-12 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase bg-slate-900 text-white w-fit">
                      <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                      {b.badge || ''}
                    </div>
                    <h2 className="mt-5 text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] text-slate-900">
                      {b.title}
                    </h2>
                    <p className="mt-4 text-slate-600 font-bold text-sm md:text-lg leading-relaxed max-w-xl">
                      {b.subtitle}
                    </p>

                    <div className="mt-7">
                      <Link
                        href={b.ctaHref}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-base bg-slate-900 text-white hover:bg-black transition-all shadow-xl"
                      >
                        {b.ctaLabel}
                      </Link>
                    </div>
                  </div>

                  <div className="md:col-span-6 relative min-h-[12rem] md:min-h-[22rem]">
                    <div
                      className={`absolute inset-0 ${
                        b.theme === 'cyan'
                          ? 'bg-gradient-to-br from-[#00E5FF]/35 via-white to-[#00E5FF]/10'
                          : b.theme === 'purple'
                            ? 'bg-gradient-to-br from-[#BD00FF]/25 via-white to-[#00E5FF]/10'
                            : 'bg-gradient-to-br from-slate-200 via-white to-slate-100'
                      }`}
                    />
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(0,229,255,0.35), transparent 35%), radial-gradient(circle at 80% 40%, rgba(189,0,255,0.25), transparent 45%)' }} />
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <div className="w-full max-w-md rounded-[1.5rem] bg-white/70 backdrop-blur-md border border-white/60 shadow-2xl p-6">
                        <div className="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase">
                          {t('common.comingSoon', 'Coming Soon')}
                        </div>
                        <div className="mt-3 text-lg md:text-2xl font-black text-slate-900">
                          {t('home.heroBadge', 'Exclusive Offers')}
                        </div>
                        <div className="mt-2 text-slate-600 font-bold text-sm">
                          {t('home.heroDesc', 'Discover the best shops and restaurants near you with offers and reviews.')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={prev}
            className={`absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/85 hover:bg-white shadow-lg border border-slate-100 flex items-center justify-center transition-all ${
              dir === 'rtl' ? 'right-4 md:right-6' : 'left-4 md:left-6'
            }`}
            aria-label={t('common.previous', 'Previous')}
          >
            <ArrowPrev className="w-5 h-5 text-slate-900" />
          </button>
          <button
            type="button"
            onClick={next}
            className={`absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/85 hover:bg-white shadow-lg border border-slate-100 flex items-center justify-center transition-all ${
              dir === 'rtl' ? 'left-4 md:left-6' : 'right-4 md:right-6'
            }`}
            aria-label={t('common.next', 'Next')}
          >
            <ArrowNext className="w-5 h-5 text-slate-900" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 py-4">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${i === index ? 'w-8 bg-slate-900' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
              aria-label={t('home.goToSlide', 'Go to slide') + ` ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
