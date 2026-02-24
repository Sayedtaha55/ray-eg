import React from 'react';
import { motion } from 'framer-motion';

const NavTab = ({ active, onClick, label, icon, design, primaryColor, layout }: any) => {
  const resolvedPrimaryColor = String(primaryColor || design?.primaryColor || '').trim() || '#00E5FF';
  const resolvedLayout = String(layout || design?.layout || '').trim() || 'modern';
  const isBold = resolvedLayout === 'bold';
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-2 md:pb-5 md:px-4 transition-all relative whitespace-nowrap font-black flex flex-col items-center ${
        active ? 'opacity-100' : 'text-slate-300 hover:text-slate-400 opacity-70 hover:opacity-100'
      } ${isBold ? 'text-base md:text-2xl' : 'text-sm md:text-xl'}`}
      style={{ color: active ? resolvedPrimaryColor : undefined }}
    >
      {icon ? <span className="mb-1">{icon}</span> : null}
      {label}
      {active && (
        <motion.div
          layoutId="tab-underline"
          className={`absolute bottom-0 left-0 right-0 rounded-t-full ${isBold ? 'h-1.5' : 'h-1'}`}
          style={{ backgroundColor: resolvedPrimaryColor }}
        />
      )}
    </button>
  );
};

export default NavTab;
