import { SkeletonBox, SkeletonText } from './SkeletonBase';

export function SkeletonMapPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10 text-right" dir="rtl">
      <div className="flex items-start justify-between gap-6 mb-6 md:mb-10">
        <div className="space-y-2">
          <SkeletonText className="h-8 w-32" />
          <SkeletonText className="h-4 w-56" />
        </div>
        <SkeletonBox className="h-10 w-20 rounded-2xl" />
      </div>
      <SkeletonBox className="w-full h-[70vh] md:h-[78vh] rounded-[2rem]" />
    </div>
  );
}

export function SkeletonMapListingDetail() {
  return (
    <div dir="rtl" className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10 text-right">
      <div className="flex items-center gap-2 mb-6">
        <SkeletonText className="h-4 w-16" />
        <SkeletonText className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonBox className="h-48 md:h-64 rounded-[2rem]" />
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 space-y-4">
            <div className="flex items-start gap-4">
              <SkeletonBox className="w-16 h-16 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonText className="h-7 w-48" />
                <SkeletonBox className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <SkeletonText className="h-4 w-full" />
            <SkeletonText className="h-4 w-3/4" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 space-y-4">
            <SkeletonText className="h-4 w-24" />
            <SkeletonBox className="h-12 w-full rounded-xl" />
            <SkeletonBox className="h-12 w-full rounded-xl" />
          </div>
          <SkeletonBox className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
