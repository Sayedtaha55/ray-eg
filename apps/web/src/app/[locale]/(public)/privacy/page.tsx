'use client';

import { Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { useT } from '@/i18n/useT';

export default function PrivacyPage() {
  const pathname = usePathname();
  const localeSeg = pathname?.split('/')?.[1];
  const activeLocale: Locale = isValidLocale(localeSeg || '') ? (localeSeg as Locale) : 'ar';
  const dir = activeLocale === 'ar' ? 'rtl' : 'ltr';
  const t = useT();

  const sections = [
    {
      title: t('privacy.collect', 'Information We Collect'),
      content: t(
        'privacy.collectContent',
        'We collect information you provide directly, such as name, phone number, and email when creating an account or placing an order.'
      ),
    },
    {
      title: t('privacy.usage', 'How We Use Your Info'),
      content: t(
        'privacy.usageContent',
        'We use your information to process orders, improve our services, and communicate with you about updates and offers.'
      ),
    },
    {
      title: t('privacy.protection', 'Data Protection'),
      content: t(
        'privacy.protectionContent',
        'We take appropriate technical and organizational security measures to protect your personal data from unauthorized access.'
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-right" dir={dir}>
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#00E5FF]/20 text-[#00E5FF] rounded-2xl flex items-center justify-center">
            <Shield size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">{t('privacy.title', 'Privacy Policy')}</h1>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            {t(
              'privacy.intro',
              'At MNMKNK, we are committed to protecting your privacy and personal data. This policy explains how we handle your information.'
            )}
          </p>

          <div className="space-y-12">
            {sections.map((section, index) => (
              <section key={index} className="space-y-4">
                <h2 className="text-2xl font-black text-slate-800 border-r-4 border-[#00E5FF] pr-4">{section.title}</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
