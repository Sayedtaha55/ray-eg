'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AreaChart as RAreaChart, Area as RArea, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  ShoppingCart, Eye, Users, DollarSign, Package, Star, RefreshCw, Download,
  TrendingUp, TrendingDown, Bell, Plus, Megaphone, Calendar, Store,
  Settings as SettingsIcon, LogIn, AlertTriangle, ChevronLeft, Wallet, Boxes, BarChart3,
  History, PieChart as PieIcon, ArrowRight,
} from 'lucide-react';
import { useAuth, apiRequest } from '@/lib/auth';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { palette, chartColors, shadows, iconTint, cardClass } from '@/lib/ui/tokens';

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
type SalesReport = {
  shop_id: string;
  stats: Array<{ label: string; label_ar: string; value: string; change: string; up: boolean }>;
  trend: Array<{ date: string; revenue: number; orders: number }>;
};
type Shop = {
  id?: string; name?: string; slug?: string; status?: string; isActive?: boolean;
  category?: string; governorate?: string; city?: string;
  followers?: number; visitors?: number; rating?: number; logoUrl?: string | null;
};
type Order = {
  id?: string; total?: number; status?: string; createdAt?: string;
  customerName?: string; customerPhone?: string;
};
type AppNotification = {
  id: string; title?: string; content?: string; type?: string;
  created_at?: string; createdAt?: string;
};
type LoginSession = {
  ID?: string; id?: string; UserEmail?: string; userEmail?: string;
  LoginAt?: string; loginAt?: string; LogoutAt?: string | null; logoutAt?: string | null;
};

/* ============================================================
 * Helpers
 * ============================================================ */

const LOCALE = 'ar-EG-u-nu-latn';

// اختصارات افتراضية تظهر لما مفيش تاريخ زيارات لسه
const DEFAULT_SHORTCUTS: { href: string; labelAr: string }[] = [
  { href: '/dashboard/sales', labelAr: 'كل الطلبات' },
  { href: '/dashboard/inventory', labelAr: 'المنتجات' },
  { href: '/dashboard/notifications', labelAr: 'الإشعارات' },
  { href: '/dashboard/pos', labelAr: 'الكاشير' },
  { href: '/dashboard/analytics', labelAr: 'التحليلات' },
  { href: '/dashboard/marketing', labelAr: 'التسويق' },
];

const fmtEGP = (n: number) => `${(Number.isFinite(n) ? n : 0).toLocaleString(LOCALE, { maximumFractionDigits: 0 })} ج.م`;
const fmtNum = (n: number) => (Number.isFinite(n) ? n : 0).toLocaleString(LOCALE, { maximumFractionDigits: 0 });
const fmtCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString(LOCALE, { maximumFractionDigits: 1 })}م`;
  if (n >= 1_000) return `${(n / 1_000).toLocaleString(LOCALE, { maximumFractionDigits: 1 })}ألف`;
  return fmtNum(n);
};
const fmtShortId = (id?: string) => {
  const s = id || '';
  return s.length > 10 ? `#${s.slice(0, 8)}…` : `#${s}`;
};
const fmtDate = (iso?: string | null, opts: Intl.DateTimeFormatOptions = {}) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  try { return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', ...opts }); } catch { return d.toLocaleDateString(); }
};
const timeAgo = (iso?: string | null) => {
  if (!iso) return '—';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${fmtNum(m)} د`;
  if (m < 1440) return `منذ ${fmtNum(Math.floor(m / 60))} س`;
  return fmtDate(iso);
};
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'نهار سعيد';
  return 'مساء الخير';
};
const todayLong = () => {
  try { return new Date().toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
};

const STATUS_META: Record<string, { label: string; chip: string; color: string }> = {
  PENDING: { label: 'قيد الانتظار', chip: 'bg-amber-50 text-amber-700 border-amber-200', color: '#d97706' },
  CONFIRMED: { label: 'مؤكد', chip: 'bg-blue-50 text-blue-700 border-blue-200', color: '#2563eb' },
  PREPARING: { label: 'قيد التحضير', chip: 'bg-violet-50 text-violet-700 border-violet-200', color: '#7c3aed' },
  READY: { label: 'جاهز', chip: 'bg-teal-50 text-teal-700 border-teal-200', color: '#0d9488' },
  DELIVERED: { label: 'مكتمل', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', color: '#059669' },
  CANCELLED: { label: 'ملغي', chip: 'bg-red-50 text-red-700 border-red-200', color: '#dc2626' },
  REFUNDED: { label: 'مسترجع', chip: 'bg-slate-100 text-slate-600 border-slate-200', color: '#64748b' },
};
const statusMeta = (s?: string) =>
  STATUS_META[String(s || '').toUpperCase()] || { label: s || 'أخرى', chip: 'bg-slate-100 text-slate-600 border-slate-200', color: '#94a3b8' };

type PeriodKey = '7' | '30' | '90' | '365';
const PERIODS: Array<{ key: PeriodKey; label: string; timeRange: string }> = [
  { key: '7', label: '7 أيام', timeRange: 'last_7_days' },
  { key: '30', label: '30 يوم', timeRange: 'last_30_days' },
  { key: '90', label: '90 يوم', timeRange: 'last_90_days' },
  { key: '365', label: 'السنة', timeRange: 'this_year' },
];
const isoDate = (d: Date) => d.toISOString().slice(0, 10);
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
const pctDelta = (cur: number, prev: number): number | null => {
  if (!Number.isFinite(cur) || !Number.isFinite(prev) || prev <= 0) return null;
  return ((cur - prev) / prev) * 100;
};

/* ============================================================
 * Tiny sparkline (SVG polyline)
 * ============================================================ */

const AXIS_STYLE = { fontSize: 10, fill: chartColors.axis, fontWeight: 600 };

function TrendTooltip({ active, payload, label, format }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-slate-900 text-white px-2.5 py-1.5 shadow-lg text-[11px] font-bold whitespace-nowrap">
      <span className="text-slate-400 font-semibold">{label} — </span>{format(payload[0].value)}
    </div>
  );
}

/** سباركلاين مصغّر لكروت المؤشرات (Recharts Area) */
function Sparkline({ values, color = chartColors.revenue }: { values: number[]; color?: string }) {
  const data = (values || []).map((v, i) => ({ i, v }));
  if (data.length < 2) return null;
  const gid = `spark-${color.replace('#', '')}`;
  return (
    <div className="w-16 h-7" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <RAreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <RArea type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${gid})`} />
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** دونات توزيع حالات الطلبات — من بيانات الطلبات الحقيقية */
function StatusDonut({ data, total }: {
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
}) {
  const shown = data.length > 0 ? data : [{ name: 'لا طلبات', value: 1, color: '#F1F5F9' }];
  return (
    <div className="relative h-[170px]" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={shown} dataKey="value" innerRadius={56} outerRadius={80} paddingAngle={data.length > 1 ? 2 : 0} strokeWidth={0} animationDuration={450}>
            {shown.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <RTooltip content={({ active, payload }: any) => {
            if (!active || !payload?.length || data.length === 0) return null;
            const p = payload[0].payload;
            return (
              <div className="rounded-lg bg-slate-900 text-white px-2.5 py-1.5 shadow-lg text-[11px] font-bold whitespace-nowrap">
                {p.name}: {fmtNum(p.value)} ({total > 0 ? Math.round((p.value / total) * 100) : 0}%)
              </div>
            );
          }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" dir="rtl">
        <span className="text-xl font-extrabold text-slate-900 tabular-nums leading-6">{fmtNum(total)}</span>
        <span className="text-[10px] font-semibold text-slate-400">طلب</span>
      </div>
    </div>
  );
}

/* ============================================================
 * Big area chart (hand-rolled SVG, smooth curve + gradient)
 * ============================================================ */

/** الرسم الرئيسي — أداء المتجر (منحنى ناعم + gradient + tooltip) */
function PerformanceAreaChart({ data, color, formatY, formatTip }: {
  data: Array<{ x: string; y: number }>;
  color: string;
  formatY: (n: number) => string;
  formatTip: (n: number) => string;
}) {
  if (!data || data.length < 2) {
    return (
      <div className="h-[260px] flex flex-col items-center justify-center gap-2.5">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300"><BarChart3 size={24} /></div>
        <p className="text-sm font-bold text-slate-500">لا توجد مبيعات في هذه الفترة بعد</p>
        <p className="text-[11px] font-medium text-slate-400">أول عملية بيع سترسم المنحنى هنا تلقائيًا.</p>
      </div>
    );
  }
  return (
    <div className="h-[260px] w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <RAreaChart data={data} margin={{ top: 10, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartColors.grid} vertical={false} />
          <XAxis dataKey="x" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} reversed />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={formatY} width={46} orientation="right" />
          <RTooltip content={<TrendTooltip format={formatTip} />} cursor={{ stroke: chartColors.cursor }} />
          <RArea
            type="monotone" dataKey="y" stroke={color} strokeWidth={2.5} fill="url(#perfFill)"
            activeDot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: color }}
            animationDuration={450}
          />
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ============================================================
 * UI primitives — نظام موحد للكروت والحالات
 * ============================================================ */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${cardClass} ${className}`}>{children}</div>;
}

/** كارت بحركة ظهور ناعمة + رفع خفيف عند الـ hover */
function MotionCard({ children, className = '', delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, boxShadow: shadows.lift }}
      className={`${cardClass} transition-shadow duration-200 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-slate-100 rounded-md animate-pulse ${className}`} />;
}

function SectionHead({ title, sub, icon, actionLabel, onAction }: {
  title: string; sub?: string; icon?: React.ReactNode;
  actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <span className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">{icon}</span>}
        <div className="min-w-0">
          <h3 className="text-[14px] font-extrabold text-slate-900 leading-5">{title}</h3>
          {sub && <p className="text-[11px] font-medium text-slate-400 leading-4 truncate">{sub}</p>}
        </div>
      </div>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-0.5 shrink-0">
          {actionLabel} <ChevronLeft size={12} />
        </button>
      )}
    </div>
  );
}

function Empty({ icon, title, desc, actionLabel, onAction, secondaryLabel, onSecondary }: {
  icon: React.ReactNode; title: string; desc?: string;
  actionLabel?: string; onAction?: () => void;
  secondaryLabel?: string; onSecondary?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400">{icon}</div>
      <p className="text-sm font-bold text-slate-700">{title}</p>
      {desc && <p className="text-[11px] font-medium text-slate-400 leading-5 max-w-[280px]">{desc}</p>}
      <div className="flex items-center gap-2 mt-1.5">
        {actionLabel && onAction && (
          <button type="button" onClick={onAction} className="h-8 px-3.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors">
            {actionLabel}
          </button>
        )}
        {secondaryLabel && onSecondary && (
          <button type="button" onClick={onSecondary} className="h-8 px-3.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-bold hover:bg-slate-50 transition-colors">
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function DeltaInline({ delta }: { delta: number | null }) {
  if (delta === null || !Number.isFinite(delta)) return <span className="text-[10px] font-semibold text-slate-300">—</span>;
  const up = delta >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold tabular-nums rounded-full px-1.5 py-0.5 ${up ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {Math.abs(delta).toLocaleString(LOCALE, { maximumFractionDigits: 1 })}%
    </span>
  );
}

/* ============================================================
 * Page
 * ============================================================ */

type Metric = 'revenue' | 'orders';

export default function DashboardOverview() {
  const router = useRouter();
  const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodKey>('30');
  const [metric, setMetric] = useState<Metric>('revenue');
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [current, setCurrent] = useState<AnalyticsOverview | null>(null);
  const [previous, setPrevious] = useState<AnalyticsOverview | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // آخر ما اطّلع عليه — زيارات حقيقية متتبّعة من الـ layout
  const visited = useRecentlyViewed();
  const recentItems = showAllRecent ? visited : visited.slice(0, 6);

  const load = useCallback(async (p: PeriodKey) => {
    setRefreshing(true);
    setError(null);
    try {
      let shopData: Shop | null = null;
      try { shopData = await apiRequest('/shops/me'); } catch { /* keep null */ }
      setShop(shopData);
      const shopId = shopData?.id || user?.shopId;
      if (!shopId) throw new Error('لا يوجد متجر مرتبط بهذا الحساب');

      const periodDef = PERIODS.find((x) => x.key === p)!;
      const prev = previousWindow(p);

      const [curRes, prevRes, salesRes, ordersRes, notifUserRes, notifShopRes, sessRes] = await Promise.allSettled([
        apiRequest(`/analytics/shop/${shopId}/overview?time_range=${periodDef.timeRange}`),
        apiRequest(`/analytics/shop/${shopId}/overview?time_range=custom&start_date=${prev.start_date}&end_date=${prev.end_date}`),
        apiRequest(`/analytics/shop/${shopId}/sales-report?time_range=last_30_days`),
        apiRequest('/orders?page=1&limit=50'),
        apiRequest('/notifications/me?limit=5'),
        apiRequest(`/notifications/shop/${shopId}?limit=5`),
        apiRequest('/audit/sessions/me?limit=8'),
      ]);

      if (curRes.status === 'fulfilled') setCurrent(curRes.value);
      if (prevRes.status === 'fulfilled') setPrevious(prevRes.value);
      if (salesRes.status === 'fulfilled') setSalesReport(salesRes.value);
      setOrders(ordersRes.status === 'fulfilled' ? (Array.isArray(ordersRes.value) ? ordersRes.value : ordersRes.value?.data || []) : []);
      {
        // merge user + shop channel notifications, newest first
        const pick = (v: any) => (Array.isArray(v) ? v : v?.data || []);
        const merged: AppNotification[] = [];
        const seen = new Set<string>();
        for (const res of [notifUserRes, notifShopRes]) {
          if (res.status !== 'fulfilled') continue;
          for (const n of pick(res.value)) {
            if (!n?.id || seen.has(n.id)) continue;
            seen.add(n.id);
            merged.push(n);
          }
        }
        merged.sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime());
        setNotifications(merged);
      }
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

  const trend = useMemo(() => salesReport?.trend || [], [salesReport]);
  const trendPoints = useMemo(() => {
    if (period === '7') return trend.slice(-7);
    return trend; // 30-day daily trend; 90/365 not available daily from backend
  }, [trend, period]);

  const kpis = useMemo(() => ([
    {
      key: 'Revenue', label: 'الإيرادات', value: fmtEGP(statByLabel.Revenue || 0),
      delta: pctDelta(statByLabel.Revenue || 0, prevByLabel.Revenue || 0),
      spark: trend.map((t) => t.revenue), icon: <DollarSign size={14} />,
    },
    {
      key: 'Orders', label: 'الطلبات', value: fmtNum(statByLabel.Orders || 0),
      delta: pctDelta(statByLabel.Orders || 0, prevByLabel.Orders || 0),
      spark: trend.map((t) => t.orders), icon: <ShoppingCart size={14} />,
    },
    {
      key: 'Customers', label: 'عملاء اشتروا', value: fmtNum(statByLabel.Customers || 0),
      delta: pctDelta(statByLabel.Customers || 0, prevByLabel.Customers || 0),
      spark: [] as number[], icon: <Users size={14} />,
    },
    {
      key: 'Views', label: 'زوار المتجر', value: fmtNum(statByLabel.Views || 0),
      delta: null, spark: [] as number[], icon: <Eye size={14} />,
    },
  ]), [statByLabel, prevByLabel, trend]);

  const pendingCount = useMemo(
    () => orders.filter((o) => String(o.status).toUpperCase() === 'PENDING').length,
    [orders],
  );

  const exportCsv = () => {
    const rows: string[] = [];
    rows.push('المؤشر,القيمة');
    kpis.forEach((k) => rows.push(`${k.label},"${k.value}"`));
    rows.push('');
    rows.push('التاريخ,الإيرادات,الطلبات');
    trend.forEach((t) => rows.push(`${t.date},${t.revenue},${t.orders}`));
    rows.push('');
    rows.push('المنتج,الكمية,الإيراد');
    (current?.top_products || []).forEach((p) => rows.push(`"${p.name}",${p.sales},${p.revenue.toFixed(2)}`));
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${isoDate(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isActive = shop ? ((shop.isActive ?? (String(shop.status || '').toLowerCase() === 'active'))) : true;
  const chartData = useMemo(() => trendPoints.map((t) => ({
    x: fmtDate(t.date),
    y: metric === 'revenue' ? t.revenue : t.orders,
  })), [trendPoints, metric]);
  const trendTotal = useMemo(
    () => trendPoints.reduce((s, t) => s + (metric === 'revenue' ? t.revenue : t.orders), 0),
    [trendPoints, metric],
  );

  // توزيع حالات الطلبات — من بيانات الطلبات الحقيقية
  const statusDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((o) => {
      const s = String(o.status || '').toUpperCase();
      counts.set(s, (counts.get(s) || 0) + 1);
    });
    const known = ['DELIVERED', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'CANCELLED', 'REFUNDED'];
    const out: { name: string; value: number; color: string }[] = [];
    known.forEach((k) => {
      const v = counts.get(k);
      if (v) out.push({ name: statusMeta(k).label, value: v, color: statusMeta(k).color });
    });
    counts.forEach((v, k) => {
      if (!known.includes(k)) out.push({ name: statusMeta(k).label, value: v, color: '#94A3B8' });
    });
    return out;
  }, [orders]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px] mx-auto">

      {/* ===== Header — هوية الصفحة ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {greeting()}، {user?.name || shop?.name || 'صاحب المتجر'}.
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            إليك ما يحدث في متجرك — {todayLong()}
            {lastUpdated && <span className="text-slate-300"> • آخر تحديث {lastUpdated.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })}</span>}
            {refreshing && <span className="text-indigo-600 font-bold"> • جارٍ التحديث…</span>}
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
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
            title="تحديث"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Download size={13} />
            تصدير
          </button>
        </div>
      </div>
      {/* ===== آخر ما اطّلع عليه (Recent shortcuts) ===== */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History size={15} className="text-slate-500" />
            <h2 className="text-sm font-bold text-slate-800">آخر ما اطّلع عليه</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowAllRecent((v) => !v)}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
          >
            {showAllRecent ? 'إخفاء' : 'استعراض الكل'}
          </button>
        </div>
        <div className="px-5 py-3 flex flex-wrap items-center">
          {(recentItems.length === 0 ? DEFAULT_SHORTCUTS : recentItems).map((it, idx, arr) => (
            <Link
              key={it.href}
              href={it.href}
              className={`group flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors rounded-lg ${idx !== arr.length - 1 ? 'border-l border-slate-100' : ''}`}
            >
              <Star size={13} className="text-slate-300 group-hover:text-amber-400 transition-colors shrink-0" />
              <span className="truncate">{it.labelAr}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* ===== Alerts ===== */}
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

      {/* ===== KPIs — المؤشرات الرئيسية ===== */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <MotionCard key={k.key} delay={0.05 + i * 0.04} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconTint[['primary', 'violet', 'info', 'success'][i] || 'neutral']}`}>
                {k.icon}
              </span>
              <DeltaInline delta={k.delta} />
            </div>
            <p className="mt-3 text-[11px] font-semibold text-slate-400">{k.label}</p>
            {loading ? (
              <Skeleton className="h-7 w-24 mt-1" />
            ) : (
              <div className="flex items-end justify-between gap-2 mt-0.5">
                <span className="text-[22px] font-extrabold text-slate-900 tabular-nums leading-7">{k.value}</span>
                <Sparkline values={k.spark} color={['#4F46E5', '#7C3AED', '#2563EB', '#059669'][i]} />
              </div>
            )}
          </MotionCard>
        ))}
      </div>

      {/* ===== Main grid: الأداء + الجانب ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* --- كارت الأداء الرئيسي (أعلى وزن بصري) --- */}
        <MotionCard className="xl:col-span-2 p-0" delay={0.15}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-4 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><BarChart3 size={15} /></span>
              <div>
                <h3 className="text-[14px] font-extrabold text-slate-900 leading-5">أداء المتجر</h3>
                <p className="text-[11px] font-medium text-slate-400 leading-4">آخر {fmtNum(trendPoints.length)} يوم</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                {([
                  { key: 'revenue', label: 'الإيرادات' },
                  { key: 'orders', label: 'الطلبات' },
                ] as { key: Metric; label: string }[]).map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMetric(m.key)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${metric === m.key ? 'bg-white text-slate-900 border border-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
                {metric === 'revenue' ? fmtEGP(trendTotal) : fmtNum(trendTotal)}
              </span>
            </div>
          </div>

          <div className="px-3 pb-3 pt-1">
            {loading ? <Skeleton className="h-64 m-2" /> : (
              <PerformanceAreaChart
                data={chartData}
                color={metric === 'revenue' ? chartColors.revenue : chartColors.orders}
                formatY={fmtCompact}
                formatTip={(n) => (metric === 'revenue' ? fmtEGP(n) : `${fmtNum(n)} طلب`)}
              />
            )}
          </div>
        </MotionCard>

        {/* --- Right column --- */}
        <div className="space-y-4">
          {/* Shop card */}
          <MotionCard className="p-5" delay={0.2}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                  {shop?.logoUrl
                    ? // eslint-disable-next-line @next/next/no-img-element
                    <img src={shop.logoUrl} alt={shop?.name || ''} className="w-full h-full object-cover" />
                    : (shop?.name || 'م')?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{shop?.name || '—'}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {[shop?.category, shop?.city && shop?.governorate].filter(Boolean).join(' • ') || 'متجر على منصة نمّي'}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 border shrink-0 ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {isActive ? 'فعّال' : 'موقوف'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                  <Star size={12} fill="currentColor" />
                  <span className="text-sm font-bold text-slate-900 tabular-nums">{(shop?.rating || 0).toFixed(1)}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">التقييم</span>
              </div>
              <div className="text-center border-x border-slate-100">
                <span className="text-sm font-bold text-slate-900 tabular-nums">{fmtNum(shop?.followers || 0)}</span>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">متابع</div>
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-slate-900 tabular-nums">{fmtNum(shop?.visitors || 0)}</span>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">زيارة</div>
              </div>
            </div>
          </MotionCard>

          {/* Quick actions — list style */}
          <MotionCard className="p-2" delay={0.25}>
            {[
              { label: 'إضافة منتج جديد', desc: 'وسّع كتالوج متجرك', icon: <Plus size={16} />, href: '/dashboard/inventory' },
              { label: 'طلب جديد', desc: 'سجّل بيع من الكاشير', icon: <ShoppingCart size={16} />, href: '/dashboard/pos' },
              { label: 'حجز جديد', desc: 'احجز موعدًا لعميل', icon: <Calendar size={16} />, href: '/dashboard/bookings' },
              { label: 'حملة إعلانية', desc: 'أطلق عرضًا لعملائك', icon: <Megaphone size={16} />, href: '/dashboard/marketing' },
              { label: 'تقرير مالي', desc: 'راجع أرباحك ومصروفاتك', icon: <Wallet size={16} />, href: '/dashboard/finance' },
              { label: 'إعدادات المتجر', desc: 'بيانات المتجر والрؤية', icon: <SettingsIcon size={16} />, href: '/dashboard/settings' },
            ].map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => router.push(a.href)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-right"
              >
                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  {a.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-slate-800">{a.label}</span>
                  <span className="block text-[10px] text-slate-400">{a.desc}</span>
                </span>
                <ChevronLeft size={14} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </MotionCard>
        </div>
      </div>

      {/* ===== Orders + Notifications ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <MotionCard className="xl:col-span-2 p-0" delay={0.2}>
          <SectionHead
            title="أحدث الطلبات"
            icon={<ShoppingCart size={14} />}
            actionLabel="كل الطلبات"
            onAction={() => router.push('/dashboard/sales')}
          />
          {loading ? (
            <div className="p-5 space-y-2"><Skeleton className="h-9" /><Skeleton className="h-9" /><Skeleton className="h-9" /></div>
          ) : orders.length === 0 ? (
            <Empty
              icon={<ShoppingCart size={20} />}
              title="لا توجد طلبات بعد"
              desc="ابدأ بإضافة منتجاتك ومشاركة رابط متجرك مع عملائك — أول طلب هيظهر هنا فورًا."
              actionLabel="إنشاء طلب من الكاشير"
              onAction={() => router.push('/dashboard/pos')}
              secondaryLabel="إضافة منتج"
              onSecondary={() => router.push('/dashboard/inventory')}
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
        </MotionCard>

        <div className="space-y-4">
        <MotionCard className="p-0" delay={0.25}>
          <SectionHead
            title="آخر الإشعارات"
            icon={<Bell size={14} />}
            actionLabel="الكل"
            onAction={() => router.push('/dashboard/notifications')}
          />
          {loading ? (
            <div className="p-5 space-y-2"><Skeleton className="h-9" /><Skeleton className="h-9" /><Skeleton className="h-9" /></div>
          ) : notifications.length === 0 ? (
            <Empty icon={<Bell size={20} />} title="لا توجد إشعارات" />
          ) : (
            <div className="px-3 py-2 divide-y divide-slate-50">
              {notifications.slice(0, 5).map((n) => (
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
          </MotionCard>

          <MotionCard className="p-0" delay={0.3}>
            <SectionHead
              title="آخر جلسات الدخول"
              icon={<LogIn size={14} />}
              sub={`${fmtNum(sessions.length)} جلسة`}
            />
            {loading ? (
              <div className="p-5 space-y-2"><Skeleton className="h-9" /><Skeleton className="h-9" /><Skeleton className="h-9" /></div>
            ) : sessions.length === 0 ? (
              <Empty icon={<LogIn size={20} />} title="لا توجد سجلات دخول" desc="سجلات الدخول لحسابك تظهر هنا لأمانك." />
            ) : (
              <div className="px-5 py-3 divide-y divide-slate-50">
                {sessions.slice(0, 5).map((e, i) => {
                  const email = e.UserEmail || e.userEmail || '—';
                  const loginAt = e.LoginAt || e.loginAt;
                  const logoutAt = e.LogoutAt || e.logoutAt;
                  const online = !logoutAt;
                  return (
                    <div key={e.ID || e.id || i} className="flex items-center gap-2.5 py-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-semibold text-slate-700 truncate">{email}</span>
                        <span className="block text-[10px] text-slate-400">{fmtDate(loginAt, { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      {online ? (
                        <span className="text-[10px] font-bold text-emerald-600 shrink-0">متصل الآن</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 shrink-0">{fmtDate(logoutAt, { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </MotionCard>
        </div>
      </div>

      {/* ===== توزيع الطلبات + الأكثر مبيعًا ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <MotionCard className="p-0" delay={0.3}>
          <SectionHead title="توزيع الطلبات" icon={<PieIcon size={14} />} sub="حسب الحالة" />
          {loading ? (
            <div className="p-5"><Skeleton className="h-40" /></div>
          ) : (
            <>
              <div className="px-4 pt-3">
                <StatusDonut data={statusDistribution} total={orders.length} />
              </div>
              {statusDistribution.length === 0 && (
                <p className="text-[11px] font-medium text-slate-400 text-center pb-4 -mt-1">بمجرد وصول أول طلب هتتوزع حالاته هنا تلقائيًا.</p>
              )}
              {statusDistribution.length > 0 && (
                <div className="px-5 pb-4 pt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {statusDistribution.slice(0, 6).map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="truncate">{d.name}</span>
                      <span className="ml-auto font-extrabold text-slate-800 tabular-nums">{fmtNum(d.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </MotionCard>

        <MotionCard className="xl:col-span-2 p-0" delay={0.35}>
          <SectionHead
            title="الأكثر مبيعًا"
            icon={<Boxes size={14} />}
            actionLabel="إدارة المنتجات"
            onAction={() => router.push('/dashboard/inventory')}
          />
          {loading ? (
            <div className="p-5 space-y-2"><Skeleton className="h-9" /><Skeleton className="h-9" /><Skeleton className="h-9" /></div>
          ) : (current?.top_products || []).length === 0 ? (
            <Empty
              icon={<Boxes size={20} />}
              title="لا توجد مبيعات منتجات بعد"
              desc="أضف منتجاتك الأولى وشاركها مع عملائك — أكثر المنتجات مبيعًا ستظهر هنا."
              actionLabel="إضافة منتج"
              onAction={() => router.push('/dashboard/inventory')}
            />
          ) : (
            <div className="px-5 py-3 space-y-1">
              {(current?.top_products || []).slice(0, 5).map((p, i) => {
                const maxRev = Math.max(...(current?.top_products || []).map((x) => x.revenue || 0), 1);
                return (
                  <div key={i} className="py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-extrabold tabular-nums shrink-0 ${i === 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{p.name || 'منتج'}</p>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.max(4, Math.round(((p.revenue || 0) / maxRev) * 100))}%`, background: i === 0 ? '#4F46E5' : '#A5B4FC' }}
                          />
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <span className="block text-xs font-extrabold text-slate-900 tabular-nums">{fmtEGP(p.revenue)}</span>
                        <span className="block text-[10px] text-slate-400 font-semibold tabular-nums">{fmtNum(p.sales)} مبيعة</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </MotionCard>
      </div>
    </div>
  );
}
