'use client';

import React from 'react';
import { LocaleProvider } from '@/i18n/LocaleProvider';

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <LocaleProvider>
      {children}
    </LocaleProvider>
  );
}
