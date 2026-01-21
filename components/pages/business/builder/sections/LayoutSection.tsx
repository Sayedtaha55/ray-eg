import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const LAYOUTS = [
  { id: 'minimal', label: 'بسيط' },
  { id: 'modern', label: 'عصري' },
  { id: 'bold', label: 'جريء' },
];

const LayoutSection: React.FC<Props> = ({ config, setConfig }) => (
  <div className="space-y-3">
    {LAYOUTS.map((item) => (
      <button
        key={item.id}
        onClick={() => setConfig({ ...config, layout: item.id as any })}
        className={`w-full p-4 rounded-2xl border-2 text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${config.layout === item.id ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
      >
        <p className="font-black text-sm">{item.label}</p>
      </button>
    ))}
  </div>
);

export default LayoutSection;
