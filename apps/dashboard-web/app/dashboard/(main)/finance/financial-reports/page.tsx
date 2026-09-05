'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, FileBarChart, RefreshCw, TrendingUp, Landmark } from 'lucide-react';
import { apiRequest } from '@/lib/auth';

type StatementLine = { code: string; name: string; type: string; amount: number };
type IncomeStatement = {
  shop_id: string; from_date: string; to_date: string;
  revenue: StatementLine[]; expenses: StatementLine[];
  total_revenue: number; total_expenses: number; net_profit: number;
};
type BalanceSheet = {
  shop_id: string; as_of: string;
  assets: StatementLine[]; liabilities: StatementLine[]; equity: StatementLine[];
  net_profit: number; total_assets: number; total_liabilities: number; total_equity: number;
  is_balanced: boolean;
};

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

export default function FinancialReportsPage() {
  const [tab, setTab] = useState<'income' | 'balance'>('income');
  const [income, setIncome] = useState<IncomeStatement | null>(null);
  const [balance, setBalance] = useState<BalanceSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10); });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const load = useCallback(async (f = from, t = to) => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const params = new URLSearchParams();
      if (f) params.set('from', f);
      if (t) params.set('to', t);
      const [incRes, balRes] = await Promise.all([
        apiRequest(`/accounting/reports/income-statement/shop/${sid}?${params.toString()}`),
        apiRequest(`/accounting/reports/balance-sheet/shop/${sid}?asOf=${encodeURIComponent(t)}`),
      ]);
      setIncome(incRes?.data || incRes || null);
      setBalance(balRes?.data || balRes || null);
    } catch { setIncome(null); setBalance(null); } finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const LineRow = ({ l, color }: { l: StatementLine; color?: string }) => (
    <tr className="border-b border-slate-50">
      <td className="px-3 py-2 font-mono text-xs text-slate-400 font-bold">{l.code}</td>
      <td className="px-3 py-2 font-bold text-slate-700 text-sm">{l.name}</td>
      <td className={`px-3 py-2 text-left font-mono tabular-nums font-bold text-sm ${color || 'text-slate-800'}`}>{fmt(l.amount)}</td>
    </tr>
  );

  return (
    <div className="p-6 space-y-4" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
            <FileBarChart size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">القوائم المالية</h1>
            <p className="text-sm text-slate-500 font-bold">تتولد تلقائيًا من القيود المرحَّلة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold" />
          <button onClick={() => load(from, to)} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl">
            <RefreshCw size={15} /> تحديث
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('income')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm ${tab === 'income' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
          <TrendingUp size={16} /> قائمة الدخل
        </button>
        <button onClick={() => setTab('balance')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm ${tab === 'balance' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
          <Landmark size={16} /> الميزانية العمومية
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-2xl border border-slate-200"><Loader2 size={28} className="animate-spin text-amber-500" /></div>
      ) : tab === 'income' && income ? (
        <IncomeView income={income} LineRow={LineRow} />
      ) : tab === 'balance' && balance ? (
        <BalanceView balance={balance} LineRow={LineRow} />
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 font-bold">لا بيانات — سجّل ورحّل قيودًا أولًا</div>
      )}
    </div>
  );
}

function IncomeView({ income, LineRow }: { income: IncomeStatement; LineRow: React.ComponentType<{ l: StatementLine; color?: string }> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 font-black text-emerald-800 text-sm">الإيرادات ({income.from_date} → {income.to_date})</div>
        <table className="w-full">
          <tbody>
            {income.revenue?.length ? income.revenue.map(l => <LineRow key={l.code} l={l} color="text-emerald-700" />) : (
              <tr><td colSpan={3} className="px-3 py-8 text-center text-slate-400 font-bold text-sm">لا إيرادات في الفترة</td></tr>
            )}
            <tr className="bg-emerald-50 font-black">
              <td className="px-3 py-2.5" colSpan={2}>إجمالي الإيرادات</td>
              <td className="px-3 py-2.5 text-left font-mono tabular-nums text-emerald-800">{fmt(income.total_revenue)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-rose-50 border-b border-rose-100 font-black text-rose-800 text-sm">المصروفات</div>
        <table className="w-full">
          <tbody>
            {income.expenses?.length ? income.expenses.map(l => <LineRow key={l.code} l={l} color="text-rose-700" />) : (
              <tr><td colSpan={3} className="px-3 py-8 text-center text-slate-400 font-bold text-sm">لا مصروفات في الفترة</td></tr>
            )}
            <tr className="bg-rose-50 font-black">
              <td className="px-3 py-2.5" colSpan={2}>إجمالي المصروفات</td>
              <td className="px-3 py-2.5 text-left font-mono tabular-nums text-rose-800">{fmt(income.total_expenses)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={`lg:col-span-2 rounded-2xl p-5 flex items-center justify-between border ${income.net_profit >= 0 ? 'bg-emerald-600 border-emerald-700' : 'bg-rose-600 border-rose-700'} text-white`}>
        <span className="font-black text-lg">{income.net_profit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}</span>
        <span className="font-mono font-black text-2xl tabular-nums" dir="ltr">{fmt(Math.abs(income.net_profit))} EGP</span>
      </div>
    </div>
  );
}

function BalanceView({ balance, LineRow }: { balance: BalanceSheet; LineRow: React.ComponentType<{ l: StatementLine; color?: string }> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 font-black text-blue-800 text-sm">الأصول (حتى {balance.as_of})</div>
          <table className="w-full">
            <tbody>
              {balance.assets?.length ? balance.assets.map(l => <LineRow key={l.code} l={l} />) : (
                <tr><td colSpan={3} className="px-3 py-8 text-center text-slate-400 font-bold text-sm">لا أصول</td></tr>
              )}
              <tr className="bg-blue-50 font-black">
                <td className="px-3 py-2.5" colSpan={2}>إجمالي الأصول</td>
                <td className="px-3 py-2.5 text-left font-mono tabular-nums text-blue-800">{fmt(balance.total_assets)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 font-black text-amber-800 text-sm">الالتزامات</div>
          <table className="w-full">
            <tbody>
              {balance.liabilities?.length ? balance.liabilities.map(l => <LineRow key={l.code} l={l} />) : (
                <tr><td colSpan={3} className="px-3 py-8 text-center text-slate-400 font-bold text-sm">لا التزامات</td></tr>
              )}
              <tr className="bg-amber-50 font-black">
                <td className="px-3 py-2.5" colSpan={2}>إجمالي الالتزامات</td>
                <td className="px-3 py-2.5 text-left font-mono tabular-nums text-amber-800">{fmt(balance.total_liabilities)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-purple-50 border-b border-purple-100 font-black text-purple-800 text-sm">حقوق الملكية</div>
          <table className="w-full">
            <tbody>
              {balance.equity?.length ? balance.equity.map(l => <LineRow key={l.code} l={l} />) : null}
              <tr className="border-b border-slate-50">
                <td className="px-3 py-2 font-mono text-xs text-slate-400 font-bold">—</td>
                <td className="px-3 py-2 font-bold text-slate-700 text-sm">صافي ربح الفترة (متراكم)</td>
                <td className={`px-3 py-2 text-left font-mono tabular-nums font-bold text-sm ${balance.net_profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{fmt(balance.net_profit)}</td>
              </tr>
              <tr className="bg-purple-50 font-black">
                <td className="px-3 py-2.5" colSpan={2}>إجمالي حقوق الملكية</td>
                <td className="px-3 py-2.5 text-left font-mono tabular-nums text-purple-800">{fmt(balance.total_equity)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className={`rounded-xl p-4 flex items-center gap-3 border ${balance.is_balanced ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
        <Landmark size={18} className={balance.is_balanced ? 'text-emerald-500' : 'text-rose-500'} />
        <span className={`font-black text-sm ${balance.is_balanced ? 'text-emerald-700' : 'text-rose-700'}`}>
          {balance.is_balanced
            ? 'الميزانية متوازنة: الأصول = الالتزامات + حقوق الملكية ✓'
            : 'الميزانية غير متوازنة — تأكد من ترحيل كل القيود'}
        </span>
        <span className="font-mono text-xs font-bold text-slate-500 mr-auto" dir="ltr">
          {fmt(balance.total_assets)} = {fmt(balance.total_liabilities + balance.total_equity)}
        </span>
      </div>
    </div>
  );
}
