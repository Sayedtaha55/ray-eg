/**
 * ═══════════════════════════════════════════
 * bookings/shared/BookingOverviewPage.tsx
 * صفحة نظرة عامة  - تعرض إحصائيات الحجوزات
 * ═══════════════════════════════════════════
 */
import React, { useEffect, useState } from 'react';
import {
  Loader2, CalendarCheck, Clock, CheckCircle2, XCircle,
  TrendingUp, Users, Star, RefreshCw
} from 'lucide-react';
import type { BookingActivityType } from '../config';
import { getVocabulary, ACTIVITY_MODULES, getBookingActivityTypeFromParam } from '../config';
import { ApiService } from '@/services/api.service';

type Props = {
  activityType: BookingActivityType;
  shop?: any;
  bookings?: any[];
  loading?: boolean;
  error?: string;
  onNavigate?: (route: string) => void;
};

const matchesActivity = (b: any, currentActivity: BookingActivityType) => {
  const rawType = b.bookingActivityType 
    || b.activityType 
    || b.metadata?.bookingActivityType 
    || b.metadata?.activityType
    || b.bookingActivityRoute
    || b.metadata?.bookingActivityRoute;
  
  if (!rawType) {
    const shop = (() => {
      try {
        return JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      } catch { return {}; }
    })();
    const shopActivity = shop?.pageDesign?.bookingActivityType || 'clinic';
    return currentActivity === shopActivity;
  }
  
  return getBookingActivityTypeFromParam(String(rawType)) === currentActivity;
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'مؤكد', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  pending: { label: 'قيد الانتظار', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  completed: { label: 'مكتمل', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  cancelled: { label: 'ملغي', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

const BookingOverviewPage: React.FC<Props> = ({ activityType, shop, bookings: propBookings, onNavigate }) => {
  const vocab = getVocabulary(activityType);
  const modules = ACTIVITY_MODULES[activityType] || [];
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (propBookings) {
      const filtered = propBookings.filter(b => matchesActivity(b, activityType));
      setBookings(filtered);
      setLoading(false);
      return;
    }

    const effectiveShop = shop || (() => {
      try {
        return JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      } catch { return {}; }
    })();

    if (!effectiveShop?.id) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([
      ApiService.getReservations(effectiveShop.id),
      ApiService.getBookings(effectiveShop.id),
    ]).then(([res, book]) => {
      const all = [
        ...(res.status === 'fulfilled' && Array.isArray(res.value) ? res.value : []),
        ...(book.status === 'fulfilled' && Array.isArray(book.value) ? book.value : []),
      ].filter(b => matchesActivity(b, activityType));
      setBookings(all);
    }).catch(() => setError('تعذر تحميل البيانات')).finally(() => setLoading(false));
  }, [shop?.id, propBookings, activityType]);

  const total = bookings.length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;

  const statCards = [
    { label: 'إجمالي الحجوزات', value: total, icon: <CalendarCheck className="w-5 h-5" />, color: 'text-[#00E5FF]', bg: 'bg-cyan-50' },
    { label: 'قيد الانتظار', value: pending, icon: <Clock className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'مؤكدة', value: confirmed, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'مكتملة', value: completed, icon: <TrendingUp className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
        <p className="font-bold text-slate-400">جاري تحميل {vocab.dashboardTitle}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-cyan-50 to-white p-6 md:p-8 rounded-[2.5rem] border border-cyan-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <CalendarCheck className="w-7 h-7 text-[#00E5FF]" />
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">{vocab.dashboardTitle}</h2>
        </div>
        <p className="text-slate-500 font-bold text-sm">{vocab.dashboardSubtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-xl flex items-center justify-center`}>
              {card.icon}
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{card.value}</div>
              <div className="text-xs font-bold text-slate-400 mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Modules quick links */}
      {modules.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
          <h3 className="font-black text-slate-900 mb-4 text-sm">أقسام {vocab.dashboardTitle}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => onNavigate?.(mod.route)}
                className="bg-slate-50 hover:bg-cyan-50 hover:border-cyan-200 border border-slate-100 rounded-2xl p-4 text-right transition-all hover:shadow-sm group"
              >
                <div className="text-sm font-black text-slate-900 group-hover:text-cyan-700">{mod.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-row-reverse">
          <h3 className="font-black text-slate-900">آخر الحجوزات</h3>
          <span className="text-xs text-slate-400 font-bold">{total} حجز</span>
        </div>

        {error ? (
          <div className="p-6 text-center">
            <p className="text-red-500 font-bold text-sm">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarCheck className="w-14 h-14 text-slate-100 mx-auto mb-3" />
            <p className="font-bold text-slate-400">لا توجد حجوزات حتى الآن</p>
            <p className="text-xs text-slate-300 mt-1">ستظهر الحجوزات الجديدة هنا فور وصولها</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {bookings.slice(0, 8).map((b: any) => {
              const st = statusConfig[b.status] || statusConfig['pending'];
              return (
                <div key={b.id} className="flex items-center justify-between flex-row-reverse px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 text-sm">
                      {(b.customerName || '؟')[0]}
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900">{b.customerName || 'عميل'}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{b.date || b.bookingDate || '—'}</span>
                        {b.startTime && <><span>•</span><span>{b.startTime}</span></>}
                        {b.serviceName && <><span>•</span><span>{b.serviceName}</span></>}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${st.bg} ${st.color}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingOverviewPage;