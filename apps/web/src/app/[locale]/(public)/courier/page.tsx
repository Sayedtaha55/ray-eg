'use client';

import Link from 'next/link';
import { Truck, DollarSign, Clock, ShieldCheck, MapPin, ChevronRight, UserCheck } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';

export default function CourierIntroPage() {
  const t = useT();
  const { locale, dir } = useLocale();
  const isRtl = dir === 'rtl';

  const benefits = [
    {
      icon: <DollarSign size={28} className="text-[#00E5FF]" />,
      title: t('courierIntro.benefits.earn.title', 'Earn Money'),
      desc: t('courierIntro.benefits.earn.desc', 'Get paid per delivery with competitive rates and bonuses.'),
    },
    {
      icon: <Clock size={28} className="text-[#00E5FF]" />,
      title: t('courierIntro.benefits.flexible.title', 'Flexible Hours'),
      desc: t('courierIntro.benefits.flexible.desc', 'Work when you want — full-time or part-time.'),
    },
    {
      icon: <MapPin size={28} className="text-[#00E5FF]" />,
      title: t('courierIntro.benefits.local.title', 'Local Deliveries'),
      desc: t('courierIntro.benefits.local.desc', 'Deliver in your area — no long distance trips.'),
    },
    {
      icon: <ShieldCheck size={28} className="text-[#00E5FF]" />,
      title: t('courierIntro.benefits.safe.title', 'Safe & Secure'),
      desc: t('courierIntro.benefits.safe.desc', 'In-app tracking, insurance, and 24/7 support.'),
    },
  ];

  const steps = [
    { num: '1', text: t('courierIntro.steps.1', 'Sign up as a courier') },
    { num: '2', text: t('courierIntro.steps.2', 'Get approved by our team') },
    { num: '3', text: t('courierIntro.steps.3', 'Start receiving delivery offers') },
    { num: '4', text: t('courierIntro.steps.4', 'Deliver and earn!') },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8" dir={dir}>
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF]" />
            <Truck className="relative z-10 text-white" size={36} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">
            {t('courierIntro.title', 'Become a Courier')}
          </h1>
          <p className="text-slate-400 font-bold text-lg max-w-md mx-auto">
            {t('courierIntro.subtitle', 'Join our delivery team and earn money on your schedule.')}
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {benefits.map((b, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)]">
              <div className={`flex items-start gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  {b.icon}
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <h3 className="font-black text-base mb-1">{b.title}</h3>
                  <p className="text-slate-400 font-bold text-sm">{b.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)] mb-16">
          <h2 className="text-2xl font-black mb-8 text-center">{t('courierIntro.howItWorks', 'How It Works')}</h2>
          <div className="space-y-4">
            {steps.map((s, idx) => (
              <div key={idx} className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                  <span className="text-white font-black text-sm">{s.num}</span>
                </div>
                <p className="font-bold text-slate-700">{s.text}</p>
                {idx < steps.length - 1 && (
                  <ChevronRight size={16} className={`text-slate-200 ${isRtl ? 'rotate-180' : ''}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href={`/${locale}/signup?role=courier`}
            className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-black transition-all shadow-2xl"
          >
            <UserCheck size={22} className="text-[#00E5FF]" />
            {t('courierIntro.cta', 'Apply Now')}
          </Link>
          <p className="text-slate-400 font-bold text-xs mt-4">
            {t('courierIntro.ctaNote', 'Approval usually takes 1-2 business days.')}
          </p>
        </div>
      </div>
    </div>
  );
}
