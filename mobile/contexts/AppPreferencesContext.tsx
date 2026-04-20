import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AppLanguage = 'en' | 'ar';

type TranslationMap = Record<string, string>;

const translations: Record<AppLanguage, TranslationMap> = {
  en: {
    overview: 'Overview',
    products: 'Products',
    sales: 'Sales',
    alerts: 'Alerts',
    more: 'More',
    dashboard: 'Dashboard',
    operations: 'OPERATIONS',
    growth: 'GROWTH',
    setup: 'SETUP',
    dashboardPages: 'DASHBOARD PAGES',
    reservations: 'Reservations',
    invoice: 'Invoice',
    smartPos: 'Smart POS',
    promotions: 'Promotions',
    customers: 'Customers',
    reports: 'Reports',
    gallery: 'Gallery',
    pageBuilder: 'Page Builder',
    chats: 'Chats',
    sharedProducts: 'Shared Products',
    settings: 'Settings',
    logOut: 'Log Out',
    logoutConfirmTitle: 'Log Out',
    logoutConfirmBody: 'Are you sure you want to log out?',
    cancel: 'Cancel',
    myShop: 'My Shop',
    merchant: 'Merchant',
    loginTitle: 'Merchant Dashboard',
    email: 'Email',
    password: 'Password',
    login: 'Log In',
    error: 'Error',
    loginFailed: 'Login Failed',
    invalidCredentials: 'Invalid credentials',
    fillCredentials: 'Please enter email and password',
    language: 'Language',
    languageDescription: 'Choose app language for the native dashboard.',
    english: 'English',
    arabic: 'العربية',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    storeOverview: 'Store Overview',
    shopName: 'Shop Name',
    category: 'Category',
    city: 'City',
    phone: 'Phone',
    status: 'Status',
    accountSettings: 'Account Settings',
    security: 'Security',
    storeSettings: 'Store Settings',
    modules: 'Modules',
    payments: 'Payments',
    receiptTheme: 'Receipt Theme',
  },
  ar: {
    overview: 'نظرة عامة',
    products: 'المنتجات',
    sales: 'المبيعات',
    alerts: 'التنبيهات',
    more: 'المزيد',
    dashboard: 'لوحة التحكم',
    operations: 'العمليات',
    growth: 'التطوير',
    setup: 'الإعدادات',
    dashboardPages: 'صفحات اللوحة',
    reservations: 'الحجوزات',
    invoice: 'الفاتورة',
    smartPos: 'نقطة البيع',
    promotions: 'العروض',
    customers: 'العملاء',
    reports: 'التقارير',
    gallery: 'المعرض',
    pageBuilder: 'منشئ الصفحة',
    chats: 'المحادثات',
    sharedProducts: 'المنتجات المشتركة',
    settings: 'الإعدادات',
    logOut: 'تسجيل الخروج',
    logoutConfirmTitle: 'تسجيل الخروج',
    logoutConfirmBody: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
    cancel: 'إلغاء',
    myShop: 'متجري',
    merchant: 'تاجر',
    loginTitle: 'لوحة تحكم التاجر',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    login: 'دخول',
    error: 'خطأ',
    loginFailed: 'فشل تسجيل الدخول',
    invalidCredentials: 'بيانات الدخول غير صحيحة',
    fillCredentials: 'من فضلك أدخل البريد الإلكتروني وكلمة المرور',
    language: 'اللغة',
    languageDescription: 'اختر لغة التطبيق في النسخة الموبايل.',
    english: 'English',
    arabic: 'العربية',
    saveChanges: 'حفظ التغييرات',
    saving: 'جارٍ الحفظ...',
    storeOverview: 'نظرة عامة على المتجر',
    shopName: 'اسم المتجر',
    category: 'التصنيف',
    city: 'المدينة',
    phone: 'الهاتف',
    status: 'الحالة',
    accountSettings: 'إعدادات الحساب',
    security: 'الأمان',
    storeSettings: 'إعدادات المتجر',
    modules: 'الوحدات',
    payments: 'المدفوعات',
    receiptTheme: 'ثيم الفاتورة',
  },
};

type PreferencesContextValue = {
  language: AppLanguage;
  isRTL: boolean;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  t: (key: string, fallback?: string) => string;
};

const STORAGE_KEY = 'mobile_language_preference';

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    (async () => {
      try {
        const SecureStore = await import('expo-secure-store');
        const saved = await SecureStore.getItemAsync(STORAGE_KEY);
        if (saved === 'en' || saved === 'ar') {
          setLanguageState(saved);
        }
      } catch {
        // no-op when secure storage is unavailable
      }
    })();
  }, []);

  const setLanguage = useCallback(async (lang: AppLanguage) => {
    setLanguageState(lang);
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
    t: (key: string, fallback?: string) => translations[language][key] || fallback || key,
  }), [language, setLanguage]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function useAppPreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('useAppPreferences must be used inside AppPreferencesProvider');
  return ctx;
}
