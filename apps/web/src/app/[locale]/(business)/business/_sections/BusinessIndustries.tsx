'use client';

import { Store, PackageCheck, Globe, Smartphone, Users, Shield, Clock, Star, BarChart3, Zap, Layout, BellRing } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Reveal } from './Reveal';

const IndustryPill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex flex-col items-center gap-2.5 p-4 md:p-5 bg-[#FAFAF7] rounded-2xl border border-slate-100 hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/5 transition-colors cursor-default">
    <div className="text-[#0097A7]">{icon}</div>
    <span className="text-xs md:text-sm font-bold text-slate-600 text-center">{label}</span>
  </div>
);

export default function BusinessIndustries() {
  const t = useT();
  return (
    <Reveal>
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#00E5FF]/10 text-[#0097A7] rounded-full text-xs font-black uppercase tracking-widest mb-4">{t('business.industriesBadge')}</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900">{t('business.industriesTitle1')} <span className="text-[#0097A7]">{t('business.industriesTitle2')}</span></h2>
            <p className="mt-4 text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">{t('business.industriesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <IndustryPill icon={<Store className="w-5 h-5" />} label={t('business.generalStores')} />
            <IndustryPill icon={<PackageCheck className="w-5 h-5" />} label={t('business.supermarket')} />
            <IndustryPill icon={<Globe className="w-5 h-5" />} label={t('business.restaurants')} />
            <IndustryPill icon={<Smartphone className="w-5 h-5" />} label={t('business.electronics')} />
            <IndustryPill icon={<Users className="w-5 h-5" />} label={t('business.clinics')} />
            <IndustryPill icon={<Shield className="w-5 h-5" />} label={t('business.pharmacies')} />
            <IndustryPill icon={<Clock className="w-5 h-5" />} label={t('business.hotelBookings')} />
            <IndustryPill icon={<Star className="w-5 h-5" />} label={t('business.fashion')} />
            <IndustryPill icon={<BarChart3 className="w-5 h-5" />} label={t('business.realEstate')} />
            <IndustryPill icon={<Zap className="w-5 h-5" />} label={t('business.cars')} />
            <IndustryPill icon={<Layout className="w-5 h-5" />} label={t('business.services')} />
            <IndustryPill icon={<BellRing className="w-5 h-5" />} label={t('business.other')} />
          </div>
        </div>
      </section>
    </Reveal>
  );
}
