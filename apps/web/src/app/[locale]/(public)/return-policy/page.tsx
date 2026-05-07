'use client';

import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { RotateCcw, ShieldCheck, Clock, Package, AlertCircle, ChevronRight } from 'lucide-react';

export default function ReturnPolicyPage() {
  const t = useT();
  const { dir } = useLocale();
  const isRtl = dir === 'rtl';

  const sections = [
    {
      icon: <RotateCcw size={24} className="text-[#00E5FF]" />,
      title: t('returnPolicy.eligibility.title', 'Return Eligibility'),
      items: [
        t('returnPolicy.eligibility.1', 'Products can be returned within 14 days of delivery.'),
        t('returnPolicy.eligibility.2', 'The product must be in its original condition and packaging.'),
        t('returnPolicy.eligibility.3', 'Products on final sale or clearance are not eligible for return.'),
      ],
    },
    {
      icon: <Clock size={24} className="text-[#00E5FF]" />,
      title: t('returnPolicy.process.title', 'Return Process'),
      items: [
        t('returnPolicy.process.1', 'Contact the shop or our support team to initiate a return.'),
        t('returnPolicy.process.2', 'Provide your order number and reason for return.'),
        t('returnPolicy.process.3', 'Wait for confirmation and return instructions from the shop.'),
      ],
    },
    {
      icon: <Package size={24} className="text-[#00E5FF]" />,
      title: t('returnPolicy.refunds.title', 'Refunds'),
      items: [
        t('returnPolicy.refunds.1', 'Refunds are processed within 5-7 business days after the returned item is received.'),
        t('returnPolicy.refunds.2', 'Cash on delivery orders will be refunded via bank transfer or wallet credit.'),
        t('returnPolicy.refunds.3', 'Shipping fees are non-refundable unless the return is due to a defective product.'),
      ],
    },
    {
      icon: <AlertCircle size={24} className="text-[#00E5FF]" />,
      title: t('returnPolicy.exceptions.title', 'Exceptions'),
      items: [
        t('returnPolicy.exceptions.1', 'Perishable goods (food, groceries) cannot be returned unless defective.'),
        t('returnPolicy.exceptions.2', 'Personal hygiene products and underwear are non-returnable.'),
        t('returnPolicy.exceptions.3', 'Customized or personalized items are non-returnable.'),
      ],
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8" dir={dir}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF]" />
            <ShieldCheck className="relative z-10 text-white" size={28} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">{t('returnPolicy.title', 'Return Policy')}</h1>
          <p className="text-slate-400 font-bold text-sm mt-2">{t('returnPolicy.subtitle', 'Our return and refund policy')}</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)]">
              <div className={`flex items-center gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                {section.icon}
                <h2 className="text-xl font-black">{section.title}</h2>
              </div>
              <ul className={`space-y-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                {section.items.map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 text-slate-600 font-bold text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <ChevronRight size={14} className="text-[#00E5FF] shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 font-bold text-sm">
            {t('returnPolicy.footer', 'For any questions about returns, please contact our support team.')}
          </p>
        </div>
      </div>
    </div>
  );
}
