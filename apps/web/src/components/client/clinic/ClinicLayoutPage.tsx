'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useT } from '@/i18n/useT';

const ClinicLayoutPage: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const t = useT();
  const pathname = usePathname();

  const isActive = (id: string) => String(pathname || '').includes(`/clinic/${id}`);

  const tabClass = (active: boolean) =>
    `px-5 py-3 rounded-2xl font-black text-sm transition-all ${active ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-100'}`;

  return (
    <div className="p-6 md:p-12">
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xl md:text-2xl font-black text-slate-900">{t('business.clinic.layout.title', 'لوحة العيادة')}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/clinic/overview" className={tabClass(isActive('overview'))}>{t('business.clinic.layout.overview', 'نظرة عامة')}</Link>
            <Link href="/clinic/booking-management" className={tabClass(isActive('booking-management'))}>{t('business.clinic.layout.bookingManagement', 'إدارة الحجوزات')}</Link>
            <Link href="/clinic/design" className={tabClass(isActive('design'))}>{t('business.clinic.layout.design', 'التصميم')}</Link>
            <Link href="/builder/preview?page=clinic" className={tabClass(false)}>{t('business.clinic.layout.previewPage', 'معاينة')}</Link>
            <Link href="/dashboard?tab=settings&settingsTab=overview" className={tabClass(isActive('settings'))}>{t('business.clinic.layout.settings', 'الإعدادات')}</Link>
          </div>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
};

export default ClinicLayoutPage;
