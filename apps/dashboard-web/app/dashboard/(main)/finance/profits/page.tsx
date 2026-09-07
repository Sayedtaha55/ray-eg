'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, TrendingDown, Loader2, Download, Info, X, Percent, Scale } from 'lucide-react';
import { apiRequest } from '@/lib/auth';

type StatementLine = { code: string; name: string; type: string; amount: number };
type IncomeStatement = {
  from_date: string; to_date: string;
  revenue: StatementLine[]; expenses: StatementLine[];
};

function periodRange(period: 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'last_year'): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const q = Math.floor(m / 3);
  const d = (dt: Date) => dt.toISOString().split('T')[0];
  switch (period) {
    case 'this_month': return { from: d(new Date(y, m, 1)), to: d(new Date(y, m + 1, 0)) };
    case 'last_month': return { from: d(new Date(y, m - 1, 1)), to: d(new Date(y, m, 0)) };
    case 'this_quarter': return { from: d(new Date(y, q * 3, 1)), to: d(new Date(y, q * 3 + 3, 0)) };
    case 'this_year': return { from: d(new Date(y, 0, 1)), to: d(new Date(y, 11, 31)) };
    case 'last_year': return { from: d(new Date(y - 1, 0, 1)), to: d(new Date(y - 1, 11, 31)) };
  }
}

type PeriodKey = 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'last_year';

export default function ProfitsPage() {
  const [inc, setInc] = useState<IncomeStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodKey>('this_year');

  const load = useCallback(async (p: PeriodKey) => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const r = periodRange(p);
      const params = new URLSearchParams();
      if (r.from) params.set('from', r.from);
      if (r.to) params.set('to', r.to);
      const res = await apiRequest(`/accounting/reports/income-statement/shop/${sid}?${params.toString()}`);
      setInc(res?.data || res || null);
    } catch { setInc(null); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(period); }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const PERIOD_LABELS: Record<PeriodKey, string> = {
    this_month: 'هذا الشهر', last_month: 'الشهر الماضي', this_quarter: 'هذا الربع',
    this_year: 'هذا العام', last_year: 'العام الماضي',
  };


  const revenue = useMemo(() => (inc?.revenue || []).reduce((s, l) => s + Math.abs(Number(l.amount || 0)), 0), [inc]);
  const expenses = useMemo(() => (inc?.expenses || []).reduce((s, l) => s + Math.abs(Number(l.amount || 0)), 0), [inc]);
  const netProfit = revenue - expenses;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const expenseLines = useMemo(() => [...(inc?.expenses || [])].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)), [inc]);
  const maxExpense = Math.max(1, ...expenseLines.map(l => Math.abs(Number(l.amount || 0))));
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const exportCSV = () => {
    const rows = [
      ['Section', 'Code', 'Account', 'Amount'],
      ...((inc?.revenue || []).map(l => ['Revenue', l.code, l.name, l.amount])),
      ...expenseLines.map(l => ['Expense', l.code, l.name, l.amount]),
      ['', '', 'Total Revenue', revenue],
      ['', '', 'Total Expenses', expenses],
      ['', '', 'Net Profit', netProfit],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'profit-and-loss.csv';
    link.click();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <Scale size={24} className="text-[#00E5FF]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الأرباح والخسائر</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">قائمة الدخل الحقيقية: الإيرادات − المصروفات = صافي الربح</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGuideOpen(true)} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50" title="دليل"><Info size={16} /></button>
          <button onClick={exportCSV} disabled={!inc} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 disabled:opacity-50">
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

      {/* P&L Summary */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 flex items-center justify-center py-16"><Loader2 size={26} className="animate-spin text-slate-400" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-right">
            <span className="text-slate-500 font-semibold text-xs">إجمالي الإيرادات</span>
            <div className="text-xl font-black text-emerald-600 mt-1">ج.م {fmt(revenue)}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-right">
            <span className="text-slate-500 font-semibold text-xs">إجمالي المصروفات</span>
            <div className="text-xl font-black text-rose-600 mt-1">ج.م {fmt(expenses)}</div>

      {/* Expense breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-black text-slate-900 text-sm mb-4">أكبر بنود المصروفات</h3>
        {expenseLines.length === 0 ? (
          <p className="text-slate-400 font-bold text-sm text-center py-6">لا توجد مصروفات مرحَّلة في هذه الفترة</p>
        ) : (
          <div className="space-y-3">
            {expenseLines.map(l => {
              const amount = Math.abs(Number(l.amount || 0));
              const pct = (amount / maxExpense) * 100;
              const share = revenue > 0 ? (amount / revenue) * 100 : 0;
              return (
                <div key={l.code} className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400 w-12 shrink-0" dir="ltr">{l.code}</span>
                  <span className="font-bold text-slate-700 text-sm w-40 truncate shrink-0">{l.name}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-black text-slate-500 w-14 text-left shrink-0">{share.toFixed(1)}%</span>
                  <span className="text-sm font-black text-rose-600 w-32 text-left shrink-0" dir="ltr">{fmt(amount)} EGP</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* P&L waterfall (simplified statement) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-black text-slate-700 text-sm">ملخص قائمة الدخل</div>
        <table className="w-full">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="p-4 font-bold text-slate-700 text-sm">إجمالي الإيرادات</td>
              <td className="p-4 text-left font-black text-emerald-600" dir="ltr">{fmt(revenue)} EGP</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-4 font-bold text-slate-700 text-sm">إجمالي المصروفات</td>
              <td className="p-4 text-left font-black text-rose-600" dir="ltr">({fmt(expenses)}) EGP</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="p-4 font-black text-slate-900">صافي الربح / (الخسارة)</td>
              <td className={`p-4 text-left font-black ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`} dir="ltr">
                {fmt(netProfit)} EGP
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Guide Modal */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل الأرباح والخسائر</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4 text-right text-sm text-slate-600 leading-relaxed">
              <p><strong>المعادلة:</strong> صافي الربح = إجمالي الإيرادات − إجمالي المصروفات، لكل من القيود المرحَّلة فقط (المسودات غير محسوبة).</p>
              <p><strong>المصدر:</strong> نفس بيانات قائمة الدخل في صفحة القوائم المالية — الأرقام متطابقة دائمًا.</p>
              <p><strong>الهامش:</strong> نسبة صافي الربح من الإيرادات؛ مؤشر رئيسي على صحة العمل.</p>
              <p><strong>الربط:</strong> المصروفات المُسجلة من صفحة المصروفات والفواتير المرحَّلة تظهر هنا مباشرة.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

          </div>
          <div className={`rounded-xl border p-5 text-right ${netProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            <span className="text-slate-500 font-semibold text-xs">صافي الربح</span>
            <div className={`text-xl font-black mt-1 flex items-center gap-1 ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {netProfit >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              ج.م {fmt(netProfit)}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-right">
            <span className="text-slate-500 font-semibold text-xs flex items-center gap-1"><Percent size={12} /> هامش الربح</span>
            <div className={`text-xl font-black mt-1 ${margin >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>{revenue > 0 ? `${margin.toFixed(1)}%` : '—'}</div>
          </div>
        </div>
      )}
