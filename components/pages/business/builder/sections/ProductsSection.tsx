import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const PRODUCTS_DISPLAY = [
  { id: 'cards', label: 'كروت' },
  { id: 'list', label: 'قائمة' },
  { id: 'minimal', label: 'بدون بطاقات' },
];

const ProductsSection: React.FC<Props> = ({ config, setConfig }) => (
  <div className="space-y-3">
    {PRODUCTS_DISPLAY.map((item) => (
      <button
        key={item.id}
        onClick={() => setConfig({ ...config, productDisplay: item.id, productDisplayStyle: item.id === 'list' ? 'list' : undefined })}
        className={`w-full p-4 rounded-2xl border-2 text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${(config.productDisplay || (config.productDisplayStyle === 'list' ? 'list' : undefined) || 'cards') === item.id ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
      >
        <p className="font-black text-sm">{item.label}</p>
      </button>
    ))}
  </div>
);

export default ProductsSection;
