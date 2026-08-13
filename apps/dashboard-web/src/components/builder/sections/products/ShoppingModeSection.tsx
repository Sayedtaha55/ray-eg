'use client';

import React from 'react';
import { ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface ShoppingModeSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
}

const SHOPPING_ITEMS = [
  { key: 'productCardAddToCart', label: 'أضف للسلة' },
  { key: 'productCardPrice', label: 'السعر' },
  { key: 'productCardStock', label: 'المخزون' },
  { key: 'mobileBottomNavCart', label: 'السلة في التنقل السفلي' },
  { key: 'purchaseModeButton', label: 'زر وضع الشراء' },
];

export default function ShoppingModeSection({ config, onChange }: ShoppingModeSectionProps) {
  const toggleVisibility = (key: string, fallback: boolean = true) => {
    const current = config.elementsVisibility || {};
    const next = { ...current, [key]: !(current[key] ?? fallback) };
    onChange({ elementsVisibility: next });
  };

  const isVisible = (key: string, fallback: boolean = true) => {
    const current = config.elementsVisibility || {};
    if (current[key] === undefined || current[key] === null) return fallback;
    return Boolean(current[key]);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-600">
          <ShoppingCart size={16} />
          <span className="text-xs font-black">تخصيص عناصر التسوق</span>
        </div>
      </div>

      <div className="space-y-3">
        {SHOPPING_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
            <span className="font-black text-sm text-slate-700">{item.label}</span>
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
