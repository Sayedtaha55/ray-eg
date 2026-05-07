'use client';

import React from 'react';
import { useT } from '@/i18n/useT';

type Props = { unit: string; setUnit: React.Dispatch<React.SetStateAction<string>>; };

const HomeTextilesExtras: React.FC<Props> = ({ unit, setUnit }) => {
  const t = useT();
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest block pr-4">{t('business.products.sellingUnitFurnishings', 'وحدة البيع')}</label>
        <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none appearance-none">
          <option value="">{t('business.products.unitNone', 'بدون')}</option>
          <option value="PIECE">{t('business.products.unitPiece', 'قطعة')}</option>
          <option value="M2">{t('business.products.unitM2', 'متر مربع')}</option>
        </select>
      </div>
    </div>
  );
};

export function buildHomeTextilesExtrasPayload(args: { unit: string }) {
  const u = String(args?.unit || '').trim();
  return { payload: { unit: u || null } };
}

export default HomeTextilesExtras;
