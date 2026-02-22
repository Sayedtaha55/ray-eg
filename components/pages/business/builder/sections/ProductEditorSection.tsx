import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

type ProductEditorVisibilityKey =
  | 'productCardPrice'
  | 'productCardStock'
  | 'productCardAddToCart'
  | 'productCardReserve';

const ITEMS: { key: ProductEditorVisibilityKey; label: string }[] = [
  { key: 'productCardPrice', label: 'إظهار السعر في كارت المنتج' },
  { key: 'productCardStock', label: 'إظهار المخزون في كارت المنتج' },
  { key: 'productCardAddToCart', label: 'إظهار زر (إضافة للسلة)' },
  { key: 'productCardReserve', label: 'إظهار زر (حجز)' },
];

const ProductEditorSection: React.FC<Props> = ({ config, setConfig }) => {
  const current = (config?.productEditorVisibility || {}) as Record<string, any>;

  const getValue = (key: ProductEditorVisibilityKey) => {
    if (current[key] === undefined || current[key] === null) return true;
    return Boolean(current[key]);
  };

  const setValue = (key: ProductEditorVisibilityKey, value: boolean) => {
    setConfig((prev: any) => {
      const base = (prev?.productEditorVisibility && typeof prev.productEditorVisibility === 'object')
        ? prev.productEditorVisibility
        : {};
      const next = { ...base, [key]: value };
      return { ...prev, productEditorVisibility: next };
    });
  };

  return (
    <div className="space-y-3">
      {ITEMS.map((item) => (
        <label key={item.key} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
          <span className="font-black text-xs md:text-sm text-slate-700">{item.label}</span>
          <input type="checkbox" checked={getValue(item.key)} onChange={(e) => setValue(item.key, e.target.checked)} />
        </label>
      ))}
    </div>
  );
};

export default ProductEditorSection;
