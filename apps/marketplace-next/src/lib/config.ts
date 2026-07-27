export const siteConfig = {
  name: 'MNMKNK',
  nameArabic: 'من مكانك',
  nameBusiness: 'MNMKNK Business',
  description: 'منصة تسويق ومبيعات للأنشطة التجارية - اكتشف المتاجر والمنتجات والعروض',
  url: 'https://mnmknk.com',
  ogImage: '/og-image.png',
  locale: 'ar',
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  themeColor: '#1A1A1A',
  keywords: ['تسويق', 'متاجر', 'منتجات', 'عروض', 'من مكانك', 'MNMKNK', 'مصر', 'تجارة الكترونية'],
  dashboardUrl:
    process.env.NEXT_PUBLIC_DASHBOARD_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://dashboard.mnmknk.com' : 'https://localhost:3000'),
};

export const navLinks = [
  { href: '/', label: { ar: 'الرئيسية', en: 'Home' } },
  { href: '/dalil', label: { ar: 'الدليل', en: 'Directory' } },
  { href: '/offers', label: { ar: 'العروض', en: 'Offers' } },
  { href: '/map', label: { ar: 'الخريطة', en: 'Map' } },
  { href: '/blog', label: { ar: 'المدونة', en: 'Blog' } },
  { href: '/about', label: { ar: 'حول', en: 'About' } },
];

export const activities = [
  { id: 'cars', label: { ar: 'سيارات', en: 'Cars' }, icon: '🚗' },
  { id: 'real-estate', label: { ar: 'عقارات', en: 'Real Estate' }, icon: '🏠' },
  { id: 'agriculture', label: { ar: 'زراعة', en: 'Agriculture' }, icon: '🌱' },
  { id: 'medical', label: { ar: 'طبي', en: 'Medical' }, icon: '⚕️' },
  { id: 'factories', label: { ar: 'مصانع', en: 'Factories' }, icon: '🏭' },
  { id: 'construction', label: { ar: 'مقاولات', en: 'Construction' }, icon: '🏗️' },
  { id: 'trade', label: { ar: 'تجارة', en: 'Trade' }, icon: '📦' },
  { id: 'tourism', label: { ar: 'سياحة', en: 'Tourism' }, icon: '✈️' },
  { id: 'animal', label: { ar: 'حيوانات', en: 'Animals' }, icon: '🐾' },
  { id: 'fish', label: { ar: 'أسماك', en: 'Fish' }, icon: '🐟' },
  { id: 'energy', label: { ar: 'طاقة', en: 'Energy' }, icon: '⚡' },
  { id: 'professional', label: { ar: 'خدمات مهنية', en: 'Professional' }, icon: '💼' },
  { id: 'home', label: { ar: 'خدمات منزلية', en: 'Home Services' }, icon: '🏡' },
];
