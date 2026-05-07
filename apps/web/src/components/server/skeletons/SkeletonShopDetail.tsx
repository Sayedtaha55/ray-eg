import { SkeletonBox, SkeletonCircle, SkeletonText } from './SkeletonBase';

export function SkeletonShopDetail() {
  return (
    <div className="min-h-screen">
      <SkeletonBox className="h-48 md:h-64 w-full" />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-end gap-4 -mt-12 mb-6">
          <SkeletonBox className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 border-white" />
          <div className="mb-1 space-y-2">
            <SkeletonText className="h-7 w-40" />
            <SkeletonText className="h-4 w-24" />
          </div>
        </div>
        <SkeletonText className="h-4 w-full mb-2" />
        <SkeletonText className="h-4 w-3/4 mb-2" />
        <SkeletonText className="h-4 w-20 mb-6" />
        <SkeletonText className="h-6 w-24 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <SkeletonBox className="aspect-square rounded-xl mb-2" />
              <SkeletonText className="h-4 w-3/4 mb-1" />
              <SkeletonText className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
