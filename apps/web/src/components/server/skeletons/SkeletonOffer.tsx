import { SkeletonBox, SkeletonCircle, SkeletonText } from './SkeletonBase';

export function SkeletonOfferCard() {
  return (
    <div className="bg-white p-3 md:p-5 rounded-[2rem] md:rounded-[3rem] border border-slate-50">
      <SkeletonBox className="aspect-[4/5] rounded-[1.8rem] md:rounded-[2.5rem] mb-4 md:mb-6" />
      <div className="flex items-center justify-between gap-2 mb-3 flex-row-reverse">
        <SkeletonText className="h-5 md:h-6 w-full max-w-[70%]" />
        <SkeletonBox className="h-5 md:h-6 w-12 md:w-16 rounded-full shrink-0" />
      </div>
      <SkeletonText className="h-4 w-3/4 mb-3" />
      <SkeletonBox className="h-10 md:h-12 w-full rounded-2xl" />
    </div>
  );
}

export function SkeletonOfferGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 lg:gap-12">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonOfferCard key={i} />
      ))}
    </div>
  );
}
