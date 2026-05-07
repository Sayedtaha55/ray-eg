'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { useT } from '@/i18n/useT';

const AdminUsers = () => {
  const t = useT();
  return (
    <div className="text-right">
      <div className="flex items-center gap-3 mb-8 flex-row-reverse">
        <Users size={24} className="text-[#00E5FF]" />
        <h3 className="text-2xl font-black text-slate-900">{t('admin.dashboard.users')}</h3>
      </div>
      <p className="text-slate-400 font-bold">{t('admin.users.loading', 'جاري تحميل المستخدمين...')}</p>
    </div>
  );
};

export default AdminUsers;
