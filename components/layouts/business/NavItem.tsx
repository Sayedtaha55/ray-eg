import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;

interface NavItemProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
  badge?: number;
  showIcon?: boolean;
  hideLabel?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  active,
  onClick,
  badge,
  showIcon = true,
  hideLabel = false,
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={`relative flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group border ${
      active
        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
        : 'bg-white text-slate-600 border-transparent hover:border-slate-100 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <div className={`flex items-center gap-3 flex-row-reverse ${hideLabel ? 'w-full justify-center' : ''}`}>
      {showIcon && icon ? (
        <span className={`${active ? 'text-[#00E5FF]' : 'text-slate-400 group-hover:text-slate-900'} transition-colors`}>
          {icon}
        </span>
      ) : null}
      {!hideLabel && <span className="font-black text-sm leading-none">{label}</span>}
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
