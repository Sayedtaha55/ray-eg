'use client';

import React from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface LayoutSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: UnifiedBuilderConfig) => void;
}

const LAYOUT_IDS = ['minimal', 'modern', 'bold'] as const;
const LAYOUT_NAMES = {
  minimal: 'بسيط',
  modern: 'عصري',
  bold: 'جريء'
};

export default function LayoutSection({ config, onChange }: LayoutSectionProps) {
  const setVal = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      {LAYOUT_IDS.map((id) => (
        <button
          key={id}
          onClick={() => setVal('layout', id)}
          className={`w-full p-4 rounded-2xl border-2 text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${config.layout === id ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
        >
          <p className="font-black text-sm">{LAYOUT_NAMES[id]}</p>
        </button>
      ))}
    </div>
  );
}