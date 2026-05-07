'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';
import { useT } from '@/i18n/useT';

const SalesTab: React.FC<{ sales: any[]; posEnabled: boolean }> = ({ sales }) => {
  const t = useT();
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-right">
      <h2 className="text-2xl font-black text-slate-900 mb-8">{t('business.dashboardTabs.sales')}</h2>
      <CreditCard size={48} className="mx-auto text-slate-200 mb-4" />
      <p className="text-slate-400 font-bold text-center">{t('business.sales.noSales')}</p>
    </div>
  );
};

export default SalesTab;
