export function isMobileViewportLike() {
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

export function getDeferredDelay(baseMs: number, mobileMs: number) {
  return isMobileViewportLike() ? mobileMs : baseMs;
}

let lowEndCached: boolean | null = null;

/**
 * Centrally identifies low-end devices based on hardware concurrency and device memory.
 * Results are cached module-level to avoid repeated expensive navigator/UA lookups.
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  if (lowEndCached !== null) return lowEndCached;

  try {
    const nav = navigator as any;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(nav.userAgent || '');

    // Performance APIs: cores and memory
    const cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 0;
    const memory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 0;

    // We flag as low-end ONLY if we are on mobile AND have limited resources.
    // If these APIs are missing (e.g. Safari), we default to false to avoid
    // disabling features on potentially high-end iOS devices.
    const hasLimitedResources = (cores > 0 && cores <= 4) || (memory > 0 && memory <= 4);

    lowEndCached = isMobile && hasLimitedResources;
    return lowEndCached;
  } catch {
    return false;
  }
}
