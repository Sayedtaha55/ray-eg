'use client';

import React from 'react';
import { ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = { config: any; setConfig: React.Dispatch<React.SetStateAction<any>> };

const ShoppingModeSection: React.FC<Props> = ({ config, setConfig }) => {
  const t = useT();
  const toggleVisibility = (key: string, fallback = true) => { const current = config?.elementsVisibility || {}; const next = { ...current, [key]: !(current[key] ?? fallback) }; setConfig({ ...config, elementsVisibility: next }); };
  const isVisible = (key: string, fallback = true) => { const current = config?.elementsVisibility || {}; if (current[key] === undefined || current[key] === null) return fallback; return Boolean(current[key]); };

  const shoppingItems = [
    { key: 'productCardAddToCart', label: t('business.builder.shoppingMode.addToCart', 'إضافة للسلة') },
    { key: 'productCardPrice', label: t('business.builder.shoppingMode.price', 'السعر') },
    { key: 'productCardStock', label: t('business.builder.shoppingMode.stock', 'المخزون') },
    { key: 'mobileBottomNavCart', label: t('business.builder.shoppingMode.cartNav', 'زر السلة') },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-4 space-y-2"><div className="flex items-center gap-2 text-slate-600"><ShoppingCart size={16} /><span className="text-xs font-black">{t('business.builder.shoppingMode.description', 'تحكم في عناصر التسوق')}</span></div></div>
      <div className="space-y-3">
        {shoppingItems.map(item => (
          <div key={item.key} className="flex items-center justify-between">
            <span className="font-black text-sm">{item.label}</span>
            <button type="button" onClick={() => toggleVisibility(item.key)} className={`p-2 rounded-xl transition-all ${isVisible(item.key) ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-100 text-slate-400'}`}>{isVisible(item.key) ? <Eye size={16} /> : <EyeOff size={16} />}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingModeSection;
