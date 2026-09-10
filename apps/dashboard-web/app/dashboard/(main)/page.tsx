'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Eye, Users, DollarSign, Package, Star, RefreshCw, Download,
  TrendingUp, TrendingDown, Bell, Plus, Megaphone, Calendar, FileText,
  Settings as SettingsIcon, LogIn, Activity, AlertTriangle, Store, ChevronLeft,
} from 'lucide-react';
import { useAuth, apiRequest } from '@/lib/auth';

/* ============================================================
 * Types (matching backend responses)
 * ============================================================ */

type OverviewStat = { label: string; label_ar: string; value: string; change: string; up: boolean; icon: string; color: string };
type WeeklyPoint = { day: string; value: number };
type TopProduct = { name: string; sales: number; revenue: number };
type AnalyticsOverview = {
  shop_id: string;
  stats: OverviewStat[];
  weekly_data: WeeklyPoint[];
  top_products: TopProduct[];
};

type Shop = {
  id?: string;
  name?: string;
  status?: string;
  isActive?: boolean;
  followers?: number;
  visitors?: number;
  logoUrl?: string | null;
};

type Order = {
  id?: string;
  total?: number;
  status?: string;
  createdAt?: string;
  customerName?: string;
  customerPhone?: string;
  items?: Array<{ productName?: string; quantity?: number; price?: number }>;
};

type AppNotification = {
  id: string;
  title?: string;
  content?: string;
  type?: string;
  created_at?: string;
  createdAt?: string;
};

type LoginSession = {
  ID?: string;
  id?: string;
  UserEmail?: string;
  userEmail?: string;
  UserRole?: string;
  userRole?: string;
  LoginAt?: string;
  loginAt?: string;
  LogoutAt?: string | null;
  logoutAt?: string | null;
  DurationMin?: number | null;
  durationMin?: number | null;
  IPAddress?: string;
  ipAddress?: string;
};

/* ============================================================
 * Formatting helpers
 * ============================================================ */

const LOCALE = 'ar-EG-u-nu-latn';

const fmtEGP = (n: number) =>
  `${(Number.isFinite(n) ? n : 0).toLocaleString(LOCALE, { maximumFractionDigits: 0 })} ج.م`;

const fmtNum = (n: number) =>
  (Number.isFinite(n) ? n : 0).toLocaleString(LOCALE, { maximumFractionDigits: 0 });

const fmtShortId = (id?: string) => {
  const s = id || '';
  return s.length > 10 ? `#${s.slice(0, 8)}…` : `#${s}`;
};

const fmtDate = (iso?: string | null, opts: Intl.DateTimeFormatOptions = {}) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  try {
    return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', ...opts });
  } catch {
    return d.toLocaleDateString();
  }
};

const timeAgo = (iso?: string | null) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${fmtNum(m)} د`;
  if (m < 1440) return `منذ ${fmtNum(Math.floor(m / 60))} س`;
  return fmtDate(iso);
};

const fmtDayAr = (day: string) => {
  const map: Record<string, string> = { Sun: 'أحد', Mon: 'اثنين', Tue: 'ثلاثاء', Wed: 'أربعاء', Thu: 'خميس', Fri: 'جمعة', Sat: 'سبت' };
  return map[day] || day;
};

/* ============================================================
 * Order status metadata
 * ============================================================ */

const STATUS_META: Record<string, { label: string; chip: string; dot: string; color: string }> = {
  PENDING: { label: 'قيد الانتظار', chip: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', color: '#d97706' },
  CONFIRMED: { label: 'مؤكد', chip: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', color: '#2563eb' },
  PREPARING: { label: 'قيد التحضير', chip: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500', color: '#7c3aed' },
  READY: { label: 'جاهز', chip: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500', color: '#0d9488' },
  DELIVERED: { label: 'مكتمل', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', color: '#059669' },
  CANCELLED: { label: 'ملغي', chip: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', color: '#dc2626' },
  REFUNDED: { label: 'مسترجع', chip: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', color: '#64748b' },
};
const statusMeta = (s?: string) =>
  STATUS_META[String(s || '').toUpperCase()] || { label: s || 'أخرى', chip: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', color: '#94a3b8' };

/* ============================================================
 * Period definitions
 * ============================================================ */

type PeriodKey = '7' | '30' | '90' | '365';
const PERIODS: Array<{ key: PeriodKey; label: string; timeRange: string }> = [
  { key: '7', label: '7 أيام', timeRange: 'last_7_days' },
  { key: '30', label: '30 يوم', timeRange: 'last_30_days' },
  { key: '90', label: '90 يوم', timeRange: 'last_90_days' },
  { key: '365', label: 'السنة', timeRange: 'this_year' },
];

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

// Previous equal-length window, for computing real period-over-period deltas.
function previousWindow(key: PeriodKey): { start_date: string; end_date: string } {
  const now = new Date();
  if (key === '365') {
    const y = now.getFullYear() - 1;
    return { start_date: `${y}-01-01`, end_date: `${y}-12-31` };
  }
  const days = Number(key);
  const end = new Date(now); end.setDate(end.getDate() - days);
  const start = new Date(now); start.setDate(start.getDate() - days * 2);
  return { start_date: isoDate(start), end_date: isoDate(end) };
}

const pctDelta = (current: number, previous: number): number | null => {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return null;
  return ((current - previous) / previous) * 100;
};

/* ============================================================
 * Small UI primitives
 * ============================================================ */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-3 border-b border-slate-100">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {action}
    </div>
  );
}

function LinkBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 hover:underline inline-flex items-center gap-0.5">
      {label}
      <ChevronLeft size={12} />
    </button>
  );
}

function DeltaPill({ delta }: { delta: number | null }) {
  if (delta === null || !Number.isFinite(delta)) return null;
  const up = delta >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold rounded px-1.5 py-0.5 tabular-nums ${up ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(delta).toLocaleString(LOCALE, { maximumFractionDigits: 1 })}%
      <span className="font-medium text-slate-400">عن الفترة السابقة</span>
    </span>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-slate-100 rounded-md animate-pulse ${className}`} />;
}

function Empty({ icon, title, actionLabel, onAction }: {
  icon: React.ReactNode; title: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">{icon}</div>
      <p className="text-sm font-medium text-slate-400">{title}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="text-xs font-bold text-cyan-700 hover:underline">{actionLabel}</button>
      )}
    </div>
  );
}

/* ============================================================
 * Charts
 * ============================================================ */

function WeeklyBars({ data, loading }: { data: WeeklyPoint[]; loading?: boolean }) {
  if (loading) return <Skeleton className="h-48" />;
  const points = data || [];
  if (points.length === 0) return <Empty icon={<Activity size={20} />} title="لا توجد مبيعات مسجلة في آخر 7 أيام" />;
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <div className="px-5 pb-4">
      <div className="flex items-end gap-2 h-44 pt-6 border-b border-slate-200">
        {points.map((p, i) => (
          <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-1 group relative">
            <span className="absolute -top-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap tabular-nums">
              {fmtEGP(p.value)}
            </span>
            <div
              className={`w-full max-w-10 rounded-t transition-all ${p.value > 0 ? 'bg-cyan-600 group-hover:bg-cyan-500' : 'bg-slate-100'}`}
              style={{ height: `${Math.max((p.value / max) * 100, 2)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-1.5">
        {points.map((p, i) => (
          <span key={i} className="flex-1 text-center text-[10px] font-medium text-slate-400">{fmtDayAr(p.day)}</span>
        ))}
      </div>
    </div>
  );
}

function StatusDonut({ orders, loading }: { orders: Order[]; loading?: boolean }) {
  if (loading) return <div className="px-5 pb-5"><Skeleton className="h-40" /></div>;
  const counts: Record<string, number> = {};
  (orders || []).forEach((o) => {
    const s = String(o.status || 'PENDING').toUpperCase();
    counts[s] = (counts[s] || 0) + 1;
  });
  const entries = Object.entries(counts).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return <div className="px-5"><Empty icon={<Package size={20} />} title="لا توجد طلبات بعد" /></div>;

  let cumulative = 0;
  const slices = entries.map(([key, value]) => {
    const start = cumulative;
    cumulative += (value / total) * 100;
    return { key, value, pct: (value / total) * 100, start, color: statusMeta(key).color };
  });
  const r = 38, cx = 50, cy = 50, circ = 2 * Math.PI * r;

  return (
    <div className="px-5 pb-5 flex items-center gap-5">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="11" />
          {slices.map((s, i) => (
            <circle
              key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth="11"
              strokeDasharray={`${(s.pct / 100) * circ} ${circ - (s.pct / 100) * circ}`}
              strokeDashoffset={-(s.start / 100) * circ}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-900 tabular-nums">{fmtNum(total)}</span>
          <span className="text-[9px] text-slate-400">طلب</span>
        </div>
      </div>
      <div className="flex-1 space-y-1.5 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-slate-600 font-medium truncate">{statusMeta(s.key).label}</span>
            <span className="text-slate-400 font-semibold mr-auto tabular-nums">{fmtNum(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * Page
 * ============================================================ */

export default function DashboardOverview() {
  const router = useRouter();
  const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodKey>('30');
  const [shop, setShop] = useState<Shop | null>(null);
  const [current, setCurrent] = useState<AnalyticsOverview | null>(null);
  const [previous, setPrevious] = useState<AnalyticsOverview | null>(null);
  const [last7, setLast7] = useState<AnalyticsOverview | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (p: PeriodKey) => {
    setRefreshing(true);
    setError(null);
    try {
      // 1) Shop context first (needed to scope analytics calls).
      let shopData: Shop | null = null;
      try { shopData = await apiRequest('/shops/me'); } catch { /* keeps previous */ }
      setShop(shopData);
      const shopId = shopData?.id || user?.shopId;
      if (!shopId) throw new Error('لا يوجد متجر مرتبط بهذا الحساب');

      const periodDef = PERIODS.find((x) => x.key === p)!;
      const prev = previousWindow(p);

      // 2) Everything else in parallel, each failure isolated.
      const [curRes, prevRes, wRes, ordersRes, notifRes, sessRes] = await Promise.allSettled([
        apiRequest(`/analytics/shop/${shopId}/overview?time_range=${periodDef.timeRange}`),
        apiRequest(`/analytics/shop/${shopId}/overview?time_range=custom&start_date=${prev.start_date}&end_date=${prev.end_date}`),
        apiRequest(`/analytics/shop/${shopId}/overview?time_range=last_7_days`),
        apiRequest('/orders?page=1&limit=50'),
        apiRequest('/notifications/me?limit=5'),
        apiRequest('/audit/sessions/me?limit=8'),
      ]);

      if (curRes.status === 'fulfilled') setCurrent(curRes.value);
      if (prevRes.status === 'fulfilled') setPrevious(prevRes.value);
      if (wRes.status === 'fulfilled') setLast7(wRes.value);
      setOrders(ordersRes.status === 'fulfilled' ? (Array.isArray(ordersRes.value) ? ordersRes.value : ordersRes.value?.data || []) : []);
      setNotifications(notifRes.status === 'fulfilled' ? (Array.isArray(notifRes.value) ? notifRes.value : notifRes.value?.data || []) : []);
      setSessions(sessRes.status === 'fulfilled' ? (Array.isArray(sessRes.value) ? sessRes.value : sessRes.value?.data || []) : []);

      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل البيانات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.shopId]);

  useEffect(() => { load(period); }, [period, load]);

  // KPI values parsed from the real stats array + real deltas vs previous window.
  const statByLabel = useMemo(() => {
    const map: Record<string, number> = {};
    (current?.stats || []).forEach((s) => { map[s.label] = parseFloat(s.value) || 0; });
    return map;
  }, [current]);

  const prevByLabel = useMemo(() => {
    const map: Record<string, number> = {};
    (previous?.stats || []).forEach((s) => { map[s.label] = parseFloat(s.value) || 0; });
    return map;
  }, [previous]);

  const kpis = useMemo(() => ([
    { key: 'Revenue', label: 'إيرادات الفترة', value: fmtEGP(statByLabel.Revenue || 0), delta: pctDelta(statByLabel.Revenue || 0, prevByLabel.Revenue || 0), icon: <DollarSign size={18} /> },
    { key: 'Orders', label: 'الطلبات', value: fmtNum(statByLabel.Orders || 0), delta: pctDelta(statByLabel.Orders || 0, prevByLabel.Orders || 0), icon: <ShoppingCart size={18} /> },
    { key: 'Customers', label: 'عملاء اشتروا', value: fmtNum(statByLabel.Customers || 0), delta: pctDelta(statByLabel.Customers || 0, prevByLabel.Customers || 0), icon: <Users size={18} /> },
    { key: 'Views', label: 'زوار المتجر', value: fmtNum(statByLabel.Views || 0), delta: null, icon: <Eye size={18} /> },
  ]), [statByLabel, prevByLabel]);

  const pendingCount = useMemo(
    () => orders.filter((o) => String(o.status).toUpperCase() === 'PENDING').length,
    [orders],
  );

  const exportCsv = () => {
    const rows: string[] = [];
    rows.push('المؤشر,القيمة');
    kpis.forEach((k) => rows.push(`${k.label},"${k.value}"`));
    rows.push('');
    rows.push('اليوم,الإيرادات (آخر 7 أيام)');
    (last7?.weekly_data || []).forEach((w) => rows.push(`${fmtDayAr(w.day)},${w.value}`));
    rows.push('');
    rows.push('المنتج,الكمية المبيعة,الإيراد');
    (current?.top_products || []).forEach((p) => rows.push(`"${p.name}",${p.sales},${p.revenue.toFixed(2)}`));
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-overview-${isoDate(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isActive = shop ? ((shop.isActive ?? (String(shop.status || '').toLowerCase() === 'active'))) : true;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px] mx-auto">

      {/* ===== Header ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900">نظرة عامة</h1>
            {shop && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5">
                <Store size={12} />
                {shop.name}
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className={isActive ? 'text-emerald-700' : 'text-red-700'}>{isActive ? 'فعّال' : 'موقوف'}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lastUpdated ? `آخر تحديث ${lastUpdated.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })}` : 'جارٍ التحميل…'}
            {refreshing && ' — جارٍ التحديث…'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors tabular-nums ${period === p.key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => load(period)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            تحديث
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download size={13} />
            تصدير CSV
          </button>
        </div>
      </div>

      {/* ===== Real errors / alerts ===== */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-800">
          <AlertTriangle size={14} className="text-red-500 shrink-0" />
          {error}
        </div>
      )}
      {!error && shop && !isActive && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs font-semibold text-amber-800">
          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          متجرك موقوف حاليًا ولن يستقبل طلبات جديدة حتى تفعّله من الإعدادات.
        </div>
      )}
      {pendingCount > 0 && (
        <button
          type="button"
          onClick={() => router.push('/dashboard/sales')}
          className="w-full flex items-center gap-2 p-3 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-800 hover:bg-blue-100 transition-colors text-right"
        >
          <AlertTriangle size={14} className="text-blue-500 shrink-0" />
          <span className="flex-1">لديك {fmtNum(pendingCount)} طلبًا قيد الانتظار بحاجة إلى مراجعة وتأكيد.</span>
          <ChevronLeft size={14} className="text-blue-400" />
        </button>
      )}

      {/* ===== KPI cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.key} className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">{k.label}</span>
              <span className="text-slate-300">{k.icon}</span>
            </div>
            {loading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">{k.value}</div>
            )}
            <div className="mt-2 min-h-[22px]">
              {loading ? <Skeleton className="h-4 w-28" /> : <DeltaPill delta={k.delta} />}
            </div>
          </Card>
        ))}
      </div>

      {/* ===== Charts row ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="الإيرادات — آخر 7 أيام"
            action={<span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded px-2 py-0.5">يوميًا</span>}
          />
          <div className="pt-2">
            <WeeklyBars data={last7?.weekly_data || []} loading={loading} />
          </div>
        </Card>
        <Card>
          <CardHeader title="حالة الطلبات" action={<span className="text-[10px] font-semibold text-slate-400">آخر {fmtNum(orders.length)} طلب</span>} />
          <div className="pt-3">
            <StatusDonut orders={orders} loading={loading} />
          </div>
        </Card>
      </div>

      {/* ===== Orders + Notifications ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="أحدث الطلبات"
            action={<LinkBtn label="كل الطلبات" onClick={() => router.push('/dashboard/sales')} />}
          />
          {loading ? (
            <div className="p-5 space-y-2"><Skeleton className="h-9" /><Skeleton className="h-9" /><Skeleton className="h-9" /></div>
          ) : orders.length === 0 ? (
            <Empty
              icon={<ShoppingCart size={20} />}
              title="لا توجد طلبات بعد — أول طلب هيظهر هنا فورًا"
              actionLabel="إنشاء طلب من الكاشير"
              onAction={() => router.push('/dashboard/pos')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-[10px] font-semibold text-slate-400 pb-2 pr-5">الطلب</th>
                    <th className="text-[10px] font-semibold text-slate-400 pb-2">العميل</th>
                    <th className="text-[10px] font-semibold text-slate-400 pb-2">الحالة</th>
                    <th className="text-[10px] font-semibold text-slate-400 pb-2">التاريخ</th>
                    <th className="text-[10px] font-semibold text-slate-400 pb-2 pl-5 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((o, i) => {
                    const sm = statusMeta(o.status);
                    return (
                      <tr key={o.id || i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 pr-5 text-xs font-bold text-slate-800 tabular-nums">{fmtShortId(o.id)}</td>
                        <td className="py-2.5 text-xs text-slate-600">{o.customerName || o.customerPhone || '—'}</td>
                        <td className="py-2.5">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${sm.chip}`}>{sm.label}</span>
                        </td>
                        <td className="py-2.5 text-[11px] text-slate-400 whitespace-nowrap">{timeAgo(o.createdAt)}</td>
                        <td className="py-2.5 pl-5 text-xs font-bold text-slate-900 text-left tabular-nums">{fmtEGP(o.total || 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="الإشعارات"
            action={<LinkBtn label="الكل" onClick={() => router.push('/dashboard/notifications')} />}
          />
          {loading ? (
            <div className="p-5 space-y-2"><Skeleton className="h-9" /><Skeleton className="h-9" /><Skeleton className="h-9" /></div>
          ) : notifications.length === 0 ? (
            <Empty icon={<Bell size={20} />} title="لا توجد إشعارات" />
          ) : (
            <div className="px-3 py-2 divide-y divide-slate-50">
              {notifications.map((n) => (
                <div key={n.id} className="py-2.5 px-2 rounded-lg hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 leading-5">{n.title || 'إشعار'}</p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{timeAgo(n.created_at || n.createdAt)}</span>
                  </div>
                  {n.content && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-5">{n.content}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ===== Top products + Login sessions ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader
            title="الأكثر مبيعًا"
            action={<LinkBtn label="إدارة المنتجات" onClick={() => router.push('/dashboard/inventory')} />}
          />
          {loading ? (
            <div className="p-5 space-y-2"><Skeleton className="h-9" /><Skeleton className="h-9" /><Skeleton className="h-9" /></div>
          ) : (current?.top_products || []).length === 0 ? (
            <Empty
              icon={<Star size={20} />}
              title="لا توجد مبيعات منتجات بعد"
              actionLabel="إضافة منتج"
              onAction={() => router.push('/dashboard/inventory')}
            />
          ) : (
            <div className="px-5 py-3 space-y-1">
              {(current?.top_products || []).slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span className="w-6 h-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{p.name || 'منتج'}</p>
                    <p className="text-[10px] text-slate-400 tabular-nums">{fmtNum(p.sales)} مبيعة</p>
                  </div>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">{fmtEGP(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="آخر جلسات الدخول" action={<span className="text-[10px] font-semibold text-slate-400">{fmtNum(sessions.length)} جلسة</span>} />
          {loading ? (
            <div className="p-5 space-y-2"><Skeleton className="h-9" /><Skeleton className="h-9" /><Skeleton className="h-9" /></div>
          ) : sessions.length === 0 ? (
            <Empty icon={<LogIn size={20} />} title="لا توجد سجلات دخول" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-[10px] font-semibold text-slate-400 pb-2 pr-5">المستخدم</th>
                    <th className="text-[10px] font-semibold text-slate-400 pb-2">الدخول</th>
                    <th className="text-[10px] font-semibold text-slate-400 pb-2 pl-5">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 5).map((e, i) => {
                    const email = e.UserEmail || e.userEmail || '—';
                    const loginAt = e.LoginAt || e.loginAt;
                    const logoutAt = e.LogoutAt || e.logoutAt;
                    const online = !logoutAt;
                    return (
                      <tr key={e.ID || e.id || i} className="border-b border-slate-50 last:border-0">
                        <td className="py-2.5 pr-5">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">{email}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-[11px] text-slate-400 whitespace-nowrap">{fmtDate(loginAt, { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-2.5 pl-5">
                          {online ? (
                            <span className="text-[10px] font-bold text-emerald-600">متصل الآن</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">{fmtDate(logoutAt, { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ===== Quick actions ===== */}
      <Card className="p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { label: 'منتج جديد', icon: <Plus size={17} />, href: '/dashboard/inventory' },
            { label: 'طلب جديد', icon: <ShoppingCart size={17} />, href: '/dashboard/sales' },
            { label: 'الكاشير', icon: <FileText size={17} />, href: '/dashboard/pos' },
            { label: 'حجز جديد', icon: <Calendar size={17} />, href: '/dashboard/bookings' },
            { label: 'حملة إعلانية', icon: <Megaphone size={17} />, href: '/dashboard/marketing' },
            { label: 'الإعدادات', icon: <SettingsIcon size={17} />, href: '/dashboard/settings' },
          ].map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => router.push(a.href)}
              className="flex flex-col items-center gap-2 py-4 px-2 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-500">{a.icon}</span>
              <span className="text-[11px] font-semibold text-slate-600">{a.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
