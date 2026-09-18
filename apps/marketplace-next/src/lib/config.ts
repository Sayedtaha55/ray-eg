export const siteConfig = {
  name: 'mnmknk',
  nameArabic: 'من مكانك',
  nameBusiness: 'MNMKNK Business',
  description: 'منصة تسويق ومبيعات للأنشطة التجارية - اكتشف المتاجر والمنتجات والعروض',
  url: 'https://mnmknk.com',
  ogImage: '/og-image.png',
  locale: 'ar',
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  themeColor: '#1A1A1A',
  keywords: ['تسويق', 'متاجر', 'منتجات', 'عروض', 'من مكانك', 'mnmknk', 'مصر', 'تجارة الكترونية'],
  businessUrl:
    process.env.NEXT_PUBLIC_BUSINESS_URL || 'https://business-blond-psi.vercel.app',
  dashboardUrl:
    process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard-web-three-kappa.vercel.app',
};

export const navLinks = [
  { href: '/', label: { ar: 'الرئيسية', en: 'Home' } },
  { href: '/offers', label: { ar: 'العروض', en: 'Offers' } },
  { href: '/map', label: { ar: 'الخريطة', en: 'Map' } },
  { href: '/dalil', label: { ar: 'الأقسام', en: 'Categories' } },
];

// الأنشطة الأساسية المعروضة في الصفحة الرئيسية والدليل.
// image: مسار صورة القسم — استبدل الملف في public/images/activities/ بنفس الاسم
// لتغيير الصورة (SVG أو PNG أو WEBP) بدون تعديل الكود.
export const activities = [
  {
    id: 'cars',
    label: { ar: 'سيارات', en: 'Cars' },
    image: '/images/activities/cars.svg',
  },
  {
    id: 'real-estate',
    label: { ar: 'عقارات', en: 'Real Estate' },
    image: '/images/activities/real-estate.svg',
  },
  {
    id: 'agriculture',
    label: { ar: 'زراعة', en: 'Agriculture' },
    image: '/images/activities/agriculture.svg',
  },
  {
    id: 'medical',
    label: { ar: 'طبي', en: 'Medical' },
    image: '/images/activities/medical.svg',
  },
  {
    id: 'construction',
    label: { ar: 'مقاولات', en: 'Construction' },
    image: '/images/activities/construction.svg',
  },
  {
    id: 'professional',
    label: { ar: 'خدمات مهنية', en: 'Professional' },
    image: '/images/activities/professional.svg',
  },
  {
    id: 'home',
    label: { ar: 'خدمات منزلية', en: 'Home Services' },
    image: '/images/activities/home.svg',
  },
];
