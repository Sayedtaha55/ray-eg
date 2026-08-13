'use client';

import React from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface ImageMapVisibilitySectionProps {
  config: UnifiedBuilderConfig;
  onChange: (updates: Partial<UnifiedBuilderConfig>) => void;
}

type ImageMapVisibilityKey =
  | 'imageMapCardPrice'
  | 'imageMapCardStock'
  | 'imageMapCardAddToCart'
  | 'imageMapCardDescription';

const IMAGE_MAP_VIS_KEYS: ImageMapVisibilityKey[] = [
  'imageMapCardPrice',
  'imageMapCardStock',
  'imageMapCardAddToCart',
  'imageMapCardDescription',
];

const IMAGE_MAP_VIS_LABELS: Record<ImageMapVisibilityKey, string> = {
  imageMapCardPrice: 'عرض السعر في بطاقة الصورة',
  imageMapCardStock: 'عرض المخزون في بطاقة الصورة',
  imageMapCardAddToCart: 'عرض زر الإضافة للسلة',
  imageMapCardDescription: 'عرض الوصف في بطاقة الصورة',
};

export default function ImageMapVisibilitySection({
  config,
  onChange,
}: ImageMapVisibilitySectionProps) {
  const current = (config.imageMapVisibility || {}) as Record<string, any>;

  const getValue = (key: ImageMapVisibilityKey): boolean => {
    if (current[key] === undefined || current[key] === null) return true;
    return Boolean(current[key]);
  };

  const setValue = (key: ImageMapVisibilityKey, value: boolean) => {
    const base = (config.imageMapVisibility && typeof config.imageMapVisibility === 'object')
      ? config.imageMapVisibility
      : {};
    const next = { ...base, [key]: value };
    onChange({ imageMapVisibility: next });
  };

  return (
    <div className="space-y-3">
      {IMAGE_MAP_VIS_KEYS.map((key) => (
        <label
          key={key}
          className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-black text-xs md:text-sm text-slate-700">
            {IMAGE_MAP_VIS_LABELS[key]}
          </span>
          <input
            type="checkbox"
            className="w-5 h-5 rounded-lg border-slate-300 text-cyan-500 focus:ring-cyan-500"
            checked={getValue(key)}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setValue(key, e.target.checked)}
          />
        </label>
      ))}
    </div>
  );
}