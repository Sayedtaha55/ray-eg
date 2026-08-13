'use client';

import React from 'react';
import { Rocket, FileText, Eye, EyeOff } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface ProductPageSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
}

type ProductVisibilityKey = 'productTabs' | 'productShareButton' | 'productQuickSpecs';

const PRODUCT_VISIBILITY_ITEMS: { key: ProductVisibilityKey; label: string }[] = [
  { key: 'productTabs', label: 'ألسنة التبويب' },
  { key: 'productShareButton', label: 'زر المشاركة' },
  { key: 'productQuickSpecs', label: 'المواصفات السريعة' },
];

export default function ProductPageSection({ config, onChange }: ProductPageSectionProps) {
  const setVal = (key: string, value: any) => {
    onChange({ [key]: value });
  };

  const elementsVisibility = config.elementsVisibility || {};

  const toggleVisibility = (key: ProductVisibilityKey) => {
    const current = elementsVisibility[key];
    const next = { ...elementsVisibility, [key]: current === undefined ? false : !current };
    onChange({ elementsVisibility: next });
  };

  const isVisible = (key: ProductVisibilityKey) => {
    const current = elementsVisibility[key];
    if (current === undefined || current === null) return true;
    return Boolean(current);
  };

  const productPageMode = config.productPageMode || 'standard';

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Mode */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          نوع صفحة المنتج
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setVal('productPageMode', 'standard')}
            className={`p-4 rounded-2xl border-2 text-right transition-all ${productPageMode === 'standard' ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <FileText size={20} className={productPageMode === 'standard' ? 'text-slate-900' : 'text-slate-400'} />
            <p className="font-black text-sm mt-2 text-slate-900">عادية</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">صفحة المنتج الافتراضية</p>
          </button>
          <button
            type="button"
            onClick={() => setVal('productPageMode', 'landing')}
            className={`p-4 rounded-2xl border-2 text-right transition-all ${productPageMode === 'landing' ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <Rocket size={20} className={productPageMode === 'landing' ? 'text-slate-900' : 'text-slate-400'} />
            <p className="font-black text-sm mt-2 text-slate-900">صفحة هبوط</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">تصميم احترافي للإعلانات</p>
          </button>
        </div>
        {productPageMode === 'landing' && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
              صفحة الهبوط بتصميم احترافي زي المواقع الكبيرة - مثالية للإعلانات
            </p>
          </div>
        )}
      </div>

      <div className="h-px bg-slate-100 my-4" />

      {/* Colors & Background */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          ألوان صفحة المنتج
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block text-right">لون الخلفية</label>
            <input
              type="color"
              value={config.productPageBackgroundColor || '#FFFFFF'}
              onChange={(e) => setVal('productPageBackgroundColor', e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block text-right">لون النص</label>
            <input
              type="color"
              value={config.productPageTextColor || '#0F172A'}
              onChange={(e) => setVal('productPageTextColor', e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block text-right">لون السعر</label>
            <input
              type="color"
              value={config.productPagePriceColor || '#00E5FF'}
              onChange={(e) => setVal('productPagePriceColor', e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block text-right">لون الزر</label>
            <input
              type="color"
              value={config.productPageButtonColor || '#00E5FF'}
              onChange={(e) => setVal('productPageButtonColor', e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100 my-4" />

      {/* Visibility Toggles */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          إظهار/إخفاء العناصر
        </label>

        {PRODUCT_VISIBILITY_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
            <span className="font-black text-xs text-slate-700">{item.label}</span>
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
    </div>
  );
}
