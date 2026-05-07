'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useT } from '@/i18n/useT';

const NotificationsTab: React.FC<{ shopId: string }> = ({ shopId }) => {
  const t = useT();
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-right">
      <div className="flex items-center justify-between mb-8 flex-row-reverse">
        <h2 className="text-2xl font-black text-slate-900">{t('business.dashboardTabs.notifications')}</h2>
        <Bell size={24} className="text-[#00E5FF]" />
      </div>
      <p className="text-slate-400 font-bold">{t('business.overview.noRecentActivity')}</p>
    </div>
  );
};

export default NotificationsTab;
