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
        <div className="flex items-center justify-between gap-4">
          <div className="text-right">
            <p className="font-black text-sm">{item.label}</p>
          </div>

          {item.id === 'minimal' ? (
            <div className="w-28 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200" />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-slate-900/70 backdrop-blur-[2px]" />
              <div className="absolute inset-x-0 bottom-0 h-8 px-2 py-1 flex flex-col items-end justify-center">
                <div className="h-2 w-14 bg-white/90 rounded-full" />
                <div className="mt-1 h-2 w-10 bg-white/70 rounded-full" />
              </div>
            </div>
          ) : item.id === 'cards' ? (
            <div className="w-28 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-white grid grid-cols-2 gap-1 p-1 shrink-0">
              <div className="bg-slate-100 rounded-xl" />
              <div className="bg-slate-100 rounded-xl" />
              <div className="bg-slate-100 rounded-xl" />
              <div className="bg-slate-100 rounded-xl" />
            </div>
          ) : (
            <div className="w-28 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 space-y-2 shrink-0">
              <div className="flex flex-row-reverse items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-16 bg-slate-100 rounded-full" />
                  <div className="h-2 w-12 bg-slate-100 rounded-full" />
                </div>
              </div>
              <div className="flex flex-row-reverse items-center gap-2 opacity-70">
                <div className="w-8 h-8 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-14 bg-slate-100 rounded-full" />
                  <div className="h-2 w-10 bg-slate-100 rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </button>
    ))}
  </div>
);

export default ProductsSection;
