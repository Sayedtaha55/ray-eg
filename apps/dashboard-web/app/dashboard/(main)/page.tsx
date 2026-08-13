'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Eye, ShoppingCart, DollarSign, Bell, TrendingUp,
  Tag, Plus, Megaphone, Calendar, FileText, Settings as SettingsIcon,
  Repeat, AlertTriangle, Sparkles,
} from 'lucide-react';
import { useAuth, apiRequest } from '@/lib/auth';

type Analytics = {
  salesCountToday?: number;
  revenueToday?: number;
  totalOrders?: number;
  totalRevenue?: number;
  chartData?: Array<{ name: string; sales: number }>;
  reservationsToday?: number;
  totalReservations?: number;
};

type Shop = {
  id?: string;
  name?: string;
  followers?: number;
  visitors?: number;
  status?: string;
  layoutConfig?: any;
};

type Notification = {
  id: string;
  title?: string;
  message?: string;
  createdAt?: string;
  type?: string;
};

function StatCard({
  label, value, icon, color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'cyan' | 'slate' | 'blue' | 'green' | 'amber' | 'purple';
}) {
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-50 text-cyan-600',
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end group hover:shadow-md transition-all">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 ${colorMap[color]}`}>
        {icon}
      </div>
      <span className="text-slate-500 font-semibold text-xs mb-1">{label}</span>
      <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{value}</span>
    </div>
  );
}

function ActivityItem({ n }: { n: Notification }) {
  return (
    <div className="flex items-start gap-3 flex-row-reverse">
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
        <Bell size={14} className="text-slate-400" />
      </div>
      <div className="flex-1 text-right">
        <p className="text-sm font-bold text-slate-700">{n.title || n.message || 'إشعار'}</p>
        {n.createdAt && (
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
            {new Date(n.createdAt).toLocaleDateString('ar-EG')}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [customerStats, setCustomerStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const shopData = await apiRequest('/shops/me');
        if (cancelled) return;
        setShop(shopData);

        if (shopData?.id) {
          try {
            const [analyticsData, notifData, customerData] = await Promise.allSettled([
              apiRequest(`/shops/${shopData.id}/analytics`),
              apiRequest('/notifications'),
              apiRequest(`/shops/${shopData.id}/customers/analytics`),
            ]);
            if (cancelled) return;
            if (analyticsData.status === 'fulfilled') setAnalytics(analyticsData.value || {});
            if (notifData.status === 'fulfilled') {
              const notifs = notifData.value?.notifications || notifData.value || [];
              setNotifications(Array.isArray(notifs) ? notifs.slice(0, 8) : []);
            }
            if (customerData.status === 'fulfilled') setCustomerStats(customerData.value);
          } catch {}
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const enabledModules = useMemo(() => {
    const DEFAULT_MODULES = ['sales', 'inventory', 'crm', 'finance', 'marketing', 'bookings', 'reservations'];
    if (!shop?.layoutConfig) return new Set<string>(DEFAULT_MODULES);
    const raw = shop.layoutConfig?.enabledModules;
    if (!Array.isArray(raw)) return new Set<string>(DEFAULT_MODULES);
    const set = new Set(
      raw.map((x: any) => String(x?.id ?? x?.moduleId ?? x?.key ?? x ?? '').trim().toLowerCase()).filter(Boolean)
    );
    if (set.has('reservations')) set.add('bookings');
    if (set.has('bookings')) set.add('reservations');
    return set;
  }, [shop]);

  const showSalesAnalytics = enabledModules.has('sales');
  const showBookings = enabledModules.has('bookings');
  const showCRM = enabledModules.has('crm');

  const safeAnalytics = analytics || {};
  const chartData = Array.isArray(safeAnalytics.chartData) ? safeAnalytics.chartData : [];

  const quickActions = useMemo(() => {
    const actions: Array<{ id: string; label: string; icon: React.ReactNode; color: string; href: string }> = [];
    if (enabledModules.has('marketing'))
      actions.push({ id: 'promotions', label: 'إنشاء عرض', icon: <Tag size={18} />, color: 'from-purple-500 to-pink-500', href: '/dashboard/marketing' });
    if (enabledModules.has('inventory'))
      actions.push({ id: 'products', label: 'إضافة منتج', icon: <Plus size={18} />, color: 'from-blue-500 to-cyan-500', href: '/dashboard/inventory' });
    if (enabledModules.has('crm') || enabledModules.has('marketing'))
      actions.push({ id: 'customers', label: 'إرسال عرض ترويجي', icon: <Megaphone size={18} />, color: 'from-green-500 to-emerald-500', href: '/dashboard/crm' });
    if (enabledModules.has('bookings'))
      actions.push({ id: 'reservations', label: 'الحجوزات', icon: <Calendar size={18} />, color: 'from-cyan-500 to-blue-500', href: '/dashboard/bookings' });
    if (enabledModules.has('finance'))
      actions.push({ id: 'invoice', label: 'الفواتير', icon: <FileText size={18} />, color: 'from-violet-500 to-purple-500', href: '/dashboard/finance' });
    actions.push({ id: 'settings', label: 'الإعدادات', icon: <SettingsIcon size={18} />, color: 'from-slate-600 to-slate-800', href: '/dashboard/settings' });
    return actions;
  }, [enabledModules]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-10 md:space-y-12">
      {/* Page title */}
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="text-right">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">نظرة عامة</h1>
          <p className="text-sm font-bold text-slate-400 mt-1">
            مرحباً، {user?.name || 'مستخدم'} 👋
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full">
          <Sparkles size={14} />
          {shop?.status === 'approved' ? 'نشط' : 'قيد المراجعة'}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 text-right">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((a) => (
            <button
              key={a.id}
              onClick={() => router.push(a.href)}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg bg-gradient-to-br ${a.color} text-white font-medium text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-sm`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard label="المتابعين" value={shop?.followers?.toLocaleString() || '0'} icon={<Users size={20} />} color="cyan" />
        <StatCard label="زيارات المتجر" value={shop?.visitors?.toLocaleString() || '0'} icon={<Eye size={20} />} color="cyan" />
        {showSalesAnalytics ? (
          <>
            <StatCard label="مبيعات اليوم" value={`${safeAnalytics.salesCountToday ?? 0}`} icon={<ShoppingCart size={20} />} color="slate" />
            <StatCard label="إيراد اليوم" value={`ج.م ${safeAnalytics.revenueToday ?? 0}`} icon={<DollarSign size={20} />} color="cyan" />
          </>
        ) : null}
        {showBookings && !showSalesAnalytics ? (
          <>
            <StatCard label="حجوزات اليوم" value={`${safeAnalytics.reservationsToday ?? 0}`} icon={<Calendar size={20} />} color="cyan" />
            <StatCard label="إجمالي الحجوزات" value={`${safeAnalytics.totalReservations ?? 0}`} icon={<Calendar size={20} />} color="slate" />
          </>
        ) : null}
      </div>

      {/* Customer Analytics */}
      {showCRM && customerStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end hover:shadow-md transition-all cursor-pointer" onClick={() => router.push('/dashboard/crm')}>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 bg-blue-50 text-blue-600">
              <Users size={20} />
            </div>
            <span className="text-slate-500 font-semibold text-xs mb-1">إجمالي العملاء</span>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{customerStats.totalCustomers || 0}</span>
            {customerStats.newCustomersThisMonth > 0 && (
              <span className="text-xs font-medium text-green-600 mt-2">+{customerStats.newCustomersThisMonth} جديد هذا الشهر</span>
            )}
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end hover:shadow-md transition-all cursor-pointer" onClick={() => router.push('/dashboard/crm')}>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 bg-green-50 text-green-600">
              <Repeat size={20} />
            </div>
            <span className="text-slate-500 font-semibold text-xs mb-1">نسبة العائدين</span>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{customerStats.retentionRate || 0}%</span>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end hover:shadow-md transition-all cursor-pointer" onClick={() => router.push('/dashboard/crm')}>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 bg-amber-50 text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <span className="text-slate-500 font-semibold text-xs mb-1">معرضون للتوقف</span>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{customerStats.atRiskCustomers?.length || 0}</span>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end hover:shadow-md transition-all cursor-pointer" onClick={() => router.push('/dashboard/crm')}>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 bg-purple-50 text-purple-600">
              <TrendingUp size={20} />
            </div>
            <span className="text-slate-500 font-semibold text-xs mb-1">متوسط الزيارات</span>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{customerStats.avgVisitsPerCustomer || 0}</span>
          </div>
        </div>
      )}

      {/* Sales chart + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {showSalesAnalytics && (
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6 flex-row-reverse">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">المبيعات والإيرادات</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 text-right">إجمالي المبيعات</div>
                <div className="mt-2 text-lg sm:text-xl font-bold text-slate-900 text-right">{Number(safeAnalytics.totalOrders || 0).toLocaleString()}</div>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 text-right">إجمالي الإيرادات</div>
                <div className="mt-2 text-lg sm:text-xl font-bold text-slate-900 text-right">ج.م {Number(safeAnalytics.totalRevenue || 0).toLocaleString()}</div>
              </div>
            </div>
            {chartData.length > 0 && (
              <div className="mt-6">
                <div className="text-xs font-semibold text-slate-500 text-right mb-3">المبيعات اليومية</div>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="grid grid-cols-2 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                    <div className="text-right">اليوم</div>
                    <div className="text-right">الإيراد</div>
                  </div>
                  <div className="divide-y divide-slate-200 max-h-48 overflow-y-auto">
                    {chartData.map((row, idx) => (
                      <div key={`${row.name}:${idx}`} className="grid grid-cols-2 px-3 py-2">
                        <div className="text-right font-semibold text-slate-700 text-sm">{row.name}</div>
                        <div className="text-right font-semibold text-slate-900 text-sm">ج.م {Number(row.sales || 0).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`${showSalesAnalytics ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6 flex-row-reverse">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">أحدث الإشعارات</h3>
              <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600">
                <Bell size={18} />
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6">
              {notifications.length === 0 ? (
                <div className="py-12 sm:py-16 text-center text-slate-300">
                  <Bell size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="font-semibold">لا يوجد نشاط حديث</p>
                </div>
              ) : (
                notifications.map((n) => <ActivityItem key={n.id} n={n} />)
              )}
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/notifications')}
              className="w-full mt-6 sm:mt-8 py-3 sm:py-4 bg-slate-50 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-100 transition-all"
            >
              عرض كل الإشعارات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
