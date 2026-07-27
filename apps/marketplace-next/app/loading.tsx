import { ShopCardSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-brand-black">
      <div className="h-[60vh] bg-brand-black animate-pulse" />
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ShopCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
