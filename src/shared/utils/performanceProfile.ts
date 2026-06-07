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
 * Identifies low-end mobile devices based on hardware concurrency and memory.
 * Defaults to false for desktop or if APIs are missing.
 */
export function isLowEndDevice(): boolean {
  if (lowEndCached !== null) return lowEndCached;
  if (typeof window === 'undefined') return false;

  try {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
      lowEndCached = false;
      return false;
    }

    const cores = navigator.hardwareConcurrency || 8;
    const memory = (navigator as any).deviceMemory || 8;

    // Low-end mobile: 4 cores or less OR 4GB RAM or less
    lowEndCached = cores <= 4 || memory <= 4;
    return lowEndCached;
  } catch {
    return false;
  }
}
