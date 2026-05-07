'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';

const BookingsPage: React.FC = () => {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const refreshInFlightRef = useRef(false);

  const getTargetShopId = useCallback(() => {
    try {
      if (typeof window === 'undefined') return '';
      const params = new URLSearchParams(window.location.search);
      const impersonateShopId = String(params.get('impersonateShopId') || '').trim();
      const userStr = localStorage.getItem('ray_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const role = String(user?.role || '').toLowerCase();
      const shopIdFromUser = String(user?.shopId || '').trim();
      if (role === 'admin' && impersonateShopId) return impersonateShopId;
      return shopIdFromUser;
    } catch { return ''; }
  }, []);

  const load = useCallback(async () => {
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    setLoading(true); setError('');
    try {
      const shopId = getTargetShopId();
      const data = await clientFetch<any[]>(`/v1/bookings${shopId ? `?shopId=${shopId}` : ''}`);
      setReservations(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setReservations([]);
      setError(String(e?.message || t('business.bookings.loadFailed', 'فشل تحميل الحجوزات')));
    } finally { setLoading(false); refreshInFlightRef.current = false; }
  }, [getTargetShopId]);

  useEffect(() => { load(); }, [load]);

  const handleUpdateStatus = useCallback(async (id: string, status: string) => {
    try { await clientFetch<any>(`/v1/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await load(); }
    catch (e: any) { setError(String(e?.message || t('business.bookings.updateFailed', 'فشل تحديث الحجز'))); }
  }, [load]);

  const statusBadge = (s: string) => {
    const v = String(s || '').toUpperCase();
    if (v === 'CONFIRMED') return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
    if (v === 'COMPLETED') return 'bg-slate-900/10 text-slate-900 border-slate-900/20';
    if (v === 'CANCELLED') return 'bg-red-500/10 text-red-600 border-red-500/20';
    return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
  };

  const statusLabel = (s: string) => {
    const v = String(s || '').toUpperCase();
    if (v === 'CONFIRMED') return t('business.bookings.status.confirmed', 'مؤكد');
    if (v === 'COMPLETED') return t('business.bookings.status.completed', 'مكتمل');
    if (v === 'CANCELLED') return t('business.bookings.status.cancelled', 'ملغي');
    return t('business.bookings.status.pending', 'قيد الانتظار');
  };

  return (
    <div className="p-6 md:p-12">
      {error && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl px-6 py-4 font-bold text-sm">{error}</div>}
      {loading ? (
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center justify-center gap-3 text-slate-500 font-bold"><Loader2 className="animate-spin" size={20} />{t('business.bookings.loading', 'جاري التحميل')}</div>
      ) : (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="text-lg font-black text-slate-900 mb-6">{t('business.bookings.title', 'الحجوزات')}</div>
          {reservations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold">{t('business.bookings.noBookings', 'لا توجد حجوزات')}</div>
          ) : (
            <div className="space-y-3">
              {reservations.map((r: any) => (
                <div key={r?.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-slate-900">{r?.customerName || r?.name || '—'}</div>
                      <div className="mt-1 text-xs font-bold text-slate-400">{r?.customerPhone || r?.phone || '—'}</div>
                      <div className="mt-1 text-xs font-bold text-slate-500">{r?.date || r?.time || '—'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-2xl border text-[11px] font-black ${statusBadge(r?.status)}`}>{statusLabel(r?.status)}</span>
                      {r?.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleUpdateStatus(r.id, 'CONFIRMED')} className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 text-[10px] font-black hover:bg-emerald-500/20">{t('business.bookings.confirm', 'تأكيد')}</button>
                          <button type="button" onClick={() => handleUpdateStatus(r.id, 'CANCELLED')} className="px-3 py-1 rounded-xl bg-red-500/10 text-red-600 text-[10px] font-black hover:bg-red-500/20">{t('business.bookings.cancel', 'إلغاء')}</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
