'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { useT } from '@/i18n/useT';

const DesignTab: React.FC<{ shop: any; onSaved: () => void }> = ({ shop, onSaved }) => {
  const t = useT();
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-right">
      <div className="flex items-center justify-between mb-8 flex-row-reverse">
        <h2 className="text-2xl font-black text-slate-900">{t('business.dashboardTabs.design')}</h2>
        <button onClick={onSaved} className="bg-[#00E5FF] text-black px-6 py-3 rounded-2xl font-black text-sm">
          {t('common.save')}
        </button>
      </div>
      <Palette size={48} className="mx-auto text-slate-200 mb-4" />
      <p className="text-slate-400 font-bold text-center">{t('business.design.customizeDesign')}</p>
    </div>
  );
};

export default DesignTab;
