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

/**
 * Detects if the device is likely low-end based on hardware concurrency and device memory.
 * Returns true ONLY if we are certain it's a mobile device with limited resources.
 * Defaults to false if hardware APIs are missing to avoid stripping features from high-end devices (e.g. newer iPhones).
 */
export function isLowEndDevice() {
  if (typeof window === 'undefined') return false;
  if (lowEndCached !== null) return lowEndCached;

  try {
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || '');
    if (!isMobile) {
      lowEndCached = false;
      return false;
    }

    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency; // May be undefined
    const memory = nav.deviceMemory; // May be undefined in some browsers

    // If we have data and it's low, it's low-end.
    // If we don't have data, we assume it's NOT low-end to be safe.
    const isLowCores = typeof cores === 'number' && cores <= 4;
    const isLowMemory = typeof memory === 'number' && memory <= 4;

    lowEndCached = isLowCores || isLowMemory;
    return lowEndCached;
  } catch {
    lowEndCached = false;
    return false;
  }
}

export function getDeferredDelay(baseMs: number, mobileMs: number) {
  return isMobileViewportLike() ? mobileMs : baseMs;
}
