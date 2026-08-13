'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CalendarCheck, Clock, Phone, UserCheck, XCircle, Calendar,
  CheckCircle2, Loader2, Bell, Settings as SettingsIcon,
  LayoutDashboard, ArrowUpRight, ArrowDownRight, CalendarDays, DoorOpen, Stethoscope,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { GenericSubPage } from '@/components/GenericSectionPage';
import Link from 'next/link';

type Reservation = {
  id: string;
  status: string;
  itemName?: string;
  itemImage?: string;
  itemPrice?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  startTime?: string;
  reservationDate?: string;
  createdAt?: string;
  notes?: string;
  guests?: number;
  participants?: number;
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'قيد الانتظار', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'مؤكد', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  COMPLETED: { label: 'مكتمل', cls: 'bg-green-50 text-green-700 border-green-200' },
  CANCELLED: { label: 'ملغي', cls: 'bg-red-50 text-red-700 border-red-200' },
  EXPIRED: { label: 'منتهي', cls: 'bg-slate-50 text-slate-500 border-slate-200' },
};

type TabId = 'overview' | 'reservations' | 'calendar' | 'appointments' | 'doctors' | 'rooms' | 'tables' | 'notifications' | 'settings';

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'reservations', label: 'الحجوزات', icon: CalendarCheck },
  { id: 'calendar', label: 'التقويم', icon: Calendar },
  { id: 'appointments', label: 'جدول المواعيد', icon: CalendarDays },
  { id: 'doctors', label: 'الأطباء والمقدمون', icon: Stethoscope },
  { id: 'rooms', label: 'الغرف والقاعات', icon: DoorOpen },
  { id: 'tables', label: 'الطاولات والأماكن', icon: DoorOpen },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
];

export default function BookingsDashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = (searchParams.get('tab') || 'overview') as TabId;
  const [activeTab, setActiveTab] = useState<TabId>(
    TABS.some((t) => t.id === tabParam) ? tabParam : 'overview'
  );

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [updatingId, setUpdatingId] = useState('');

  const switchTab = (tab: TabId) => {
    setActiveTab(tab);
    router.push(`/bookings?tab=${tab}`, { scroll: false });
  };

  useEffect(() => {
    setActiveTab(TABS.some((t) => t.id === tabParam) ? tabParam : 'overview');
  }, [tabParam]);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) {
        setError('لم يتم العثور على المتجر');
        setLoading(false);
        return;
      }
      const data = await apiRequest(`/reservations?shopId=${sid}&limit=200`);
      const list = Array.isArray(data) ? data : (data?.reservations || data?.data || data?.items || []);
      setReservations(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل الحجوزات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const counts = useMemo(() => {
    const pending = reservations.filter((r) => ['PENDING', 'CONFIRMED'].includes(String(r.status || '').toUpperCase())).length;
    const completed = reservations.filter((r) => String(r.status || '').toUpperCase() === 'COMPLETED').length;
    const cancelled = reservations.filter((r) => ['CANCELLED', 'EXPIRED'].includes(String(r.status || '').toUpperCase())).length;
    return { pending, completed, cancelled };
  }, [reservations]);

  const stats = useMemo(() => {
    const totalRevenue = reservations
      .filter((r) => String(r.status || '').toUpperCase() === 'COMPLETED')
      .reduce((s, r) => s + Number(r.itemPrice || 0), 0);
    const pendingRevenue = reservations
      .filter((r) => String(r.status || '').toUpperCase() === 'PENDING')
      .reduce((s, r) => s + Number(r.itemPrice || 0), 0);
    const todayCount = reservations.filter((r) => {
      const d = new Date(r.createdAt || r.startTime || r.reservationDate || Date.now());
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { totalRevenue, pendingRevenue, todayCount };
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    if (filter === 'all') return reservations;
    if (filter === 'pending') return reservations.filter((r) => ['PENDING', 'CONFIRMED'].includes(String(r.status || '').toUpperCase()));
    if (filter === 'completed') return reservations.filter((r) => String(r.status || '').toUpperCase() === 'COMPLETED');
    if (filter === 'cancelled') return reservations.filter((r) => ['CANCELLED', 'EXPIRED'].includes(String(r.status || '').toUpperCase()));
    return reservations;
  }, [reservations, filter]);

  const handleUpdateStatus = useCallback(async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await apiRequest(`/reservations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err: any) {
      setError(err?.message || 'فشل تحديث الحالة');
    } finally {
      setUpdatingId('');
    }
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 flex-row-reverse mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
            <CalendarCheck size={28} className="text-[#00E5FF]" />
          </div>
          <div className="text-right">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">لوحة الحجوزات</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">إدارة كاملة للحجوزات والمواعيد والإعدادات</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-all ${
                  isActive ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-right mb-6">
            {error}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab reservations={reservations} counts={counts} stats={stats} loading={loading} />
        )}
        {activeTab === 'reservations' && (
          <ReservationsTab
            reservations={filteredReservations}
            loading={loading}
            filter={filter}
            setFilter={setFilter}
            updatingId={updatingId}
            handleUpdateStatus={handleUpdateStatus}
          />
        )}
        {activeTab === 'calendar' && <GenericSubPage pageId="bookings/calendar" />}
        {activeTab === 'appointments' && <GenericSubPage pageId="bookings/appointments" />}
        {activeTab === 'doctors' && <GenericSubPage pageId="bookings/doctors" />}
        {activeTab === 'rooms' && <GenericSubPage pageId="bookings/rooms" />}
        {activeTab === 'tables' && <GenericSubPage pageId="bookings/tables" />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

/* ============ OVERVIEW TAB ============ */
function OverviewTab({ reservations, counts, stats, loading }: {
  reservations: Reservation[];
  counts: { pending: number; completed: number; cancelled: number };
  stats: { totalRevenue: number; pendingRevenue: number; todayCount: number };
  loading: boolean;
}) {
  const todayReservations = useMemo(() => {
    return reservations.filter((r) => {
      const d = new Date(r.createdAt || r.startTime || r.reservationDate || Date.now());
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [reservations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="قيد الانتظار"
          value={counts.pending}
          sublabel={`ج.م ${stats.pendingRevenue.toLocaleString()} معلق`}
          color="amber"
        />
        <StatCard
          icon={UserCheck}
          label="مكتملة"
          value={counts.completed}
          sublabel={`ج.م ${stats.totalRevenue.toLocaleString()} إيرادات`}
          color="green"
        />
        <StatCard
          icon={XCircle}
          label="ملغاة / منتهية"
          value={counts.cancelled}
          sublabel="إجمالي الملغاة"
          color="red"
        />
        <StatCard
          icon={Calendar}
          label="حجوزات اليوم"
          value={stats.todayCount}
          sublabel={`من ${reservations.length} إجمالي`}
          color="blue"
        />
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-black text-slate-900 mb-4">حجوزات اليوم</h3>
        {todayReservations.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CalendarCheck size={48} className="mx-auto mb-3 opacity-20" />
            <p className="font-bold">لا توجد حجوزات اليوم</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayReservations.slice(0, 5).map((reservation) => {
              const statusInfo = STATUS_LABELS[String(reservation.status || '').toUpperCase()] || STATUS_LABELS.PENDING;
              return (
                <div key={reservation.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                      <CalendarCheck size={20} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{reservation.itemName || 'حجز'}</p>
                      <p className="text-xs text-slate-500">{reservation.customerName || 'عميل'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${statusInfo.cls}`}>
                    {statusInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ NOTIFICATIONS TAB ============ */
function NotificationsTab() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
      <Bell size={48} className="mx-auto mb-4 text-slate-300" />
      <h3 className="text-lg font-black text-slate-900 mb-2">الإشعارات</h3>
      <p className="text-sm text-slate-500">لا توجد إشعارات جديدة</p>
    </div>
  );
}

/* ============ RESERVATIONS TAB ============ */
function ReservationsTab({
  reservations,
  loading,
  filter,
  setFilter,
  updatingId,
  handleUpdateStatus,
}: {
  reservations: Reservation[];
  loading: boolean;
  filter: 'all' | 'pending' | 'completed' | 'cancelled';
  setFilter: (filter: 'all' | 'pending' | 'completed' | 'cancelled') => void;
  updatingId: string;
  handleUpdateStatus: (id: string, status: string) => void;
}) {
  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'pending', label: 'قيد الانتظار' },
    { id: 'completed', label: 'مكتملة' },
    { id: 'cancelled', label: 'ملغاة' },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              filter === f.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      {reservations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <CalendarCheck size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-black text-slate-900 mb-2">لا توجد حجوزات</h3>
          <p className="text-sm text-slate-500">ابدأ بإضافة حجوزات جديدة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => {
            const statusInfo = STATUS_LABELS[String(reservation.status || '').toUpperCase()] || STATUS_LABELS.PENDING;
            const isPending = ['PENDING', 'CONFIRMED'].includes(String(reservation.status || '').toUpperCase());
            
            return (
              <div key={reservation.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {reservation.itemImage && (
                      <img
                        src={reservation.itemImage}
                        alt={reservation.itemName}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-lg text-slate-900">{reservation.itemName || 'حجز'}</h4>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-slate-500">
                        <p className="flex items-center gap-2">
                          <UserCheck size={14} />
                          {reservation.customerName || 'عميل'}
                        </p>
                        {reservation.customerPhone && (
                          <p className="flex items-center gap-2">
                            <Phone size={14} />
                            {reservation.customerPhone}
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <Clock size={14} />
                          {reservation.createdAt ? new Date(reservation.createdAt).toLocaleDateString('ar-EG') : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <p className="text-xs text-slate-400 mb-1">المبلغ</p>
                    <p className="text-xl font-black text-slate-900">
                      ج.م {Number(reservation.itemPrice || 0).toLocaleString()}
                    </p>
                    
                    {isPending && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleUpdateStatus(reservation.id, 'COMPLETED')}
                          disabled={updatingId === reservation.id}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 disabled:opacity-50"
                        >
                          {updatingId === reservation.id ? <Loader2 size={14} className="animate-spin" /> : 'قبول'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(reservation.id, 'CANCELLED')}
                          disabled={updatingId === reservation.id}
                          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 disabled:opacity-50"
                        >
                          {updatingId === reservation.id ? <Loader2 size={14} className="animate-spin" /> : 'رفض'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============ SETTINGS TAB ============ */
function SettingsTab() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
      <SettingsIcon size={48} className="mx-auto mb-4 text-slate-300" />
      <h3 className="text-lg font-black text-slate-900 mb-2">الإعدادات</h3>
      <p className="text-sm text-slate-500">إعدادات لوحة الحجوزات</p>
    </div>
  );
}

/* ============ STAT CARD COMPONENT ============ */
function StatCard({ icon: Icon, label, value, sublabel, color }: {
  icon: any;
  label: string;
  value: number;
  sublabel: string;
  color: 'amber' | 'green' | 'red' | 'blue';
}) {
  const colors = {
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-500',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <span className="text-xs font-semibold text-slate-500">{label}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 font-semibold mt-1">{sublabel}</p>
    </div>
  );
}
