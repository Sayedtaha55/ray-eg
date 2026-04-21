import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import i18n from '@/i18n';

export type AppLanguage = 'en' | 'ar';

type TFunc = (key: string, options?: Record<string, any>) => string;

type PreferencesContextValue = {
  language: AppLanguage;
  isRTL: boolean;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  t: TFunc;
};

const STORAGE_KEY = 'mobile_language_preference';

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>((i18n.language as AppLanguage) || 'ar');

  useEffect(() => {
    (async () => {
      try {
        const SecureStore = await import('expo-secure-store');
        const saved = await SecureStore.getItemAsync(STORAGE_KEY);
        if (saved === 'en' || saved === 'ar') {
          setLanguageState(saved);
          i18n.changeLanguage(saved);
        }
      } catch {
        // no-op when secure storage is unavailable
      }
    })();
  }, []);

  const setLanguage = useCallback(async (lang: AppLanguage) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    try {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.setItemAsync(STORAGE_KEY, lang);
    } catch {
      // no-op when secure storage is unavailable
    }
  }, []);

  const value = useMemo<PreferencesContextValue>(() => ({
    language,
    isRTL: language === 'ar',
    setLanguage,
    t: i18n.t.bind(i18n),
  }), [language, setLanguage]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function useAppPreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('useAppPreferences must be used inside AppPreferencesProvider');
  return ctx;
}
