import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import ReservationsTab from '@/components/pages/business/merchant-dashboard/tabs/ReservationsTab';

const BookingsPage: React.FC = () => {
  const { useLocation } = ReactRouterDOM as any;
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const refreshInFlightRef = useRef(false);

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

  const load = useCallback(async () => {
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    setLoading(true);
    setError('');
    try {
      const shopId = getTargetShopId();
      const data = await ApiService.getBookings(shopId || undefined);
      setReservations(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setReservations([]);
      setError(String(e?.message || 'تعذر تحميل الحجوزات'));
    } finally {
      setLoading(false);
      refreshInFlightRef.current = false;
    }
  }, [getTargetShopId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateStatus = useCallback(async (id: string, status: string) => {
    try {
      await ApiService.updateBookingStatus(id, status);
      await load();
    } catch (e: any) {
      setError(String(e?.message || 'تعذر تحديث حالة الحجز'));
    }
  }, [load]);

  return (
    <div className="p-6 md:p-12">
      {error ? (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl px-6 py-4 font-bold text-sm">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm flex items-center justify-center gap-3 text-slate-500 font-bold">
          <Loader2 className="animate-spin" size={20} />
          جاري تحميل الحجوزات...
        </div>
      ) : (
        <ReservationsTab reservations={reservations as any} onUpdateStatus={handleUpdateStatus} />
      )}
    </div>
  );
};

export default BookingsPage;
