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

/**
 * Detects low-end mobile devices based on hardware concurrency and device memory.
 * Centralized to avoid duplication and ensure consistent performance scaling.
 */
export function isLowEndDevice() {
  if (typeof window === 'undefined') return false;

  try {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    // hardwareConcurrency and deviceMemory might be missing on some browsers (like Safari)
    const cores = navigator.hardwareConcurrency || 8;
    const memory = (navigator as any).deviceMemory || 8;

    // We consider it low-end if it's a mobile device with 4 or fewer cores/GB of memory.
    // Defaulting to 8 if unknown ensures we don't accidentally flag high-end desktops/iPhones as low-end.
    return isMobile && (cores <= 4 || memory <= 4);
  } catch {
    return false;
  }
}

export function getDeferredDelay(baseMs: number, mobileMs: number) {
  return isMobileViewportLike() ? mobileMs : baseMs;
}
