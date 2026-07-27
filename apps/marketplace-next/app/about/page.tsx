import { Metadata } from 'next';
import { Info, Target, Rocket, Cpu, Users } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'حول من مكانك',
  description: 'تعرف على منصة من مكانك ورسالتنا ورؤيتنا',
  alternates: { canonical: '/about' },
  openGraph: { title: 'حول من مكانك', description: 'تعرف على منصة من مكانك ورسالتنا ورؤيتنا', url: '/about', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'حول من مكانك', description: 'تعرف على منصة من مكانك ورسالتنا ورؤيتنا' },
};

export default function AboutPage() {
  const aboutLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'حول من مكانك',
    url: `${siteConfig.url}/about`,
    description: 'تعرف على منصة من مكانك ورسالتنا ورؤيتنا',
    mainEntity: {
      '@type': 'Organization',
      name: siteConfig.name,
      alternateName: siteConfig.nameArabic,
      url: siteConfig.url,
      logo: `${siteConfig.url}/brand/logo.png`,
      foundingDate: '2024',
      foundingLocation: 'Egypt',
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutLd) }} />
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-brand-black text-white rounded-full font-black text-xs uppercase tracking-widest mb-8">
          <Info className="w-4 h-4 text-brand-cyan" />
          من نحن
        </div>
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
          منصة <span className="text-gradient">من مكانك</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-2xl font-bold max-w-2xl mx-auto leading-relaxed">
          منصة تسويق ومبيعات متكاملة للأنشطة التجارية في مصر
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
        <div className="p-8 md:p-12 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] space-y-4">
          <Target className="w-10 h-10 text-brand-purple" />
          <h2 className="text-2xl font-black">رسالتنا</h2>
          <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
            تمكين الأنشطة التجارية من الوصول للعملاء بسهولة وتوفير أدوات التسويق الرقمي لكل تاجر
          </p>
        </div>
        <div className="p-8 md:p-12 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] space-y-4">
          <Rocket className="w-10 h-10 text-brand-cyan" />
          <h2 className="text-2xl font-black">رؤيتنا</h2>
          <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
            أن نكون المنصة الأولى للتجارة والتسويق في مصر والمنطقة العربية
          </p>
        </div>
        <div className="p-8 md:p-12 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] space-y-4">
          <Cpu className="w-10 h-10 text-brand-cyan" />
          <h2 className="text-2xl font-black">تقنية متطورة</h2>
          <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
            نستخدم أحدث التقنيات لتوفير تجربة سلسة وسريعة للتجار والعملاء
          </p>
        </div>
        <div className="p-8 md:p-12 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] space-y-4">
          <Users className="w-10 h-10 text-brand-purple" />
          <h2 className="text-2xl font-black">مجتمع متنامي</h2>
          <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
            انضم لآلاف التجار والعملاء على منصتنا وكون جزء من مجتمعنا المتنامي
          </p>
        </div>
      </div>
    </div>
  );
}
