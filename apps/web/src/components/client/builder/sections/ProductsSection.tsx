'use client';

import React from 'react';
import { useT } from '@/i18n/useT';

type Props = { config: any; setConfig: React.Dispatch<React.SetStateAction<any>> };

const PRODUCTS_DISPLAY_IDS = ['cards', 'list', 'minimal'] as const;

const ProductsSection: React.FC<Props> = ({ config, setConfig }) => {
  const t = useT();
  const displayMode = String(config.productDisplay || 'cards');
  const layoutMode = String(config.productsLayout || 'vertical');

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.products.displayMode', 'وضع العرض')}</label>
        {PRODUCTS_DISPLAY_IDS.map(id => (
          <button key={id} onClick={() => setConfig({ ...config, productDisplay: id, productDisplayStyle: id === 'list' ? 'list' : undefined })} className={`group relative w-full p-4 rounded-2xl text-right transition-all active:scale-[0.99] hover:bg-slate-50/40 ${(config.productDisplay || (config.productDisplayStyle === 'list' ? 'list' : undefined) || 'cards') === id ? 'bg-transparent text-cyan-700' : 'bg-transparent text-slate-950'}`}>
            {(config.productDisplay || (config.productDisplayStyle === 'list' ? 'list' : undefined) || 'cards') === id && <span className="pointer-events-none absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-cyan-400/80" />}
            <div className="flex items-center justify-between gap-4">
              <div className="text-right"><p className="font-black text-sm">{t(`business.builder.products.mode.${id}`, id)}</p></div>
              {id === 'minimal' ? (
                <div className="w-28 h-20 overflow-hidden relative shrink-0"><div className="absolute inset-0 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200" /><div className="absolute inset-x-0 bottom-0 h-8 px-2 py-1 flex flex-col items-end justify-center"><div className="h-2 w-14 bg-slate-900/70 rounded-full" /><div className="mt-1 h-2 w-10 bg-slate-900/70 rounded-full" /></div></div>
              ) : id === 'cards' ? (
                <div className="w-28 h-20 rounded-2xl overflow-hidden bg-white grid grid-cols-2 gap-1 p-1 shrink-0"><div className="bg-slate-100 rounded-xl" /><div className="bg-slate-100 rounded-xl" /><div className="bg-slate-100 rounded-xl" /><div className="bg-slate-100 rounded-xl" /></div>
              ) : (
                <div className="w-28 h-20 rounded-2xl overflow-hidden bg-white p-2 space-y-2 shrink-0"><div className="flex flex-row-reverse items-center gap-2"><div className="w-8 h-8 rounded-xl bg-slate-100" /><div className="flex-1 space-y-1"><div className="h-2 w-16 bg-slate-100 rounded-full" /><div className="h-2 w-12 bg-slate-100 rounded-full" /></div></div><div className="flex flex-row-reverse items-center gap-2 opacity-70"><div className="w-8 h-8 rounded-xl bg-slate-100" /><div className="flex-1 space-y-1"><div className="h-2 w-14 bg-slate-100 rounded-full" /><div className="h-2 w-10 bg-slate-100 rounded-full" /></div></div></div>
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="h-px bg-slate-100" />
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.products.layoutDirection', 'اتجاه التخطيط')}</label>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setConfig({ ...config, productsLayout: 'vertical' })} className={`p-4 rounded-2xl border transition-all ${layoutMode === 'vertical' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}><div className="aspect-square bg-slate-100 rounded-xl mb-3 overflow-hidden"><div className="w-full h-full flex items-center justify-center"><span className="text-2xl">⬇️</span></div></div><p className="font-black text-xs text-center">{t('business.builder.products.vertical', 'عمودي')}</p></button>
          <button onClick={() => setConfig({ ...config, productsLayout: 'horizontal' })} className={`p-4 rounded-2xl border transition-all ${layoutMode === 'horizontal' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}><div className="aspect-square bg-slate-100 rounded-xl mb-3 overflow-hidden"><div className="w-full h-full flex items-center justify-center"><span className="text-2xl">➡️</span></div></div><p className="font-black text-xs text-center">{t('business.builder.products.horizontal', 'أفقي')}</p></button>
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
