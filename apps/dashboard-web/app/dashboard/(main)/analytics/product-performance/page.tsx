'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { RefreshCw, Package, Search, Star, ArrowUpDown } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';

/* صفحة أداء المنتجات — بيانات حقيقية من /analytics/shop/:id/product-performance */

type ProductPerf = {
  id: string;
  name: string;
  category: string;
  units_sold: number;
  revenue: number;
  stock: number;
  avg_rating: number;
  status: string; // star | rising | stable | declining
};

type PerfReport = {
  products: ProductPerf[];
  totals: { units: number; revenue: number; views: number; avg_conv: number };
};

const LOCALE = 'ar-EG-u-nu-latn';
const fmtNum = (n: number) => (Number.isFinite(n) ? n : 0).toLocaleString(LOCALE, { maximumFractionDigits: 0 });
const fmtEGP = (n: number) => `${(Number.isFinite(n) ? n : 0).toLocaleString(LOCALE, { maximumFractionDigits: 0 })} ج.م`;

type PeriodKey = '7' | '30' | '90';
const PERIODS: Array<{ key: PeriodKey; label: string }> = [
  { key: '7', label: '7 أيام' },
  { key: '30', label: '30 يوم' },
  { key: '90', label: '90 يوم' },
];

const STATUS_META: Record<string, { label: string; cls: string }> = {
  star: { label: 'نجم', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  rising: { label: 'صاعد', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  stable: { label: 'ثابت', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  declining: { label: 'متراجع', cls: 'bg-red-50 text-red-700 border-red-200' },
};

type SortKey = 'revenue' | 'units_sold' | 'stock';

export default function ProductPerformancePage() {
  const { shop } = useShop();
  const [period, setPeriod] = useState<PeriodKey>('30');
  const [data, setData] = useState<PerfReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('revenue');

  const load = useCallback(async (p: PeriodKey) => {
    const shopId = shop?.id;
    if (!shopId) return;
    setRefreshing(true);
    setError('');
    try {
      const res = await apiRequest(`/analytics/shop/${shopId}/product-performance?period=${p}d`);
      setData(res || null);
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل أداء المنتجات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { load(period); }, [period, load]);

  const products = useMemo(() => {
    let list = [...(data?.products || [])];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
    }
    list.sort((a, b) => Number(b[sortKey] || 0) - Number(a[sortKey] || 0));
    return list;
  }, [data, search, sortKey]);

  const totals = data?.totals;

  const kpis = useMemo(() => ([
    { label: 'إيراد المنتجات', value: fmtEGP(totals?.revenue || 0) },
    { label: 'قطع مباعة', value: fmtNum(totals?.units || 0) },
    { label: 'عدد المنتجات', value: fmtNum((data?.products || []).length) },
    { label: 'متوسط معدل التحويل', value: `${(totals?.avg_conv || 0).toFixed(1)}%` },
  ]), [totals, data]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px] mx-auto">

      {/* ===== Header ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">أداء المنتجات</h1>
          <p className="text-xs text-slate-400 mt-1">مين بيبيع ومين واقف — ترتيب حسب الإيراد والمبيعات</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md tabular-nums transition-colors ${period === p.key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => load(period)}
            disabled={refreshing || !shop?.id}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="تحديث"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-800">{error}</div>
      )}

      {/* ===== KPIs ===== */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
            <p className="text-[11px] font-semibold text-slate-400">{k.label}</p>
            {loading ? (
              <div className="h-7 w-24 bg-slate-100 rounded-md animate-pulse mt-2" />
            ) : (
              <div className="text-[22px] font-extrabold text-slate-900 tabular-nums leading-7 mt-1">{k.value}</div>
            )}
          </div>
        ))}
      </div>

      {/* ===== Products table ===== */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="flex items-center gap-2 flex-1">
            <Package size={15} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">كل المنتجات</h3>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded px-2 py-0.5 tabular-nums">{fmtNum(products.length)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الفئة…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-48 pr-9 pl-3 rounded-full border border-slate-200 text-xs font-semibold outline-none focus:border-slate-400"
              />
            </div>
            <div className="relative flex items-center gap-1">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="h-9 px-2 rounded-full border border-slate-200 text-[11px] font-bold text-slate-600 bg-white focus:outline-none"
              >
                <option value="revenue">الأعلى إيرادًا</option>
                <option value="units_sold">الأكثر مبيعًا</option>
                <option value="stock">الأعلى مخزونًا</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-5 space-y-2"><div className="h-9 bg-slate-100 rounded-lg animate-pulse" /><div className="h-9 bg-slate-100 rounded-lg animate-pulse" /><div className="h-9 bg-slate-100 rounded-lg animate-pulse" /></div>
        ) : products.length === 0 ? (
          <div className="py-14 text-center">
            <Package size={26} className="mx-auto mb-2 text-slate-200" />
            <p className="text-sm font-bold text-slate-500">{search ? 'لا نتائج مطابقة للبحث' : 'لا توجد منتجات بعد — أضف أول منتج وسيظهر أداؤه هنا'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[760px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">المنتج</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">الفئة</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">قطع مباعة</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">الإيراد</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">المخزون</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const st = STATUS_META[p.status] || STATUS_META.stable;
                  const lowStock = p.stock > 0 && p.stock <= 5;
                  return (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-xs font-bold text-slate-800 max-w-[200px] truncate">{p.name || 'منتج'}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{p.category || '—'}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-700 tabular-nums">{fmtNum(p.units_sold)}</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-900 tabular-nums">{fmtEGP(p.revenue)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold tabular-nums ${lowStock ? 'text-amber-600' : 'text-slate-700'}`}>{fmtNum(p.stock)}</span>
                        {lowStock && <span className="text-[9px] font-bold text-amber-600 mr-1">منخفض</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${st.cls}`}>
                          {p.status === 'star' && <Star size={9} className="inline ml-0.5" />}
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
