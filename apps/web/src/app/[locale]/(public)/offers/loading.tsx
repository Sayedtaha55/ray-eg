import { SkeletonOfferGrid } from '@/components/server/skeletons/SkeletonOffer';

export default function OffersLoading() {
  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-12 relative">
        <div className="flex flex-col items-center text-center mb-10 md:mb-16">
          <div className="h-6 w-24 bg-slate-100 rounded-xl shimmer mb-4" aria-hidden="true" />
          <div className="h-10 md:h-20 w-40 md:w-56 bg-slate-100 rounded-xl shimmer mb-2" aria-hidden="true" />
          <div className="h-4 w-64 bg-slate-100 rounded-xl shimmer" aria-hidden="true" />
        </div>
        <SkeletonOfferGrid count={8} />
      </div>
    </div>
  );
}
