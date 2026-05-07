'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { useT } from '@/i18n/useT';

const CourierOrdersTab = () => {
  const t = useT();
  return (
    <div className="text-right">
      <div className="flex items-center gap-3 mb-8 flex-row-reverse">
        <Package size={24} className="text-[#00E5FF]" />
        <h3 className="text-2xl font-black text-slate-900">{t('courier.orders.title', 'الطلبات الحالية')}</h3>
      </div>
      <p className="text-slate-400 font-bold">{t('courier.orders.noOrders', 'لا توجد طلبات نشطة حالياً.')}</p>
    </div>
  );
};

export default CourierOrdersTab;
