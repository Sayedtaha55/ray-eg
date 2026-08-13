'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface FooterSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
}

export default function FooterSection({ config, onChange }: FooterSectionProps) {
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

  const setVal = (key: string, value: any) => {
    onChange({ [key]: value });
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
            className={`p-1.5 rounded-lg transition-all ${isVisible('footer', true) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}
          >
            {isVisible('footer', true) ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
          <span className="font-black text-xs text-slate-700">إظهار روابط سريعة في الفوتر</span>
          <button
            type="button"
            onClick={() => toggleVisibility('footerQuickLinks', true)}
            className={`p-1.5 rounded-lg transition-all ${isVisible('footerQuickLinks', true) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}
          >
            {isVisible('footerQuickLinks', true) ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
          <span className="font-black text-xs text-slate-700">إظهار بيانات التواصل في الفوتر</span>
          <button
            type="button"
            onClick={() => toggleVisibility('footerContact', true)}
            className={`p-1.5 rounded-lg transition-all ${isVisible('footerContact', true) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}
          >
            {isVisible('footerContact', true) ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
          <span className="font-black text-xs text-slate-700">إظهار زر المحادثة العائم</span>
          <button
            type="button"
            onClick={() => toggleVisibility('floatingChatButton', true)}
            className={`p-1.5 rounded-lg transition-all ${isVisible('floatingChatButton', true) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}
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
                footerOpacity: checked ? (config.footerOpacity || 90) : 100 
              });
            }}
            className="w-4 h-4 accent-cyan-500"
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
              onChange={(e) => setVal('footerBackgroundColor', e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">
              لون النص
            </label>
            <input
              type="color"
              value={String(config.footerTextColor || '#0F172A')}
              onChange={(e) => setVal('footerTextColor', e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">
            الشفافية ({config.footerOpacity || 90}%)
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={config.footerOpacity || 90}
            onChange={(e) => setVal('footerOpacity', Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>
      </div>

      <div className="h-px bg-slate-100 my-3" />

      {/* Footer Content */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          محتوى الفوتر
        </label>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 block text-right">نص حقوق النشر</label>
          <input
            type="text"
            value={config.footerCopyright || '© 2026 جميع الحقوق محفوظة'}
            onChange={(e) => setVal('footerCopyright', e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 block text-right">رابط إنستغرام</label>
          <input
            type="url"
            value={config.footerInstagram || ''}
            onChange={(e) => setVal('footerInstagram', e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
            placeholder="https://instagram.com/yourshop"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 block text-right">رابط تويتر/X</label>
          <input
            type="url"
            value={config.footerTwitter || ''}
            onChange={(e) => setVal('footerTwitter', e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
            placeholder="https://twitter.com/yourshop"
          />
        </div>
      </div>
    </div>
  );
}
