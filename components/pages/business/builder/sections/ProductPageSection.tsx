import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

type ProductVisibilityKey = 'productTabs' | 'productShareButton' | 'productQuickSpecs';

const PRODUCT_ITEMS: { key: ProductVisibilityKey; label: string }[] = [
  { key: 'productTabs', label: 'إظهار تبويبات صفحة المنتج (التفاصيل / المواصفات / الشحن)' },
  { key: 'productShareButton', label: 'إظهار زر المشاركة في صفحة المنتج' },
  { key: 'productQuickSpecs', label: 'إظهار صندوق المواصفات السريعة' },
];

const ProductPageSection: React.FC<Props> = ({ config, setConfig }) => {
  const current = (config?.elementsVisibility || {}) as Record<string, any>;

  const getValue = (key: ProductVisibilityKey) => {
    if (current[key] === undefined || current[key] === null) return true;
    return Boolean(current[key]);
  };

  const setValue = (key: ProductVisibilityKey, value: boolean) => {
    const next = { ...current, [key]: value };
    setConfig({ ...config, elementsVisibility: next });
  };

  return (
    <div className="space-y-6">
      {/* Colors & Background */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون الخلفية</label>
            <input
              type="color"
              value={String(config.productPageBackgroundColor || '#FFFFFF')}
              onChange={(e) => setConfig({ ...config, productPageBackgroundColor: e.target.value })}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون النص</label>
            <input
              type="color"
              value={String(config.productPageTextColor || '#0F172A')}
              onChange={(e) => setConfig({ ...config, productPageTextColor: e.target.value })}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون السعر</label>
            <input
              type="color"
              value={String(config.productPagePriceColor || '#00E5FF')}
              onChange={(e) => setConfig({ ...config, productPagePriceColor: e.target.value })}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون الزر</label>
            <input
              type="color"
              value={String(config.productPageButtonColor || config.primaryColor || '#00E5FF')}
              onChange={(e) => setConfig({ ...config, productPageButtonColor: e.target.value })}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Visibility */}
      <div className="space-y-3">
        <h3 className="font-black text-sm text-slate-900">إظهار / إخفاء</h3>
        {PRODUCT_ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-black text-xs md:text-sm text-slate-700">{item.label}</span>
            <input
              type="checkbox"
              checked={getValue(item.key)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setValue(item.key, e.target.checked)}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default ProductPageSection;
