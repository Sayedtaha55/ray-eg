'use client';

import React from 'react';
import { useT } from '@/i18n/useT';

type Props = { config: any; setConfig: React.Dispatch<React.SetStateAction<any>> };

const LAYOUT_IDS = ['minimal', 'modern', 'bold'] as const;

const LayoutSection: React.FC<Props> = ({ config, setConfig }) => {
  const t = useT();
  return (
    <div className="space-y-3">
      {LAYOUT_IDS.map(id => (
        <button key={id} onClick={() => setConfig({ ...config, layout: id as any })} className={`w-full p-4 rounded-2xl border-2 text-right transition-all hover:shadow-sm active:scale-[0.99] ${config.layout === id ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}>
          <p className="font-black text-sm">{t(`business.builder.layout.${id}`, id)}</p>
        </button>
      ))}
    </div>
  );
};

export default LayoutSection;
