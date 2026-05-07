'use client';

import Link from 'next/link';
import { ArrowLeft, Globe, Zap, Shield, Users } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { Reveal } from './Reveal';

const AboutCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-white/5 rounded-2xl p-5 md:p-6 border border-white/10">
    <div className="text-[#00E5FF] mb-3">{icon}</div>
    <h4 className="text-lg font-black text-white mb-1.5">{title}</h4>
    <p className="text-white/50 text-sm font-medium">{description}</p>
  </div>
);

export default function BusinessAbout() {
  const t = useT();
  const { locale, dir } = useLocale();

  return (
    <Reveal id="about">
      <section className="bg-slate-900 text-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#00E5FF]/15 text-[#00E5FF] rounded-full text-xs font-black uppercase tracking-widest mb-4">{t('business.aboutBadge')}</span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 md:mb-8">
                {t('business.aboutTitle1')} <span className="text-[#00E5FF]">{t('business.aboutTitle2')}</span>
              </h2>
              <p className="text-white/70 text-lg md:text-xl leading-relaxed font-medium mb-6">{t('business.aboutDesc1')}</p>
              <p className="text-white/60 text-base md:text-lg leading-relaxed font-medium mb-8">{t('business.aboutDesc2')}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/${locale}/business/signup`} className="inline-flex items-center justify-center gap-2 bg-[#00E5FF] text-slate-900 px-8 py-4 rounded-2xl font-black text-base hover:bg-[#00D4EE] transition-colors">
                  {t('business.startFreeTrial')} <ArrowLeft className="w-5 h-5" />
                </Link>
                <Link href={`/${locale}/contact`} className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-base hover:bg-white/5 transition-colors">
                  {t('common.contactUs')}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              <AboutCard icon={<Globe className="w-8 h-8" />} title={t('business.arabicPlatform')} description={t('business.arabicPlatformDesc')} />
              <AboutCard icon={<Zap className="w-8 h-8" />} title={t('business.easeOfUse')} description={t('business.easeOfUseDesc')} />
              <AboutCard icon={<Shield className="w-8 h-8" />} title={t('business.globalSecurity')} description={t('business.globalSecurityDesc')} />
              <AboutCard icon={<Users className="w-8 h-8" />} title={t('business.continuousSupport')} description={t('business.continuousSupportDesc')} />
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
