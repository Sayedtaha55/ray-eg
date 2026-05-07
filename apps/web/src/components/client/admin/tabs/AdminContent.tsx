'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { useT } from '@/i18n/useT';

const AdminContent = () => {
  const t = useT();
  return (
    <div className="text-right">
      <div className="flex items-center gap-3 mb-8 flex-row-reverse">
        <FileText size={24} className="text-[#00E5FF]" />
        <h3 className="text-2xl font-black text-slate-900">{t('admin.dashboard.content')}</h3>
      </div>
      <p className="text-slate-400 font-bold">{t('common.loading')}</p>
    </div>
  );
};

export default AdminContent;
