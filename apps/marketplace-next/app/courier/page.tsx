import { Metadata } from 'next';
import { Bike } from 'lucide-react';

export const metadata: Metadata = {
  title: 'كن كورير',
  description: 'انضم لفريق الكورير وابدأ رحلتك في توصيل الطلبات وكسب المال',
  alternates: { canonical: '/courier' },
  openGraph: { title: 'كن كورير مع من مكانك', description: 'انضم لفريق الكورير وابدأ رحلتك في توصيل الطلبات وكسب المال', url: '/courier', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'كن كورير مع من مكانك', description: 'انضم لفريق الكورير وابدأ رحلتك في توصيل الطلبات وكسب المال' },
};

export default function CourierPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20 text-center">
      <div className="w-20 h-20 bg-brand-cyan/10 rounded-4xl flex items-center justify-center mx-auto mb-8">
        <Bike className="w-10 h-10 text-brand-cyan" />
      </div>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">كن كورير مع <span className="text-gradient">من مكانك</span></h1>
      <p className="text-slate-600 dark:text-slate-400 font-bold text-lg md:text-xl max-w-2xl mx-auto mb-10">
        انضم لفريق الكورير وابدأ رحلتك في توصيل الطلبات وكسب المال
      </p>
      <a href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-gradient text-white font-black text-lg hover:shadow-glow-cyan transition-all shadow-lg">
        سجل الآن
      </a>
    </div>
  );
}
