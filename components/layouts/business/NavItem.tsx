import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, onClick, badge }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
      active
        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <div className="flex items-center gap-3 flex-row-reverse">
      <span className={`${active ? 'text-[#00E5FF]' : 'text-slate-400 group-hover:text-slate-900'} transition-colors`}>
        {icon}
      </span>
      <span className="font-black text-sm">{label}</span>
    </div>
    {badge ? (
      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
        {badge}
      </span>
    ) : (
      <span className={`text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${active ? 'text-white/40' : 'text-slate-300'}`}>
        ←
      </span>
    )}
  </Link>
);

export default React.memo(NavItem);
