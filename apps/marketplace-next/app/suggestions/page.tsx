import { Metadata } from 'next';
import { Lightbulb } from 'lucide-react';
import SuggestionsForm from './SuggestionsForm';

export const metadata: Metadata = {
  title: 'الاقتراحات',
  description: 'شاركنا اقتراحاتك لتحسين منصة من مكانك',
  alternates: { canonical: '/suggestions' },
  openGraph: { title: 'الاقتراحات - من مكانك', description: 'شاركنا اقتراحاتك لتحسين منصة من مكانك', url: '/suggestions', type: 'website' },
  twitter: { card: 'summary', title: 'الاقتراحات - من مكانك', description: 'شاركنا اقتراحاتك لتحسين منصة من مكانك' },
};

export default function SuggestionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
          <Lightbulb className="w-6 h-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">الاقتراحات</h1>
      </div>
      <p className="text-slate-600 dark:text-slate-400 font-bold text-lg mb-8">رأيك يهمنا! شاركنا اقتراحاتك لتحسين المنصة</p>
      <SuggestionsForm />
    </div>
  );
}
