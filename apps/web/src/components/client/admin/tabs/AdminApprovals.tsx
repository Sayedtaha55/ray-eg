'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useT } from '@/i18n/useT';

const AdminApprovals = () => {
  const t = useT();
  return (
    <div className="text-right">
      <div className="flex items-center gap-3 mb-8 flex-row-reverse">
        <ShieldCheck size={24} className="text-[#00E5FF]" />
        <h3 className="text-2xl font-black text-slate-900">{t('admin.dashboard.approvals')}</h3>
      </div>
      <p className="text-slate-400 font-bold">{t('admin.approvals.noPending', 'لا توجد طلبات معلقة حالياً.')}</p>
    </div>
  );
};

export default AdminApprovals;
