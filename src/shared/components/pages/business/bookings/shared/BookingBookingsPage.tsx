/**
 * ═══════════════════════════════════════════
 * bookings/shared/BookingBookingsPage.tsx
 * صفحة الحجوزات  - عرض وإدارة الحجوزات
 * ═══════════════════════════════════════════
 */
import React, { useEffect, useState } from 'react';
import {
  CalendarCheck, Loader2, XCircle, CheckCircle2, Clock,
  Plus, RefreshCw, Search, Filter
} from 'lucide-react';
import type { BookingActivityType } from '../config';
import { getVocabulary, getBookingActivityTypeFromParam } from '../config';
import { ApiService } from '@/services/api.service';

type Props = {
  activityType: BookingActivityType;
  bookings?: any[];
  loading?: boolean;
  error?: string;
  onNewBooking?: () => void;
  onEditBooking?: (booking: any) => void;
  onCancelBooking?: (bookingId: string) => void;
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

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  confirmed: { label: 'مؤكد', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  pending: { label: 'انتظار', icon: <Clock className="w-3.5 h-3.5" />, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  completed: { label: 'مكتمل', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  cancelled: { label: 'ملغي', icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

const ALL_STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
  all: 'الكل', pending: 'انتظار', confirmed: 'مؤكد', completed: 'مكتمل', cancelled: 'ملغي',
};

const BookingBookingsPage: React.FC<Props> = ({ activityType, bookings: propBookings }) => {
  const vocab = getVocabulary(activityType);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, newStatus: string, b: any) => {
    setUpdatingId(id);
    try {
      const isBookingType = b.__type === 'booking' || Boolean(b.bookingNumber || b.slotId);
      if (isBookingType) {
        await ApiService.updateBookingStatus(id, newStatus);
      } else {
        await ApiService.updateReservationStatus(id, newStatus);
      }
      setBookings(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));

      if ((newStatus === 'confirmed' || newStatus === 'completed') && b) {
        const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
        await ApiService.convertReservationToCustomer({
          customerName: b.customerName,
          customerPhone: b.customerPhone || '',
          customerEmail: b.customerEmail || '',
          shopId: shop.id || b.shopId,
          firstPurchaseAmount: b.itemPrice || 0,
          firstPurchaseItem: b.itemName || b.serviceName || 'حجز',
        });
      }
    } catch {
      alert('تعذر تحديث حالة الحجز');
    } finally {
      setUpdatingId(null);
    }
  };

  const loadBookings = async () => {
    setLoading(true); setError('');
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) { setLoading(false); return; }
      const [res, book] = await Promise.allSettled([
        ApiService.getReservations(shop.id),
        ApiService.getBookings(shop.id),
      ]);
      const all = [
        ...(res.status === 'fulfilled' && Array.isArray(res.value) ? res.value : []),
        ...(book.status === 'fulfilled' && Array.isArray(book.value) ? (book.value as any[]).map((b: any) => ({ ...b, __type: 'booking' })) : []),
      ]
        .filter(b => matchesActivity(b, activityType))
        .sort((a, b) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime());
      setBookings(all);
    } catch { setError('تعذر تحميل الحجوزات. تحقق من اتصالك بالإنترنت.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (propBookings) {
      const filtered = propBookings.filter(b => matchesActivity(b, activityType));
      setBookings(filtered);
      setLoading(false);
      return;
    }
    loadBookings();
  }, [propBookings, activityType]);

  const handleCancel = async (id: string, isBooking: boolean) => {
    if (!confirm('هل تريد إلغاء هذا الحجز؟')) return;
    setCancelling(id);
    try {
      if (isBooking) await ApiService.updateBookingStatus(id, 'cancelled');
      else await ApiService.updateReservationStatus(id, 'cancelled');
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch { alert('تعذر إلغاء الحجز'); }
    finally { setCancelling(null); }
  };

  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'all' || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || (b.customerName || '').toLowerCase().includes(q) ||
      (b.customerPhone || '').includes(q) || (b.serviceName || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <CalendarCheck className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">حجوزات {vocab.dashboardTitle}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{bookings.length} حجز إجمالاً</p>
          </div>
        </div>
        <button
          onClick={loadBookings}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-500"
          title="تحديث"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو الهاتف أو الخدمة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
          />
        </div>
        {/* Status Filters */}
        <div className="flex gap-2 flex-row-reverse overflow-x-auto no-scrollbar">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all ${filter === s
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
            >
              {STATUS_LABELS[s]}
              {s !== 'all' && (
                <span className="mr-1 opacity-60">
                  ({bookings.filter(b => b.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
          <p className="font-bold text-slate-400">جاري تحميل الحجوزات...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
          <p className="text-red-600 font-bold text-sm">{error}</p>
          <button onClick={loadBookings} className="mt-3 text-xs font-black text-red-600 underline">إعادة المحاولة</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10 text-center">
          <CalendarCheck className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">
            {search ? `لا نتائج لـ "${search}"` : 'لا توجد حجوزات في هذه الفئة'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {filtered.map((b: any) => {
              const st = statusConfig[b.status] || statusConfig['pending'];
              const isBookingType = b.__type === 'booking' || Boolean(b.bookingNumber || b.slotId);
              return (
                <div key={b.id} className="flex items-center justify-between flex-row-reverse px-5 py-4 hover:bg-slate-50/70 transition-colors">
                  {/* Right: Customer info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-cyan-100 flex items-center justify-center font-black text-slate-600 text-sm shrink-0">
                      {(b.customerName || '؟')[0]}
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900">{b.customerName || 'عميل غير محدد'}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-1.5">
                        {b.customerPhone && <span>{b.customerPhone}</span>}
                        {(b.date || b.bookingDate) && <><span>•</span><span>{b.date || b.bookingDate}</span></>}
                        {b.startTime && <><span>•</span><span>{b.startTime}</span></>}
                        {b.serviceName && <><span>•</span><span className="text-cyan-600">{b.serviceName}</span></>}
                      </div>
                    </div>
                  </div>
                  {/* Left: Status + Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-row-reverse">
                    <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border ${st.bg} ${st.color}`}>
                      {st.icon} {st.label}
                    </span>

                    {updatingId === b.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#00E5FF]" />
                    ) : (
                      <>
                        {b.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b.id, 'confirmed', b)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition-all animate-pulse-subtle"
                            >
                              موافقة
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b.id, 'cancelled', b)}
                              className="px-2.5 py-1 rounded-lg border border-red-200 text-red-650 font-black text-xs hover:bg-red-50 transition-all"
                            >
                              رفض
                            </button>
                          </div>
                        )}
                        {b.status === 'confirmed' && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b.id, 'completed', b)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition-all"
                            >
                              إكمال
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b.id, 'pending', b)}
                              className="px-2.5 py-1 rounded-lg border border-amber-200 text-amber-600 font-black text-xs hover:bg-amber-50 transition-all"
                            >
                              انتظار
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b.id, 'cancelled', b)}
                              className="px-2.5 py-1 rounded-lg border border-red-200 text-red-650 font-black text-xs hover:bg-red-50 transition-all"
                            >
                              إلغاء
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingBookingsPage;