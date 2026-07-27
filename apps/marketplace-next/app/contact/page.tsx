import { Metadata } from 'next';
import { MessageSquare, Mail, Phone, MapPin, Facebook, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import ContactForm from './ContactForm';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'تواصل معنا',
  description: 'تواصل مع فريق من مكانك - البريد، الهاتف، أو نموذج التواصل',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'تواصل معنا', description: 'تواصل مع فريق من مكانك', url: '/contact', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'تواصل معنا', description: 'تواصل مع فريق من مكانك' },
};

export default function ContactPage() {
  const contactLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'تواصل معنا - من مكانك',
    url: `${siteConfig.url}/contact`,
    email: 'mnmknk.eg@gmail.com',
    telephone: '+201067461059',
    contactType: 'customer service',
    areaServed: 'EG',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLd) }} />
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-brand-purple/10 rounded-3xl flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-brand-purple" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">تواصل معنا</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <p className="text-lg text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
            نحن هنا لمساعدتك. تواصل معنا في أي وقت وسنرد عليك في أقرب وقت ممكن
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black">البريد الإلكتروني</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">mnmknk.eg@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black">الهاتف</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">01067461059</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black">الموقع</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">مصر</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                <Facebook className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black">فيسبوك</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">MNMKNK</p>
              </div>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
