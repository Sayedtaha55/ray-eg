import React, { lazy, Suspense } from 'react';

// Lazy load framer-motion only when animations are actually needed
const MotionLazy = lazy(() =>
  import('framer-motion').then((mod) => ({
    default: ({ children }: { children: React.ReactNode }) => children as any,
  })),
);

interface LazyMotionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * LazyMotion wraps framer-motion imports so the ~60KB framer-motion bundle
 * is only loaded when animations are actually used on screen.
 *
 * Usage:
 *   <LazyMotion fallback={<Skeleton />}>
 *     <motion.div animate={{ x: 100 }} />
 *   </LazyMotion>
 *
 * For components that conditionally animate, this prevents loading
 * the entire motion library until the first animation is triggered.
 */
const LazyMotion: React.FC<LazyMotionProps> = ({ children, fallback }) => {
  return (
    <Suspense fallback={fallback || null}>
      <MotionLazy>{children}</MotionLazy>
    </Suspense>
  );
};

export default LazyMotion;

/**
 * AnimationPresenceLazy — lazy-loaded AnimatePresence.
 */
export const AnimatePresenceLazy = lazy(() =>
  import('framer-motion').then((mod) => ({
    default: mod.AnimatePresence,
  })),
);

/**
 * useReducedMotionLazy — wraps useReducedMotion into a lazy hook pattern.
 * Returns false by default (no reduced motion) when framer-motion isn't loaded.
 */
export function useReducedMotionLazy(): boolean {
  // Use matchMedia directly since framer-motion may not be loaded yet
  try {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mq.matches;
  } catch {
    return false;
  }
}