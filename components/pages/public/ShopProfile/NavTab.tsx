import React from 'react';
import { motion } from 'framer-motion';

const NavTab = ({ active, onClick, label, primaryColor, layout }: any) => {
  const isBold = layout === 'bold';
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-2 md:pb-5 md:px-4 transition-all relative whitespace-nowrap font-black flex flex-col items-center ${
        active ? 'opacity-100' : 'text-slate-300 hover:text-slate-400 opacity-70 hover:opacity-100'
      } ${isBold ? 'text-base md:text-2xl' : 'text-sm md:text-xl'}`}
      style={{ color: active ? primaryColor : undefined }}
    >
      {label}
      {active && (
        <motion.div
          layoutId="tab-underline"
          className={`absolute bottom-0 left-0 right-0 rounded-t-full ${isBold ? 'h-1.5' : 'h-1'}`}
          style={{ backgroundColor: primaryColor }}
        />
      )}
    </button>
  );
};

export default NavTab;
