'use client';

import { Book } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { useT } from '@/i18n/useT';

export default function TermsPage() {
  const pathname = usePathname();
  const localeSeg = pathname?.split('/')?.[1];
  const activeLocale: Locale = isValidLocale(localeSeg || '') ? (localeSeg as Locale) : 'ar';
  const dir = activeLocale === 'ar' ? 'rtl' : 'ltr';
  const t = useT();

  const sections = [
    {
      title: t('terms.accept', 'Accepting Terms'),
      content: t(
        'terms.acceptContent',
        'By using the MNMKNK platform, you agree to abide by the terms of service outlined here.'
      ),
    },
    {
      title: t('terms.accounts', 'User Accounts'),
      content: t(
        'terms.accountsContent',
        'Information provided when creating an account must be accurate and complete. You are responsible for keeping your account information confidential.'
      ),
    },
    {
      title: t('terms.usage', 'Acceptable Use'),
      content: t(
        'terms.usageContent',
        'It is prohibited to use the platform for any illegal purposes or to violate the intellectual property rights of others.'
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-right" dir={dir}>
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#BD00FF]/20 text-[#BD00FF] rounded-2xl flex items-center justify-center">
            <Book size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">{t('terms.title', 'Terms of Service')}</h1>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            {t(
              'terms.intro',
              'This page outlines the rules and terms governing your use of the MNMKNK platform. Please read carefully.'
            )}
          </p>

          <div className="space-y-12">
            {sections.map((section, index) => (
              <section key={index} className="space-y-4">
                <h2 className="text-2xl font-black text-slate-800 border-r-4 border-[#BD00FF] pr-4">{section.title}</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
