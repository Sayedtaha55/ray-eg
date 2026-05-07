import { SkeletonBox, SkeletonCircle, SkeletonText } from './SkeletonBase';

export function SkeletonProductDetail() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SkeletonText className="h-4 w-24 mb-4" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <SkeletonBox className="aspect-square rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox key={i} className="w-16 h-16 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <SkeletonText className="h-7 w-3/4" />
          <SkeletonText className="h-9 w-32" />
          <SkeletonText className="h-4 w-20" />
          <div className="mt-6 space-y-2">
            <SkeletonText className="h-5 w-16" />
            <SkeletonBox className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
