'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const StoreFooter: React.FC<Props> = ({ config, setConfig }) => {
  const t = useT();

  const toggleVisibility = (key: string, fallback = true) => {
    const current = config?.elementsVisibility || {};
    const next = { ...current, [key]: !(current[key] ?? fallback) };
    setConfig({ ...config, elementsVisibility: next });
  };

  const isVisible = (key: string, fallback = true) => {
    const current = config?.elementsVisibility || {};
    if (current[key] === undefined || current[key] === null) return fallback;
    return Boolean(current[key]);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Visibility Toggles */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          {t('business.builder.visibility.showHide', 'إظهار/إخفاء')}
        </label>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
          <span className="font-black text-xs text-slate-700">{t('business.builder.visibility.items.footer', 'إظهار الفوتر بالكامل')}</span>
          <button
            type="button"
            onClick={() => toggleVisibility('footer', true)}
            className={`p-1.5 rounded-lg transition-all ${isVisible('footer', true) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}
          >
            {isVisible('footer', true) ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
          <span className="font-black text-xs text-slate-700">{t('business.builder.visibility.items.footerQuickLinks', 'إظهار روابط سريعة في الفوتر')}</span>
          <button
            type="button"
            onClick={() => toggleVisibility('footerQuickLinks', true)}
            className={`p-1.5 rounded-lg transition-all ${isVisible('footerQuickLinks', true) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}
          >
            {isVisible('footerQuickLinks', true) ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
          <span className="font-black text-xs text-slate-700">{t('business.builder.visibility.items.footerContact', 'إظهار بيانات التواصل في الفوتر')}</span>
          <button
            type="button"
            onClick={() => toggleVisibility('footerContact', true)}
            className={`p-1.5 rounded-lg transition-all ${isVisible('footerContact', true) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}
          >
            {isVisible('footerContact', true) ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
          <span className="font-black text-xs text-slate-700">{t('business.builder.visibility.items.floatingChatButton', 'إظهار زر المحادثة العائم')}</span>
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
          {t('business.builder.headerFooter.footerStyle', 'مظهر أسفل العرض')}
        </label>
        <div className="flex items-center justify-between">
          <span className="font-black text-sm">{t('business.builder.headerFooter.footerTransparent', 'أسفل العرض شفاف')}</span>
          <input
            type="checkbox"
            checked={Boolean(config.footerTransparent)}
            onChange={(e) => {
              const checked = e.target.checked;
              setConfig({ ...config, footerTransparent: checked, footerOpacity: checked ? (config.footerOpacity ?? 90) : 100 });
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">
              {t('business.builder.headerFooter.backgroundColor', 'لون الخلفية')}
            </label>
            <input
              type="color"
              value={String(config.footerBackgroundColor || '#FFFFFF')}
              onChange={(e) => setConfig({ ...config, footerBackgroundColor: e.target.value })}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">
              {t('business.builder.headerFooter.textColor', 'لون النص')}
            </label>
            <input
              type="color"
              value={String(config.footerTextColor || '#0F172A')}
              onChange={(e) => setConfig({ ...config, footerTextColor: e.target.value })}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white cursor-pointer"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">
            {t('business.builder.headerFooter.backgroundOpacity', 'شفافية الخلفية')}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Number(config.footerOpacity ?? 90)}
            onChange={(e) => setConfig({ ...config, footerOpacity: Number(e.target.value) })}
            className="w-full"
            disabled={!Boolean(config.footerTransparent)}
          />
        </div>
      </div>
    </div>
  );
};

export default StoreFooter;
