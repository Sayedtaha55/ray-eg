'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = { config: any; setConfig: React.Dispatch<React.SetStateAction<any>>; shop?: any };

const MID_VIS_KEYS = ['productCardPrice', 'productCardStock', 'productCardAddToCart', 'productCardReserve', 'productTabs', 'productShareButton', 'productQuickSpecs', 'mobileBottomNav', 'mobileBottomNavHome', 'mobileBottomNavCart', 'mobileBottomNavAccount'] as const;
const IMAGE_MAP_VIS_KEYS = ['imageMapCardPrice', 'imageMapCardStock', 'imageMapCardAddToCart', 'imageMapCardDescription'] as const;

const ProductCardSection: React.FC<Props> = ({ config, setConfig, shop }) => {
  const t = useT();
  const getVis = (key: string, fallback = true) => { const cur = config?.elementsVisibility || {}; if (cur[key] === undefined || cur[key] === null) return fallback; return Boolean(cur[key]); };
  const setVis = (key: string, value: boolean) => { const base = (config?.elementsVisibility && typeof config.elementsVisibility === 'object') ? config.elementsVisibility : {}; setConfig({ ...config, elementsVisibility: { ...base, [key]: value } }); };
  const getImgMapVis = (key: string, fallback = true) => { const cur = config?.imageMapVisibility || {}; if (cur[key] === undefined || cur[key] === null) return fallback; return Boolean(cur[key]); };
  const setImgMapVis = (key: string, value: boolean) => { const base = (config?.imageMapVisibility && typeof config.imageMapVisibility === 'object') ? config.imageMapVisibility : {}; setConfig({ ...config, imageMapVisibility: { ...base, [key]: value } }); };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.productCard.overlayBgColor', 'لون خلفية الأوفلاي')}</label><input type="color" value={String(config.productCardOverlayBgColor || '#0F172A')} onChange={e => setConfig({ ...config, productCardOverlayBgColor: e.target.value })} className="w-full h-10 rounded-xl border border-slate-200 bg-white" /></div>
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.productCard.overlayOpacity', 'شفافية الأوفلاي')}</label><input type="range" min={0} max={100} value={Number(config.productCardOverlayOpacity ?? 70)} onChange={e => setConfig({ ...config, productCardOverlayOpacity: Number(e.target.value) })} className="w-full" /></div>
        </div>
      </div>
      <div className="h-px bg-slate-100" />
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.productCard.titleColor', 'لون العنوان')}</label><input type="color" value={String(config.productCardTitleColor || '#FFFFFF')} onChange={e => setConfig({ ...config, productCardTitleColor: e.target.value })} className="w-full h-10 rounded-xl border border-slate-200 bg-white" /></div>
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.productCard.priceColor', 'لون السعر')}</label><input type="color" value={String(config.productCardPriceColor || '#FFFFFF')} onChange={e => setConfig({ ...config, productCardPriceColor: e.target.value })} className="w-full h-10 rounded-xl border border-slate-200 bg-white" /></div>
        </div>
      </div>
      <div className="h-px bg-slate-100" />
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.visibility.showHide', 'إظهار/إخفاء')}</label>
        {MID_VIS_KEYS.map(key => (
          <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
            <span className="font-black text-xs text-slate-700">{t(`business.builder.visibility.items.${key}`, key)}</span>
            <button type="button" onClick={() => setVis(key, !getVis(key))} className={`p-1.5 rounded-lg transition-all ${getVis(key) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}>{getVis(key) ? <Eye size={14} /> : <EyeOff size={14} />}</button>
          </div>
        ))}
      </div>
      <div className="h-px bg-slate-100" />
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.imageMapVisibility.title', 'خريطة الصور')}</label>
        {IMAGE_MAP_VIS_KEYS.map(key => (
          <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
            <span className="font-black text-xs text-slate-700">{t(`business.builder.imageMapVisibility.${key}`, key)}</span>
            <button type="button" onClick={() => setImgMapVis(key, !getImgMapVis(key))} className={`p-1.5 rounded-lg transition-all ${getImgMapVis(key) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}>{getImgMapVis(key) ? <Eye size={14} /> : <EyeOff size={14} />}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCardSection;
