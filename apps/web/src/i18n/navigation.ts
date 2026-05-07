import type { Locale } from './config';

/**
 * Build a locale-prefixed path.
 * Usage: `href(locale, '/offers')` → `/ar/offers`
 */
export function localeHref(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/**
 * Switch the locale of the current path.
 * `/ar/offers` → `/en/offers`
 */
export function switchLocale(currentPath: string, target: Locale): string {
  const segments = currentPath.split('/');
  // Replace the first segment (locale) or prepend
  if (segments.length >= 2 && /^[a-z]{2}$/.test(segments[1])) {
    segments[1] = target;
  } else {
    segments.splice(1, 0, target);
  }
  return segments.join('/') || '/';
}
