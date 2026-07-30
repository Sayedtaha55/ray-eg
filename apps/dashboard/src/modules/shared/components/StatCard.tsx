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
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end group hover:shadow-md transition-all">
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-xl mb-4 sm:mb-5 ${
          color === 'cyan' ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-50 text-slate-500'
        }`}
      >
        {icon}
      </div>
      <span className="text-slate-500 font-semibold text-xs mb-1">{label}</span>
      <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{normalizedValue}</span>
    </div>
  );
};

export default StatCard;
