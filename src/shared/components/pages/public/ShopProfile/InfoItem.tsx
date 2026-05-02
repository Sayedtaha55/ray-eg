import React from 'react';

const InfoItem = ({ icon, title, value }: any) => (
  <div className="flex items-center gap-4 flex-row-reverse w-full">
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">{icon}</div>
    <div className="text-right flex-1 min-w-0">
      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-xs md:text-lg font-black text-slate-800 break-words leading-tight">{value}</p>
    </div>
  </div>
);

export default InfoItem;
