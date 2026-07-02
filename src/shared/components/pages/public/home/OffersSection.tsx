import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, TrendingUp, Zap, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/common/ui';
import { Offer } from '@/types';
import OfferCard from './OfferCard';

interface OffersSectionProps {
  loading: boolean;
  loadingMore: boolean;
  hasMoreOffers: boolean;
  offers: Offer[];
  navigate: (url: string) => void;
  playSound: () => void;
  loadMoreSentinelRef: React.RefObject<HTMLDivElement | null>;
  loadMoreOffers: () => void;
}

const OffersSection: React.FC<OffersSectionProps> = ({
  loading,
  loadingMore,
  hasMoreOffers,
  offers,
  navigate,
  playSound,
  loadMoreSentinelRef,
  loadMoreOffers,
}) => {
  const { t } = useTranslation();

  return (
    <section className="mb-16 md:mb-24">
      {/* Section Header with Enhanced Design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 px-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-1 h-10 md:h-12 bg-gradient-to-b from-purple-600 via-pink-600 to-orange-500 rounded-full" />
            <div className="absolute top-0 left-0 w-1 h-10 md:h-12 bg-gradient-to-b from-purple-600 via-pink-600 to-orange-500 rounded-full blur-sm opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-orange-500 fill-current" />
              <span className="text-[10px] md:text-xs font-black text-orange-600 uppercase tracking-wider">{t('home.offers.limited', 'عروض محدودة')}</span>
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">{t('home.offers.title')}</h2>
          </div>
        </div>
        <Link
          to="/offers"
          className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto justify-center"
        >
          <Tag className="w-4 h-4" />
          {t('home.offers.viewAll')}
          <TrendingUp className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`offer-skel-${idx}`} className="bg-white p-3 sm:p-4 md:p-5 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
              <Skeleton className="relative aspect-[4/5] rounded-[1.5rem] md:rounded-[2.5rem] mb-4 md:mb-6" />
              <div className="flex items-center justify-between gap-2 mb-4">
                <Skeleton className="h-5 md:h-6 w-full max-w-[70%] rounded-lg" />
                <Skeleton className="h-5 md:h-6 w-12 md:w-16 rounded-full shrink-0" />
              </div>
              <Skeleton className="h-4 md:h-5 w-full mb-3 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
            {offers.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
                  <Tag className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-500 font-bold text-lg">{t('home.offers.noOffers')}</p>
              </div>
            ) : offers.map((offer, idx) => (
              <div key={offer.id} className="cv-auto">
                <OfferCard
                  offer={offer}
                  idx={idx}
                  navigate={navigate}
                  playSound={playSound}
                />
              </div>
            ))}
          </div>

          {hasMoreOffers && (
            <div ref={loadMoreSentinelRef} className="h-10" aria-hidden="true" />
          )}

          {hasMoreOffers && (
            <div className="mt-12 md:mt-16 flex items-center justify-center">
              <button
                type="button"
                aria-label={t('home.offers.loadMoreAria')}
                onClick={loadMoreOffers}
                className="group relative px-8 py-3.5 md:px-10 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl hover:shadow-slate-900/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={loadingMore}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3">
                  {loadingMore ? <Loader2 className="animate-spin" size={18} /> : <Zap className="w-4 h-4 md:w-5 md:h-5" />}
                  <span>{loadingMore ? t('home.offers.loading') : t('home.offers.loadMore')}</span>
                </div>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default React.memo(OffersSection);