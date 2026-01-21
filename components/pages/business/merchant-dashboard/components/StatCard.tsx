import React from 'react';

type Props = {
  label: string;
  value: any;
  icon: React.ReactNode;
  color: 'cyan' | 'slate';
};

const StatCard: React.FC<Props> = ({ label, value, icon, color }) => {
  const normalizedValue = (() => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number' && Number.isNaN(value)) return 0;
    if (typeof value === 'string') return value.replace(/\b(undefined|null)\b/g, '0');
    return value;
  })();

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm text-right flex flex-col items-end group hover:shadow-xl transition-all">
      <div
        className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl mb-8 group-hover:rotate-6 transition-transform ${
          color === 'cyan' ? 'bg-cyan-50 text-[#00E5FF]' : 'bg-slate-50 text-slate-400'
        }`}
      >
        {icon}
      </div>
      <span className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">{label}</span>
      <span className="text-4xl font-black tracking-tighter text-slate-900">{normalizedValue}</span>
    </div>
  );
};

export default StatCard;
