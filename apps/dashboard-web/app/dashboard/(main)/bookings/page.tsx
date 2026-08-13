'use client';

import React, { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CalendarCheck, Clock, Phone, UserCheck, XCircle, Calendar,
  CheckCircle2, Loader2, X, Bell, Settings as SettingsIcon,
  Globe, ShieldCheck, CreditCard, Lock, LayoutDashboard,
  TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight,
  CalendarDays, DoorOpen, Stethoscope,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { GenericSubPage } from '@/components/GenericSectionPage';

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

function BookingsDashboardContent() {
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
    router.push(`/dashboard/bookings?tab=${tab}`, { scroll: false });
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
      const d = new Date(r.startTime || r.reservationDate || r.createdAt || Date.now());
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).slice(0, 5);
  }, [reservations]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Clock} label="قيد الانتظار" value={counts.pending} color="amber" />
        <StatCard icon={CheckCircle2} label="مكتملة" value={counts.completed} color="green" />
        <StatCard icon={XCircle} label="ملغاة / منتهية" value={counts.cancelled} color="red" />
        <StatCard icon={Calendar} label="حجوزات اليوم" value={stats.todayCount} color="blue" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between flex-row-reverse mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <ArrowUpRight size={20} className="text-emerald-400" />
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 mb-1">إجمالي الإيرادات</div>
            <div className="text-2xl font-black text-slate-900">ج.م {stats.totalRevenue.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between flex-row-reverse mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <ArrowDownRight size={20} className="text-amber-400" />
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 mb-1">إيرادات معلقة</div>
            <div className="text-2xl font-black text-slate-900">ج.م {stats.pendingRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-row-reverse">
          <h3 className="font-black text-slate-900 text-sm">حجوزات اليوم</h3>
          <CalendarCheck size={18} className="text-slate-300" />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
          </div>
        ) : todayReservations.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarCheck size={28} className="mx-auto mb-2 text-slate-200" />
            <p className="text-slate-400 font-bold text-xs">لا توجد حجوزات اليوم</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {todayReservations.map((res) => {
              const status = String(res.status || '').toUpperCase();
              const meta = STATUS_LABELS[status] || { label: status, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
              return (
                <div key={res.id} className="p-4 flex items-center justify-between flex-row-reverse">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <CalendarCheck size={18} className="text-slate-400" />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-sm">{res.itemName || 'حجز'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {res.customerName || 'عميل'} • {new Date(res.startTime || res.reservationDate || res.createdAt || Date.now()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${meta.cls}`}>{meta.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <span className="text-slate-500 font-semibold text-xs mb-1">{label}</span>
      <span className="text-xl sm:text-2xl font-black text-slate-900">{value}</span>
    </div>
  );
}

/* ============ RESERVATIONS TAB ============ */
function ReservationsTab({ reservations, loading, filter, setFilter, updatingId, handleUpdateStatus }: {
  reservations: Reservation[];
  loading: boolean;
  filter: 'all' | 'pending' | 'completed' | 'cancelled';
  setFilter: (f: any) => void;
  updatingId: string;
  handleUpdateStatus: (id: string, status: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'pending', label: 'قيد الانتظار' },
          { id: 'completed', label: 'مكتملة' },
          { id: 'cancelled', label: 'ملغاة' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === f.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CalendarCheck size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد حجوزات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => {
            const status = String(res.status || '').toUpperCase();
            const meta = STATUS_LABELS[status] || { label: status, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
            const isPending = status === 'PENDING' || status === 'CONFIRMED';
            return (
              <div key={res.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between flex-row-reverse mb-3">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    {res.itemImage ? (
                      <img src={res.itemImage} alt={res.itemName || ''} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                        <CalendarCheck size={20} className="text-slate-300" />
                      </div>
                    )}
                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-sm">{res.itemName || 'حجز'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {new Date(res.startTime || res.reservationDate || res.createdAt || Date.now()).toLocaleString('ar-EG')}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${meta.cls}`}>{meta.label}</span>
                </div>
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right space-y-1">
                    {res.customerName && (<div className="text-xs font-medium text-slate-600">{res.customerName}</div>)}
                    {res.customerPhone && (<div className="text-xs text-slate-500" dir="ltr">{res.customerPhone}</div>)}
                    {res.guests || res.participants ? (<div className="text-xs text-slate-500">{Number(res.guests || res.participants)} ضيف</div>) : null}
                    {res.itemPrice ? (<div className="text-sm font-bold text-slate-900">ج.م {Number(res.itemPrice).toLocaleString()}</div>) : null}
                  </div>
                  {isPending && (
                    <div className="flex gap-2 flex-row-reverse">
                      <button onClick={() => handleUpdateStatus(res.id, 'COMPLETED')} disabled={updatingId === res.id}
                        className="px-3 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition-all disabled:opacity-50">
                        {updatingId === res.id ? <Loader2 size={14} className="animate-spin" /> : 'تأكيد'}
                      </button>
                      <button onClick={() => handleUpdateStatus(res.id, 'CANCELLED')} disabled={updatingId === res.id}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50">
                        إلغاء
                      </button>
                    </div>
                  )}
                </div>
                {res.notes && (<div className="mt-3 pt-3 border-t border-slate-100 text-right"><span className="text-xs text-slate-500">{res.notes}</span></div>)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============ NOTIFICATIONS TAB ============ */
function NotificationsTab() {
  const notifs = [
    { id: 1, title: 'حجز جديد', desc: 'عميل جديد حجز موعد عند ٣ مساءً', time: 'منذ ٥ دقائق', icon: CalendarCheck, color: 'blue' },
    { id: 2, title: 'تم تأكيد حجز', desc: 'تم تأكيد حجز السيد أحمد محمد', time: 'منذ ٢٠ دقيقة', icon: CheckCircle2, color: 'green' },
    { id: 3, title: 'إلغاء حجز', desc: 'تم إلغاء حجز السيدة سارة علي', time: 'منذ ساعة', icon: XCircle, color: 'red' },
    { id: 4, title: 'تذكير موعد', desc: 'موعد بعد ٣٠ دقيقة مع السيد خالد', time: 'منذ ٢ ساعة', icon: Bell, color: 'amber' },
  ];
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-row-reverse mb-2">
        <h3 className="font-black text-slate-900 text-sm">الإشعارات الأخيرة</h3>
        <button className="text-xs font-bold text-slate-400 hover:text-slate-600">تعليم الكل كمقروء</button>
      </div>
      {notifs.map((n) => {
        const Icon = n.icon;
        return (
          <div key={n.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3 flex-row-reverse">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[n.color]}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1 text-right">
              <div className="font-black text-slate-900 text-sm">{n.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">{n.desc}</div>
              <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
            </div>
          </div>
        );
      })}
      <div className="bg-slate-50 rounded-xl p-4 text-center">
        <p className="text-xs font-bold text-slate-400">إعدادات الإشعارات تتوفر في تبويب الإعدادات</p>
      </div>
    </div>
  );
}

/* ============ SETTINGS TAB ============ */
const SETTINGS_TABS = [
  { id: 'booking-site', label: 'الموقع العام', icon: Globe },
  { id: 'booking-security', label: 'الأمان والصلاحيات', icon: ShieldCheck },
  { id: 'booking-notifications', label: 'إشعارات وتأكيدات', icon: Bell },
  { id: 'booking-payments', label: 'مدفوعات وتأمين', icon: CreditCard },
  { id: 'booking-cancellation', label: 'سياسات الإلغاء', icon: XCircle },
  { id: 'booking-privacy', label: 'الخصوصية', icon: Lock },
] as const;

type SettingsTabId = typeof SETTINGS_TABS[number]['id'];

function SettingsTab() {
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTabId>('booking-site');
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSettingsTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveSettingsTab(tab.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                isActive ? 'border-slate-900 bg-slate-50' : 'border-slate-100 bg-white hover:border-slate-200'
              }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isActive ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>
                <Icon size={20} />
              </div>
              <span className={`text-[10px] font-black text-center leading-tight ${
                isActive ? 'text-slate-900' : 'text-slate-400'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8">
        {activeSettingsTab === 'booking-site' && <BookingSiteSettings />}
        {activeSettingsTab === 'booking-security' && <BookingSecuritySettings />}
        {activeSettingsTab === 'booking-notifications' && <BookingNotificationsSettings />}
        {activeSettingsTab === 'booking-payments' && <BookingPaymentsSettings />}
        {activeSettingsTab === 'booking-cancellation' && <BookingCancellationSettings />}
        {activeSettingsTab === 'booking-privacy' && <BookingPrivacySettings />}
      </div>
    </div>
  );
}

function SectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-black text-slate-900 mb-1">{title}</h2>
      <p className="text-sm font-bold text-slate-400">{desc}</p>
    </div>
  );
}

function ToggleRow({ title, desc, defaultOn }: { title: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
      <div className="flex-1">
        <div className="text-sm font-black text-slate-800">{title}</div>
        <div className="text-xs font-bold text-slate-400 mt-0.5">{desc}</div>
      </div>
      <button onClick={() => setOn(!on)}
        className={`w-12 h-7 rounded-full transition-all relative shrink-0 ${on ? 'bg-emerald-500' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? 'right-1' : 'right-6'}`} />
      </button>
    </div>
  );
}

function InputRow({ label, placeholder, type }: { label: string; placeholder: string; type?: string }) {
  return (
    <div className="py-4 border-b border-slate-50 last:border-0">
      <label className="text-sm font-black text-slate-800 block mb-2">{label}</label>
      <input type={type || 'text'} placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-slate-400" />
    </div>
  );
}

function BookingSiteSettings() {
  return (
    <div>
      <SectionTitle title="الموقع العام للحجوزات" desc="إعدادات الصفحة العامة التي يراها العملاء عند الحجز" />
      <InputRow label="اسم النشاط" placeholder="مثال: عيادة الدكتور أحمد" />
      <InputRow label="رقم التواصل" placeholder="مثال: 05xxxxxxxx" type="tel" />
      <InputRow label="عنوان الموقع" placeholder="مثال: الرياض، حي العليا" />
      <InputRow label="رابط الحجز المخصص" placeholder="mnmknk.com/booking/your-store" />
      <ToggleRow title="تفعيل الصفحة العامة" desc="إتاحة الحجز للعملاء عبر رابط عام" defaultOn />
      <ToggleRow title="إظهار الأسعار" desc="عرض أسعار الخدمات في الصفحة العامة" defaultOn />
      <ToggleRow title="إظهار أوقات التوفر" desc="عرض المواعيد المتاحة للعملاء" defaultOn />
    </div>
  );
}

function BookingSecuritySettings() {
  return (
    <div>
      <SectionTitle title="الأمان والصلاحيات" desc="تحكم في وصول الموظفين وإدارة الحجوزات" />
      <ToggleRow title="تأكيد الحجز يدوياً" desc="يتطلب موافقة المسؤول قبل تأكيد أي حجز" defaultOn />
      <ToggleRow title="منع الحجز المكرر" desc="منع نفس العميل من حجز أكثر من موعد في نفس الوقت" defaultOn />
      <ToggleRow title="تحقق رقم الهاتف" desc="إرسال رمز تحقق عبر SMS قبل تأكيد الحجز" />
      <ToggleRow title="تقييد الحجز بالعملاء المسجلين" desc="السماح بالحجز للعملاء المسجلين فقط" />
      <ToggleRow title="حد أقصى للحجوزات اليومية" desc="تحديد عدد الحجوزات المسموح به في اليوم" />
    </div>
  );
}

function BookingNotificationsSettings() {
  return (
    <div>
      <SectionTitle title="إشعارات وتأكيدات" desc="إعدادات إشعارات الحجز للعملاء والمسؤولين" />
      <ToggleRow title="إشعار تأكيد الحجز" desc="إرسال رسالة تأكيد للعميل بعد الحجز" defaultOn />
      <ToggleRow title="تذكير قبل الموعد" desc="إرسال تذكير للعميل قبل الموعد بساعة" defaultOn />
      <ToggleRow title="إشعار الإلغاء" desc="إشعار المسؤول عند إلغاء حجز" defaultOn />
      <ToggleRow title="إشعار حجز جديد" desc="إشعار المسؤول فور وصول حجز جديد" defaultOn />
      <ToggleRow title="إشعار عبر SMS" desc="إرسال الإشعارات عبر رسائل نصية" />
      <ToggleRow title="إشعار عبر WhatsApp" desc="إرسال الإشعارات عبر واتساب" />
      <ToggleRow title="إشعار عبر البريد الإلكتروني" desc="إرسال الإشعارات عبر البريد الإلكتروني" defaultOn />
    </div>
  );
}

function BookingPaymentsSettings() {
  return (
    <div>
      <SectionTitle title="مدفوعات وتأمين" desc="إعدادات الدفع والتأمين على الحجوزات" />
      <ToggleRow title="تفعيل الدفع الإلكتروني" desc="السماح للعملاء بالدفع عبر الإنترنت" />
      <ToggleRow title="دفع مقدم" desc="طلب دفع مقدم لتأكيد الحجز" />
      <ToggleRow title="تأمين الحجز" desc="خصم مبلغ تأمين قابل للاسترداد" />
      <ToggleRow title="الدفع عند الاستلام" desc="السماح بالدفع حضورياً" defaultOn />
      <ToggleRow title="استرداد تلقائي" desc="استرداد المبلغ تلقائياً عند الإلغاء" />
      <InputRow label="نسبة المقدم (%)" placeholder="مثال: 30" type="number" />
    </div>
  );
}

function BookingCancellationSettings() {
  return (
    <div>
      <SectionTitle title="سياسات الإلغاء" desc="قواعد إلغاء الحجوزات والاسترداد" />
      <ToggleRow title="السماح بالإلغاء" desc="السماح للعملاء بإلغاء حجوزاتهم" defaultOn />
      <ToggleRow title="إلغاء مجاني" desc="إلغاء بدون رسوم" />
      <InputRow label="مهلة الإلغاء المجاني (ساعات)" placeholder="مثال: 24" type="number" />
      <InputRow label="رسوم الإلغاء المتأخر (%)" placeholder="مثال: 50" type="number" />
      <ToggleRow title="منع الإلغاء يوم الحجز" desc="لا يمكن إلغاء الحجز في يوم الموعد" />
      <ToggleRow title="إلغاء تلقائي للحجوزات غير المؤكدة" desc="إلغاء الحجوزات غير المؤكدة بعد فترة محددة" defaultOn />
    </div>
  );
}

function BookingPrivacySettings() {
  return (
    <div>
      <SectionTitle title="الخصوصية وبيانات العملاء" desc="حماية بيانات العملاء وخصوصية الحجوزات" />
      <ToggleRow title="إخفاء بيانات العميل" desc="إخفاء رقم الهاتف والبريد عن الموظفين" />
      <ToggleRow title="حفظ سجل الحجوزات" desc="الاحتفاظ بسجل كامل للحجوزات للمراجعة" defaultOn />
      <ToggleRow title="مشاركة البيانات مع طرف ثالث" desc="السماح بمشاركة بيانات الحجز مع خدمات خارجية" />
      <ToggleRow title="طلب موافقة الخصوصية" desc="طلب موافقة العميل على سياسة الخصوصية قبل الحجز" defaultOn />
      <ToggleRow title="حذف البيانات تلقائياً" desc="حذف بيانات الحجوزات القديمة تلقائياً" />
      <InputRow label="مدة حفظ البيانات (أشهر)" placeholder="مثال: 12" type="number" />
    </div>
  );
}

export default function BookingsDashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm font-bold text-slate-500">جاري التحميل...</div>}>
      <BookingsDashboardContent />
    </Suspense>
  );
}
