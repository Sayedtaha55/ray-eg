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
 * Determines if the current device is likely "low-end" (limited CPU/RAM).
 * Used to disable expensive animations, high-res 3D models, or heavy effects.
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
    const memory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 8;
    const cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 8;

    // Standard definition for low-end: mobile device with <= 4GB RAM or <= 4 CPU cores.
    // We default to false for desktops or high-end mobiles to ensure best experience.
    const isLowEnd = memory <= 4 || cores <= 4;
    lowEndCached = isLowEnd;
    return isLowEnd;
  } catch {
    lowEndCached = false;
    return false;
  }
}
