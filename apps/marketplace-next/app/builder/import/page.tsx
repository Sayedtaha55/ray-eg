import { Metadata } from 'next';
import Link from 'next/link';
import { Globe, ArrowLeft, Check, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ربط موقع موجود',
  robots: { index: false, follow: false },
};

export default function BuilderImportPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-black py-12 md:py-20">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        <Link href="/builder" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-cyan transition-all mb-8">
          <ArrowLeft className="w-4 h-4" />
          العودة للوحة التحكم
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Globe className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black">ربط موقع موجود</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">اربط موقعك الحالي بالمنصة</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/10">
            <Info className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              أدخل رابط موقعك الحالي وسيتم استيراد المحتوى والإعدادات تلقائياً
            </p>
          </div>

          <div>
            <label className="text-sm font-black mb-2 block">رابط الموقع</label>
            <input
              type="url"
              placeholder="https://example.com"
              dir="ltr"
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 font-bold text-sm border border-transparent focus:border-brand-cyan/20 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-black mb-2 block">اسم الموقع</label>
            <input
              type="text"
              placeholder="موقعي"
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 font-bold text-sm border border-transparent focus:border-brand-cyan/20 outline-none"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-black">ما الذي سيتم استيراده؟</h3>
            {['الصفحات والمحتوى', 'الصور والوسائط', 'إعدادات SEO', 'القائمة والروابط'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                <Check className="w-4 h-4 text-brand-cyan" />
                {item}
              </div>
            ))}
          </div>

          <button className="w-full py-3.5 rounded-2xl bg-brand-gradient text-white font-black text-sm hover:shadow-glow-cyan transition-all">
            استيراد الموقع
          </button>
        </div>
      </div>
    </div>
  );
}
