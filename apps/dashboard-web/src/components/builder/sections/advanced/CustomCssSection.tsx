'use client';

import React from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface CustomCssSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: UnifiedBuilderConfig) => void;
}

export default function CustomCssSection({ config, onChange }: CustomCssSectionProps) {
  const value = typeof config?.customCss === 'string' ? config.customCss : '';

  return (
    <div className="space-y-3">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">CSS مخصص</label>
      <textarea
        value={value}
        onChange={(e) => onChange({ ...config, customCss: e.target.value })}
        className="w-full min-h-[180px] p-4 rounded-2xl border border-slate-100 bg-white text-right font-mono text-xs outline-none focus:border-[#00E5FF]"
        dir="ltr"
        placeholder={`#shop-profile-root h1 {
  font-size: 32px;
}

#shop-profile-root .my-class {
  opacity: 0.9;
}`}
      />
      <p className="text-[11px] md:text-xs text-slate-500 font-bold leading-relaxed">
        أضف CSS مخصص لتخصيص إضافي. استخدم #shop-profile-root كمعرف رئيسي.
      </p>
    </div>
  );
}