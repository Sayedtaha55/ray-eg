'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Loader2, Download, Info, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { apiRequest } from '@/lib/auth';

type StatementLine = { code: string; name: string; type: string; amount: number };
type IncomeStatement = {
  shop_id: string; from_date: string; to_date: string;
  revenue: StatementLine[]; expenses: StatementLine[];
  total_revenue: number; total_expenses: number; net_profit: number;
};

function periodRange(period: 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'all'): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (dt: Date) => dt.toISOString().split('T')[0];
  switch (period) {
    case 'this_month': return { from: d(new Date(y, m, 1)), to: d(new Date(y, m + 1, 0)) };
    case 'last_month': return { from: d(new Date(y, m - 1, 1)), to: d(new Date(y, m, 0)) };
    case 'this_year': return { from: d(new Date(y, 0, 1)), to: d(new Date(y, 11, 31)) };
    case 'last_year': return { from: d(new Date(y - 1, 0, 1)), to: d(new Date(y - 1, 11, 31)) };
    default: return { from: '', to: d(now) };
  }
}

type PeriodKey = 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'all';

export default function RevenuePage() {
  const [current, setCurrent] = useState<IncomeStatement | null>(null);
  const [previous, setPrevious] = useState<IncomeStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodKey>('this_year');

  const load = useCallback(async (p: PeriodKey) => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const cur = periodRange(p);
      const q = (f: string, t: string) => {
        const params = new URLSearchParams();
        if (f) params.set('from', f);
        if (t) params.set('to', t);
        return params.toString();
      };
      // الفترة السابقة بنفس طول الفترة الحالية (لحساب النمو)
      let prev: { from: string; to: string } | null = null;
      if (cur.from && cur.to) {
        const [fy, fm, fd] = cur.from.split('-').map(Number);
        const [ty, tm, td] = cur.to.split('-').map(Number);
        const lenDays = Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000) + 1;
        const prevEnd = new Date(Date.UTC(fy, fm - 1, fd - 1));
        const prevStart = new Date(prevEnd.getTime() - (lenDays - 1) * 86400000);
        prev = { from: prevStart.toISOString().split('T')[0], to: prevEnd.toISOString().split('T')[0] };
      }
      const [curRes, prevRes] = await Promise.all([
        apiRequest(`/accounting/reports/income-statement/shop/${sid}?${q(cur.from, cur.to)}`),
        prev ? apiRequest(`/accounting/reports/income-statement/shop/${sid}?${q(prev.from, prev.to)}`).catch(() => null) : Promise.resolve(null),

  const revenueLines = useMemo(() => current?.revenue || [], [current]);
  const totalRevenue = revenueLines.reduce((s, l) => s + Number(l.amount || 0), 0);
  const prevRevenue = (previous?.revenue || []).reduce((s, l) => s + Number(l.amount || 0), 0);
  const growth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const maxLine = Math.max(1, ...revenueLines.map(l => Math.abs(Number(l.amount || 0))));
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const exportCSV = () => {
    const headers = ['Code', 'Account', 'Amount'];
    const rows = revenueLines.map(l => [l.code, l.name, l.amount]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'revenue.csv';
    link.click();
  };

  const PERIOD_LABELS: Record<PeriodKey, string> = {
    this_month: 'هذا الشهر', last_month: 'الشهر الماضي',
    this_year: 'هذا العام', last_year: 'العام الماضي', all: 'كل الفترات',
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <TrendingUp size={24} className="text-[#00E5FF]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الإيرادات</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">الإيرادات الحقيقية من قائمة الدخل — مصدرها القيود المرحَّلة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGuideOpen(true)} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50" title="دليل"><Info size={16} /></button>
          <button onClick={exportCSV} disabled={!revenueLines.length} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 disabled:opacity-50">
            <Download size={16} /> تصدير CSV
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap gap-2 items-center">
        {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map(k => (
          <button key={k} onClick={() => setPeriod(k)}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${period === k ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {PERIOD_LABELS[k]}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-right">
          <span className="text-slate-500 font-semibold text-xs">إجمالي الإيرادات</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">ج.م {fmt(totalRevenue)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-right">
          <span className="text-slate-500 font-semibold text-xs">الفترة السابقة</span>
          <div className="text-2xl font-black text-slate-900 mt-1">ج.م {fmt(prevRevenue)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-right">
          <span className="text-slate-500 font-semibold text-xs">النمو</span>

      {/* Revenue breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={26} className="animate-spin text-slate-400" /></div>
        ) : revenueLines.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 font-bold text-sm">لا توجد إيرادات مرحَّلة في هذه الفترة — الإيرادات تظهر هنا بعد ترحيل الفواتير أو القيود</p>
          </div>
        ) : (
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-black text-slate-500">
                <th className="p-4 text-right">الكود</th>
                <th className="p-4 text-right">حساب الإيراد</th>
                <th className="p-4 text-right w-1/2">المساهمة</th>
                <th className="p-4 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {revenueLines.map(l => {
                const pct = (Math.abs(Number(l.amount || 0)) / maxLine) * 100;
                return (
                  <tr key={l.code} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-mono text-xs font-bold text-slate-500">{l.code}</td>
                    <td className="p-4 font-bold text-slate-800 text-sm">{l.name}</td>
                    <td className="p-4">
                      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="p-4 text-left font-black text-emerald-600">ج.م {fmt(Number(l.amount || 0))}</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50 font-black">
                <td className="p-4" colSpan={3}>الإجمالي</td>
                <td className="p-4 text-left font-black text-emerald-700">ج.م {fmt(totalRevenue)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Guide Modal */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل الإيرادات</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4 text-right text-sm text-slate-600 leading-relaxed">
              <p><strong>مصدر البيانات:</strong> الأرصدة الدائنة لحسابات الإيرادات (سلسلة 4000) من القيود المرحَّلة في قائمة الدخل.</p>
              <p><strong>الفواتير:</strong> عند ترحيل فاتورة بيع من صفحة الفواتير، يُسجَّل قيد مزدوج تلقائيًا ويظهر الإيراد هنا فورًا.</p>
              <p><strong>النمو:</strong> يقارن الفترة الحالية بالفترة السابقة بنفس الطول (شهر مقابل شهر، سنة مقابل سنة).</p>
              <p><strong>الربط:</strong> نفس الأرقام تظهر في قائمة الدخل وصفحة الأرباح وميزان المراجعة — مصدر حقيقة واحد.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

          <div className={`text-2xl font-black mt-1 flex items-center gap-1 ${growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {growth >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            {prevRevenue > 0 ? `${growth.toFixed(1)}%` : '—'}
          </div>
        </div>
      </div>

      ]);
      setCurrent(curRes?.data || curRes || null);
      setPrevious(prevRes ? (prevRes?.data || prevRes) : null);
    } catch { setCurrent(null); setPrevious(null); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(period); }, [period]); // eslint-disable-line react-hooks/exhaustive-deps
