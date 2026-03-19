import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const ClinicLayoutPage: React.FC = () => {
  const { NavLink, Outlet, useLocation } = ReactRouterDOM as any;
  const location = useLocation();

  const isActive = (id: string) => {
    const p = String(location?.pathname || '');
    return p.includes(`/business/clinic/${id}`);
  };

  const tabClass = (active: boolean) => {
    return `px-5 py-3 rounded-2xl font-black text-sm transition-all ${
      active ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-100'
    }`;
  };

  return (
    <div className="p-6 md:p-12">
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xl md:text-2xl font-black text-slate-900">العيادة</div>
          <div className="flex items-center gap-2 flex-wrap">
            <NavLink to="/business/clinic/overview" className={tabClass(isActive('overview'))}>نظرة عامة</NavLink>
            <NavLink to="/business/clinic/booking-management" className={tabClass(isActive('booking-management'))}>إدارة الحجوزات</NavLink>
            <NavLink to="/business/clinic/design" className={tabClass(isActive('design'))}>التصميم</NavLink>
            <NavLink to="/business/builder/preview?page=clinic" className={tabClass(false)}>معاينة صفحة العرض</NavLink>
            <NavLink to="/business/dashboard?tab=settings&settingsTab=overview" className={tabClass(isActive('settings'))}>الإعدادات</NavLink>
          </div>
        </div>
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ClinicLayoutPage;
