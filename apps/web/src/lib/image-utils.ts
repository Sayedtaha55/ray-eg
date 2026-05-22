export type ImageOptimizeVariant = 'opt' | 'md' | 'thumb';

export function getOptimizedImageUrl(src: string, variant: ImageOptimizeVariant = 'opt'): string {
  const u = String(src || '').trim();
  if (!u) return '';

  // Already a data URL or blob or local Next.js static path
  if (u.startsWith('data:') || u.startsWith('blob:') || u.startsWith('/')) return u;

  // If the URL already has a variant parameter, keep it stable.
  try {
    const url = new URL(u);
    if (!url.searchParams.has('v')) url.searchParams.set('v', variant);
    return url.toString();
  } catch {
    return u;
  }
}
