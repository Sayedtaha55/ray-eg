import React, { useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { CalendarCheck, ClipboardList, ListChecks, Palette, Settings, Sparkles, Stethoscope, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';
import { getBookingActivityDefinition } from './bookingActivityConfig';

const ClinicLayoutPage: React.FC = () => {
  const { t } = useTranslation();
  const { NavLink, Outlet, useLocation } = ReactRouterDOM as any;
  const location = useLocation();
  const [shop, setShop] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    ApiService.getMyShop()
      .then((myShop: any) => {
        if (!cancelled) setShop(myShop);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const bookingActivity = useMemo(
    () => getBookingActivityDefinition(shop?.pageDesign?.bookingActivityType),
    [shop?.pageDesign?.bookingActivityType],
  );

  const isActive = (id: string) => {
    const p = String(location?.pathname || '');
    return p.includes(`/business/clinic/${id}`);
  };

  const tabClass = (active: boolean) => {
    return `px-5 py-3 rounded-2xl font-black text-sm transition-all inline-flex items-center gap-2 ${
      active ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-100'
    }`;
  };

  const generalTabs = [
    { to: '/business/clinic/overview', id: 'overview', label: t('business.clinic.layout.overview'), icon: <ClipboardList size={16} /> },
    { to: '/business/clinic/bookings', id: 'bookings', label: 'حجوزات لوحة الحجوزات', icon: <CalendarCheck size={16} /> },
    { to: '/business/clinic/design', id: 'design', label: t('business.clinic.layout.design'), icon: <Palette size={16} /> },
    { to: '/business/clinic/settings', id: 'settings', label: t('business.clinic.layout.settings'), icon: <Settings size={16} /> },
  ];

  const activityTabs = [
    { to: '/business/clinic/doctors', id: 'doctors', label: bookingActivity.primaryTabLabel, icon: <Users size={16} /> },
    { to: '/business/clinic/services', id: 'services', label: bookingActivity.secondaryTabLabel, icon: <Stethoscope size={16} /> },
  ];

  return (
    <div className="p-6 md:p-12">
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
        <div className="flex items-start justify-between gap-6 flex-wrap" dir="rtl">
          <div className="text-right">
            <div className="text-xl md:text-2xl font-black text-slate-900">{t('business.clinic.layout.title')}</div>
            <p className="mt-2 text-xs font-bold text-slate-400 max-w-2xl">
              لوحة حجوزات مستقلة لنشاط: <span className="text-slate-700">{bookingActivity.title}</span>. الأزرار العامة ثابتة، وأزرار النشاط تتغير حسب نوع الحجز بدون تأثير على الأنشطة الأخرى.
            </p>
          </div>
          <NavLink to="/business/builder/preview?page=clinic" className={tabClass(false)}>{t('business.clinic.layout.previewPage')}</NavLink>
        </div>

        <div className="mt-7 space-y-4" dir="rtl">
          <div>
            <div className="mb-2 text-[11px] font-black text-slate-400">الأزرار العامة للحجوزات</div>
            <div className="flex items-center gap-2 flex-wrap">
              {generalTabs.map((tab) => (
                <NavLink key={tab.id} to={tab.to} className={tabClass(isActive(tab.id))}>{tab.icon}{tab.label}</NavLink>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[11px] font-black text-slate-400">أزرار خاصة بنشاط {bookingActivity.title}</div>
            <div className="flex items-center gap-2 flex-wrap">
              {activityTabs.map((tab) => (
                <NavLink key={tab.id} to={tab.to} className={tabClass(isActive(tab.id))}>{tab.icon}{tab.label}</NavLink>
              ))}
              {bookingActivity.extraButtons.map((label) => (
                <span key={label} className="px-5 py-3 rounded-2xl font-black text-sm inline-flex items-center gap-2 bg-cyan-50 text-cyan-800 border border-cyan-100">
                  <ListChecks size={16} />{label}
                </span>
              ))}
              <NavLink to="/business/clinic/settings" className="px-5 py-3 rounded-2xl font-black text-sm inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-100 hover:bg-amber-100 transition-all">
                <Sparkles size={16} />تغيير نوع نشاط الحجوزات
              </NavLink>
            </div>
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
