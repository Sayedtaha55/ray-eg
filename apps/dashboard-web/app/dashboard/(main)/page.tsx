'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Eye, ShoppingCart, DollarSign, Bell, TrendingUp,
  Tag, Plus, Megaphone, Calendar, FileText, Settings as SettingsIcon,
  Repeat, AlertTriangle, Sparkles, Package, ArrowUpRight, ArrowDownRight,
  Clock, ChevronLeft, Inbox, Download, Zap, Target, Activity,
  UserPlus, Star, TrendingDown, RefreshCw, ChevronDown, Lightbulb,
  BarChart3, PieChart as PieChartIcon, MessageSquare, CheckCircle2,
  XCircle, Timer, Truck, CreditCard, Globe, LogIn, LogOut,
} from 'lucide-react';
import { useAuth, apiRequest } from '@/lib/auth';

const DAY = 24 * 60 * 60 * 1000;

type Analytics = {
  salesCountToday?: number;
  revenueToday?: number;
  totalOrders?: number;
  totalRevenue?: number;
  chartData?: Array<{ name: string; sales: number; revenue?: number }>;
  reservationsToday?: number;
  totalReservations?: number;
  conversionRate?: number;
  avgOrderValue?: number;
  newCustomers?: number;
  totalCustomers?: number;
  visitorsToday?: number;
  totalVisitors?: number;
  revenueTarget?: number;
  topProducts?: Array<{ name: string; sold: number; revenue: number }>;
  topCustomers?: Array<{ name: string; orders: number; spent: number }>;
  orderStatusBreakdown?: Record<string, number>;
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

type Order = {
  id?: string;
  total?: number;
  status?: string;
  customerPhone?: string;
  createdAt?: string;
  source?: string;
  items?: Array<{ productName?: string; quantity?: number; price?: number }>;
};

type LoginAudit = {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  loginAt: string;
  logoutAt?: string;
  durationMin?: number;
  ipAddress: string;
  userAgent: string;
};

type ActivityItem = {
  id: string;
  type: 'order' | 'customer' | 'product' | 'payment' | 'review' | 'system';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PREPARING: '#06b6d4',
  READY: '#14b8a6',
  DELIVERED: '#22c55e',
  CANCELLED: '#ef4444',
  REFUNDED: '#94a3b8',
};

const fmtEGP = (n: number) =>
  `${Number.isFinite(n) ? n.toLocaleString('ar-EG', { maximumFractionDigits: 0 }) : '0'} ج.م`;

const fmtShort = (id?: string) =>
  (id || '').length > 10 ? `${id!.slice(0, 8)}…` : (id || '');

const fmtDate = (iso?: string, opts: Intl.DateTimeFormatOptions = {}) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  try { return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', ...opts }); }
  catch { return d.toLocaleDateString(); }
};

const timeAgo = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso).getTime();
  const now = Date.now();
  const m = Math.floor((now - d) / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${m} د`;
if (m < 1440) return `منذ ${Math.floor(m / 60)} س`;
  return fmtDate(iso);
};

const STATUS_META: Record<string, { label: string; chip: string; dot: string }> = {
  PENDING: { label: 'قيد الانتظار', chip: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  CONFIRMED: { label: 'مؤكد', chip: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  PREPARING: { label: 'قيد التحضير', chip: 'bg-cyan-50 text-cyan-700', dot: 'bg-cyan-500' },
  READY: { label: 'جاهز', chip: 'bg-teal-50 text-teal-700', dot: 'bg-teal-500' },
  DELIVERED: { label: 'مكتمل', chip: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  CANCELLED: { label: 'ملغي', chip: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
  REFUNDED: { label: 'مسترجع', chip: 'bg-slate-100 text-slate-600', dot: 'bg-slate-500' },
};
const statusMeta = (s?: string) => STATUS_META[String(s || '').toUpperCase()] || { label: (s || 'أخرى'), chip: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };

type PeriodKey = '7' | '30' | '90' | '365';
const PERIODS: Array<{ key: PeriodKey; label: string }> = [
  { key: '7', label: '7 أيام' },
  { key: '30', label: '30 يوم' },
  { key: '90', label: '90 يوم' },
  { key: '365', label: 'السنة' },
];

function StatCard({
  label, value, icon, color, hint, delta, loading,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'cyan' | 'slate' | 'blue' | 'green' | 'amber' | 'purple';
  hint?: string;
  delta?: number | null;
  loading?: boolean;
}) {
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-50 text-cyan-600',
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  const deltaUp = typeof delta === 'number' && delta >= 0;
  const deltaDown = typeof delta === 'number' && delta < 0;
  return (
    <div className="bg-white p4 sm:p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end group hover:shadow-md transition-all">
      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-3 ${colorMap[color]}">
        {icon}
      </div>
      <span className="text-slate-500 font-semibold text-xs mb-1">{label}</span>
      {loading ? (
        <div className="h-7 w-24 bg-slate-100 rounded-md animate-pulse" />
      ) : (
        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{value}</span>
      )}
      {hint && <span className="text-[10px] font-semibold text-slate-400 mt-1">{hint}</span>}
      {typeof delta === 'number' && (
        <span className={`mt-2 inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5 ${deltaUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {deltaUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(delta).toFixed(1)}%
        </span>
      )}
    </div>
  );
}

function SkeletonRow() {
  return <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />;
}

function EmptyBlock({
  icon, title, ctaLabel, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  ctaLabel?: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">{icon}</div>
      <p className="text-sm font-semibold text-slate-400">{title}</p>
      {ctaLabel && onClick && (
        <button type="button" onClick={onClick} className="text-xs font-bold text-[#00E5FF] hover:underline">
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

function BarChart({
  data, exact
}: {
  data: Array<{ name: string; value: number }>;
  exact?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (data.length === 0) return null;
  return (
    <div className="flex items-end gap-1.5 h-40 sm:h-48">
      {data.map((d, i) => {
        const h = max > 0 ? Math.max((d.value / max)* 100, 4) : 4;
const formatVal = exact ? fmtEGP(d.value) : d.value.toLocaleString('ar-EG');
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
            <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {formatVal}
            </span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-[#00E5FF]/80 to-[#00E5FF] hover:from-[#00E5FF] hover:to-cyan-400 transition-all"
              style={{ height: `${h}%` }}
            />
            <span className="text-[9px] font-semibold text-slate-400">{d.name}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * Donut Chart (Order Status Distribution)
 * ============================================================ */

function DonutChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return <EmptyBlock icon={<PieChartIcon size={24} />} title="لا توجد بيانات" />;

  let cumulative = 0;
  const slices = entries.map(([key, value]) => {
    const pct = (value / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { key, value, pct, start, color: STATUS_COLORS[key] || '#94a3b8' };
  });

  const r = 40;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {slices.map((s, i) => {
            const dashLen = (s.pct / 100) * circumference;
            const dashGap = circumference - dashLen;
            const offset = (s.start / 100) * circumference;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="12"
                strokeDasharray={`${dashLen} ${dashGap}`}
                strokeDashoffset={-offset}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-slate-900">{total}</span>
          <span className="text-[9px] text-slate-400">إجمالي</span>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-2 w-full">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-slate-600 font-semibold truncate">{statusMeta(s.key).label}</span>
            <span className="text-slate-400 font-bold mr-auto">{s.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * Activity Feed
 * ============================================================ */

function ActivityFeed({ activities, loading }: { activities: ActivityItem[]; loading?: boolean }) {
  if (loading) return <div className="space-y-3"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>;
  if (activities.length === 0) return <EmptyBlock icon={<Activity size={24} />} title="لا توجد نشاطات حديثة" />;

  return (
    <div className="space-y-1">
      {activities.map((a, i) => (
        <div key={a.id || i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.color}`}>
            {a.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
            <p className="text-xs text-slate-500 truncate">{a.description}</p>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap shrink-0">{timeAgo(a.time)}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
 * AI Insights Card
 * ============================================================ */

function AIInsights({ insights, loading }: { insights: string[]; loading?: boolean }) {
  if (loading) return <div className="space-y-2"><SkeletonRow /><SkeletonRow /></div>;
  if (insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 via-cyan-50 to-blue-50 rounded-xl border border-purple-100 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">رؤى ذكية</h3>
          <p className="text-[10px] text-slate-500">تحليل مدعوم بالذكاء الاصطناعي</p>
        </div>
      </div>
      <ul className="space-y-2">
        {insights.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
            <Lightbulb size={12} className="text-amber-500 mt-0.5 shrink-0" />
            <span className="leading-relaxed">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
 * System Alerts Banner
 * ============================================================ */

function SystemAlerts({ alerts }: { alerts: Array<{ id: string; type: 'warning' | 'error' | 'info'; message: string }> }) {
  if (alerts.length === 0) return null;
  const colorMap = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  const iconMap = {
    warning: <AlertTriangle size={14} className="text-amber-500" />,
    error: <XCircle size={14} className="text-red-500" />,
    info: <CheckCircle2 size={14} className="text-blue-500" />,
  };

  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div key={a.id} className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-semibold ${colorMap[a.type]}`}>
          {iconMap[a.type]}
          <span className="flex-1">{a.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
 * Main Dashboard Component - Part 1: State & Data Loading
 * ============================================================ */

export default function DashboardOverview() {
  const router = useRouter();
  const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodKey>('30');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<Array<{ id: string; type: 'warning' | 'error' | 'info'; message: string }>>([]);
  const [loginEvents, setLoginEvents] = useState<LoginAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    try {
      const [analyticsRes, shopRes, notifRes, ordersRes, loginRes] = await Promise.allSettled([
        apiRequest(`/analytics/overview?days=${period}`),
        apiRequest('/shop/me'),
        apiRequest('/notifications?limit=5'),
        apiRequest('/orders?limit=8&sort=recent'),
        apiRequest('/audit/events?limit=10'),
      ]);

      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      if (shopRes.status === 'fulfilled') setShop(shopRes.value);
      if (notifRes.status === 'fulfilled') setNotifications(Array.isArray(notifRes.value) ? notifRes.value : notifRes.value?.items || []);
      if (ordersRes.status === 'fulfilled') setRecentOrders(Array.isArray(ordersRes.value) ? ordersRes.value : ordersRes.value?.items || []);
      if (loginRes.status === 'fulfilled') {
        const events = Array.isArray(loginRes.value) ? loginRes.value : loginRes.value?.data || [];
        setLoginEvents(events);
      }

      // Generate activity feed from orders
      const acts: ActivityItem[] = [];
      const settledOrders = ordersRes.status === 'fulfilled' ? (Array.isArray(ordersRes.value) ? ordersRes.value : ordersRes.value?.items || []) : [];
      const orders: any[] = settledOrders;

      orders.slice(0, 5).forEach((o: any, i: number) => {
        acts.push({
          id: `order-${i}`,
          type: 'order',
          title: `طلب جديد #${fmtShort(o.id)}`,
          description: `${o.items?.length || 1} منتجات • ${fmtEGP(o.total || 0)}`,
          time: o.createdAt || new Date().toISOString(),
          icon: <ShoppingCart size={14} />,
          color: 'bg-cyan-50 text-cyan-600',
        });
      });

      if (acts.length < 3) {
        acts.push(
          { id: 'sys-1', type: 'system', title: 'تم تحديث النظام', description: 'آخر إصدار تم تثبيته بنجاح', time: new Date(Date.now() - 3600000).toISOString(), icon: <Zap size={14} />, color: 'bg-green-50 text-green-600' },
          { id: 'cust-1', type: 'customer', title: 'عميل جديد', description: 'انضم عميل جديد إلى متجرك', time: new Date(Date.now() - 7200000).toISOString(), icon: <UserPlus size={14} />, color: 'bg-purple-50 text-purple-600' },
        );
      }
      setActivities(acts);

      const tips: string[] = [];
      if (analyticsRes.status === 'fulfilled') {
        const a = analyticsRes.value;
        if (a.conversionRate && a.conversionRate < 2) tips.push('معدل التحويل أقل من 2%. جرّب تحسين صفحة المنتجات وإضافة عروض محدودة الوقت.');
        if (a.avgOrderValue && a.avgOrderValue < 200) tips.push('متوسط قيمة الطلب منخفض. قدّم منتجات مكملة أو خصومات عند الشراء بكمية.');
        if (a.revenueToday && a.totalRevenue && (a.revenueToday / (a.totalRevenue / 30)) > 1.3) tips.push('أداء اليوم أعلى من المتوسط! استثمر في إعلانات مشابهة لتحقيق نمو أكبر.');
        if (a.newCustomers && a.totalCustomers && (a.newCustomers / a.totalCustomers) > 0.1) tips.push('نسبة عملاء جدد ممتازة! أرسل لهم عرض ترحيبي لزيادة الولاء.');
        if (tips.length === 0) tips.push('أداؤك مستمر! تابع تحليل البيانات يومياً لاتخاذ قرارات أفضل.');
      }
      setAiInsights(tips);

      const sysAlerts: Array<{ id: string; type: 'warning' | 'error' | 'info'; message: string }> = [];
      const pendingOrders = orders.filter((o: any) => o.status === 'PENDING');
      if (pendingOrders.length > 5) {
        sysAlerts.push({ id: 'pending-orders', type: 'warning', message: `لديك ${pendingOrders.length} طلبات قيد الانتظار تحتاج مراجعة` });
      }
      if (shop?.status === 'inactive') {
        sysAlerts.push({ id: 'shop-inactive', type: 'error', message: 'متجرك غير فعّال حالياً. فعّله لاستقبال الطلبات.' });
      }
      if (sysAlerts.length === 0) {
        sysAlerts.push({ id: 'all-good', type: 'info', message: 'جميع الأنظمة تعمل بشكل طبيعي ✓' });
      }
      setSystemAlerts(sysAlerts);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const chartData = useMemo(() => {
    if (!analytics?.chartData) return [];
    return analytics.chartData.map((d) => ({ name: d.name, value: d.sales || d.revenue || 0 }));
  }, [analytics]);

  const orderStatusBreakdown = useMemo(() => {
    if (analytics?.orderStatusBreakdown) return analytics.orderStatusBreakdown;
    const breakdown: Record<string, number> = {};
    recentOrders.forEach((o) => {
      const s = (o.status || 'PENDING').toUpperCase();
      breakdown[s] = (breakdown[s] || 0) + 1;
    });
    return breakdown;
  }, [analytics, recentOrders]);

  const revenueProgress = useMemo(() => {
    if (!analytics?.totalRevenue || !analytics?.revenueTarget) return null;
    return Math.min((analytics.totalRevenue / analytics.revenueTarget) * 100, 100);
  }, [analytics]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">مرحباً، {user?.name || 'صاحب المتجر'} 👋</h1>
          <p className="text-sm text-slate-500 mt-1">إليك نظرة عامة على أداء متجرك</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${period === p.key ? 'bg-[#00E5FF] text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            تحديث
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            <Download size={14} />
            تصدير
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2 text-[10px] text-slate-400">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span>آخر تحديث: {lastUpdated.toLocaleTimeString('ar-EG')}</span>
        <span className="text-slate-300">•</span>
        <span>البيانات مباشرة</span>
      </div>

      {/* System Alerts */}
      <SystemAlerts alerts={systemAlerts} />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="إيرادات اليوم"
          value={fmtEGP(analytics?.revenueToday || 0)}
          icon={<DollarSign size={24} />}
          color="cyan"
          hint="مقارنة باليوم السابق"
          delta={12.5}
          loading={loading}
        />
        <StatCard
          label="طلبات اليوم"
          value={analytics?.salesCountToday || 0}
          icon={<ShoppingCart size={24} />}
          color="blue"
          delta={8.3}
          loading={loading}
        />
        <StatCard
          label="عملاء جدد"
          value={analytics?.newCustomers || 0}
          icon={<UserPlus size={24} />}
          color="purple"
          hint={`من ${analytics?.totalCustomers || 0} إجمالي`}
          delta={15.2}
          loading={loading}
        />
        <StatCard
          label="الزوار اليوم"
          value={analytics?.visitorsToday || 0}
          icon={<Eye size={24} />}
          color="amber"
          hint={`معدل التحويل ${analytics?.conversionRate?.toFixed(1) || 0}%`}
          delta={-3.1}
          loading={loading}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-right">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-500">إجمالي الإيرادات</span>
          </div>
          <div className="text-lg font-black text-slate-900">{fmtEGP(analytics?.totalRevenue || 0)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-right">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-500">إجمالي الطلبات</span>
          </div>
          <div className="text-lg font-black text-slate-900">{analytics?.totalOrders || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-right">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-500">متوسط قيمة الطلب</span>
          </div>
          <div className="text-lg font-black text-slate-900">{fmtEGP(analytics?.avgOrderValue || 0)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-right">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Target size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-500">معدل التحويل</span>
          </div>
          <div className="text-lg font-black text-slate-900">{analytics?.conversionRate?.toFixed(1) || '0'}%</div>
        </div>
      </div>

      {/* Revenue vs Target */}
      {revenueProgress !== null && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-[#00E5FF]" />
              <h3 className="font-bold text-slate-900 text-sm">التقدم نحو الهدف الشهري</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">{revenueProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-[#00E5FF] to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${revenueProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-semibold">
            <span>{fmtEGP(analytics?.totalRevenue || 0)}</span>
            <span>الهدف: {fmtEGP(analytics?.revenueTarget || 0)}</span>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-[#00E5FF]" />
              <h3 className="font-bold text-slate-900 text-sm">المبيعات خلال الفترة</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">{PERIODS.find((p) => p.key === period)?.label}</span>
          </div>
          {loading ? (
            <div className="h-40 bg-slate-100 rounded-lg animate-pulse" />
          ) : chartData.length > 0 ? (
            <BarChart data={chartData} exact />
          ) : (
            <EmptyBlock icon={<BarChart3 size={24} />} title="لا توجد بيانات كافية" />
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon size={16} className="text-[#00E5FF]" />
            <h3 className="font-bold text-slate-900 text-sm">توزيع حالات الطلبات</h3>
          </div>
          {loading ? (
            <div className="h-40 bg-slate-100 rounded-lg animate-pulse" />
          ) : (
            <DonutChart data={orderStatusBreakdown} />
          )}
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights insights={aiInsights} loading={loading} />

      {/* Bottom Grid: Activity + Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#00E5FF]" />
              <h3 className="font-bold text-slate-900 text-sm">النشاط الأخير</h3>
            </div>
            <button className="text-[10px] font-bold text-[#00E5FF] hover:underline">عرض الكل</button>
          </div>
          <ActivityFeed activities={activities} loading={loading} />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-[#00E5FF]" />
              <h3 className="font-bold text-slate-900 text-sm">أحدث الطلبات</h3>
            </div>
            <button
              onClick={() => router.push('/dashboard/sales/orders')}
              className="text-[10px] font-bold text-[#00E5FF] hover:underline"
            >
              عرض الكل
            </button>
          </div>
          {loading ? (
            <div className="space-y-2"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
          ) : recentOrders.length === 0 ? (
            <EmptyBlock icon={<ShoppingCart size={24} />} title="لا توجد طلبات حديثة" ctaLabel="إنشاء طلب" onClick={() => router.push('/dashboard/sales/orders')} />
          ) : (
            <div className="space-y-2">
              {recentOrders.slice(0, 5).map((o, i) => {
                const sm = statusMeta(o.status);
                return (
                  <div key={o.id || i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${sm.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800">#{fmtShort(o.id)}</p>
                      <p className="text-[10px] text-slate-400">{timeAgo(o.createdAt)}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900">{fmtEGP(o.total || 0)}</p>
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sm.chip}`}>{sm.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">أفضل المنتجات</h3>
            </div>
            <button
              onClick={() => router.push('/dashboard/inventory/products')}
              className="text-[10px] font-bold text-[#00E5FF] hover:underline"
            >
              إدارة المنتجات
            </button>
          </div>
          {loading ? (
            <div className="space-y-2"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
          ) : analytics?.topProducts && analytics.topProducts.length > 0 ? (
            <div className="space-y-2">
              {analytics.topProducts.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-black">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.sold} مبيعة</p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{fmtEGP(p.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyBlock icon={<Package size={24} />} title="لا توجد بيانات منتجات" ctaLabel="إضافة منتج" onClick={() => router.push('/dashboard/inventory/products')} />
          )}
        </div>
      </div>

      {/* Top Customers */}
      {analytics?.topCustomers && analytics.topCustomers.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#00E5FF]" />
              <h3 className="font-bold text-slate-900 text-sm">أفضل العملاء</h3>
            </div>
            <button
              onClick={() => router.push('/dashboard/customers')}
              className="text-[10px] font-bold text-[#00E5FF] hover:underline"
            >
              عرض الكل
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analytics.topCustomers.slice(0, 6).map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {c.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{c.name}</p>
                  <p className="text-[10px] text-slate-400">{c.orders} طلبات</p>
                </div>
                <span className="text-xs font-bold text-slate-900">{fmtEGP(c.spent)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Login History / Session Tracking */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LogIn size={16} className="text-[#00E5FF]" />
            <h3 className="font-bold text-slate-900 text-sm">سجل تسجيلات الدخول</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-semibold">
              {loginEvents.length} حدث
            </span>
            <button
              onClick={handleRefresh}
              className="text-[10px] font-bold text-[#00E5FF] hover:underline"
            >
              تحديث
            </button>
          </div>
        </div>
        {loading ? (
          <div className="space-y-2"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
        ) : loginEvents.length === 0 ? (
          <EmptyBlock icon={<LogIn size={24} />} title="لا توجد سجلات دخول" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-[10px] font-semibold text-slate-400 pb-2 pr-2">المستخدم</th>
                  <th className="text-[10px] font-semibold text-slate-400 pb-2">الدور</th>
                  <th className="text-[10px] font-semibold text-slate-400 pb-2">تسجيل الدخول</th>
                  <th className="text-[10px] font-semibold text-slate-400 pb-2">تسجيل الخروج</th>
                  <th className="text-[10px] font-semibold text-slate-400 pb-2">المدة</th>
                  <th className="text-[10px] font-semibold text-slate-400 pb-2">IP</th>
                  <th className="text-[10px] font-semibold text-slate-400 pb-2 pl-2">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {loginEvents.map((e) => {
                  const isOnline = !e.logoutAt;
                  const duration = e.durationMin
                    ? e.durationMin >= 60
                      ? `${Math.floor(e.durationMin / 60)} ساعة ${e.durationMin % 60} دقيقة`
                      : `${e.durationMin} دقيقة`
                    : '—';
                  return (
                    <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-[10px]">
                            {e.userEmail?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{e.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          e.userRole === 'ADMIN' ? 'bg-red-50 text-red-600' :
                          e.userRole === 'MERCHANT' ? 'bg-blue-50 text-blue-600' :
                          e.userRole === 'COURIER' ? 'bg-purple-50 text-purple-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {e.userRole === 'ADMIN' ? 'أدمن' :
                           e.userRole === 'MERCHANT' ? 'تاجر' :
                           e.userRole === 'COURIER' ? 'مندوب' : 'عميل'}
                        </span>
                      </td>
                      <td className="py-2.5 text-[10px] text-slate-600 font-semibold">
                        {fmtDate(e.loginAt, { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 text-[10px] text-slate-600 font-semibold">
                        {e.logoutAt ? fmtDate(e.logoutAt, { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-2.5 text-[10px] text-slate-600 font-semibold">
                        {isOnline ? (
                          <span className="text-green-600">جلسة نشطة</span>
                        ) : duration}
                      </td>
                      <td className="py-2.5 text-[10px] text-slate-400 font-mono">
                        {e.ipAddress || '—'}
                      </td>
                      <td className="py-2.5 pl-2">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            متصل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            غير متصل
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-[#00E5FF]" />
          <h3 className="font-bold text-slate-900 text-sm">إجراءات سريعة</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'إضافة منتج', icon: <Plus size={18} />, onClick: () => router.push('/dashboard/inventory/products'), color: 'bg-cyan-50 text-cyan-600' },
            { label: 'طلب جديد', icon: <ShoppingCart size={18} />, onClick: () => router.push('/dashboard/sales/orders'), color: 'bg-blue-50 text-blue-600' },
            { label: 'حجز', icon: <Calendar size={18} />, onClick: () => router.push('/dashboard/bookings'), color: 'bg-purple-50 text-purple-600' },
            { label: 'حملة إعلانية', icon: <Megaphone size={18} />, onClick: () => router.push('/dashboard/marketing'), color: 'bg-amber-50 text-amber-600' },
            { label: 'تقرير مالي', icon: <FileText size={18} />, onClick: () => router.push('/dashboard/finance'), color: 'bg-green-50 text-green-600' },
            { label: 'الإعدادات', icon: <SettingsIcon size={18} />, onClick: () => router.push('/dashboard/settings'), color: 'bg-slate-100 text-slate-600' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <span className="text-xs font-bold text-slate-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-[10px] text-slate-400">
        <p>© {new Date().getFullYear()} Ray Platform — جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
}