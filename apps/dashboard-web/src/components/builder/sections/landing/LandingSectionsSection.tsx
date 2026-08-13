'use client';

import React from 'react';
import { ToggleLeft, ToggleRight, Layout } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface LandingSectionsSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
}

const TOGGLE_ITEMS = [
  { id: 'hero', label: 'القسم الرئيسي (صورة + سعر + زر)' },
  { id: 'features', label: 'قسم المميزات (3 كروت)' },
  { id: 'description', label: 'وصف المنتج الكامل' },
  { id: 'gallery', label: 'معرض الصور' },
  { id: 'specs', label: 'المواصفات التقنية' },
  { id: 'reviews', label: 'آراء العملاء' },
  { id: 'faq', label: 'الأسئلة الشائعة' },
  { id: 'cta', label: 'CTA النهائي (الأسفل)' },
  { id: 'stickyBar', label: 'الشريط الثابت (موبايل)' },
];

export default function LandingSectionsSection({ config, onChange }: LandingSectionsSectionProps) {
  const landing = (config.landingPage || {}) as Record<string, any>;

  const update = (key: string, value: any) => {
    onChange({ landingPage: { ...landing, [key]: value } });
  };

  const toggleSection = (id: string) => {
    update('sections', {
      ...(landing.sections || {}),
      [id]: !(landing.sections || {})[id],
    });
  };

  const sections = landing.sections || {
    hero: true, features: true, description: true, gallery: true,
    faq: true, reviews: true, specs: true, cta: true, stickyBar: true,
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-l from-rose-50 to-amber-50 rounded-2xl border border-rose-100">
        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg">
          <Layout size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm text-slate-900">الأقسام الظاهرة</h3>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">تحكم في الأقسام المعروضة</p>
        </div>
      </div>

      <div className="space-y-2">
        {TOGGLE_ITEMS.map((s) => (
          <label key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
            <span className="text-xs font-black text-slate-700">{s.label}</span>
            {sections[s.id] !== false ? (
              <ToggleRight size={24} className="text-emerald-500" onClick={() => toggleSection(s.id)} />
            ) : (
              <ToggleLeft size={24} className="text-slate-300" onClick={() => toggleSection(s.id)} />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
