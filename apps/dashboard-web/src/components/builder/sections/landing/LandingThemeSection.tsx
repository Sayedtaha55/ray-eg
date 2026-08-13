'use client';

import React from 'react';
import { Rocket } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface LandingThemeSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
}

export default function LandingThemeSection({ config, onChange }: LandingThemeSectionProps) {
  const landing = (config.landingPage || {}) as Record<string, any>;

  const update = (key: string, value: any) => {
    onChange({ landingPage: { ...landing, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-l from-rose-50 to-amber-50 rounded-2xl border border-rose-100">
        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg">
          <Rocket size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm text-slate-900">تصميم صفحة الهبوط</h3>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">اختر تخطيط صفحة الهبوط</p>
        </div>
      </div>

      <p className="text-xs font-bold text-slate-500">اختر تخطيط صفحة الهبوط فقط. هذا الإعداد مستقل عن ثيمات المتجر وألوانه:</p>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => update('landingTheme', 'classic')}
          className={`p-3 rounded-2xl border-2 text-right transition-all space-y-2 ${String(landing.landingTheme || 'classic') === 'classic' ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-slate-200'}`}
        >
          <div className="w-full h-16 rounded-xl bg-white border border-slate-200 flex items-center gap-1 p-1.5">
            <div className="w-1/2 h-full rounded-lg bg-slate-300" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-4/5 rounded bg-slate-300" />
              <div className="h-1.5 w-3/5 rounded bg-slate-200" />
              <div className="h-2.5 w-2/3 rounded bg-slate-400 mt-1.5" />
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">كلاسيك</p>
            <p className="text-[10px] font-bold text-slate-500">صورة على الجنب + تفاصيل بجانبها</p>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => update('landingTheme', 'banner')}
          className={`p-3 rounded-2xl border-2 text-right transition-all space-y-2 ${String(landing.landingTheme || 'classic') === 'banner' ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-slate-200'}`}
        >
          <div className="w-full h-16 rounded-xl bg-white border border-slate-200 flex flex-col p-1.5 gap-1">
            <div className="w-full h-8 rounded-lg bg-slate-300" />
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
              <div className="h-1.5 w-3/5 rounded bg-slate-300" />
              <div className="h-2.5 w-2/5 rounded bg-slate-400" />
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">بانر كامل</p>
            <p className="text-[10px] font-bold text-slate-500">صورة بعرض الصفحة بالكامل زي بانر</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => update('landingTheme', 'split')}
          className={`p-3 rounded-2xl border-2 text-right transition-all space-y-2 ${String(landing.landingTheme || 'classic') === 'split' ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-slate-200'}`}
        >
          <div className="w-full h-16 rounded-xl bg-white border border-slate-200 flex items-center gap-1 p-1.5">
            <div className="w-1/3 h-full rounded-lg bg-slate-300" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-4/5 rounded bg-slate-300" />
              <div className="h-1.5 w-3/5 rounded bg-slate-200" />
              <div className="h-2.5 w-2/3 rounded bg-slate-400 mt-1.5" />
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">منقسم</p>
            <p className="text-[10px] font-bold text-slate-500">صورة أصغر + تفاصيل أكبر</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => update('landingTheme', 'minimal')}
          className={`p-3 rounded-2xl border-2 text-right transition-all space-y-2 ${String(landing.landingTheme || 'classic') === 'minimal' ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-slate-200'}`}
        >
          <div className="w-full h-16 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center p-1.5 gap-1">
            <div className="h-1.5 w-3/5 rounded bg-slate-300" />
            <div className="h-2.5 w-2/5 rounded bg-slate-400" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">بسيط</p>
            <p className="text-[10px] font-bold text-slate-500">بدون صور - نص فقط</p>
          </div>
        </button>
      </div>

      {/* Hero Title */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 block text-right">عنوان القسم الرئيسي</label>
        <input
          type="text"
          value={landing.heroTitle || ''}
          onChange={(e) => update('heroTitle', e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 transition-all"
          placeholder="عنوان جذاب"
        />
      </div>

      {/* Hero Subtitle */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 block text-right">العنوان الفرعي</label>
        <textarea
          value={landing.heroSubtitle || ''}
          onChange={(e) => update('heroSubtitle', e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 transition-all min-h-[80px]"
          placeholder="وصف مختصر"
        />
      </div>

      {/* CTA Button Text */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 block text-right">نص زر الدعوة للإجراء</label>
        <input
          type="text"
          value={landing.ctaText || ''}
          onChange={(e) => update('ctaText', e.target.value)}
          className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 transition-all"
          placeholder="ابدأ الآن"
        />
      </div>
    </div>
  );
}
