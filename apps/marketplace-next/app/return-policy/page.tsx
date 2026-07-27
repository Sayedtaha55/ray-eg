import { Metadata } from 'next';
import { RotateCcw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'سياسة الاسترجاع',
  description: 'سياسة الاسترجاع والاستبدال في منصة من مكانك',
  alternates: { canonical: '/return-policy' },
  openGraph: { title: 'سياسة الاسترجاع - من مكانك', description: 'سياسة الاسترجاع والاستبدال في منصة من مكانك', url: '/return-policy', type: 'article' },
  twitter: { card: 'summary', title: 'سياسة الاسترجاع - من مكانك', description: 'سياسة الاسترجاع والاستبدال في منصة من مكانك' },
};

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">سياسة الاسترجاع</h1>
      </div>
      <p className="text-slate-600 dark:text-slate-400 font-bold text-lg mb-8">سياسة الاسترجاع والاستبدال للمنتجات</p>
      <div className="space-y-6">
        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl">
          <h2 className="font-black text-lg mb-2">مدة الاسترجاع</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold">يمكن استرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام</p>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl">
          <h2 className="font-black text-lg mb-2">شروط الاسترجاع</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold">يجب أن يكون المنتج في حالته الأصلية مع جميع ملحقاته</p>
        </div>
      </div>
    </div>
  );
}
