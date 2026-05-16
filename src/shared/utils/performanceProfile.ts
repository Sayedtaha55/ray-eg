/**
 * Centralized performance profiling utilities to detect device capabilities.
 * Cached to avoid redundant lookups and computations.
 */

let cachedIsLowEnd: boolean | null = null;

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
 * Detects if the device is likely "low-end" (mobile with low CPU/RAM).
 * Used to disable heavy animations or high-quality assets.
 *
 * PERFORMANCE IMPACT:
 * - Reduces redundant User Agent regex parsing and navigator property lookups across components.
 * - Improves initial render time for pages with many components (e.g., Shop Profile).
 * - Centralizes performance-based feature toggles.
 */
export function isLowEndDevice() {
  if (typeof window === 'undefined') return false;
  if (cachedIsLowEnd !== null) return cachedIsLowEnd;

  try {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    // hardwareConcurrency: number of logical processors
    const cores = navigator.hardwareConcurrency || 4;
    // deviceMemory: approximate amount of RAM in GiB
    const memory = (navigator as any).deviceMemory || 4;

    // Threshold: Mobile device with 4 or fewer cores OR 4GB or less RAM
    cachedIsLowEnd = isMobile && (cores <= 4 || memory <= 4);
  } catch {
    cachedIsLowEnd = false;
  }

  return cachedIsLowEnd;
}

export function getDeferredDelay(baseMs: number, mobileMs: number) {
  return isMobileViewportLike() ? mobileMs : baseMs;
}
