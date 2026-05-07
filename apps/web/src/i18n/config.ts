export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ar';

export function isValidLocale(val: string): val is Locale {
  return locales.includes(val as Locale);
}
