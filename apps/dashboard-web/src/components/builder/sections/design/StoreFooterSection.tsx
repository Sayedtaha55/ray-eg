'use client';

import React from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';
import { Eye, EyeOff } from 'lucide-react';

interface StoreFooterSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (updates: Partial<UnifiedBuilderConfig>) => void;
}

export default function StoreFooterSection({
  config,
  onChange,
}: StoreFooterSectionProps) {
  const toggleVisibility = (key: string, fallback: boolean = true) => {
    const current = config.elementsVisibility || {};
    const next = { ...current, [key]: !(current[key] ?? fallback) };
    onChange({ elementsVisibility: next });
  };

  const isVisible = (key: string, fallback: boolean = true): boolean => {
    const current = config.elementsVisibility || {};
    if (current[key] === undefined || current[key] === null) return fallback;
    return Boolean(current[key]);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Visibility Toggles */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          إظهار/إخفاء
        </label>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
          <span className="font-black text-xs text-slate-700">إظهار الفوتر بالكامل</span>
          <button
            type="button"
            onClick={() => toggleVisibility('footer', true)}
            className={`p-1.5 rounded-lg transition-all ${isVisible('footer', true) ? 'bg-cyan-500/10 text-cyan-500' : 'bg-slate-200 text-slate-400'}`}
          >
            {isVisible('footer', true) ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
          <span className="font-black text-xs text-slate-700">إظهار روابط سريعة في الفوتر</span>
          <button
            type="button"
            onClick={() => toggleVisibility('footerQuickLinks', true)}
            className={`p-1.5 rounded-lg transition-all ${isVisible('footerQuickLinks', true) ? 'bg-cyan-500/10 text-cyan-500' : 'bg-slate-200 text-slate-400'}`}
          >
            {isVisible('footerQuickLinks', true) ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
          <span className="font-black text-xs text-slate-700">إظهار بيانات التواصل في الفوتر</span>
          <button
            type="button"
            onClick={() => toggleVisibility('footerContact', true)}
            className={`p-1.5 rounded-lg transition-all ${isVisible('footerContact', true) ? 'bg-cyan-500/10 text-cyan-500' : 'bg-slate-200 text-slate-400'}`}
          >
            {isVisible('footerContact', true) ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
          <span className="font-black text-xs text-slate-700">إظهار زر المحادثة العائم</span>
          <button
            type="button"
            onClick={() => toggleVisibility('floatingChatButton', true)}
            className={`p-1.5 rounded-lg transition-all ${isVisible('floatingChatButton', true) ? 'bg-cyan-500/10 text-cyan-500' : 'bg-slate-200 text-slate-400'}`}
          >
            {isVisible('floatingChatButton', true) ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-100 my-3" />

      {/* Style Controls */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          مظهر أسفل العرض
        </label>
        <div className="flex items-center justify-between">
          <span className="font-black text-sm">أسفل العرض شفاف</span>
          <input
            type="checkbox"
            checked={Boolean(config.footerTransparent)}
            onChange={(e) => {
              const checked = e.target.checked;
              onChange({
                footerTransparent: checked,
                footerOpacity: checked ? (config.footerOpacity ?? 90) : 100,
              });
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">
              لون الخلفية
            </label>
            <input
              type="color"
              value={String(config.footerBackgroundColor || '#FFFFFF')}
              onChange={(e) => onChange({ footerBackgroundColor: e.target.value })}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">
              لون النص
            </label>
            <input
              type="color"
              value={String(config.footerTextColor || '#0F172A')}
              onChange={(e) => onChange({ footerTextColor: e.target.value })}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white cursor-pointer"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">
            شفافية الخلفية
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Number(config.footerOpacity ?? 90)}
            onChange={(e) => onChange({ footerOpacity: Number(e.target.value) })}
            className="w-full"
            disabled={!Boolean(config.footerTransparent)}
          />
        </div>
      </div>
    </div>
  );
}