'use client';

import React from 'react';
import { useT } from '@/i18n/useT';

const ClinicBookingManagementPage: React.FC = () => {
  const t = useT();
  return (
    <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 md:p-8">
      <div className="text-lg font-black text-slate-900">{t('business.clinic.bookingManagement.title', 'إدارة الحجوزات')}</div>
      <div className="mt-2 text-sm font-bold text-slate-500">{t('business.clinic.bookingManagement.subtitle', 'إدارة حجوزات العيادة')}</div>
    </div>
  );
};

export default ClinicBookingManagementPage;
