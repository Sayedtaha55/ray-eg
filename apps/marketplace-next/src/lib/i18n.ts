'use client';

import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

let instance: ReturnType<typeof createInstance> | null = null;

export function getI18n(lng: string = 'ar') {
  if (instance) return instance;

  instance = createInstance();
  instance
    .use(initReactI18next)
    .use(
      resourcesToBackend((language: string, namespace: string) => {
        try {
          return import(`../../packages/shared/src/i18n/locales/${language}/${namespace}.json`);
        } catch {
          return {};
        }
      })
    )
    .init({
      lng,
      fallbackLng: 'ar',
      defaultNS: 'common',
      ns: ['common', 'public', 'auth', 'home', 'business', 'blog'],
      interpolation: { escapeValue: false },
    });

  return instance;
}
