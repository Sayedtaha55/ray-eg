/**
 * Utilities for profiling device performance and capabilities.
 * Centralizing these checks helps avoid redundant calculations and API calls.
 */

let lowEndCached: boolean | null = null;

/**
 * Detects if the current device is likely "low-end" (weak CPU/Memory).
 * Results are cached after the first call.
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  if (lowEndCached !== null) return lowEndCached;

  try {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // hardwareConcurrency provides number of logical processors.
    // deviceMemory (where supported) provides RAM in GB.
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;

    // We consider it low-end if it's a mobile device with 4 or fewer cores OR 4GB or less RAM.
    lowEndCached = isMobile && (cores <= 4 || memory <= 4);
    return lowEndCached;
  } catch {
    return false;
  }
}

/**
 * Checks if the user has requested reduced motion at the OS level.
 */
export function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detects if the viewport/input type is mobile-like.
 */
export function isMobileViewportLike(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const uaMobile = Boolean((navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile);
    if (uaMobile) return true;

    const coarsePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    const narrowViewport = typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 768px)').matches;
    const mobileUserAgent = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || '');

    return coarsePointer || narrowViewport || mobileUserAgent;
  } catch {
    return false;
  }
}

/**
 * Returns a delay value adjusted for device performance.
 */
export function getDeferredDelay(baseMs: number, mobileMs: number): number {
  return isMobileViewportLike() ? mobileMs : baseMs;
}
