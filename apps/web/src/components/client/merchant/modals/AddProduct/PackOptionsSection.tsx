'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useT } from '@/i18n/useT';

interface PackOptionsSectionProps { packOptionItems: any[]; setPackOptionItems: (v: any) => void; unit: string; }

const PackOptionsSection: React.FC<PackOptionsSectionProps> = ({ packOptionItems, setPackOptionItems, unit }) => {
  const t = useT();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.products.sellPacksOptional', 'بيع بالباكت (اختياري)')}</label>
        <button type="button" onClick={() => setPackOptionItems((prev: any) => [...(Array.isArray(prev) ? prev : []), { id: `pack_${Date.now()}_${Math.random().toString(16).slice(2)}`, qty: '', price: '' }])} className="px-4 py-2 rounded-xl font-black text-xs bg-slate-900 text-white">+ {t('business.products.addPack', 'أضف باكت')}</button>
      </div>
      {packOptionItems.length > 0 && (
        <div className="space-y-3">
          {packOptionItems.map((p: any, idx: number) => (
            <div key={p.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-black">{t('business.products.packNum', 'باكت {{num}}').replace('{{num}}', String(idx + 1))}</p>
                <button type="button" onClick={() => setPackOptionItems((prev: any) => prev.filter((x: any) => x.id !== p.id))} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.products.packQty', 'الكمية')}</label><input type="number" placeholder={unit ? t('business.products.packQtyPlaceholderWithUnit', `عدد (${unit})`).replace('{{unit}}', unit) : t('business.products.packQtyPlaceholder', 'عدد')} value={p.qty} onChange={e => setPackOptionItems((prev: any) => prev.map((x: any) => x.id === p.id ? { ...x, qty: e.target.value } : x))} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.products.packPriceEgp', 'سعر الباكت (ج.م)')}</label><input type="number" placeholder="0" value={p.price} onChange={e => setPackOptionItems((prev: any) => prev.map((x: any) => x.id === p.id ? { ...x, price: e.target.value } : x))} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none" /></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackOptionsSection;
