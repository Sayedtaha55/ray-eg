import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const PAGE_PADDING = ['p-4 md:p-8', 'p-6 md:p-12', 'p-8 md:p-16', 'p-10 md:p-20'];
const ITEM_GAPS = ['gap-2 md:gap-4', 'gap-3 md:gap-6', 'gap-4 md:gap-8', 'gap-6 md:gap-12'];

const SpacingSection: React.FC<Props> = ({ config, setConfig }) => (
  <div className="space-y-4">
    <div>
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">حشو الصفحة</label>
      <div className="grid grid-cols-2 gap-2">
        {PAGE_PADDING.map((padding) => (
          <button
            key={padding}
            onClick={() => setConfig({ ...config, pagePadding: padding })}
            className={`p-3 rounded-xl border text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${config.pagePadding === padding ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
          >
            <p className="font-black text-xs">{padding}</p>
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">المسافة بين العناصر</label>
      <div className="grid grid-cols-2 gap-2">
        {ITEM_GAPS.map((gap) => (
          <button
            key={gap}
            onClick={() => setConfig({ ...config, itemGap: gap })}
            className={`p-3 rounded-xl border text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${config.itemGap === gap ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
          >
            <p className="font-black text-xs">{gap}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default SpacingSection;
