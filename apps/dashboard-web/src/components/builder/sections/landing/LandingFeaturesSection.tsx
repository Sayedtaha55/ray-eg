'use client';

import React from 'react';
import { Zap, Star, Truck, ShieldCheck, Package, Flame, Gift, Clock } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface LandingFeaturesSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
}

const FEATURE_ICONS: { icon: any; label: string; key: string }[] = [
  { icon: Zap, label: 'جودة عالية', key: 'quality' },
  { icon: Flame, label: 'الأكثر مبيعاً', key: 'bestseller' },
  { icon: Gift, label: 'عرض خاص', key: 'offer' },
  { icon: Truck, label: 'توصيل سريع', key: 'delivery' },
  { icon: ShieldCheck, label: 'ضمان الجودة', key: 'warranty' },
  { icon: Package, label: 'تغليف آمن', key: 'packaging' },
  { icon: Clock, label: 'توصيل خلال 24 ساعة', key: 'fast24' },
  { icon: Star, label: 'تقييم عالي', key: 'rating' },
];

const TRUST_BADGES: { icon: any; label: string; key: string }[] = [
  { icon: Truck, label: 'توصيل سريع', key: 'truck' },
  { icon: ShieldCheck, label: 'ضمان الجودة', key: 'shield' },
  { icon: Package, label: 'تغليف آمن', key: 'package' },
];

export default function LandingFeaturesSection({ config, onChange }: LandingFeaturesSectionProps) {
  const landing = (config.landingPage || {}) as Record<string, any>;

  const update = (key: string, value: any) => {
    onChange({ landingPage: { ...landing, [key]: value } });
  };

  const selectedFeatures: string[] = landing.selectedFeatures || ['quality', 'bestseller', 'offer'];
  const selectedBadges: string[] = landing.selectedBadges || ['truck', 'shield', 'package'];

  const toggleFeature = (key: string) => {
    const next = selectedFeatures.includes(key)
      ? selectedFeatures.filter((k) => k !== key)
      : [...selectedFeatures, key];
    update('selectedFeatures', next);
  };

  const toggleBadge = (key: string) => {
    const next = selectedBadges.includes(key)
      ? selectedBadges.filter((k) => k !== key)
      : [...selectedBadges, key];
    update('selectedBadges', next);
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-l from-rose-50 to-amber-50 rounded-2xl border border-rose-100">
        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg">
          <Zap size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm text-slate-900">المميزات</h3>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">اختر المميزات وشارات الثقة</p>
        </div>
      </div>

      <p className="text-xs font-bold text-slate-500">اختر المميزات اللي تظهر في صفحة الهبوط:</p>
      <div className="grid grid-cols-2 gap-2">
        {FEATURE_ICONS.map((f) => {
          const isSelected = selectedFeatures.includes(f.key);
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => toggleFeature(f.key)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 text-right transition-all ${isSelected ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <Icon size={18} className={isSelected ? 'text-rose-500' : 'text-slate-400'} />
              <span className={`text-xs font-black ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{f.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-px bg-slate-100 my-4" />

      <p className="text-xs font-bold text-slate-500">اختر شارات الثقة:</p>
      <div className="grid grid-cols-3 gap-2">
        {TRUST_BADGES.map((b) => {
          const isSelected = selectedBadges.includes(b.key);
          const Icon = b.icon;
          return (
            <button
              key={b.key}
              type="button"
              onClick={() => toggleBadge(b.key)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <Icon size={18} className={isSelected ? 'text-emerald-500' : 'text-slate-400'} />
              <span className={`text-[10px] font-black ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{b.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
