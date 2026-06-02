import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock, Loader2, User2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';

const ClinicOverviewPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const locale = String(i18n.language || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US';
  const { useLocation, useNavigate } = ReactRouterDOM as any;
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

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
  }, [getTargetShopId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      patient: b.customerName || 'مريض مجهول',
      doctor: b.itemName || 'استشارة عامة',
      status: b.status || 'PENDING',
    }));

  // Recent bookings: top 5 sorted by createdAt descending
  const recentBookings = bookings
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)
    .map((b) => ({
      id: b.id,
      name: b.customerName || 'مريض مجهول',
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

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
        <p className="font-bold text-slate-400">جاري تحميل لوحة التحكم للعيادة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 rounded-2xl p-4 text-xs font-black">
          ⚠️ {error}
        </div>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="text-right">
          <div className="text-lg md:text-xl font-black text-slate-900">{t('business.clinic.overview.title')}</div>
          <div className="mt-1 text-sm font-bold text-slate-500">{t('business.clinic.overview.subtitle')}</div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/business/dashboard?tab=clinicDoctors')}
            className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all"
          >
            إدارة أطباء العيادة
          </button>
          <button
            type="button"
            onClick={() => navigate('/business/dashboard?tab=clinicServices')}
            className="px-5 py-3 rounded-2xl bg-white border border-slate-100 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all"
          >
            إدارة التخصصات والخدمات
          </button>
          <button
            type="button"
            onClick={() => navigate('/business/dashboard?tab=settings')}
            className="px-5 py-3 rounded-2xl bg-white border border-slate-100 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all"
          >
            إعدادات الحجوزات والعيادة
          </button>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap flex-row-reverse text-right">
            <div>
              <div className="text-sm font-black text-slate-900">{t('business.clinic.overview.todaySchedule')}</div>
              <div className="mt-1 text-xs font-bold text-slate-400">{t('business.clinic.overview.todayScheduleSubtitle')}</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/business/dashboard?tab=reservations')}
              className="px-4 py-2 rounded-2xl bg-slate-50 text-slate-700 font-black text-xs hover:bg-slate-100 transition-all"
            >
              {t('business.clinic.overview.openBookingMgmt')}
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-[11px] font-black text-slate-500 text-right flex-row-reverse">
              <div className="col-span-2 text-right">{t('business.clinic.overview.table.time')}</div>
              <div className="col-span-4 text-right">{t('business.clinic.overview.table.patient')}</div>
              <div className="col-span-4 text-right">{t('business.clinic.overview.table.doctor')}</div>
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
