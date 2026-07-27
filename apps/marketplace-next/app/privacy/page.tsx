import { Metadata } from 'next';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description: 'سياسة الخصوصية وحماية البيانات في منصة من مكانك',
  alternates: { canonical: '/privacy' },
  openGraph: { title: 'سياسة الخصوصية - من مكانك', description: 'سياسة الخصوصية وحماية البيانات في منصة من مكانك', url: '/privacy', type: 'article' },
  twitter: { card: 'summary', title: 'سياسة الخصوصية - من مكانك', description: 'سياسة الخصوصية وحماية البيانات في منصة من مكانك' },
};

export default function PrivacyPage() {
  const sections = [
    { title: '1. جمع البيانات', content: 'نقوم بجمع البيانات التي تقدمها لنا مباشرة مثل الاسم والبريد الإلكتروني ورقم الهاتف عند التسجيل.' },
    { title: '2. استخدام البيانات', content: 'نستخدم بياناتك لتقديم خدماتنا وتحسين تجربتك على المنصة وللتواصل معك بخصوص حسابك.' },
    { title: '3. حماية البيانات', content: 'نتخذ إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-brand-cyan/10 text-brand-cyan rounded-2xl flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">سياسة الخصوصية</h1>
      </div>
      <p className="text-lg text-slate-600 dark:text-slate-400 font-bold leading-relaxed mb-8">
        نحن في من مكانك نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية
      </p>
      <div className="space-y-8">
        {sections.map((s, i) => (
          <section key={i} className="space-y-3">
            <h2 className="text-xl md:text-2xl font-black border-r-4 border-brand-cyan pr-4">{s.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-bold">{s.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
