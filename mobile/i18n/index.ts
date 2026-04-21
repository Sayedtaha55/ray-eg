import i18n from 'i18next';
import { Platform } from 'react-native';
import en from './locales/en.ts';
import ar from './locales/ar.ts';

const LANGUAGE_KEY = 'ray_lang';

function getStoredLang(): string {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(LANGUAGE_KEY) || 'ar'; } catch { return 'ar'; }
  }
  return 'ar';
}

i18n.init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  fallbackLng: 'ar',
  lng: getStoredLang(),
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

i18n.on('languageChanged', (lang: string) => {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(LANGUAGE_KEY, lang); } catch {}
  }
});

export default i18n;
export { LANGUAGE_KEY };
