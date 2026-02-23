import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

type ImageMapVisibilityKey =
  | 'imageMapCardPrice'
  | 'imageMapCardStock'
  | 'imageMapCardAddToCart'
  | 'imageMapCardDescription';

const ITEMS: { key: ImageMapVisibilityKey; label: string }[] = [
  { key: 'imageMapCardPrice', label: 'إظهار السعر في كارت التحرير بالصور' },
  { key: 'imageMapCardStock', label: 'إظهار المخزون في كارت التحرير بالصور' },
  { key: 'imageMapCardAddToCart', label: 'إظهار زر (إضافة للسلة) في كارت التحرير' },
  { key: 'imageMapCardDescription', label: 'إظهار الوصف المختصر في كارت التحرير' },
];

const ImageMapVisibilitySection: React.FC<Props> = ({ config, setConfig }) => {
  const current = (config?.imageMapVisibility || {}) as Record<string, any>;

  const getValue = (key: ImageMapVisibilityKey) => {
    if (current[key] === undefined || current[key] === null) return true;
    return Boolean(current[key]);
  };

  const setValue = (key: ImageMapVisibilityKey, value: boolean) => {
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
      {ITEMS.map((item) => (
        <label key={item.key} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
          <span className="font-black text-xs md:text-sm text-slate-700">{item.label}</span>
          <input 
            type="checkbox" 
            className="w-5 h-5 rounded-lg border-slate-300 text-[#00E5FF] focus:ring-[#00E5FF]"
            checked={getValue(item.key)} 
            onChange={(e) => setValue(item.key, e.target.checked)} 
          />
        </label>
      ))}
    </div>
  );
};

export default ImageMapVisibilitySection;
