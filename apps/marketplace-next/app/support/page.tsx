import { Metadata } from 'next';
import { LifeBuoy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'مركز المساعدة',
  description: 'مركز المساعدة والدعم الفني لمنصة من مكانك',
  alternates: { canonical: '/support' },
  openGraph: { title: 'مركز المساعدة - من مكانك', description: 'مركز المساعدة والدعم الفني لمنصة من مكانك', url: '/support', type: 'website' },
  twitter: { card: 'summary', title: 'مركز المساعدة - من مكانك', description: 'مركز المساعدة والدعم الفني لمنصة من مكانك' },
};

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
          <LifeBuoy className="w-6 h-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">مركز المساعدة</h1>
      </div>
      <p className="text-slate-600 dark:text-slate-400 font-bold text-lg mb-8">كيف يمكننا مساعدتك؟</p>
      <div className="grid md:grid-cols-2 gap-6">
        <a href="/contact" className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl hover:shadow-lg transition-all block">
          <h2 className="font-black text-lg mb-2">تواصل معنا</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">راسلنا مباشرة وسنرد عليك</p>
        </a>
        <a href="/customer-service" className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl hover:shadow-lg transition-all block">
          <h2 className="font-black text-lg mb-2">خدمة العملاء</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">استفسارات وشكاوى العملاء</p>
        </a>
      </div>
    </div>
  );
}
