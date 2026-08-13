'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, UploadCloud, Eye, EyeOff, Check, X } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface HomeExperienceSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
  activityType: 'COMMERCIAL' | 'RESERVATIONS' | 'HYBRID';
}

export default function HomeExperienceSection({ config, onChange, activityType }: HomeExperienceSectionProps) {
  const setVal = (key: string, value: any) => {
    onChange({ [key]: value });
  };

  const toggleVisibility = (key: string, fallback: boolean = true) => {
    const current = config.elementsVisibility || {};
    const next = { ...current, [key]: !(current[key] ?? fallback) };
    onChange({ elementsVisibility: next });
  };

  const isVisible = (key: string, fallback: boolean = true) => {
    const current = config.elementsVisibility || {};
    if (current[key] === undefined || current[key] === null) return fallback;
    return Boolean(current[key]);
  };

  const isBookingActivity = activityType === 'RESERVATIONS' || activityType === 'HYBRID';

  return (
    <div className="space-y-5 text-right" dir="rtl">
      {/* Page Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">اسم الصفحة الرئيسية</label>
          <input 
            value={config.homePageName || 'الرئيسية'} 
            onChange={(e) => setVal('homePageName', e.target.value)} 
            className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all" 
            placeholder="مثال: الرئيسية" 
          />
        </div>
        {!isBookingActivity && (
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">اسم صفحة المنتجات</label>
            <input 
              value={config.allProductsPageName || 'جميع المنتجات'} 
              onChange={(e) => setVal('allProductsPageName', e.target.value)} 
              className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all" 
              placeholder="مثال: المنتجات / المنيو" 
            />
          </div>
        )}
      </div>

      {/* Booking Activity: Section Visibility Toggles */}
      {isBookingActivity && (
        <>
          <div className="h-px bg-slate-100 my-4" />

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">إظهار/إخفاء الأقسام</label>
            {[
              { key: 'clinicHero', label: 'القسم الرئيسي (Hero)', fallback: true },
              { key: 'clinicWhyChooseUs', label: 'قسم لماذا نحن', fallback: true },
              { key: 'clinicSpecialties', label: 'قسم التخصصات', fallback: true },
              { key: 'clinicDoctors', label: 'قسم الأطباء', fallback: true },
              { key: 'clinicBookingWizard', label: 'قسم حجز موعد', fallback: true },
              { key: 'clinicReviews', label: 'قسم آراء العملاء', fallback: true },
              { key: 'clinicFaq', label: 'الأسئلة الشائعة', fallback: true },
              { key: 'clinicContact', label: 'قسم اتصل بنا', fallback: true },
              { key: 'clinicAboutUs', label: 'قسم من نحن', fallback: true },
              { key: 'clinicCustomPages', label: 'الصفحات المخصصة', fallback: true },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
                <span className="font-black text-xs text-slate-700">{item.label}</span>
                <button
                  type="button"
                  onClick={() => toggleVisibility(item.key, item.fallback)}
                  className={`p-1.5 rounded-lg transition-all ${isVisible(item.key, item.fallback) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}
                >
                  {isVisible(item.key, item.fallback) ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Commercial Activity: Intro & Story */}
      {!isBookingActivity && (
        <>
          <div className="h-px bg-slate-100 my-4" />

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">نص التعريف</label>
              <textarea
                value={config.homeIntroText || ''}
                onChange={(e) => setVal('homeIntroText', e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all min-h-[80px]"
                placeholder="اكتب نبذة تعريفية عن متجرك..."
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">قصتنا</label>
              <textarea
                value={config.homeStoryText || ''}
                onChange={(e) => setVal('homeStoryText', e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all min-h-[120px]"
                placeholder="اكتب قصة متجرك و رحلتك..."
              />
            </div>
          </div>
        </>
      )}

      {/* Layout Mode Selection */}
      <div className="h-px bg-slate-100 my-4" />

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">وضع الصفحة الرئيسية</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'banner_products', label: 'بانر + منتجات', desc: 'بانر كبير مع المنتجات مباشرة' },
            { id: 'banner_ads_story', label: 'بانر + إعلانات + قصة', desc: 'بانر مع إعلانات جانبية وقصة' },
            { id: 'products_only', label: 'منتجات فقط', desc: 'عرض المنتجات مباشرة بدون بانر' },
            { id: 'minimal', label: 'بسيط', desc: 'تصميم بسيط ونظيف' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setVal('homeLayoutMode', option.id)}
              className={`p-3 rounded-xl border text-right transition-all ${
                config.homeLayoutMode === option.id
                  ? 'border-[#00E5FF] bg-cyan-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <p className="font-black text-sm">{option.label}</p>
              <p className="text-[10px] text-slate-500 mt-1">{option.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Ad Titles */}
      {!isBookingActivity && config.homeLayoutMode === 'banner_ads_story' && (
        <>
          <div className="h-px bg-slate-100 my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">عنوان الإعلان الأيمن</label>
              <input
                value={config.homeRightAdTitle || ''}
                onChange={(e) => setVal('homeRightAdTitle', e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                placeholder="عنوان الإعلان"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">عنوان الإعلان الأيسر</label>
              <input
                value={config.homeLeftAdTitle || ''}
                onChange={(e) => setVal('homeLeftAdTitle', e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                placeholder="عنوان الإعلان"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
