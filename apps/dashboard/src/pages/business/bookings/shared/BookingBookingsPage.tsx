/**
 * ═══════════════════════════════════════════
 * bookings/shared/BookingBookingsPage.tsx
 * صفحة الحجوزات — عرض وإدارة + قائمة انتظار + تحكم كامل
 * ═══════════════════════════════════════════
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CalendarCheck, Loader2, XCircle, CheckCircle2, Clock,
  Plus, RefreshCw, Search, Filter,
  ChevronUp, ChevronDown, UserPlus, Zap, X, Phone, Calendar,
  AlertCircle, Play, Bell
} from 'lucide-react';
import type { BookingActivityType } from '../config';
import { getLocalizedVocabulary } from '../config';
import { ApiService } from '@/services/api.service';
import { matchesActivity, statusConfig, ALL_STATUSES, getLocalizedStatusLabels, getLocalizedStatusConfigLabel, getEffectiveShop } from './utils';
import { useTranslation } from 'react-i18next';

type Props = {
  activityType: BookingActivityType;
  shop?: any;
  bookings?: any[];
  loading?: boolean;
  error?: string;
  onNewBooking?: () => void;
  onEditBooking?: (booking: any) => void;
  onCancelBooking?: (bookingId: string) => void;
};

/* ═══════════════════════════════════════════
 * ManualBookingForm — فورم إضافة حجز يدوي
 * ═══════════════════════════════════════════ */
const ManualBookingForm: React.FC<{
  isEn: boolean;
  shop: any;
  activityType: BookingActivityType;
  onAdded: () => void;
  onClose: () => void;
}> = ({ isEn, shop, activityType, onAdded, onClose }) => {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    serviceName: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '',
    notes: '',
    priority: 'normal' as 'normal' | 'urgent',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!form.customerName.trim()) {
      setErr(isEn ? 'Patient name is required' : 'اسم المريض مطلوب');
      return;
    }
    setSaving(true); setErr('');
    try {
      const es = getEffectiveShop(shop);
      await ApiService.addBooking({
        shopId: es?.id,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        serviceName: form.serviceName.trim() || (isEn ? 'Walk-in' : 'حجز يدوي'),
        date: form.date,
        startTime: form.startTime || undefined,
        notes: form.notes.trim() || undefined,
        bookingActivityType: activityType,
        status: 'confirmed',
        isManual: true,
        priority: form.priority,
      });
      onAdded();
      onClose();
    } catch {
      setErr(isEn ? 'Failed to add booking' : 'تعذر إضافة الحجز');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-row-reverse">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#00E5FF]" />
            <h3 className="font-black text-slate-900 text-sm">{isEn ? 'Add Manual Booking' : 'إضافة حجز يدوي'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="p-5 space-y-3 text-right" dir={isEn ? 'ltr' : 'rtl'}>
          {err && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 flex-row-reverse">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-xs font-bold text-red-600">{err}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1">{isEn ? 'Patient Name *' : 'اسم المريض *'}</label>
            <input type="text" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
              placeholder={isEn ? 'Enter patient name' : 'أدخل اسم المريض'} />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1">{isEn ? 'Phone' : 'الهاتف'}</label>
            <input type="tel" value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
              placeholder={isEn ? 'Phone number' : 'رقم الهاتف'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">{isEn ? 'Service' : 'الخدمة'}</label>
              <input type="text" value={form.serviceName} onChange={e => setForm(f => ({ ...f, serviceName: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
                placeholder={isEn ? 'Service name' : 'اسم الخدمة'} />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">{isEn ? 'Date' : 'التاريخ'}</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">{isEn ? 'Time' : 'الوقت'}</label>
              <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">{isEn ? 'Priority' : 'الأولوية'}</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300">
                <option value="normal">{isEn ? 'Normal' : 'عادي'}</option>
                <option value="urgent">{isEn ? 'Urgent' : 'مستعجل'}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1">{isEn ? 'Notes' : 'ملاحظات'}</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300 resize-none"
              placeholder={isEn ? 'Optional notes...' : 'ملاحظات اختيارية...'} />
          </div>
          <button onClick={handleSubmit} disabled={saving}
            className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? (isEn ? 'Adding...' : 'جاري الإضافة...') : (isEn ? 'Add Booking' : 'إضافة الحجز')}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
 * QueueItem — عنصر قائمة الانتظار مع تحكم
 * ═══════════════════════════════════════════ */
const QueueItem: React.FC<{
  booking: any;
  index: number;
  total: number;
  isEn: boolean;
  lang: string;
  isToday: boolean;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onJump: (id: string, delta: number) => void;
  onUpdateStatus: (id: string, status: string, b: any) => void;
  updatingId: string | null;
}> = ({ booking: b, index, total, isEn, lang, isToday, onMoveUp, onMoveDown, onJump, onUpdateStatus, updatingId }) => {
  const st = statusConfig[b.status] || statusConfig['pending'];
  const isUrgent = b.priority === 'urgent';
  const isDone = b.status === 'completed' || b.status === 'cancelled';
  const isActive = b.status === 'confirmed';
  const [showJump, setShowJump] = useState(false);

  return (
    <div className={`relative flex items-center gap-2 px-4 py-3.5 transition-all ${isDone ? 'opacity-50' : ''} ${isUrgent && !isDone ? 'bg-red-50/50' : 'hover:bg-slate-50/70'} ${index === 0 && isActive && isToday ? 'bg-emerald-50/40' : ''}`}>
      {/* Queue number + reorder controls */}
      {isToday && !isDone ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${isUrgent ? 'bg-red-100 text-red-700' : isActive && index === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {index + 1}
          </div>
          <div className="flex flex-col gap-0.5">
            <button onClick={() => onMoveUp(b.id)} disabled={index === 0}
              className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-20 transition-colors">
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button onClick={() => onMoveDown(b.id)} disabled={index === total - 1}
              className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-20 transition-colors">
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-7 h-7 shrink-0" />
      )}

      {/* Customer info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-gradient-to-br from-slate-100 to-cyan-100 text-slate-600'}`}>
          {(b.customerName || (isEn ? '?' : '؟'))[0]}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-black text-sm text-slate-900 truncate">{b.customerName || (isEn ? 'Unknown' : 'غير محدد')}</span>
            {isUrgent && (
              <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                <Zap className="w-2.5 h-2.5" /> {isEn ? 'URGENT' : 'مستعجل'}
              </span>
            )}
            {b.isManual && (
              <span className="shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100">
                {isEn ? 'Manual' : 'يدوي'}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-1.5">
            {b.customerPhone && <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{b.customerPhone}</span>}
            {(b.date || b.bookingDate) && <><span>•</span><span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{b.date || b.bookingDate}</span></>}
            {b.startTime && <><span>•</span><span>{b.startTime}</span></>}
            {b.serviceName && <><span>•</span><span className="text-cyan-600">{b.serviceName}</span></>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0 flex-row-reverse">
        <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border ${st.bg} ${st.color}`}>
          {getLocalizedStatusConfigLabel(b.status, lang)}
        </span>

        {updatingId === b.id ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#00E5FF]" />
        ) : (
          <>
            {isToday && !isDone && (
              <>
                {/* Jump to position */}
                <div className="relative">
                  <button onClick={() => setShowJump(!showJump)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    title={isEn ? 'Jump to position' : 'نقل لموقع'}>
                    <Play className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  {showJump && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1 min-w-[100px]">
                      {[1, 2, 3, 4, 5].map(pos => (
                        <button key={pos} onClick={() => { onJump(b.id, pos - 1 - index); setShowJump(false); }}
                          className="w-full px-3 py-1.5 text-xs font-bold text-right hover:bg-slate-50 transition-colors">
                          {isEn ? `Position ${pos}` : `المركز ${pos}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {b.status === 'pending' && (
                  <button onClick={() => onUpdateStatus(b.id, 'confirmed', b)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition-all">
                    {isEn ? 'Approve' : 'موافقة'}
                  </button>
                )}
                {b.status === 'confirmed' && (
                  <button onClick={() => onUpdateStatus(b.id, 'completed', b)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition-all">
                    {isEn ? 'Done' : 'تم'}
                  </button>
                )}
                <button onClick={() => onUpdateStatus(b.id, 'cancelled', b)}
                  className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};


const BookingBookingsPage: React.FC<Props> = ({ activityType, shop, bookings: propBookings }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  const vocab = getLocalizedVocabulary(activityType, lang);
  const statusLabels = getLocalizedStatusLabels(lang);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [queueOrder, setQueueOrder] = useState<string[]>([]);

  const getShop = () => getEffectiveShop(shop);
  const effectiveShop = getShop();

  /* ── Queue management ── */
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBookings = useMemo(() => bookings.filter(b => {
    const bDate = (b.date || b.bookingDate || '').slice(0, 10);
    return bDate === todayStr && (b.status === 'confirmed' || b.status === 'pending');
  }), [bookings, todayStr]);

  const sortedTodayBookings = useMemo(() => {
    const sorted = [...todayBookings];
    sorted.sort((a, b) => {
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
      const aIdx = queueOrder.indexOf(a.id);
      const bIdx = queueOrder.indexOf(b.id);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      if (a.status === 'confirmed' && b.status !== 'confirmed') return -1;
      if (b.status === 'confirmed' && a.status !== 'confirmed') return 1;
      return new Date(a.createdAt || a.created_at || 0).getTime() - new Date(b.createdAt || b.created_at || 0).getTime();
    });
    return sorted;
  }, [todayBookings, queueOrder]);

  useEffect(() => {
    if (todayBookings.length > 0 && queueOrder.length === 0) {
      setQueueOrder(todayBookings.map(b => b.id));
    }
  }, [todayBookings, queueOrder.length]);

  const saveQueueOrder = async (newOrder: string[]) => {
    setQueueOrder(newOrder);
    try {
      const es = getShop();
      await ApiService.saveBookingActivityData(es.id, 'bookingQueueOrder', newOrder);
    } catch { /* silent */ }
  };

  const handleMoveUp = (id: string) => {
    const idx = sortedTodayBookings.findIndex(b => b.id === id);
    if (idx <= 0) return;
    const arr = [...sortedTodayBookings];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    saveQueueOrder(arr.map(b => b.id));
  };

  const handleMoveDown = (id: string) => {
    const idx = sortedTodayBookings.findIndex(b => b.id === id);
    if (idx < 0 || idx >= sortedTodayBookings.length - 1) return;
    const arr = [...sortedTodayBookings];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    saveQueueOrder(arr.map(b => b.id));
  };

  const handleJump = (id: string, delta: number) => {
    if (delta === 0) return;
    const idx = sortedTodayBookings.findIndex(b => b.id === id);
    if (idx < 0) return;
    const arr = [...sortedTodayBookings];
    const target = Math.max(0, Math.min(arr.length - 1, idx + delta));
    const [item] = arr.splice(idx, 1);
    arr.splice(target, 0, item);
    saveQueueOrder(arr.map(b => b.id));
  };

  /* ── Status updates ── */
  const handleUpdateStatus = async (id: string, newStatus: string, b: any) => {
    setUpdatingId(id);
    try {
      const isBookingType = b.__type === 'booking' || b.__recordType === 'booking' || String(b.id || '').startsWith('booking-') || Boolean(b.bookingNumber || b.slotId) || b.isManual;
      if (isBookingType) await ApiService.updateBookingStatus(id, newStatus);
      else await ApiService.updateReservationStatus(id, newStatus);
      setBookings(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      if ((newStatus === 'confirmed' || newStatus === 'completed') && b) {
        const es = getShop();
        await ApiService.convertReservationToCustomer({
          customerName: b.customerName,
          customerPhone: b.customerPhone || '',
          customerEmail: b.customerEmail || '',
          shopId: es.id || b.shopId,
          firstPurchaseAmount: b.itemPrice || 0,
          firstPurchaseItem: b.itemName || b.serviceName || (isEn ? 'Booking' : 'حجز'),
        });
      }

      /* ── When booking completes: auto-create/update patient record + payment ── */
      if (newStatus === 'completed' && b?.customerName) {
        try {
          const es = getShop();
          const shopId = es?.id;
          if (shopId) {
            const existing = await ApiService.getBookingActivityData(shopId, 'activityPatientsList');
            const patients: any[] = Array.isArray(existing) ? existing : [];
            const phone = (b.customerPhone || '').trim();
            const matchIdx = patients.findIndex((p: any) =>
              p.phone === phone || (phone && p.phone?.includes(phone)) || (p.name || '').trim() === (b.customerName || '').trim()
            );
            const paymentAmount = Number(b.itemPrice || b.item_price || 0);
            const serviceName = b.itemName || b.serviceName || (isEn ? 'Booking' : 'حجز');
            const today = new Date().toISOString().slice(0, 10);
            const newPayment: any = {
              id: `pay-${Date.now()}`,
              amount: paymentAmount,
              method: 'cash',
              service: serviceName,
              date: today,
              bookingId: b.id,
              note: isEn ? `Auto from booking` : `تلقائي من حجز`,
            };
            if (matchIdx >= 0) {
              const p = patients[matchIdx];
              const updated = {
                ...p,
                totalVisits: (p.totalVisits || 0) + 1,
                lastVisit: today,
                caseType: p.caseType || serviceName,
                payments: [...(p.payments || []), newPayment],
              };
              patients[matchIdx] = updated;
            } else {
              const newPatient = {
                id: `pat-${Date.now()}`,
                name: b.customerName.trim(),
                phone: phone || '',
                email: b.customerEmail || undefined,
                totalVisits: 1,
                lastVisit: today,
                caseType: serviceName,
                payments: [newPayment],
              };
              patients.unshift(newPatient);
            }
            await ApiService.saveBookingActivityData(shopId, 'activityPatientsList', patients);
          }
        } catch { /* silent — patient sync is best-effort */ }
      }
    } catch {
      alert(isEn ? 'Failed to update booking status' : 'تعذر تحديث حالة الحجز');
    } finally { setUpdatingId(null); }
  };

  /* ── Load bookings ── */
  const loadBookings = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const es = getShop();
      if (!es?.id) { setLoading(false); return; }
      const [res, book] = await Promise.allSettled([
        ApiService.getReservations(es.id),
        ApiService.getBookings(es.id),
      ]);
      const all = [
        ...(res.status === 'fulfilled' && Array.isArray(res.value) ? res.value : []),
        ...(book.status === 'fulfilled' && Array.isArray(book.value) ? (book.value as any[]).map((b: any) => ({ ...b, __type: 'booking' })) : []),
      ]
        .filter(b => matchesActivity(b, activityType, shop))
        .sort((a, b) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime());
      setBookings(all);
      try {
        const savedOrder = await ApiService.getBookingActivityData(es.id, 'bookingQueueOrder');
        if (Array.isArray(savedOrder) && savedOrder.length > 0) setQueueOrder(savedOrder);
      } catch { /* silent */ }
    } catch { setError(isEn ? 'Failed to load bookings.' : 'تعذر تحميل الحجوزات.'); }
    finally { setLoading(false); }
  }, [activityType, shop]);

  useEffect(() => {
    if (propBookings) {
      setBookings(propBookings.filter(b => matchesActivity(b, activityType, shop)));
      setLoading(false);
      return;
    }
    loadBookings();
  }, [propBookings, activityType, shop?.id, loadBookings]);

  /* ── Filters ── */
  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'all' || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || (b.customerName || '').toLowerCase().includes(q) ||
      (b.customerPhone || '').includes(q) || (b.serviceName || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const otherBookings = useMemo(() => filtered.filter(b => {
    const bDate = (b.date || b.bookingDate || '').slice(0, 10);
    return bDate !== todayStr || b.status === 'completed' || b.status === 'cancelled';
  }), [filtered, todayStr]);

  return (
    <div className="space-y-5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      {/* Manual booking modal */}
      {showManualForm && (
        <ManualBookingForm isEn={isEn} shop={shop} activityType={activityType}
          onAdded={loadBookings} onClose={() => setShowManualForm(false)} />
      )}

      {/* ─── Header with booking open/close toggle ─── */}
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <CalendarCheck className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{isEn ? `${vocab.dashboardTitle} Bookings` : `حجوزات ${vocab.dashboardTitle}`}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{bookings.length} {isEn ? 'total bookings' : 'حجز إجمالاً'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-row-reverse">
          {/* Add manual booking */}
          <button onClick={() => setShowManualForm(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-black transition-all">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{isEn ? 'Add Booking' : 'حجز يدوي'}</span>
          </button>
          {/* Refresh */}
          <button onClick={loadBookings}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-500"
            title={isEn ? 'Refresh' : 'تحديث'}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ─── Search & Filters ─── */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text"
            placeholder={isEn ? 'Search by name, phone, or service...' : 'ابحث بالاسم أو الهاتف أو الخدمة...'}
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
        </div>
        <div className="flex gap-2 flex-row-reverse overflow-x-auto no-scrollbar">
          {ALL_STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black border transition-all ${filter === s
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
              {statusLabels[s]}
              {s !== 'all' && <span className="mr-1 opacity-60">({bookings.filter(b => b.status === s).length})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Content ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
          <p className="font-bold text-slate-400">{isEn ? 'Loading bookings...' : 'جاري تحميل الحجوزات...'}</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
          <p className="text-red-600 font-bold text-sm">{error}</p>
          <button onClick={loadBookings} className="mt-3 text-xs font-black text-red-600 underline">{isEn ? 'Retry' : 'إعادة المحاولة'}</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10 text-center">
          <CalendarCheck className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">
            {search ? (isEn ? `No results for "${search}"` : `لا نتائج لـ "${search}"`) : (isEn ? 'No bookings yet' : 'لا توجد حجوزات')}
          </p>
          <button onClick={() => setShowManualForm(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-black transition-all">
            <Plus className="w-3.5 h-3.5" /> {isEn ? 'Add First Booking' : 'أضف أول حجز'}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ─── Today's Queue Section ─── */}
          {sortedTodayBookings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                <Clock className="w-4 h-4 text-[#00E5FF]" />
                <h3 className="font-black text-sm text-slate-900">{isEn ? "Today's Queue" : 'قائمة انتظار اليوم'}</h3>
                <span className="text-xs font-bold text-slate-400">({sortedTodayBookings.length})</span>
              </div>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {sortedTodayBookings.map((b: any, idx: number) => (
                    <QueueItem key={b.id} booking={b} index={idx} total={sortedTodayBookings.length}
                      isEn={isEn} lang={lang} isToday={true}
                      onMoveUp={handleMoveUp} onMoveDown={handleMoveDown} onJump={handleJump}
                      onUpdateStatus={handleUpdateStatus} updatingId={updatingId} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Other Bookings Section ─── */}
          {otherBookings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                <CalendarCheck className="w-4 h-4 text-slate-400" />
                <h3 className="font-black text-sm text-slate-700">{isEn ? 'Other Bookings' : 'حجوزات أخرى'}</h3>
                <span className="text-xs font-bold text-slate-400">({otherBookings.length})</span>
              </div>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {otherBookings.map((b: any, idx: number) => (
                    <QueueItem key={b.id} booking={b} index={idx} total={otherBookings.length}
                      isEn={isEn} lang={lang} isToday={false}
                      onMoveUp={() => {}} onMoveDown={() => {}} onJump={() => {}}
                      onUpdateStatus={handleUpdateStatus} updatingId={updatingId} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingBookingsPage;