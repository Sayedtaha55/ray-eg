'use client';

import React from 'react';
import { Store } from 'lucide-react';
import { useT } from '@/i18n/useT';

const AdminShops = () => {
  const t = useT();
  return (
    <div className="text-right">
      <div className="flex items-center gap-3 mb-8 flex-row-reverse">
        <Store size={24} className="text-[#00E5FF]" />
        <h3 className="text-2xl font-black text-slate-900">{t('admin.dashboard.shops')}</h3>
      </div>
      <p className="text-slate-400 font-bold">{t('admin.shops.loading', 'جاري تحميل المتاجر...')}</p>
    </div>
  );
};

export default AdminShops;
