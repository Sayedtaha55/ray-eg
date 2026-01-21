import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const HEADING_SIZES = ['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'];
const TEXT_SIZES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];
const FONT_WEIGHTS = ['font-bold', 'font-black', 'font-extrabold'];

const TypographySection: React.FC<Props> = ({ config, setConfig }) => (
  <div className="space-y-4">
    <div>
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">حجم العناوين</label>
      <div className="grid grid-cols-3 gap-2">
        {HEADING_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setConfig({ ...config, headingSize: size })}
            className={`p-3 rounded-xl border text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${config.headingSize === size ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
          >
            <p className={`font-black ${size}`}>ع</p>
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">حجم النصوص</label>
      <div className="grid grid-cols-3 gap-2">
        {TEXT_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setConfig({ ...config, textSize: size })}
            className={`p-3 rounded-xl border text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${config.textSize === size ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
          >
            <p className={`font-black ${size}`}>أ</p>
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">وزن الخط</label>
      <div className="grid grid-cols-2 gap-2">
        {FONT_WEIGHTS.map((weight) => (
          <button
            key={weight}
            onClick={() => setConfig({ ...config, fontWeight: weight })}
            className={`p-3 rounded-xl border text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${config.fontWeight === weight ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
          >
            <p className={`${weight}`}>ع</p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default TypographySection;
