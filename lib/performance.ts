/**
 * Performance-related utilities and constants.
 */

/**
 * Detects if the current device is likely low-end (e.g., mobile with low RAM/CPU).
 * Used to disable heavy animations or load lower-resolution assets.
 */
export const IS_LOW_END_DEVICE = (() => {
  if (typeof window === 'undefined') return false;

  try {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency;
    const memory = (navigator as any).deviceMemory;

    // If we can't detect, assume it's NOT low-end to avoid degraded experience for unknown devices
    if (!cores && !memory) return isMobile;

    // Mobile specific threshold
    if (isMobile) {
      if (cores && cores <= 4) return true;
      if (memory && memory <= 4) return true;
    }

    // Absolute low-end threshold for any device
    if (cores && cores <= 2) return true;
    if (memory && memory <= 2) return true;

    return false;
  } catch {
    return false;
  }
})();
