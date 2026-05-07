'use client';

import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  active: boolean;
  onClick: () => void;
  onPointerEnter?: () => void;
  icon: React.ReactNode;
  label: string;
};

const TabButton: React.FC<Props> = ({ active, onClick, onPointerEnter, icon, label }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      className={`shrink-0 px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
        active
          ? 'bg-[#00E5FF] text-black shadow-lg shadow-cyan-200/50'
          : 'bg-white text-slate-500 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export default TabButton;
