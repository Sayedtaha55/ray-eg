export const locales = ['ar', 'en'] as const;
export const defaultLocale = 'ar';
export type Locale = (typeof locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}
