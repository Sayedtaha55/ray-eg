'use client';

import React, { useCallback } from 'react';
import { X } from 'lucide-react';
import { useT } from '@/i18n/useT';

export type RestaurantMenuVariantItem = {
  id: string; name: string;
  hasSmall: boolean; hasMedium: boolean; hasLarge: boolean;
  priceSmall: string; priceMedium: string; priceLarge: string;
};

export interface RestaurantMenuSectionProps {
  menuVariantItems: RestaurantMenuVariantItem[];
  setMenuVariantItems: React.Dispatch<React.SetStateAction<RestaurantMenuVariantItem[]>>;
  parseNumberInput: (v: any) => number;
}

const RestaurantMenuSection: React.FC<RestaurantMenuSectionProps> = ({ menuVariantItems, setMenuVariantItems, parseNumberInput }) => {
  const t = useT();
  const handleAddItem = useCallback(() => {
    setMenuVariantItems(prev => [...prev, { id: `type_${Date.now()}_${Math.random().toString(16).slice(2)}`, name: '', hasSmall: true, hasMedium: true, hasLarge: true, priceSmall: '', priceMedium: '', priceLarge: '' }]);
  }, [setMenuVariantItems]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.products.typesAndSizesOptional', 'الأنواع والأحجام (اختياري)')}</label>
        <button type="button" onClick={handleAddItem} className="px-4 py-2 rounded-xl font-black text-xs bg-slate-900 text-white">+ {t('business.products.addType', 'أضف نوع')}</button>
      </div>
      {menuVariantItems.length > 0 && (
        <div className="space-y-4">
          {menuVariantItems.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black">{t('business.products.typeNum', 'نوع {{num}}').replace('{{num}}', String(idx + 1))}</p>
                <button type="button" onClick={() => setMenuVariantItems(prev => prev.filter(x => x.id !== item.id))} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.products.typeNameLabel', 'اسم النوع')}</label>
                <input required value={item.name} onChange={e => setMenuVariantItems(prev => prev.map(x => x.id === item.id ? { ...x, name: e.target.value } : x))} placeholder={t('business.products.typeNamePlaceholder', 'مثال: بيتزا')} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{ key: 'Small', has: item.hasSmall, val: item.priceSmall, field: 'hasSmall' as const, priceField: 'priceSmall' as const }, { key: 'Medium', has: item.hasMedium, val: item.priceMedium, field: 'hasMedium' as const, priceField: 'priceMedium' as const }, { key: 'Large', has: item.hasLarge, val: item.priceLarge, field: 'hasLarge' as const, priceField: 'priceLarge' as const }].map(s => (
                  <div key={s.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t(`business.dashboard.products.size${s.key}`, s.key)}</label>
                      <button type="button" onClick={() => setMenuVariantItems(prev => prev.map(x => x.id === item.id ? { ...x, [s.field]: !x[s.field], [s.priceField]: !x[s.field] ? x[s.priceField] : '' } : x))} className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200">{s.has ? t('business.products.none', 'بدون') : t('business.products.available', 'متاح')}</button>
                    </div>
                    <input type="number" disabled={!s.has} value={s.has ? s.val : ''} onChange={e => setMenuVariantItems(prev => prev.map(x => x.id === item.id ? { ...x, [s.priceField]: e.target.value } : x))} placeholder={s.has ? '0' : t('business.products.none', 'بدون')} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none disabled:opacity-60" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantMenuSection;
