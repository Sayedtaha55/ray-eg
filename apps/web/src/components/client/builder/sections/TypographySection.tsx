'use client';

import React from 'react';
import { useT } from '@/i18n/useT';

type Props = { config: any; setConfig: React.Dispatch<React.SetStateAction<any>> };

const HEADING_SIZES = ['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'];
const TEXT_SIZES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];

const TypographySection: React.FC<Props> = ({ config, setConfig }) => {
  const t = useT();
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">{t('business.builder.typography.headingSize', 'حجم العنوان')}</label>
        <div className="grid grid-cols-3 gap-2">
          {HEADING_SIZES.map(size => (
            <button key={size} onClick={() => setConfig({ ...config, headingSize: size })} className={`p-3 rounded-xl border text-right transition-all hover:shadow-sm active:scale-[0.99] ${config.headingSize === size ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}>
              <p className={`font-black ${size}`}>{t('business.builder.typography.sampleHeading', 'عنوان')}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">{t('business.builder.typography.textSize', 'حجم النص')}</label>
        <div className="grid grid-cols-3 gap-2">
          {TEXT_SIZES.map(size => (
            <button key={size} onClick={() => setConfig({ ...config, textSize: size })} className={`p-3 rounded-xl border text-right transition-all hover:shadow-sm active:scale-[0.99] ${config.textSize === size ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}>
              <p className={`font-black ${size}`}>{t('business.builder.typography.sampleText', 'نص')}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypographySection;
