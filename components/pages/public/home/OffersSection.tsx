import React from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
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
  setSelectedItem: (item: any) => void;
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
  setSelectedItem,
  playSound,
  loadMoreSentinelRef,
  loadMoreOffers,
}) => {
  return (
    <section className="mb-16 md:mb-24">
      <div className="flex items-center justify-between mb-8 md:mb-20 flex-row-reverse px-2">
        <h2 className="text-xl md:text-3xl lg:text-5xl font-black tracking-tighter">أحدث الانفجارات السعرية</h2>
        <Link to="/map" className="flex items-center gap-2 text-slate-600 font-black text-xs md:text-sm hover:text-black transition-all group">
          مشاهدة الكل <TrendingUp className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-12">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`offer-skel-${idx}`} className="bg-white p-3 sm:p-4 md:p-5 rounded-[2rem] md:rounded-[3rem] border border-slate-50 min-w-0">
              <Skeleton className="relative aspect-[4/5] rounded-[1.5rem] md:rounded-[2.5rem] mb-4 md:mb-6" />
              <div className="flex items-center justify-between gap-2 mb-4 flex-row-reverse">
                <Skeleton className="h-5 md:h-6 w-full max-w-[70%]" />
                <Skeleton className="h-5 md:h-6 w-12 md:w-16 rounded-full shrink-0" />
              </div>
              <Skeleton className="h-4 md:h-5 w-full mb-3" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 lg:gap-12">
            {offers.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-500 font-bold">لا توجد عروض نشطة حالياً.</div>
            ) : offers.map((offer, idx) => (
              <div key={offer.id} className="cv-auto">
                <OfferCard
                  offer={offer}
                  idx={idx}
                  navigate={navigate}
                  setSelectedItem={setSelectedItem}
                  playSound={playSound}
                />
              </div>
            ))}
          </div>

          {hasMoreOffers && (
            <div ref={loadMoreSentinelRef} className="h-10" aria-hidden="true" />
          )}

          {hasMoreOffers && (
            <div className="mt-10 md:mt-16 flex items-center justify-center">
              <button
                type="button"
                aria-label="تحميل المزيد من العروض"
                onClick={loadMoreOffers}
                className="px-8 py-3 md:px-10 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
                disabled={loadingMore}
              >
                {loadingMore ? <Loader2 className="animate-spin" size={18} /> : null}
                <span>{loadingMore ? 'تحميل...' : 'تحميل المزيد'}</span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default React.memo(OffersSection);
