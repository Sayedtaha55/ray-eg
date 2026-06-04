import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock, Loader2, User2, XCircle, Settings, Shield, Bell, CreditCard, FileText, Palette, Users, ListChecks, CalendarCheck, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { getBookingActivityVocabulary, BOOKING_SETTINGS_PAGE_BUTTONS, getBookingActivityDefinition } from './bookingActivityConfig';

const ClinicOverviewPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const locale = String(i18n.language || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US';
  const { useLocation, useNavigate, useOutletContext } = ReactRouterDOM as any;
  const location = useLocation();
  const navigate = useNavigate();
  const context = useOutletContext?.() || {};
  const isInMasterDashboard = context.bookings !== undefined;

  const basePath = String(location?.pathname || '').split('/').filter(Boolean)[1] || 'clinic';
  const vocab = getBookingActivityVocabulary(basePath);
  const activityDefinition = getBookingActivityDefinition(
    basePath === 'clinic' ? 'clinic_hospital' :
    basePath === 'salon' ? 'salon_barber' :
    basePath === 'spa' ? 'wellness_spa' :
    basePath === 'chalets' ? 'chalets_resorts' :
    basePath === 'hotels' ? 'hotels_rooms' :
    basePath === 'restaurants' ? 'restaurants_tables' :
    basePath === 'events' ? 'events_venues' :
    basePath === 'rental' ? 'vehicle_rental' :
    basePath === 'sports' ? 'sports_trainers' :
    basePath === 'education' ? 'education_courses' :
    basePath === 'maintenance' ? 'maintenance_services' :
    basePath === 'appointments' ? 'general_appointments' : 'clinic_hospital'
  );

  const [loading, setLoading] = useState(isInMasterDashboard ? context.loading : true);
  const [bookings, setBookings] = useState<any[]>(isInMasterDashboard ? context.bookings : []);
  const [error, setError] = useState<string>(isInMasterDashboard ? context.error || '' : '');

  // Sync with context if present
  useEffect(() => {
    if (isInMasterDashboard) {
      setBookings(context.bookings || []);
      setLoading(context.loading);
      setError(context.error || '');
    }
  }, [context.bookings, context.loading, context.error, isInMasterDashboard]);

  const getTargetShopId = useCallback(() => {
    try {
      const params = new URLSearchParams(location.search);
      const impersonateShopId = String(params.get('impersonateShopId') || '').trim();

      const userStr = localStorage.getItem('ray_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const role = String(user?.role || '').toLowerCase();
      const shopIdFromUser = String(user?.shopId || '').trim();

      if (role === 'admin' && impersonateShopId) return impersonateShopId;
      return shopIdFromUser;
    } catch {
      return '';
    }
  }, [location.search]);

  const loadData = useCallback(async () => {
    if (isInMasterDashboard) {
      if (context.loadBookings) {
        await context.loadBookings();
      }
      return;
    }
    setLoading(true);
    setError('');
    try {
      const shopId = getTargetShopId();
      const list = await ApiService.getBookings(shopId || undefined);
      setBookings(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setError(String(e?.message || 'فشل تحميل بيانات العيادة'));
    } finally {
      setLoading(false);
    }
  }, [getTargetShopId, isInMasterDashboard, context.loadBookings]);

  useEffect(() => {
    if (!isInMasterDashboard) {
      loadData();
    }
  }, [loadData, isInMasterDashboard]);

  // Compute stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookingsList = bookings.filter((b) => String(b.bookingDate) === todayStr);

  const todayCount = todayBookingsList.length;
  const pendingCount = bookings.filter((b) => String(b.status).toUpperCase() === 'PENDING').length;
  const confirmedCount = bookings.filter((b) => String(b.status).toUpperCase() === 'CONFIRMED' || String(b.status).toUpperCase() === 'COMPLETED').length;
  const cancelledCount = bookings.filter((b) => String(b.status).toUpperCase() === 'CANCELLED' || String(b.status).toUpperCase() === 'EXPIRED').length;

  const stats = [
    { label: t('business.clinic.overview.stats.todayBookings'), value: String(todayCount), icon: <Calendar size={18} /> },
    { label: t('business.clinic.overview.stats.pending'), value: String(pendingCount), icon: <Clock size={18} /> },
    { label: t('business.clinic.overview.stats.confirmed'), value: String(confirmedCount), icon: <CheckCircle2 size={18} /> },
    { label: t('business.clinic.overview.stats.cancelled'), value: String(cancelledCount), icon: <XCircle size={18} /> },
  ];

  // Today's schedule sorted by time
  const todaySchedule = todayBookingsList
    .slice()
    .sort((a, b) => String(a.bookingTime).localeCompare(String(b.bookingTime)))
    .map((b) => ({
      time: b.bookingTime || '10:00',
      patient: b.customerName || `${vocab.customerSingular} مجهول`,
      doctor: b.itemName || 'حجز عام',
      status: b.status || 'PENDING',
    }));

  // Recent bookings: top 5 sorted by createdAt descending
  const recentBookings = bookings
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)
    .map((b) => ({
      id: b.id,
      name: b.customerName || `${vocab.customerSingular} مجهول`,
      phone: b.customerPhone || '—',
      time: b.bookingDate ? `${b.bookingDate} (${b.bookingTime || ''})` : new Date(b.createdAt).toLocaleDateString(locale),
      status: b.status || 'PENDING',
    }));

  const statusBadge = (s: string) => {
    const v = String(s || '').toUpperCase();
    if (v === 'CONFIRMED' || v === 'COMPLETED') return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
    if (v === 'CANCELLED' || v === 'EXPIRED') return 'bg-red-500/10 text-red-650 border-red-500/20';
    return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
  };

  const statusLabel = (s: string) => {
    const v = String(s || '').toUpperCase();
    if (v === 'CONFIRMED') return t('business.clinic.overview.status.confirmed');
    if (v === 'COMPLETED') return t('business.clinic.overview.status.completed');
    if (v === 'CANCELLED' || v === 'EXPIRED') return t('business.clinic.overview.status.cancelled');
    return t('business.clinic.overview.status.pending');
  };

  if (loading && !isInMasterDashboard) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
        <p className="font-bold text-slate-400">جاري تحميل {vocab.dashboardTitle}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && !isInMasterDashboard && (
        <div className="bg-red-50 text-red-655 border border-red-100 rounded-2xl p-4 text-xs font-black">
          ⚠️ {error}
        </div>
      )}

      {!isInMasterDashboard && (
        <>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="text-right">
              <div className="text-lg md:text-xl font-black text-slate-900">{vocab.dashboardTitle}</div>
              <div className="mt-1 text-sm font-bold text-slate-500">{vocab.dashboardSubtitle}</div>
            </div>

            <div className="rounded-2xl bg-cyan-50 border border-cyan-100 px-5 py-3 text-right max-w-md">
              <div className="text-xs font-black text-cyan-800">تم نقل إدارة {vocab.providerPlural} و {vocab.servicePlural} إلى قائمة لوحة الحجوزات.</div>
              <div className="mt-1 text-[11px] font-bold text-cyan-700/80">استخدم أزرار القائمة الجانبية للوصول إلى كل نشاط خاص بدون ازدحام النظرة العامة.</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-xs font-black text-slate-400">{s.label}</div>
                  <div className="text-slate-500">{s.icon}</div>
                </div>
                <div className="mt-3 text-3xl font-black text-slate-900 text-right">{s.value}</div>
                <div className="mt-1 text-xs font-bold text-slate-400 text-right">{t('business.clinic.overview.last24h')}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* إعدادات الحجوزات */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-right">
        <div className="flex items-center justify-between gap-3 flex-wrap flex-row-reverse mb-5">
          <div>
            <div className="text-sm font-black text-slate-900">إعدادات الحجوزات</div>
            <div className="mt-1 text-xs font-bold text-slate-400">تحكم في إعدادات الموقع والصلاحيات والإشعارات</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {BOOKING_SETTINGS_PAGE_BUTTONS.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => navigate(`/business/${basePath}/activity/${btn.id}`)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all"
            >
              {btn.id === 'booking-site' && <Settings size={20} className="text-emerald-600" />}
              {btn.id === 'booking-security' && <Shield size={20} className="text-emerald-600" />}
              {btn.id === 'booking-notifications' && <Bell size={20} className="text-emerald-600" />}
              {btn.id === 'booking-payments' && <CreditCard size={20} className="text-emerald-600" />}
              {btn.id === 'booking-cancellation' && <FileText size={20} className="text-emerald-600" />}
              {btn.id === 'booking-privacy' && <Shield size={20} className="text-emerald-600" />}
              <span className="text-xs font-black text-slate-700 text-center leading-tight">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* أزرار الأنشطة الخاصة */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-right">
        <div className="flex items-center justify-between gap-3 flex-wrap flex-row-reverse mb-5">
          <div>
            <div className="text-sm font-black text-slate-900">{vocab.providerPlural} و {vocab.servicePlural}</div>
            <div className="mt-1 text-xs font-bold text-slate-400">إدارة {vocab.providerPlural.toLowerCase()} و {vocab.servicePlural.toLowerCase()}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => navigate(`/business/${basePath}/doctors`)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 transition-all"
          >
            <Users size={20} className="text-cyan-600" />
            <span className="text-xs font-black text-slate-700 text-center leading-tight">{vocab.providerLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/business/${basePath}/services`)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 transition-all"
          >
            <ListChecks size={20} className="text-cyan-600" />
            <span className="text-xs font-black text-slate-700 text-center leading-tight">{vocab.serviceSingular}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/business/${basePath}/overview`)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 transition-all"
          >
            <CalendarCheck size={20} className="text-cyan-600" />
            <span className="text-xs font-black text-slate-700 text-center leading-tight">لوحة الحجوزات</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/business/${basePath}/bookings`)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 transition-all"
          >
            <ClipboardList size={20} className="text-cyan-600" />
            <span className="text-xs font-black text-slate-700 text-center leading-tight">جدول المواعيد</span>
          </button>
          {activityDefinition.extraButtons.map((label, idx) => {
            const pageId = label.replace(/[ً-ٰٟ]/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(`/business/${basePath}/activity/${pageId}`)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 transition-all"
              >
                <ListChecks size={20} className="text-cyan-600" />
                <span className="text-xs font-black text-slate-700 text-center leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* التصميم والإعدادات */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-right">
        <div className="flex items-center justify-between gap-3 flex-wrap flex-row-reverse mb-5">
          <div>
            <div className="text-sm font-black text-slate-900">التصميم والإعدادات</div>
            <div className="mt-1 text-xs font-bold text-slate-400">خصص مظهر متجرك وإعداداته الأساسية</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => navigate(`/business/${basePath}/design`)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-violet-50 border border-slate-100 hover:border-violet-200 transition-all"
          >
            <Palette size={20} className="text-violet-600" />
            <span className="text-xs font-black text-slate-700 text-center leading-tight">التصميم</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/business/${basePath}/settings`)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-violet-50 border border-slate-100 hover:border-violet-200 transition-all"
          >
            <Settings size={20} className="text-violet-600" />
            <span className="text-xs font-black text-slate-700 text-center leading-tight">الإعدادات</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap flex-row-reverse text-right">
            <div>
              <div className="text-sm font-black text-slate-900">{t('business.clinic.overview.todaySchedule')}</div>
              <div className="mt-1 text-xs font-bold text-slate-400">{t('business.clinic.overview.todayScheduleSubtitle')}</div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/business/${basePath}/bookings`)}
              className="px-4 py-2 rounded-2xl bg-slate-50 text-slate-700 font-black text-xs hover:bg-slate-100 transition-all"
            >
              {t('business.clinic.overview.openBookingMgmt')}
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-[11px] font-black text-slate-500 text-right flex-row-reverse">
              <div className="col-span-2 text-right">{t('business.clinic.overview.table.time')}</div>
              <div className="col-span-4 text-right">اسم {vocab.customerSingular}</div>
              <div className="col-span-4 text-right">{vocab.providerLabel}</div>
              <div className="col-span-2 text-right">{t('business.clinic.overview.table.status')}</div>
            </div>
            <div className="divide-y divide-slate-100 text-right" dir="rtl">
              {todaySchedule.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold text-sm">
                  لا توجد مواعيد مجدولة اليوم.
                </div>
              ) : (
                todaySchedule.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 px-4 py-3.5 text-sm items-center hover:bg-slate-50 transition-colors">
                    <div className="col-span-2 font-black text-slate-900">{row.time}</div>
                    <div className="col-span-4 font-bold text-slate-650 flex items-center gap-2">
                      <User2 size={16} className="text-slate-355" />
                      <span>{row.patient}</span>
                    </div>
                    <div className="col-span-4 font-bold text-slate-650">{row.doctor}</div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-2xl border text-[11px] font-black ${statusBadge(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-right">
          <div>
            <div className="text-sm font-black text-slate-900">{t('business.clinic.overview.recentBookings.title')}</div>
            <div className="mt-1 text-xs font-bold text-slate-400">{t('business.clinic.overview.recentBookings.subtitle')}</div>
          </div>

          <div className="mt-5 space-y-3" dir="rtl">
            {recentBookings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-bold text-xs">
                لا توجد حجوزات حديثة حتى الآن.
              </div>
            ) : (
              recentBookings.map((b) => (
                <div key={b.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:border-slate-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900">{b.name}</div>
                      <div className="mt-1 text-xs font-bold text-slate-400">{b.phone}</div>
                    </div>
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-2xl border text-[11px] font-black ${statusBadge(b.status)}`}>
                      {statusLabel(b.status)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-500 text-right">{b.time}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicOverviewPage;
