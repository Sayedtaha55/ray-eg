'use client';

import { Layout, PackageCheck, BellRing, BarChart3, Smartphone, Shield } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Reveal } from './Reveal';

const OfferCard = ({ icon, title, description, accent }: { icon: React.ReactNode; title: string; description: string; accent: 'cyan' | 'purple' }) => (
  <div className="group bg-white rounded-2xl p-6 md:p-8 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${accent === 'cyan' ? 'bg-[#00E5FF]/10 text-[#0097A7]' : 'bg-[#BD00FF]/10 text-[#9C27B0]'}`}>{icon}</div>
    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">{description}</p>
  </div>
);

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-1">{value}</div>
    <div className="text-slate-400 text-sm font-medium">{label}</div>
  </div>
);

export default function BusinessFeatures() {
  const t = useT();
  return (
    <>
      <Reveal>
        <section className="bg-[#FAFAF7] border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 md:py-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <StatItem value="10+" label={t('business.statsActivities')} />
              <StatItem value="24/7" label={t('business.statsSupport')} />
              <StatItem value="99.9%" label={t('business.statsUptime')} />
              <StatItem value="30s" label={t('business.statsStoreTime')} />
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="bg-[#FAFAF7]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
            <div className="text-center mb-12 md:mb-16">
              <span className="inline-block px-4 py-1.5 bg-[#00E5FF]/10 text-[#0097A7] rounded-full text-xs font-black uppercase tracking-widest mb-4">{t('business.featuresBadge')}</span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900">{t('business.featuresTitle1')} <span className="text-[#0097A7]">{t('business.featuresTitle2')}</span></h2>
              <p className="mt-4 text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">{t('business.featuresSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              <OfferCard icon={<Layout className="w-6 h-6" />} title={t('business.pageBuilder')} description={t('business.pageBuilderDesc')} accent="cyan" />
              <OfferCard icon={<PackageCheck className="w-6 h-6" />} title={t('business.productMgmt')} description={t('business.productMgmtDesc')} accent="purple" />
              <OfferCard icon={<BellRing className="w-6 h-6" />} title={t('business.instantNotif')} description={t('business.instantNotifDesc')} accent="cyan" />
              <OfferCard icon={<BarChart3 className="w-6 h-6" />} title={t('business.analytics')} description={t('business.analyticsDesc')} accent="purple" />
              <OfferCard icon={<Smartphone className="w-6 h-6" />} title={t('business.mobileExp')} description={t('business.mobileExpDesc')} accent="cyan" />
              <OfferCard icon={<Shield className="w-6 h-6" />} title={t('business.security')} description={t('business.securityDesc')} accent="purple" />
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
