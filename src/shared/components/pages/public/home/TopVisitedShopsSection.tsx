import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, MapPin, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Shop } from '@/types';
import { getOptimizedImageUrl } from '@/lib/image-utils';

interface TopVisitedShopsSectionProps {
  shops: Shop[];
  loading: boolean;
}

// استخدام IntersectionObserver لتأثير الظهور
const useInView = (options?: IntersectionObserverInit) => {
  const [ref, setRef] = React.useState<HTMLElement | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(ref);
      }
    }, options);
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, options]);

  return [setRef, inView] as const;
};

const ShopCard: React.FC<{ shop: Shop; idx: number }> = ({ shop, idx }) => {
  const [setRef, inView] = useInView({ rootMargin: '50px' });
  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const city = shop.city || shop.governorate || '';

  return (
    <div
      ref={setRef}
      className={`group flex-shrink-0 w-[160px] sm:w-[200px] md:w-[240px] ${
        !prefersReducedMotion ? 'transition-all duration-700' : ''
      } ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${idx * 80}ms` }}
    >
      <Link
        to={`/shop/${shop.slug}`}
        className="block bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300"
      >
        {/* صورة الشعار */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          <img
            loading={idx < 4 ? 'eager' : 'lazy'}
            src={getOptimizedImageUrl(shop.logoUrl, 'md')}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              const img = e.currentTarget;
              img.style.display = 'none';
            }}
          />
          {/* عدد الزيارات */}
          <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-black flex items-center gap-1">
            <Eye className="w-3 h-3 text-[#00E5FF]" />
            <span>{(shop.visitors || 0).toLocaleString('ar-EG')}</span>
          </div>
        </div>

        {/* معلومات المحل */}
        <div className="p-3 md:p-4 text-right">
          <h3 className="text-xs md:text-sm font-black text-slate-900 mb-1 line-clamp-1 truncate">
            {shop.name}
          </h3>
          {city && (
            <p className="text-[10px] md:text-xs text-slate-500 flex items-center justify-end gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{city}</span>
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

const TopVisitedShopsSection: React.FC<TopVisitedShopsSectionProps> = ({ shops, loading }) => {
  const { t } = useTranslation();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // ترتيب المحلات حسب عدد الزيارات
  const topShops = useMemo(() => {
    if (!shops || shops.length === 0) return [];
    return [...shops]
      .sort((a, b) => (b.visitors || 0) - (a.visitors || 0))
      .slice(0, 12);
  }, [shops]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = direction === 'left' ? -280 : 280;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Skeleton loading
  if (loading) {
    return (
      <section className="mb-12 md:mb-20">
        <div className="flex items-center justify-between mb-6 md:mb-10 px-2">
          <div className="h-8 md:h-10 w-48 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-8 w-20 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="flex gap-3 md:gap-4 overflow-hidden px-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[240px] bg-slate-50 rounded-[2rem] overflow-hidden"
            >
              <div className="aspect-square bg-slate-100 animate-pulse" />
              <div className="p-3 md:p-4">
                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse mb-2" />
                <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // لا توجد بيانات
  if (topShops.length === 0) {
    return (
      <section className="mb-12 md:mb-20">
        <div className="flex items-center justify-between mb-6 md:mb-10 px-2 md:px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Store className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-black tracking-tighter text-slate-900">
                {t('home.topVisited.title')}
              </h2>
              <p className="text-[10px] md:text-sm text-slate-500 font-medium">
                {t('home.topVisited.noData')}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12 md:mb-20">
      {/* العنوان مع أزرار التنقل */}
      <div className="flex items-center justify-between mb-6 md:mb-10 px-2 md:px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Store className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl lg:text-3xl font-black tracking-tighter text-slate-900">
              {t('home.topVisited.title')}
            </h2>
            <p className="text-[10px] md:text-sm text-slate-500 font-medium hidden sm:block">
              {t('home.topVisited.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/map"
            className="text-xs md:text-sm font-bold text-slate-600 hover:text-cyan-600 transition-colors ml-2"
          >
            {t('home.topVisited.viewAll')}
          </Link>
          {/* أزرار التنقل - تظهر فقط على الشاشات الكبيرة */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-600"
              aria-label={t('home.topVisited.next')}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-600"
              aria-label={t('home.topVisited.previous')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* قائمة المحلات - Scroll أفقي */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 md:gap-5 overflow-x-auto pb-4 px-2 md:px-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {topShops.map((shop, idx) => (
          <div key={shop.id} className="snap-start">
            <ShopCard shop={shop} idx={idx} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(TopVisitedShopsSection);
