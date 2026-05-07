'use client';

import { useLocale } from './LocaleProvider';
import ar from './dictionaries/ar';
import en from './dictionaries/en';

const dictionaries = { ar, en };

export function useT() {
  const { locale } = useLocale();
  const dict = dictionaries[locale] || dictionaries.ar;

  return (key: string, fallback?: string) => {
    const keys = key.split('.');
    let value: any = dict;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    return typeof value === 'string' ? value : (fallback ?? key);
  };
}
