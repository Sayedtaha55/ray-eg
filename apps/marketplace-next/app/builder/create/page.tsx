import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, FileEdit, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'إنشاء موقع',
  robots: { index: false, follow: false },
};

const options = [
  {
    icon: Sparkles,
    title: 'ابدأ بقالب',
    description: 'اختر من بين عشرات القوالب الجاهزة وخصّصها حسب احتياجك',
    href: '/builder/templates',
    color: 'text-brand-cyan',
    bgColor: 'bg-brand-cyan/10',
  },
  {
    icon: FileEdit,
    title: 'ابدأ من الصفر',
    description: 'صفحة بيضاء تضيف عليها ما تريد بحرية كاملة',
    href: '/builder/blank',
    color: 'text-brand-purple',
    bgColor: 'bg-brand-purple/10',
  },
  {
    icon: Globe,
    title: 'اربط موقعاً موجوداً',
    description: 'لديك موقع بالفعل؟ اربطه بالمنصة لإدارته من مكان واحد',
    href: '/builder/import',
    color: 'text-slate-600 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
  },
];

export default function BuilderCreatePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-black py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <Link href="/builder" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-cyan transition-all mb-8">
          <ArrowLeft className="w-4 h-4" />
          العودة للوحة التحكم
        </Link>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">كيف تريد البدء؟</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold mb-12">اختر الطريقة المناسبة لك لإنشاء موقعك</p>

        <div className="space-y-4">
          {options.map((option, i) => (
            <Link
              key={i}
              href={option.href}
              className="group flex items-center gap-6 p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-brand-cyan/20 hover:shadow-brand transition-all animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${option.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <option.icon className={`w-7 h-7 ${option.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black mb-1">{option.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">{option.description}</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-brand-cyan group-hover:-translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
