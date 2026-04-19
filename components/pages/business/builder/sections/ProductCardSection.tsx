import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const ProductCardSection: React.FC<Props> = ({ config, setConfig }) => {
  const { t } = useTranslation();
  return (
  <div className="space-y-6">
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.productCard.overlayBgColor')}</label>
          <input
            type="color"
            value={String(config.productCardOverlayBgColor || '#0F172A')}
            onChange={(e) => setConfig({ ...config, productCardOverlayBgColor: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.productCard.overlayOpacity')}</label>
          <input
            type="range"
            min={0}
            max={100}
            value={Number(config.productCardOverlayOpacity ?? 70)}
            onChange={(e) => setConfig({ ...config, productCardOverlayOpacity: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>

    <div className="h-px bg-slate-100" />

    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.productCard.titleColor')}</label>
          <input
            type="color"
            value={String(config.productCardTitleColor || '#FFFFFF')}
            onChange={(e) => setConfig({ ...config, productCardTitleColor: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.productCard.priceColor')}</label>
          <input
            type="color"
            value={String(config.productCardPriceColor || '#FFFFFF')}
            onChange={(e) => setConfig({ ...config, productCardPriceColor: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </div>
    </div>
  </div>
  );
};

export default ProductCardSection;
