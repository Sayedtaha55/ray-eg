import React from 'react';

type Props = {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
};

const TabButton: React.FC<Props> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-10 py-5 rounded-full font-black text-xs transition-all whitespace-nowrap ${
      active ? 'bg-slate-900 text-white shadow-[0_15px_30px_rgba(0,0,0,0.15)]' : 'text-slate-400 hover:text-slate-900 hover:bg-white'
    }`}
  >
    {icon} <span>{label}</span>
  </button>
);

export default TabButton;
