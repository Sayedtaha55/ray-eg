'use client';

import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'cyan' | 'slate';
};

const StatCard: React.FC<Props> = ({ label, value, icon, color }) => {
  const colorClass = color === 'cyan' ? 'bg-cyan-50 text-[#00E5FF]' : 'bg-slate-50 text-slate-600';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-end gap-3 sm:gap-4"
    >
      <div className={`p-3 sm:p-4 rounded-2xl ${colorClass}`}>
        {icon}
      </div>
      <div className="text-right">
        <div className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
        <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">{value}</div>
      </div>
    </motion.div>
  );
};

export default StatCard;
