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
 * Checks if the current device is likely a low-end device.
 * Results are cached after the first call.
 *
 * Target: Mobile devices with <= 4 CPU cores or <= 4GB RAM.
 * Also targets low-end desktops/laptops with <= 4 CPU cores or <= 4GB RAM.
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  if (lowEndCached !== null) return lowEndCached;

  try {
    const nav = navigator as any;

    const cores = nav.hardwareConcurrency || 4;
    const memory = nav.deviceMemory || 4;

    lowEndCached = cores <= 4 || memory <= 4;
    return lowEndCached;
  } catch {
    lowEndCached = false;
    return false;
  }
}
