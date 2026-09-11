'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart, Eye, Users, DollarSign, Package, Star, RefreshCw, Download,
  TrendingUp, TrendingDown, Bell, Plus, Megaphone, Calendar, Store,
  Settings as SettingsIcon, LogIn, AlertTriangle, ChevronLeft, Wallet, Boxes, BarChart3,
  History,
} from 'lucide-react';
import { useAuth, apiRequest } from '@/lib/auth';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

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

function Sparkline({ values, color = '#0891b2', width = 64, height = 24 }: {
  values: number[]; color?: string; width?: number; height?: number;
}) {
  const pts = values || [];
  if (pts.length < 2) return null;
  const max = Math.max(...pts, 1);
  const min = Math.min(...pts, 0);
  const range = max - min || 1;
  const step = width / (pts.length - 1);
  const d = pts
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(height - 2 - ((v - min) / range) * (height - 4)).toFixed(1)}`)
    .join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ============================================================
 * Big area chart (hand-rolled SVG, smooth curve + gradient)
 * ============================================================ */

function AreaChart({ data, color = '#0891b2', formatY, formatTip }: {
  data: Array<{ x: string; y: number }>;
  color?: string;
  formatY: (n: number) => string;
  formatTip: (p: { x: string; y: number }) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 800, H = 260, PL = 44, PR = 12, PT = 14, PB = 26;
  if (!data || data.length < 2) {
    return (
      <div className="h-[240px] flex flex-col items-center justify-center gap-2 text-slate-300">
        <BarChart3 size={28} />
        <p className="text-xs font-semibold text-slate-400">لا توجد مبيعات في هذه الفترة بعد</p>
      </div>
    );
  }
  const max = Math.max(...data.map((d) => d.y), 1);
  // round up to a nice ceiling (1/2/5 × 10^n) for clean axis ticks
  const mag = Math.pow(10, Math.floor(Math.log10(max)));
  const niceMax = [1, 2, 5, 10].map((m) => m * mag).find((m) => m >= max * 1.05) ?? max * 1.1;
  const iw = W - PL - PR, ih = H - PT - PB;
  const px = (i: number) => PL + (i / (data.length - 1)) * iw;
  const py = (v: number) => PT + ih - (v / niceMax) * ih;

  // smooth path (quadratic midpoint smoothing)
  let path = `M${px(0)},${py(data[0].y)}`;
  for (let i = 1; i < data.length; i++) {
    const xc = (px(i - 1) + px(i)) / 2;
    const yc = (py(data[i - 1].y) + py(data[i].y)) / 2;
    path += ` Q${xc.toFixed(1)},${yc.toFixed(1)} ${px(i).toFixed(1)},${py(data[i].y).toFixed(1)}`;
  }
  const area = `${path} L${px(data.length - 1)},${PT + ih} L${px(0)},${PT + ih} Z`;
  const yTicks = [0, 0.5, 1].map((t) => niceMax * t);
  const xLabelEvery = Math.max(1, Math.ceil(data.length / 6));
  const id = React.useId();

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ direction: 'ltr' }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((x - PL) / iw) * (data.length - 1));
          setHover(Math.max(0, Math.min(data.length - 1, i)));
        }}
      >
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={py(t)} y2={py(t)} stroke="#f1f5f9" strokeWidth="1" />
            <text x={PL - 6} y={py(t) + 3} textAnchor="end" fontSize="9" fill="#94a3b8">{formatY(t)}</text>
          </g>
        ))}
        <path d={area} fill={`url(#g${id})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {data.map((d, i) => (
          i % xLabelEvery === 0 ? (
            <text key={i} x={px(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.x}</text>
          ) : null
        ))}
        {hover !== null && (
          <g>
            <line x1={px(hover)} x2={px(hover)} y1={PT} y2={PT + ih} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx={px(hover)} cy={py(data[hover].y)} r="4" fill="white" stroke={color} strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="absolute pointer-events-none bg-slate-900 text-white text-[10px] font-bold rounded-md px-2 py-1 whitespace-nowrap -translate-x-1/2"
          style={{ left: `${(px(hover) / W) * 100}%`, top: 0 }}
        >
          {formatTip(data[hover])}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Small UI primitives
 * ============================================================ */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-slate-200 rounded-xl ${className}`}>{children}</div>;
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

function DeltaInline({ delta }: { delta: number | null }) {
  if (delta === null || !Number.isFinite(delta)) return <span className="text-[10px] text-slate-300">—</span>;
  const up = delta >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums ${up ? 'text-emerald-600' : 'text-red-600'}`}>
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1500px] mx-auto">

      {/* ===== Header ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {greeting()}، {user?.name || shop?.name || 'صاحب المتجر'}.
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            إليك ما يحدث في متجرك — {todayLong()}
            {lastUpdated && <span className="text-slate-300"> • آخر تحديث {lastUpdated.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })}</span>}
            {refreshing && <span className="text-cyan-700"> • جارٍ التحديث…</span>}
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
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="تحديث"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
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

      {/* ===== Main grid: chart + side ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* --- Big chart card with stats strip --- */}
        <Card className="xl:col-span-2">
          {/* stats strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-x-reverse divide-slate-100 border-b border-slate-100">
            {kpis.map((k) => (
              <div key={k.key} className="px-5 py-4">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                  {k.icon}
                  <span className="text-[11px] font-semibold">{k.label}</span>
                </div>
                {loading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <div className="text-lg font-bold text-slate-900 tabular-nums leading-6">{k.value}</div>
                      <div className="mt-0.5"><DeltaInline delta={k.delta} /></div>
                    </div>
                    {k.spark.length > 1 && <Sparkline values={k.spark} />}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* metric tabs */}
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
              {([
                { key: 'revenue', label: 'الإيرادات' },
                { key: 'orders', label: 'الطلبات' },
              ] as { key: Metric; label: string }[]).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${metric === m.key ? 'bg-white text-slate-900 border border-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {metric === 'revenue' ? fmtEGP(trendTotal) : fmtNum(trendTotal)}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">آخر {fmtNum(trendPoints.length)} يوم</span>
            </div>
          </div>

          <div className="px-3 pb-3 pt-1">
            {loading ? <Skeleton className="h-56 m-2" /> : (
              <AreaChart
                data={chartData}
                color={metric === 'revenue' ? '#0891b2' : '#7c3aed'}
                formatY={(n) => (metric === 'revenue' ? fmtCompact(n) : fmtCompact(n))}
                formatTip={(p) => `${p.x} — ${metric === 'revenue' ? fmtEGP(p.y) : `${fmtNum(p.y)} طلب`}`}
              />
            )}
          </div>
        </Card>

        {/* --- Right column --- */}
        <div className="space-y-4">
          {/* Shop card */}
          <Card className="p-5">
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
          </Card>

          {/* Quick actions — list style */}
          <Card className="p-2">
            {[
              { label: 'إضافة منتج جديد', desc: 'وسّع كتالوج متجرك', icon: <Plus size={16} />, href: '/dashboard/inventory' },
              { label: 'طلب جديد', desc: 'سجّل بيع من الكاشير', icon: <ShoppingCart size={16} />, href: '/dashboard/pos' },
              { label: 'حجز جديد', desc: 'احجز موعدًا لعميل', icon: <Calendar size={16} />, href: '/dashboard/bookings' },
              { label: 'حملة إعلانية', desc: 'أطلق عرضًا لعملائك', icon: <Megaphone size={16} />, href: '/dashboard/marketing' },
              { label: 'تقرير مالي', desc: 'راجع أرباحك ومصروفاتك', icon: <Wallet size={16} />, href: '/dashboard/finance' },
              { label: 'إعدادات المتجر', desc: 'بيانات المتجر والрؤية', icon: <SettingsIcon size={16} />, href: '/dashboard/settings' },
            ].map((a, i, arr) => (
              <button
                key={a.label}
                type="button"
                onClick={() => router.push(a.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-right ${i < arr.length - 1 ? '' : ''}`}
              >
                <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  {a.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-slate-800">{a.label}</span>
                  <span className="block text-[10px] text-slate-400">{a.desc}</span>
                </span>
                <ChevronLeft size={14} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </Card>
        </div>
      </div>

      {/* ===== Orders + Notifications ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">أحدث الطلبات</h3>
            <button type="button" onClick={() => router.push('/dashboard/sales')} className="text-xs font-semibold text-cyan-700 hover:underline inline-flex items-center gap-0.5">
              كل الطلبات <ChevronLeft size={12} />
            </button>
          </div>
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
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">آخر الإشعارات</h3>
            <button type="button" onClick={() => router.push('/dashboard/notifications')} className="text-xs font-semibold text-cyan-700 hover:underline inline-flex items-center gap-0.5">
              الكل <ChevronLeft size={12} />
            </button>
          </div>
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
        </Card>
      </div>

      {/* ===== Top products + Sessions ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">الأكثر مبيعًا</h3>
            <button type="button" onClick={() => router.push('/dashboard/inventory')} className="text-xs font-semibold text-cyan-700 hover:underline inline-flex items-center gap-0.5">
              إدارة المنتجات <ChevronLeft size={12} />
            </button>
          </div>
          {loading ? (
            <div className="p-5 space-y-2"><Skeleton className="h-9" /><Skeleton className="h-9" /><Skeleton className="h-9" /></div>
          ) : (current?.top_products || []).length === 0 ? (
            <Empty
              icon={<Boxes size={20} />}
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
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">آخر جلسات الدخول</h3>
            <span className="text-[10px] font-semibold text-slate-400">{fmtNum(sessions.length)} جلسة</span>
          </div>
          {loading ? (
            <div className="p-5 space-y-2"><Skeleton className="h-9" /><Skeleton className="h-9" /><Skeleton className="h-9" /></div>
          ) : sessions.length === 0 ? (
            <Empty icon={<LogIn size={20} />} title="لا توجد سجلات دخول" />
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
        </Card>
      </div>
    </div>
  );
}
