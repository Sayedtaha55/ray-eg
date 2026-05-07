import { SkeletonBox, SkeletonCircle, SkeletonText } from './SkeletonBase';

export function SkeletonShopCard() {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-4 md:p-6">
      <div className="flex items-center gap-3 flex-row-reverse mb-4">
        <SkeletonCircle className="w-10 h-10 md:w-12 md:h-12 shrink-0" />
        <div className="flex-1 text-right space-y-2">
          <SkeletonText className="h-4 w-32" />
          <SkeletonText className="h-3 w-20" />
        </div>
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBox key={i} className="w-[160px] md:w-[190px] shrink-0 aspect-[4/3] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonShopGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-5 md:space-y-7">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonShopCard key={i} />
      ))}
    </div>
  );
}
