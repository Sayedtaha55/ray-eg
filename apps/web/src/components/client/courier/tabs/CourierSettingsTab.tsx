'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { useT } from '@/i18n/useT';

const CourierSettingsTab = () => {
  const t = useT();
  return (
    <div className="text-right">
      <div className="flex items-center gap-3 mb-8 flex-row-reverse">
        <Settings size={24} className="text-[#00E5FF]" />
        <h3 className="text-2xl font-black text-slate-900">{t('courier.dashboard.settings')}</h3>
      </div>
      <p className="text-slate-400 font-bold">{t('profile.settings.title')}</p>
    </div>
  );
};

export default CourierSettingsTab;
