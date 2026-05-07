'use client';

import { HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useT } from '@/i18n/useT';

export default function SupportPage() {
  const { locale } = useParams<{ locale: string }>();
  const prefix = `/${locale}`;
  const t = useT();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const faqs = [
    {
      question: t('support.faq1Question', 'How do I order from the website?'),
      answer: t('support.faq1Answer', 'Choose the product you want, add it to the cart, then complete delivery details and confirm the order.'),
    },
    {
      question: t('support.faq2Question', 'What payment methods are available?'),
      answer: t('support.faq2Answer', 'Currently we support cash on delivery, and soon we will add online payment options.'),
    },
    {
      question: t('support.faq3Question', 'How can I track my order?'),
      answer: t('support.faq3Answer', 'You can track your order status from the “My Orders” page in your profile.'),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-right" dir={dir}>
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#00E5FF]/20 text-[#00E5FF] rounded-2xl flex items-center justify-center">
            <HelpCircle size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">{t('support.title', 'Help Center')}</h1>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">{t('support.faq', 'FAQ')}</h2>
          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-black text-lg text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="p-8 bg-slate-900 text-white rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <h3 className="text-xl font-black">{t('support.stillNeedHelp', 'Still need help?')}</h3>
            <p className="text-slate-400">{t('support.supportDesc', 'Our support team is available to help you anytime')}</p>
          </div>
          <Link href={`${prefix}/contact`} className="px-8 py-4 bg-[#00E5FF] text-black font-black rounded-xl hover:scale-105 transition-all">
            {t('common.contactUs', 'Contact Us')}
          </Link>
        </section>
      </div>
    </div>
  );
}
