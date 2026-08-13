'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface ProductEditorSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
}

type ImageMapCardVisibilityKey =
  | 'imageMapCardPrice'
  | 'imageMapCardStock'
  | 'imageMapCardAddToCart'
  | 'imageMapCardReserve'
  | 'imageMapCardDescription';

const IMAGE_MAP_ITEMS: { key: ImageMapCardVisibilityKey; label: string }[] = [
  { key: 'imageMapCardPrice', label: 'السعر' },
  { key: 'imageMapCardStock', label: 'المخزون' },
  { key: 'imageMapCardDescription', label: 'الوصف' },
  { key: 'imageMapCardAddToCart', label: 'أضف للسلة' },
  { key: 'imageMapCardReserve', label: 'احجز الآن' },
];

export default function ProductEditorSection({ config, onChange }: ProductEditorSectionProps) {
  const imageMapVisibility = config.imageMapVisibility || {};

  const toggleVisibility = (key: ImageMapCardVisibilityKey) => {
    const current = imageMapVisibility[key];
    const next = { ...imageMapVisibility, [key]: current === undefined ? false : !current };
    onChange({ imageMapVisibility: next });
  };

  const isVisible = (key: ImageMapCardVisibilityKey) => {
    const current = imageMapVisibility[key];
    if (current === undefined || current === null) return true;
    return Boolean(current);
  };

  return (
    <div className="space-y-3 text-right" dir="rtl">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
        عناصر بطاقة المنتج في خريطة الصور
      </label>

      {IMAGE_MAP_ITEMS.map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white"
        >
          <span className="font-black text-sm text-slate-700">{item.label}</span>
          <button
            type="button"
            onClick={() => toggleVisibility(item.key)}
            className={`p-1.5 rounded-lg transition-all ${isVisible(item.key) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}
          >
            {isVisible(item.key) ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
      ))}
    </div>
  );
}
