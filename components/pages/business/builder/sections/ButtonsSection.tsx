import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const SHAPES = ['rounded-none', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full'];
const PADDINGS = ['px-3 py-2', 'px-4 py-2.5', 'px-6 py-3', 'px-8 py-4'];

const ButtonsSection: React.FC<Props> = ({ config, setConfig }) => (
  <div className="space-y-4">
    <div>
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">شكل الزر</label>
      <div className="grid grid-cols-3 gap-2">
        {SHAPES.map((shape) => (
          <button
            key={shape}
            onClick={() => setConfig({ ...config, buttonShape: shape })}
            className={`p-3 rounded-xl border text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${config.buttonShape === shape ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
          >
            <div className={`h-6 bg-slate-900 ${shape}`}></div>
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">حجم الحشو</label>
      <div className="grid grid-cols-2 gap-2">
        {PADDINGS.map((padding) => (
          <button
            key={padding}
            onClick={() => setConfig({ ...config, buttonPadding: padding })}
            className={`p-3 rounded-xl border text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${config.buttonPadding === padding ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
          >
            <p className="font-black text-xs">{padding}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default ButtonsSection;
