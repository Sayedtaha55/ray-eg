'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Locale, defaultLocale, isValidLocale } from './config';

type LocaleContextType = {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const locale = (isValidLocale(params.locale as string) ? params.locale : defaultLocale) as Locale;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <LocaleContext.Provider value={{ locale, dir, setLocale }}>
      <div dir={dir}>{children}</div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within a LocaleProvider');
  return context;
}
