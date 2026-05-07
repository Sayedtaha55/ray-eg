'use client';

import React from 'react';
import { useT } from '@/i18n/useT';

type Props = { config: any; setConfig: React.Dispatch<React.SetStateAction<any>> };

type ImageMapCardVisibilityKey = 'imageMapCardPrice' | 'imageMapCardStock' | 'imageMapCardAddToCart' | 'imageMapCardReserve' | 'imageMapCardDescription';
const IMAGE_MAP_KEYS: ImageMapCardVisibilityKey[] = ['imageMapCardPrice', 'imageMapCardStock', 'imageMapCardDescription', 'imageMapCardAddToCart', 'imageMapCardReserve'];

const ProductEditorSection: React.FC<Props> = ({ config, setConfig }) => {
  const t = useT();
  const imageMapCurrent = (config?.imageMapVisibility || {}) as Record<string, any>;
  const getImageMapValue = (key: ImageMapCardVisibilityKey) => { if (imageMapCurrent[key] === undefined || imageMapCurrent[key] === null) return true; return Boolean(imageMapCurrent[key]); };
  const setImageMapValue = (key: ImageMapCardVisibilityKey, value: boolean) => { setConfig((prev: any) => { const base = (prev?.imageMapVisibility && typeof prev.imageMapVisibility === 'object') ? prev.imageMapVisibility : {}; return { ...prev, imageMapVisibility: { ...base, [key]: value } }; }); };

  return (
    <div className="space-y-3">
      {IMAGE_MAP_KEYS.map(key => (
        <label key={key} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white" onClick={e => e.stopPropagation()}>
          <span className="font-black text-xs md:text-sm text-slate-700">{t(`business.builder.productEditor.${key}`, key)}</span>
          <input type="checkbox" checked={getImageMapValue(key)} onClick={e => e.stopPropagation()} onChange={e => setImageMapValue(key, e.target.checked)} />
        </label>
      ))}
    </div>
  );
};

export default ProductEditorSection;
