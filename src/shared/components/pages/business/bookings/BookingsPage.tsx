import React, { useCallback, useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, CheckCircle2, XCircle, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { getBookingActivityVocabulary } from '../clinic/bookingActivityConfig';

const BookingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { useLocation, Outlet } = ReactRouterDOM as any;
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const pathParts = String(location?.pathname || '').split('/').filter(Boolean);
  const basePath = pathParts[1] || 'clinic';
  const subPage = pathParts[2] || 'overview';
  const vocab = getBookingActivityVocabulary(basePath);

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
      
      // Fetch shop details first
      const shopData = await ApiService.getMyShop().catch(() => null);
      if (shopData) {
        setShop(shopData);
      }

      // Fetch bookings list
      const data = await ApiService.getBookings(shopId || undefined);
      setBookings(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setBookings([]);
      setError(String(e?.message || 'فشل تحميل بيانات الحجوزات'));
    } finally {
      setLoading(false);
    }
  }, [getTargetShopId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookingsList = bookings.filter((b) => String(b.bookingDate) === todayStr);

  const todayCount = todayBookingsList.length;
  const pendingCount = bookings.filter((b) => String(b.status).toUpperCase() === 'PENDING').length;
  const confirmedCount = bookings.filter(
    (b) => String(b.status).toUpperCase() === 'CONFIRMED' || String(b.status).toUpperCase() === 'COMPLETED'
  ).length;
  const cancelledCount = bookings.filter(
    (b) => String(b.status).toUpperCase() === 'CANCELLED' || String(b.status).toUpperCase() === 'EXPIRED'
  ).length;

  const showStats = ['overview', 'bookings'].includes(subPage);

  if (loading && bookings.length === 0) {
    return (
      <div className="p-6 md:p-12 min-h-[400px] flex flex-col items-center justify-center gap-4 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm">
        <Loader2 className="animate-spin text-cyan-500 w-12 h-12" />
        <p className="font-bold text-slate-400 text-sm">جاري تحميل لوحة الحجوزات الموحدة...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 space-y-8 text-right" dir="rtl">
      {error && (
        <div className="bg-red-50 text-red-650 border border-red-100 rounded-2xl p-4 text-xs font-black flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={loadData} className="p-1 hover:bg-red-100 rounded-full transition-colors">
            <RefreshCw size={14} className="animate-spin-hover" />
          </button>
        </div>
      )}

      {/* Shared Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">{vocab.dashboardTitle}</h1>
            {shop && (
              <span className="px-3.5 py-1 text-xs font-black bg-cyan-50 text-cyan-800 rounded-full border border-cyan-100">
                {shop.name}
              </span>
            )}
          </div>
          <p className="text-slate-500 font-bold text-sm leading-relaxed">{vocab.dashboardSubtitle}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {shop && (
            <a
              href={`/shop/${shop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial px-5 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ExternalLink size={14} />
              <span>معاينة صفحة الحجز</span>
            </a>
          )}
          <button
            onClick={loadData}
            className="p-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="تحديث البيانات"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Shared Statistics Dashboard */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400">حجوزات اليوم</span>
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{todayCount}</span>
              <p className="mt-1 text-[11px] font-bold text-slate-400">مجموع الحجوزات لليوم الحالي</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400">قيد الانتظار</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{pendingCount}</span>
              <p className="mt-1 text-[11px] font-bold text-slate-400">حجوزات معلقة تتطلب اتخاذ إجراء</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400">المؤكدة والمكتملة</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{confirmedCount}</span>
              <p className="mt-1 text-[11px] font-bold text-slate-400">إجمالي المواعيد المؤكدة والناجحة</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400">الملغية</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <XCircle size={18} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{cancelledCount}</span>
              <p className="mt-1 text-[11px] font-bold text-slate-400">مواعيد تم إلغاؤها من الإدارة أو العميل</p>
            </div>
          </div>
        </div>
      )}

      {/* Child Dynamic Content View */}
      <div className="mt-6">
        <Outlet context={{ bookings, loading, error, loadBookings: loadData, shop }} />
      </div>
    </div>
  );
};

export default BookingsPage;
