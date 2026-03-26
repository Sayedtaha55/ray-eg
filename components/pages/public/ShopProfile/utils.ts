export const isVideoUrl = (url: string) => {
  const u = String(url || '').toLowerCase();
  return u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov');
};

export const hexToRgba = (hex: string, alpha: number) => {
  const raw = String(hex || '').replace('#', '').trim();
  const normalized = raw.length === 3 ? raw.split('').map((c) => `${c}${c}`).join('') : raw;
  if (normalized.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const coerceBoolean = (value: any, fallback: boolean) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
};

export const coerceNumber = (value: any, fallback: number) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

// Global performance profiling to avoid redundant calculations on every component mount.
// We calculate device capabilities once per module load.
export const IS_LOW_END_DEVICE = (() => {
  if (typeof window === 'undefined') return false;
  try {
    const mem = typeof (navigator as any)?.deviceMemory === 'number' ? Number((navigator as any).deviceMemory) : 8;
    const cores = typeof navigator?.hardwareConcurrency === 'number' ? Number(navigator.hardwareConcurrency) : 8;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Low end: mobile with <= 4 cores OR <= 4GB RAM
    if (isMobile && (cores <= 4 || mem <= 4)) return true;

    // Generic: <= 2 cores OR <= 2GB RAM
    return cores <= 2 || mem <= 2;
  } catch {
    return false;
  }
})();

export const scopeCss = (css: string, scopeSelector: string) => {
  const raw = String(css || '');
  const safe = raw.replace(/<\s*\/\s*style/gi, '');
  return safe.replace(/([^{}]+)\{/g, (match, selectorGroup) => {
    const group = String(selectorGroup || '');
    const trimmed = group.trim();
    if (!trimmed) return match;
    if (trimmed.startsWith('@')) return match;
    if (trimmed === 'from' || trimmed === 'to' || /^\d+%$/.test(trimmed)) return match;

    const prefixed = group
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.includes(scopeSelector) ? s : `${scopeSelector} ${s}`))
      .join(', ');

    return `${prefixed}{`;
  });
};
