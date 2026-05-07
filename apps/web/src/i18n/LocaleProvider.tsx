'use client';

import { createContext, useContext } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

const LocaleContext = createContext<{
  locale: Locale;
  dir: 'rtl' | 'ltr';
  dict: Dictionary;
}>({
  locale: 'ar',
  dir: 'rtl',
  dict: {} as Dictionary,
});

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  return (
    <LocaleContext.Provider value={{ locale, dir, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
