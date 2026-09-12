'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { RefreshCw, Users, UserPlus, Repeat, CircleDollarSign } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';

/* تحليلات العملاء — من /analytics/shop/:id/customer-insights */

type CustomerSegment = { segment: string; segment_ar: string; count: number; percentage: number };
type TopCustomer = { name: string; orders: number; spent: number };
type CustomerInsightsData = {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  avg_order_value: number;
  segments: CustomerSegment[];
  top_customers: TopCustomer[];
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

export default function CustomerInsightsPage() {
  const { shop } = useShop();
  const [period, setPeriod] = useState<PeriodKey>('30');
  const [data, setData] = useState<CustomerInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (p: PeriodKey) => {
    const shopId = shop?.id;
    if (!shopId) return;
    setRefreshing(true);
    setError('');
    try {
      const res = await apiRequest(`/analytics/shop/${shopId}/customer-insights?period=${p}d`);
      setData(res || null);
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل تحليلات العملاء');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { load(period); }, [period, load]);

  const kpis = useMemo(() => ([
    { label: 'إجمالي العملاء', value: fmtNum(data?.total_customers || 0) },
    { label: 'عملاء جدد', value: fmtNum(data?.new_customers || 0) },
    { label: 'عملاء عائدون', value: fmtNum(data?.returning_customers || 0) },
    { label: 'متوسط قيمة الطلب', value: fmtEGP(data?.avg_order_value || 0) },
  ]), [data]);

  const segments = data?.segments || [];
  const topCustomers = data?.top_customers || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px] mx-auto">

      {/* ===== Header ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">تحليلات العملاء</h1>
          <p className="text-xs text-slate-400 mt-1">مين عملاؤك، مين جديد، ومين بيكرر الشراء</p>
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
        {kpis.map((k, i) => (
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

      {/* ===== Segments + Top customers ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Users size={15} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">شرائح العملاء</h3>
          </div>
          <div className="p-5 space-y-4">
            {loading ? (
              [0, 1].map((i) => <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />)
            ) : segments.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-4">لا توجد شرائح بعد — أول عميل شراء سيصنّف تلقائيًا</p>
            ) : (
              segments.map((s) => (
                <div key={s.segment}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800">{s.segment_ar || s.segment}</span>
                    <span className="text-[11px] font-bold text-slate-600 tabular-nums">{fmtNum(s.count)} عميل • {s.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${Math.max(s.percentage, 2)}%` }} />
                  </div>
                </div>
              ))
            )}
            {segments.length > 0 && (
              <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1"><UserPlus size={12} /> جديد: أول عملية شراء</span>
                <span className="flex items-center gap-1"><Repeat size={12} /> عائد: أكتر من عملية شراء</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center gap-2">
            <CircleDollarSign size={15} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">أفضل العملاء</h3>
          </div>
          {loading ? (
            <div className="p-5 space-y-2"><div className="h-9 bg-slate-100 rounded-lg animate-pulse" /><div className="h-9 bg-slate-100 rounded-lg animate-pulse" /></div>
          ) : topCustomers.length === 0 ? (
            <div className="py-12 text-center">
              <Users size={24} className="mx-auto mb-2 text-slate-200" />
              <p className="text-xs font-semibold text-slate-400">لا توجد مشتريات بعد — أوائل العملاء هيظهروا هنا</p>
            </div>
          ) : (
            <div className="px-5 py-2 divide-y divide-slate-50">
              {topCustomers.slice(0, 8).map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{(c.name || '?')?.charAt(0)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{c.name || 'عميل'}</p>
                    <p className="text-[10px] text-slate-400 tabular-nums">{fmtNum(c.orders)} طلب</p>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 tabular-nums">{fmtEGP(c.spent)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
