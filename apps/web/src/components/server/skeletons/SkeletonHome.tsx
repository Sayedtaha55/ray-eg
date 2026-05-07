import { SkeletonBox, SkeletonText } from './SkeletonBase';
import { SkeletonOfferGrid } from './SkeletonOffer';
import { SkeletonShopGrid } from './SkeletonShop';

export function SkeletonHomePage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 md:py-12 relative">
      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-8 md:mb-20">
        <SkeletonBox className="h-8 w-36 rounded-full mb-6 md:mb-10" />
        <SkeletonText className="h-10 md:h-20 w-64 md:w-[500px] mb-4 md:mb-8" />
        <SkeletonText className="h-5 md:h-8 w-80 md:w-[500px] mb-8 md:mb-12" />
        <SkeletonBox className="h-11 md:h-14 w-36 md:w-44 rounded-xl md:rounded-2xl" />
      </div>

      {/* Category Section */}
      <div className="mb-16 md:mb-24">
        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
          <SkeletonText className="h-7 md:h-12 w-64 mb-4" />
          <SkeletonText className="h-4 md:h-6 w-72" />
        </div>
        <div className="flex items-center justify-center gap-4">
          <SkeletonBox className="hidden sm:flex w-12 h-12 rounded-full" />
          <SkeletonBox className="flex-1 max-w-md h-48 md:h-64 rounded-[2rem] md:rounded-[3rem]" />
          <SkeletonBox className="hidden sm:flex w-12 h-12 rounded-full" />
        </div>
      </div>

      {/* Shops Section */}
      <div className="mb-16 md:mb-24">
        <div className="flex items-center justify-between flex-row-reverse mb-6 md:mb-8">
          <SkeletonText className="h-7 md:h-10 w-48 md:w-64" />
        </div>
        <SkeletonShopGrid count={2} />
      </div>

      {/* Offers Section */}
      <div className="mb-16 md:mb-24">
        <div className="flex items-center justify-between flex-row-reverse mb-8 md:mb-20 px-2">
          <SkeletonText className="h-7 md:h-12 w-56 md:w-72" />
          <SkeletonText className="h-4 w-24" />
        </div>
        <SkeletonOfferGrid count={6} />
      </div>
    </div>
  );
}
