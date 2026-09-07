'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Loader2, Download, Info, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { apiRequest } from '@/lib/auth';

type StatementLine = { code: string; name: string; amount: number };
type IncomeStatement = { shop_id: string; from_date: string; to_date: string; revenue: StatementLine[]; expenses: StatementLine[]; total_revenue: number; net_profit: number; };

function periodRange(p: 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'all'): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (dt: Date) => dt.toISOString().split('T')[0];
  switch (p) {
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
      const q = (f: string, t: string) => { const ps = new URLSearchParams(); if (f) ps.set('from', f); if (t) ps.set('to', t); return ps.toString(); };
      let prev: { from: string; to: string } | null = null;
      if (cur.from && cur.to) {
        const [fy, fm, fd] = cur.from.split('-').map(Number);
        const [ty, tm, td] = cur.to.split('-').map(Number);
        const len = Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000) + 1;
        const pe = new Date(Date.UTC(fy, fm - 1, fd - 1));
        const ps = new Date(pe.getTime() - (len - 1) * 86400000);
        prev = { from: ps.toISOString().split('T')[0], to: pe.toISOString().split('T')[0] };
      }
      const [curRes, prevRes] = await Promise.all([
        apiRequest(`/accounting/reports/income-statement/shop/${sid}?${q(cur.from, cur.to)}`),
        prev ? apiRequest(`/accounting/reports/income-statement/shop/${sid}?${q(prev.from, prev.to)}`).catch(() => null) : Promise.resolve(null),
      ]);
      setCurrent(curRes?.data || curRes || null);
      setPrevious(prevRes ? (prevRes?.data || prevRes) : null);
    } catch { setCurrent(null); setPrevious(null); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(period); }, [period]);

  const revenueLines = useMemo(() => current?.revenue || [], [current]);
  const totalRevenue = revenueLines.reduce((s, l) => s + Number(l.amount || 0), 0);
  const prevRevenue = (previous?.revenue || []).reduce((s, l) => s + Number(l.amount || 0), 0);
  const growth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const maxLine = Math.max(1, ...revenueLines.map(l => Math.abs(Number(l.amount || 0))));
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const exportCSV = () => {
    const rows = [['Code', 'Account', 'Amount'], ...revenueLines.map(l => [l.code, l.name, l.amount])];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'revenue.csv'; link.click();
  };

  const periods: { key: PeriodKey; label: string }[] = [
    { key: 'this_month', label: 'هذا الشهر' },
    { key: 'last_month', label: 'الشهر الماضي' },
    { key: 'this_year', label: 'هذه السنة' },
    { key: 'last_year', label: 'السنة الماضية' },
    { key: 'all', label: 'الكل' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center"><TrendingUp size={24} className="text-white" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الإيرادات</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">قائمة الدخل — إيرادات حقيقية من القوائم المالية</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGuideOpen(true)} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500"><Info size={18} /></button>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50"><Download size={16} /> CSV</button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {periods.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${period === p.key ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-emerald-600" /></div>
      ) : !current ? (
        <div className="text-center py-20 text-slate-400 font-bold">لا توجد بيانات — تأكد من وجود قيود محاسبية مرحّلة</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-xs font-bold text-slate-400">إجمالي الإيرادات</div>
              <div className="text-3xl font-black text-slate-900 mt-2" dir="ltr">{fmt(totalRevenue)} EGP</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-xs font-bold text-slate-400">عدد بنود الإيراد</div>
              <div className="text-3xl font-black text-slate-900 mt-2">{revenueLines.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-xs font-bold text-slate-400">النمو عن الفترة السابقة</div>
              <div className={`text-3xl font-black mt-2 flex items-center gap-2 ${growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {growth >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                {growth.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-black text-slate-900">تفصيل بنود الإيراد</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {revenueLines.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-bold">لا توجد بنود إيراد في هذه الفترة</div>
              ) : (
                revenueLines.map((l, i) => (
                  <div key={i} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-400 w-16 shrink-0">{l.code}</span>
                      <span className="font-bold text-slate-700 truncate">{l.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (Math.abs(Number(l.amount)) / maxLine) * 100)}%` }} />
                      </div>
                      <span className="font-black text-slate-900 w-24 text-left" dir="ltr">{fmt(Number(l.amount))}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {guideOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900">دليل الإيرادات</h3>
              <button onClick={() => setGuideOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="text-sm font-bold text-slate-600 space-y-2">
              <p>• الإيرادات تأتي من قائمة الدخل المبنية على القيود المحاسبية المرحّلة.</p>
              <p>• اختر الفترة الزمنية لمقارنة الأداء مع الفترة السابقة تلقائيًا.</p>
              <p>• اضغط CSV لتصدير البيانات.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
