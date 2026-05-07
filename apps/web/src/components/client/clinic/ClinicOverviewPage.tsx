'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock, User2, XCircle } from 'lucide-react';
import { useT } from '@/i18n/useT';

const ClinicOverviewPage: React.FC = () => {
  const t = useT();
  const stats = [
    { label: t('business.clinic.overview.stats.todayBookings', 'حجوزات اليوم'), value: '0', icon: <Calendar size={18} /> },
    { label: t('business.clinic.overview.stats.pending', 'قيد الانتظار'), value: '0', icon: <Clock size={18} /> },
    { label: t('business.clinic.overview.stats.confirmed', 'مؤكدة'), value: '0', icon: <CheckCircle2 size={18} /> },
    { label: t('business.clinic.overview.stats.cancelled', 'ملغية'), value: '0', icon: <XCircle size={18} /> },
  ];

  const todaySchedule = [
    { time: '10:00', patient: '—', doctor: '—', status: 'PENDING' },
    { time: '11:30', patient: '—', doctor: '—', status: 'CONFIRMED' },
    { time: '13:00', patient: '—', doctor: '—', status: 'COMPLETED' },
  ];

  const recentBookings = [
    { id: '1', name: '—', phone: '—', time: t('business.clinic.overview.recentBookings.t1Time', '10:00 ص'), status: 'PENDING' },
    { id: '2', name: '—', phone: '—', time: t('business.clinic.overview.recentBookings.t2Time', '11:30 ص'), status: 'CONFIRMED' },
    { id: '3', name: '—', phone: '—', time: t('business.clinic.overview.recentBookings.t3Time', '1:00 م'), status: 'CANCELLED' },
  ];

  const statusBadge = (s: string) => {
    const v = String(s || '').toUpperCase();
    if (v === 'CONFIRMED') return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
    if (v === 'COMPLETED') return 'bg-slate-900/10 text-slate-900 border-slate-900/20';
    if (v === 'CANCELLED') return 'bg-red-500/10 text-red-600 border-red-500/20';
    return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
  };

  const statusLabel = (s: string) => {
    const v = String(s || '').toUpperCase();
    if (v === 'CONFIRMED') return t('business.clinic.overview.status.confirmed', 'مؤكد');
    if (v === 'COMPLETED') return t('business.clinic.overview.status.completed', 'مكتمل');
    if (v === 'CANCELLED') return t('business.clinic.overview.status.cancelled', 'ملغي');
    return t('business.clinic.overview.status.pending', 'قيد الانتظار');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-lg md:text-xl font-black text-slate-900">{t('business.clinic.overview.title', 'نظرة عامة')}</div>
          <div className="mt-1 text-sm font-bold text-slate-500">{t('business.clinic.overview.subtitle', 'ملخص العيادة اليوم')}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all">{t('business.clinic.overview.addBooking', 'إضافة حجز')}</button>
          <button type="button" className="px-5 py-3 rounded-2xl bg-white border border-slate-100 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all">{t('business.clinic.overview.manageDoctors', 'إدارة الأطباء')}</button>
          <button type="button" className="px-5 py-3 rounded-2xl bg-white border border-slate-100 text-slate-700 font-black text-sm hover:bg-slate-50 transition-all">{t('business.clinic.overview.scheduleSettings', 'إعدادات المواعيد')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between"><div className="text-xs font-black text-slate-400">{s.label}</div><div className="text-slate-500">{s.icon}</div></div>
            <div className="mt-3 text-2xl font-black text-slate-900">{s.value}</div>
            <div className="mt-1 text-xs font-bold text-slate-400">{t('business.clinic.overview.last24h', 'آخر 24 ساعة')}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div><div className="text-sm font-black text-slate-900">{t('business.clinic.overview.todaySchedule', 'مواعيد اليوم')}</div><div className="mt-1 text-xs font-bold text-slate-400">{t('business.clinic.overview.todayScheduleSubtitle', 'جدول المواعيد')}</div></div>
            <button type="button" className="px-4 py-2 rounded-2xl bg-slate-50 text-slate-700 font-black text-xs hover:bg-slate-100 transition-all">{t('business.clinic.overview.openBookingMgmt', 'إدارة الحجوزات')}</button>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-[11px] font-black text-slate-500">
              <div className="col-span-2">{t('business.clinic.overview.table.time', 'الوقت')}</div>
              <div className="col-span-4">{t('business.clinic.overview.table.patient', 'المريض')}</div>
              <div className="col-span-4">{t('business.clinic.overview.table.doctor', 'الطبيب')}</div>
              <div className="col-span-2">{t('business.clinic.overview.table.status', 'الحالة')}</div>
            </div>
            <div className="divide-y divide-slate-100">
              {todaySchedule.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 px-4 py-3 text-sm">
                  <div className="col-span-2 font-black text-slate-900">{row.time}</div>
                  <div className="col-span-4 font-bold text-slate-600 flex items-center gap-2 flex-row-reverse"><User2 size={16} className="text-slate-300" /><span>{row.patient}</span></div>
                  <div className="col-span-4 font-bold text-slate-600">{row.doctor}</div>
                  <div className="col-span-2"><span className={`inline-flex items-center justify-center px-3 py-1 rounded-2xl border text-[11px] font-black ${statusBadge(row.status)}`}>{statusLabel(row.status)}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div><div className="text-sm font-black text-slate-900">{t('business.clinic.overview.recentBookings.title', 'أحدث الحجوزات')}</div><div className="mt-1 text-xs font-bold text-slate-400">{t('business.clinic.overview.recentBookings.subtitle', 'آخر الحجوزات')}</div></div>
          <div className="mt-5 space-y-3">
            {recentBookings.map(b => (
              <div key={b.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="text-sm font-black text-slate-900">{b.name}</div><div className="mt-1 text-xs font-bold text-slate-400">{b.phone}</div></div>
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-2xl border text-[11px] font-black ${statusBadge(b.status)}`}>{statusLabel(b.status)}</span>
                </div>
                <div className="mt-2 text-xs font-bold text-slate-500">{b.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicOverviewPage;
