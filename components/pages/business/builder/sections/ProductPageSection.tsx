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
    <div className="space-y-3">
      {PRODUCT_ITEMS.map((item) => (
        <label key={item.key} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
          <span className="font-black text-xs md:text-sm text-slate-700">{item.label}</span>
          <input type="checkbox" checked={getValue(item.key)} onChange={(e) => setValue(item.key, e.target.checked)} />
        </label>
      ))}
    </div>
  );
};

export default ProductPageSection;
