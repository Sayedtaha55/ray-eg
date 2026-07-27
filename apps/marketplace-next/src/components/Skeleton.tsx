import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-2xl', className)} />;
}

export function ShopCardSkeleton() {
  return (
    <div className="bg-white dark:bg-brand-black rounded-4xl overflow-hidden border border-slate-100 dark:border-slate-800">
      <Skeleton className="aspect-square w-full !rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-brand-black rounded-4xl overflow-hidden border border-slate-100 dark:border-slate-800">
      <Skeleton className="aspect-square w-full !rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
}
