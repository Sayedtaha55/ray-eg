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
 * Detects if the current device is considered "low-end" based on hardware specs.
 * A device is considered low-end if it's a mobile device with <= 4 CPU cores or <= 4GB of RAM.
 * Results are cached for the duration of the page load to avoid redundant lookups.
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  if (lowEndCached !== null) return lowEndCached;

  try {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) {
      lowEndCached = false;
      return false;
    }

    const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };

    // hardwareConcurrency is widely supported, default to 8 if unknown to avoid false positives
    const cores = nav.hardwareConcurrency || 8;

    // deviceMemory is Chrome-only. Default to 8 if unknown to avoid false positives on Safari/Firefox.
    const memory = (nav as any).deviceMemory || 8;

    lowEndCached = cores <= 4 || memory <= 4;
    return lowEndCached;
  } catch {
    return false;
  }
}

export function getDeferredDelay(baseMs: number, mobileMs: number) {
  return isMobileViewportLike() ? mobileMs : baseMs;
}
