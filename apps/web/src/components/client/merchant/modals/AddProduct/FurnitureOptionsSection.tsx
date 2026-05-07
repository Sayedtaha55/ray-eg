'use client';

import React from 'react';
import { useT } from '@/i18n/useT';

interface FurnitureOptionsSectionProps {
  furnitureUnit: string; setFurnitureUnit: (v: string) => void;
  furnitureLengthCm: string; setFurnitureLengthCm: (v: string) => void;
  furnitureWidthCm: string; setFurnitureWidthCm: (v: string) => void;
  furnitureHeightCm: string; setFurnitureHeightCm: (v: string) => void;
  unit: string;
}

const FurnitureOptionsSection: React.FC<FurnitureOptionsSectionProps> = ({ furnitureUnit, setFurnitureUnit, furnitureLengthCm, setFurnitureLengthCm, furnitureWidthCm, setFurnitureWidthCm, furnitureHeightCm, setFurnitureHeightCm, unit }) => {
  const t = useT();
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest block pr-4">{t('business.products.sellingUnitFurniture', 'وحدة البيع')}</label>
        <select value={furnitureUnit} onChange={e => setFurnitureUnit(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none appearance-none">
          <option value="">{t('business.products.unitNone', 'بدون')}</option>
          <option value="PIECE">{t('business.products.unitPiece', 'قطعة')}</option>
          <option value="M">{t('business.products.unitLinearMeter', 'متر طولي')}</option>
          <option value="M2">{t('business.products.unitM2', 'متر مربع')}</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.products.horizontalLengthCm', 'الطول (سم)')}</label><input type="number" value={furnitureLengthCm} onChange={e => setFurnitureLengthCm(e.target.value)} placeholder={t('business.products.placeholders.lengthCm', 'سم')} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none" /></div>
        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.products.widthDepthCm', 'العرض/العمق (سم)')}</label><input type="number" value={furnitureWidthCm} onChange={e => setFurnitureWidthCm(e.target.value)} placeholder={t('business.products.placeholders.widthCm', 'سم')} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none" /></div>
        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.products.heightFromGroundCm', 'الارتفاع (سم)')}</label><input type="number" value={furnitureHeightCm} onChange={e => setFurnitureHeightCm(e.target.value)} placeholder={t('business.products.placeholders.heightCm', 'سم')} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none" /></div>
      </div>
    </div>
  );
};

export default FurnitureOptionsSection;
