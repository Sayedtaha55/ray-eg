import { type Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'من مكانك للأعمال — نمّ تجرك معنا' : 'MNMKNK for Business — Grow Your Store',
    description: isAr
      ? 'أنشئ متجرك الإلكتروني مجاناً وابدأ في البيع خلال دقائق. لوحة تحكم ذكية، مندوبين، وعروض مميزة.'
      : 'Create your online store for free and start selling in minutes. Smart dashboard, couriers, and featured offers.',
    openGraph: {
      title: isAr ? 'من مكانك للأعمال — نمّ تجرك معنا' : 'MNMKNK for Business — Grow Your Store',
      description: isAr
        ? 'أنشئ متجرك الإلكتروني مجاناً وابدأ في البيع خلال دقائق.'
        : 'Create your online store for free and start selling in minutes.',
      siteName: 'MNMKNK',
      type: 'website',
      locale: isAr ? 'ar_EG' : 'en_US',
    },
  };
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
