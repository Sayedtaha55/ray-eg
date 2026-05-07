'use client';

import React from 'react';
import { useT } from '@/i18n/useT';

type Props = { config: any; setConfig: React.Dispatch<React.SetStateAction<any>> };

type ImageMapVisibilityKey = 'imageMapCardPrice' | 'imageMapCardStock' | 'imageMapCardAddToCart' | 'imageMapCardDescription';
const IMAGE_MAP_VIS_KEYS: ImageMapVisibilityKey[] = ['imageMapCardPrice', 'imageMapCardStock', 'imageMapCardAddToCart', 'imageMapCardDescription'];

const ImageMapVisibilitySection: React.FC<Props> = ({ config, setConfig }) => {
  const t = useT();
  const current = (config?.imageMapVisibility || {}) as Record<string, any>;
  const getValue = (key: ImageMapVisibilityKey) => { if (current[key] === undefined || current[key] === null) return true; return Boolean(current[key]); };
  const setValue = (key: ImageMapVisibilityKey, value: boolean) => { setConfig((prev: any) => { const base = (prev?.imageMapVisibility && typeof prev.imageMapVisibility === 'object') ? prev.imageMapVisibility : {}; return { ...prev, imageMapVisibility: { ...base, [key]: value } }; }); };

  return (
    <div className="space-y-3">
      {IMAGE_MAP_VIS_KEYS.map(key => (
        <label key={key} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white cursor-pointer hover:bg-slate-50 transition-colors" onClick={e => e.stopPropagation()}>
          <span className="font-black text-xs md:text-sm text-slate-700">{t(`business.builder.imageMapVisibility.${key}`, key)}</span>
          <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-[#00E5FF] focus:ring-[#00E5FF]" checked={getValue(key)} onClick={e => e.stopPropagation()} onChange={e => setValue(key, e.target.checked)} />
        </label>
      ))}
    </div>
  );
};

export default ImageMapVisibilitySection;
