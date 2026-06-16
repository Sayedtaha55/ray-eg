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

/**
 * Centrally profile device capabilities to scale UI features.
 * Returns true for mobile devices with limited CPU/Memory.
 */
let lowEndCached: boolean | null = null;
export function isLowEndDevice(): boolean {
  if (lowEndCached !== null) return lowEndCached;
  if (typeof window === 'undefined') return false;

  try {
    const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
    const isMobile = /Android|iPhone|iPad|iPod|mobile/i.test(navigator.userAgent);

    // Default to false if APIs are missing (like on Safari) to avoid over-flagging high-end devices
    const mem = typeof nav?.deviceMemory === 'number' ? Number(nav.deviceMemory) : 8;
    const cores = typeof nav?.hardwareConcurrency === 'number' ? Number(nav.hardwareConcurrency) : 8;

    // Only flag as low-end if it's mobile AND (low memory OR few cores)
    lowEndCached = isMobile && (mem <= 4 || cores <= 4);
    return lowEndCached;
  } catch {
    return false;
  }
}
