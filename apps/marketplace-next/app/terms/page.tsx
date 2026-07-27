import { Metadata } from 'next';
import { Book } from 'lucide-react';

export const metadata: Metadata = {
  title: 'الشروط والأحكام',
  description: 'الشروط والأحكام لاستخدام منصة من مكانك',
  alternates: { canonical: '/terms' },
  openGraph: { title: 'الشروط والأحكام - من مكانك', description: 'الشروط والأحكام لاستخدام منصة من مكانك', url: '/terms', type: 'article' },
  twitter: { card: 'summary', title: 'الشروط والأحكام - من مكانك', description: 'الشروط والأحكام لاستخدام منصة من مكانك' },
};

export default function TermsPage() {
  const sections = [
    { title: '1. قبول الشروط', content: 'باستخدامك لمنصة من مكانك، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق، يرجى عدم استخدام المنصة.' },
    { title: '2. استخدام المنصة', content: 'يُسمح باستخدام المنصة للأغراض التجارية المشروعة فقط. يُحظر استخدامها لأي أنشطة غير قانونية أو مخالفة للآداب.' },
    { title: '3. مسؤولية المستخدم', content: 'أنت مسؤول عن جميع المحتوى الذي تنشره على المنصة وعن الحفاظ على سرية حسابك وكلمة المرور الخاصة بك.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-brand-purple/10 text-brand-purple rounded-2xl flex items-center justify-center">
          <Book className="w-6 h-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">الشروط والأحكام</h1>
      </div>
      <p className="text-lg text-slate-600 dark:text-slate-400 font-bold leading-relaxed mb-8">
        مرحباً بك في منصة من مكانك. باستخدامك لمنصتنا، فإنك توافق على الشروط التالية
      </p>
      <div className="space-y-8">
        {sections.map((s, i) => (
          <section key={i} className="space-y-3">
            <h2 className="text-xl md:text-2xl font-black border-r-4 border-brand-purple pr-4">{s.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-bold">{s.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
