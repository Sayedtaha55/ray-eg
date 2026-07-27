import { Metadata } from 'next';
import { Headphones } from 'lucide-react';

export const metadata: Metadata = {
  title: 'خدمة العملاء',
  description: 'تواصل مع خدمة عملاء من مكانك للرد على استفساراتك',
  alternates: { canonical: '/customer-service' },
  openGraph: { title: 'خدمة العملاء - من مكانك', description: 'تواصل مع خدمة عملاء من مكانك للرد على استفساراتك', url: '/customer-service', type: 'website' },
  twitter: { card: 'summary', title: 'خدمة العملاء - من مكانك', description: 'تواصل مع خدمة عملاء من مكانك للرد على استفساراتك' },
};

export default function CustomerServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-brand-cyan/10 text-brand-cyan rounded-2xl flex items-center justify-center">
          <Headphones className="w-6 h-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">خدمة العملاء</h1>
      </div>
      <p className="text-slate-600 dark:text-slate-400 font-bold text-lg mb-8">نحن هنا لخدمتك في أي وقت</p>
      <div className="space-y-4">
        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl">
          <h2 className="font-black text-lg mb-2">أوقات العمل</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold">السبت - الخميس: 9 صباحاً - 9 مساءً</p>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl">
          <h2 className="font-black text-lg mb-2">رقم خدمة العملاء</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold">01067461059</p>
        </div>
      </div>
    </div>
  );
}
