import React from 'react';
import { Check } from 'lucide-react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const COLORS = ['#1A1A1A', '#00E5FF', '#BD00FF', '#FF0055', '#FFCC00', '#00FF77', '#0077FF', '#FF6600', '#7C3AED', '#EC4899'];

const ColorsSection: React.FC<Props> = ({ config, setConfig }) => (
  <div className="grid grid-cols-5 gap-3">
    {COLORS.map((color) => (
      <button
        key={color}
        onClick={() => setConfig({ ...config, primaryColor: color })}
        className={`aspect-square rounded-xl border-2 transition-all relative hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.98] ${config.primaryColor === color ? 'scale-110 shadow-lg border-white ring-2 ring-slate-200' : 'border-transparent opacity-60'}`}
        style={{ backgroundColor: color }}
      >
        {config.primaryColor === color && <Check className="w-4 h-4 text-white mx-auto" />}
      </button>
    ))}
  </div>
);

export default ColorsSection;
