import { cn } from '@/lib/utils/cn';

interface SkeletonBaseProps {
  className?: string;
}

export function SkeletonBox({ className }: SkeletonBaseProps) {
  return (
    <div
      className={cn('rounded-xl bg-slate-100 shimmer', className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonCircle({ className }: SkeletonBaseProps) {
  return (
    <div
      className={cn('rounded-full bg-slate-100 shimmer', className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ className }: SkeletonBaseProps) {
  return (
    <div
      className={cn('h-4 rounded-lg bg-slate-100 shimmer', className)}
      aria-hidden="true"
    />
  );
}
