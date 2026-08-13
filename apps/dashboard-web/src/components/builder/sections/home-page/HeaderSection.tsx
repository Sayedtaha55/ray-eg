'use client';

import React from 'react';
import { Upload, Eye, EyeOff } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface HeaderSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
}

const HEADER_STYLES = [
  { id: 'centered', title: 'افتراضي متناسق', desc: 'شعار المتجر بالوسط، القائمة بالوسط' },
  { id: 'split_branding', title: 'شعار مميز', desc: 'الشعار والاسم بالوسط، القائمة باليمين' },
  { id: 'minimal_left', title: 'بسيط جداً', desc: 'الشعار باليمين، القائمة والأزرار باليسار' },
  { id: 'search_bar', title: 'تركيز على البحث', desc: 'شريط بحث عريض بالوسط' },
  { id: 'stacked_bold', title: 'شكل كبير وعريض', desc: 'صفين: الشعار بالأعلى، القائمة بالأسفل' },
];

export default function HeaderSection({ config, onChange }: HeaderSectionProps) {
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

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header Style Selection */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          نمط الشعار
        </label>
        <div className="grid grid-cols-1 gap-2">
          {HEADER_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setVal('headerType', style.id)}
              className={`p-3 rounded-xl border-2 text-right transition-all ${
                config.headerType === style.id
                  ? 'border-[#00E5FF] bg-cyan-50'
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <p className="font-black text-sm">{style.title}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-1">{style.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100 my-4" />

      {/* Header Colors */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          ألوان الشعار
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block text-right">لون الخلفية</label>
            <input
              type="color"
              value={config.headerBackgroundColor || '#FFFFFF'}
              onChange={(e) => setVal('headerBackgroundColor', e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block text-right">لون النص</label>
            <input
              type="color"
              value={config.headerTextColor || '#0F172A'}
              onChange={(e) => setVal('headerTextColor', e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100 my-4" />

      {/* Header Options */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          خيارات الشعار
        </label>

        <label className="flex items-center justify-between text-xs font-bold text-slate-700">
          شعار شفاف
          <input
            type="checkbox"
            checked={config.headerTransparent || false}
            onChange={(e) => {
              const checked = e.target.checked;
              onChange({ 
                headerTransparent: checked, 
                headerOpacity: checked ? (config.headerOpacity || 60) : 100 
              });
            }}
            className="w-4 h-4 accent-cyan-500"
          />
        </label>

        <label className="flex items-center justify-between text-xs font-bold text-slate-700">
          الشعار فوق البانر
          <input
            type="checkbox"
            checked={config.headerOverlayBanner || false}
            onChange={(e) => setVal('headerOverlayBanner', e.target.checked)}
            className="w-4 h-4 accent-cyan-500"
          />
        </label>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 block text-right">
            الشفافية ({config.headerOpacity || 60}%)
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={config.headerOpacity || 60}
            onChange={(e) => setVal('headerOpacity', Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>
      </div>

      <div className="h-px bg-slate-100 my-4" />

      {/* Navigation Visibility */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          إظهار/إخفاء عناصر التنقل
        </label>

        {[
          { key: 'headerNavHome', label: 'الرئيسية' },
          { key: 'headerNavGallery', label: 'المعرض' },
          { key: 'headerNavInfo', label: 'المعلومات' },
          { key: 'headerChatButton', label: 'زر المحادثة' },
          { key: 'headerShareButton', label: 'زر المشاركة' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
            <span className="font-black text-xs text-slate-700">{item.label}</span>
            <button
              type="button"
              onClick={() => toggleVisibility(item.key, true)}
              className={`p-1.5 rounded-lg transition-all ${isVisible(item.key, true) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}
            >
              {isVisible(item.key, true) ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
