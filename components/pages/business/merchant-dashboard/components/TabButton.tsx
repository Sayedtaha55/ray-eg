import React from 'react';

type Props = {
  active: boolean;
  onClick: () => void;
  onPointerEnter?: () => void;
  icon: React.ReactNode;
  label: string;
};

const TabButton: React.FC<Props> = ({ active, onClick, onPointerEnter, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    onPointerEnter={onPointerEnter}
    className={`flex items-center gap-3 px-5 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full font-black text-[11px] sm:text-xs transition-all whitespace-nowrap border ${
      active
        ? 'bg-slate-900 text-white border-slate-900 shadow-[0_15px_30px_rgba(0,0,0,0.15)]'
        : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-white hover:border-slate-200'
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

export default TabButton;
