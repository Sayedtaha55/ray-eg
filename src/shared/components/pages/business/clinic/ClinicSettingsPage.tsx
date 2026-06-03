import React, { useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import {
  Building2,
  CalendarClock,
  Car,
  CheckCircle2,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Hotel,
  PartyPopper,
  Scissors,
  Settings,
  Sparkles,
  Stethoscope,
  Utensils,
  Wrench,
} from 'lucide-react';
import { ApiService } from '@/services/api.service';
import {
  BOOKING_ACTIVITY_DEFINITIONS,
  BOOKING_SETTINGS_PAGE_BUTTONS,
  BookingActivityType,
  getBookingActivityDefinition,
} from './bookingActivityConfig';

const ICON_BY_ACTIVITY: Record<BookingActivityType, React.ReactNode> = {
  clinic_hospital: <Stethoscope size={20} />,
  salon_barber: <Scissors size={20} />,
  wellness_spa: <HeartPulse size={20} />,
  chalets_resorts: <Building2 size={20} />,
  hotels_rooms: <Hotel size={20} />,
  restaurants_tables: <Utensils size={20} />,
  events_venues: <PartyPopper size={20} />,
  vehicle_rental: <Car size={20} />,
  sports_trainers: <Dumbbell size={20} />,
  education_courses: <GraduationCap size={20} />,
  maintenance_services: <Wrench size={20} />,
  general_appointments: <CalendarClock size={20} />,
};

type Props = {
  shop?: any;
  onSaved?: () => void;
};

const ClinicSettingsPage: React.FC<Props> = ({ shop, onSaved }) => {
  const { NavLink } = ReactRouterDOM as any;
  const [loadedShop, setLoadedShop] = useState<any>(shop || null);
  const effectiveShop = shop || loadedShop;

  useEffect(() => {
    if (shop || loadedShop) return;
    let cancelled = false;
    ApiService.getMyShop()
      .then((myShop: any) => {
        if (!cancelled) setLoadedShop(myShop);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [shop, loadedShop]);

  const currentActivity = String(effectiveShop?.pageDesign?.bookingActivityType || 'clinic_hospital') as BookingActivityType;
  const [selectedActivity, setSelectedActivity] = useState<BookingActivityType>(currentActivity);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedActivity(currentActivity);
  }, [currentActivity]);

  const activeDefinition = useMemo(
    () => getBookingActivityDefinition(selectedActivity),
    [selectedActivity],
  );

  const bookingGeneralButtons = [
    'نظرة عامة الحجوزات',
    'حجوزات لوحة الحجوزات',
    'تصميم صفحة الحجز',
    'إعدادات الحجوزات',
  ];


  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updatedPageDesign = {
        ...(effectiveShop?.pageDesign || {}),
        bookingActivityType: selectedActivity,
        bookingDashboardScope: 'booking_only',
      };
      const updatedShop = await ApiService.updateMyShop({
        pageDesign: updatedPageDesign,
      });
      setLoadedShop(updatedShop || { ...(effectiveShop || {}), pageDesign: updatedPageDesign });
      setMessage('تم حفظ إعدادات لوحة الحجوزات الخاصة بهذا النشاط فقط.');
      onSaved?.();
    } catch (err: any) {
      setError(err?.message || 'فشل حفظ إعدادات الحجوزات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600">
              <Settings size={14} /> إعدادات خاصة بالحجوزات فقط
            </div>
            <h3 className="mt-3 text-xl md:text-2xl font-black text-slate-900">هيكل لوحة الحجوزات والأنشطة</h3>
            <p className="mt-2 text-sm font-bold text-slate-500 max-w-3xl">
              اختر نوع نشاط الحجوزات الحقيقي من هنا: عيادة، صالون، شاليهات، فنادق، طاولات مطاعم، فعاليات، تأجير مركبات، ملاعب، تعليم، صيانة أو مواعيد عامة. الاختيار يغيّر أزرار لوحة الحجوزات فقط ولا يلمس إعدادات الأنشطة الأخرى.
            </p>
          </div>
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-black disabled:opacity-60 transition-all"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ إعدادات الحجوزات'}
          </button>
        </div>

        {message && <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 text-xs font-black">{message}</div>}
        {error && <div className="mt-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 p-4 text-xs font-black">⚠️ {error}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {BOOKING_ACTIVITY_DEFINITIONS.map((activity) => {
          const active = selectedActivity === activity.id;
          return (
            <button
              key={activity.id}
              type="button"
              onClick={() => setSelectedActivity(activity.id)}
              className={`rounded-[2rem] border p-5 text-right transition-all ${active ? 'border-cyan-300 bg-cyan-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${active ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{ICON_BY_ACTIVITY[activity.id]}</span>
                {active && <CheckCircle2 size={18} className="text-cyan-600" />}
              </div>
              <h4 className="mt-4 text-sm font-black text-slate-900">{activity.title}</h4>
              <p className="mt-2 text-xs font-bold text-slate-500 leading-6">{activity.description}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-2 justify-end">
          <Sparkles size={18} className="text-cyan-500" />
          <h4 className="text-lg font-black text-slate-900">الأزرار الناتجة لنشاط: {activeDefinition.title}</h4>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-slate-50 border border-slate-100 p-5">
            <div className="text-xs font-black text-slate-500">الأزرار العامة للحجوزات</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {bookingGeneralButtons.map((label) => (
                <span key={label} className="px-3 py-2 rounded-2xl bg-white border border-slate-100 text-xs font-black text-slate-700">{label}</span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-cyan-50 border border-cyan-100 p-5">
            <div className="text-xs font-black text-cyan-700">الأزرار الخاصة بالنشاط</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[activeDefinition.primaryTabLabel, activeDefinition.secondaryTabLabel, ...activeDefinition.extraButtons].map((label) => (
                <span key={label} className="px-3 py-2 rounded-2xl bg-white border border-cyan-100 text-xs font-black text-cyan-800">{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-2 justify-end">
          <Settings size={18} className="text-emerald-600" />
          <h4 className="text-lg font-black text-slate-900">إعدادات مناسبة للحجوزات فقط</h4>
        </div>
        <p className="mt-2 text-xs font-bold text-slate-500 leading-6">
          هنا تظهر أزرار الموقع والأمان والمدفوعات والإشعارات الخاصة بالحجوزات. تم استبعاد ثيم الفاتورة وأزرار البيع العامة من لوحة الحجوزات حتى لا تختلط بإعدادات المتجر الأخرى.
        </p>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BOOKING_SETTINGS_PAGE_BUTTONS.map((page) => (
            <NavLink key={page.id} to={`/business/clinic/activity/${page.id}`} className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition-all">
              {page.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClinicSettingsPage;
