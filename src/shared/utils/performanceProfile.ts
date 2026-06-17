let lowEndCached: boolean | null = null;

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

export function isLowEndDevice() {
  if (typeof window === 'undefined') return false;
  if (lowEndCached !== null) return lowEndCached;

  try {
    const isMobile = isMobileViewportLike();
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;

    // We consider it low-end if it's a mobile-like device AND has limited resources
    // (<= 4 cores OR <= 4GB RAM)
    lowEndCached = isMobile && (cores <= 4 || memory <= 4);
    return lowEndCached;
  } catch {
    return false;
  }
}

export function getDeferredDelay(baseMs: number, mobileMs: number) {
  return isMobileViewportLike() ? mobileMs : baseMs;
}
