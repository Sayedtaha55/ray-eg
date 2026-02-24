import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

type ImageMapCardVisibilityKey =
  | 'imageMapCardPrice'
  | 'imageMapCardStock'
  | 'imageMapCardAddToCart'
  | 'imageMapCardReserve'
  | 'imageMapCardDescription';

const IMAGE_MAP_ITEMS: { key: ImageMapCardVisibilityKey; label: string }[] = [
  { key: 'imageMapCardPrice', label: 'كارت منتج الخريطة: إظهار السعر' },
  { key: 'imageMapCardStock', label: 'كارت منتج الخريطة: إظهار المخزون' },
  { key: 'imageMapCardDescription', label: 'كارت منتج الخريطة: إظهار الوصف' },
  { key: 'imageMapCardAddToCart', label: 'كارت منتج الخريطة: إظهار زر (إضافة للسلة)' },
  { key: 'imageMapCardReserve', label: 'كارت منتج الخريطة: إظهار زر (حجز)' },
];

const ProductEditorSection: React.FC<Props> = ({ config, setConfig }) => {
  const imageMapCurrent = (config?.imageMapVisibility || {}) as Record<string, any>;

  const getImageMapValue = (key: ImageMapCardVisibilityKey) => {
    if (imageMapCurrent[key] === undefined || imageMapCurrent[key] === null) return true;
    return Boolean(imageMapCurrent[key]);
  };

  const setImageMapValue = (key: ImageMapCardVisibilityKey, value: boolean) => {
    setConfig((prev: any) => {
      const base = (prev?.imageMapVisibility && typeof prev.imageMapVisibility === 'object')
        ? prev.imageMapVisibility
        : {};
      const next = { ...base, [key]: value };
      return { ...prev, imageMapVisibility: next };
    });
  };

  return (
    <div className="space-y-3">
      {IMAGE_MAP_ITEMS.map((item) => (
        <label key={item.key} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
          <span className="font-black text-xs md:text-sm text-slate-700">{item.label}</span>
          <input type="checkbox" checked={getImageMapValue(item.key)} onChange={(e) => setImageMapValue(item.key, e.target.checked)} />
        </label>
      ))}
    </div>
  );
};

export default ProductEditorSection;
