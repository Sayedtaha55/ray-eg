'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Search, Download, RefreshCw, Info, X,
  ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check,
  DollarSign, Calendar, Package, Percent, ArrowUp, ArrowDown, Minus,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type ProfitData = {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  topProducts: { name: string; revenue: number; cost: number; profit: number; margin: number }[];
  monthlyData: { month: string; revenue: number; expenses: number; profit: number }[];
};

export default function ProfitsPage() {
  const [data, setData] = useState<ProfitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [sortBy, setSortBy] = useState('profit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/finance/profits/shop/${sid}?period=${period}&from=${dateFrom}&to=${dateTo}`);
      setData({
        totalRevenue: Number(res?.totalRevenue ?? 0),
        totalCost: Number(res?.totalCost ?? 0),
        grossProfit: Number(res?.grossProfit ?? 0),
        totalExpenses: Number(res?.totalExpenses ?? 0),
        netProfit: Number(res?.netProfit ?? 0),
        profitMargin: Number(res?.profitMargin ?? 0),
        topProducts: (res?.topProducts || []).map((p: any) => ({
          name: p.name || '---',
          revenue: Number(p.revenue ?? 0),
          cost: Number(p.cost ?? 0),
          profit: Number(p.profit ?? 0),
          margin: Number(p.margin ?? 0),
        })),
        monthlyData: (res?.monthlyData || []).map((m: any) => ({
          month: m.month || '---',
          revenue: Number(m.revenue ?? 0),
          expenses: Number(m.expenses ?? 0),
          profit: Number(m.profit ?? 0),
        })),
      });
    } catch { setData(null); } finally { setLoading(false); }
  }, [period, dateFrom, dateTo]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    let result = data.topProducts.filter(p =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'profit' ? a.profit : sortBy === 'revenue' ? a.revenue : sortBy === 'margin' ? a.margin : a.cost;
      const bVal = sortBy === 'profit' ? b.profit : sortBy === 'revenue' ? b.revenue : sortBy === 'margin' ? b.margin : b.cost;
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [data, debouncedSearch, sortBy, sortOrder]);

  const exportCSV = useCallback(() => {
    if (!data) return;
    const headers = ['Product', 'Revenue', 'Cost', 'Profit', 'Margin %'];
    const rows = filteredProducts.map(p => [p.name, p.revenue, p.cost, p.profit, p.margin]);
    const summary = ['', '', '', '', ''];
    const summaryRow = ['TOTAL', data.totalRevenue, data.totalCost, data.grossProfit, data.profitMargin];
    const csvContent = [headers, ...rows, summary, summaryRow].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'profits.csv';
    link.click();
  }, [data, filteredProducts]);

  const fmt = (n: number) => `${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م`;

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'إجمالي الإيرادات', value: fmt(data.totalRevenue), icon: DollarSign, color: 'bg-blue-50 text-blue-600', trend: 'up' as const },
      { label: 'تكلفة البضاعة', value: fmt(data.totalCost), icon: Package, color: 'bg-orange-50 text-orange-600', trend: 'down' as const },
      { label: 'إجمالي الربح', value: fmt(data.grossProfit), icon: TrendingUp, color: 'bg-green-50 text-green-600', trend: data.grossProfit >= 0 ? ('up' as const) : ('down' as const) },
      { label: 'المصروفات', value: fmt(data.totalExpenses), icon: Minus, color: 'bg-amber-50 text-amber-600', trend: 'down' as const },
      { label: 'صافي الربح', value: fmt(data.netProfit), icon: data.netProfit >= 0 ? TrendingUp : TrendingDown, color: data.netProfit >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700', trend: data.netProfit >= 0 ? ('up' as const) : ('down' as const) },
      { label: 'هامش الربح', value: `${data.profitMargin.toFixed(1)}%`, icon: Percent, color: 'bg-purple-50 text-purple-600', trend: data.profitMargin >= 0 ? ('up' as const) : ('down' as const) },
    ];
  }, [data]);

  const maxMonthlyProfit = useMemo(() => {
    if (!data || data.monthlyData.length === 0) return 1;
    return Math.max(...data.monthlyData.map(m => Math.abs(m.profit)), 1);
  }, [data]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <TrendingUp size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الأرباح</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">تحليل الأرباح والخسائر وحساب صافي الربح</p>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الفترة:</span>
          <select value={period} onChange={e => setPeriod(e.target.value as any)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="daily">يومي</option>
            <option value="weekly">أسبوعي</option>
            <option value="monthly">شهري</option>
            <option value="yearly">سنوي</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">من:</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">إلى:</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <button onClick={() => loadData()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
          <RefreshCw size={18} /> تحديث
        </button>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
          <Download size={18} /> تصدير CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <TrendingUp size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد بيانات أرباح حالياً</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
                <div className={`p-2 rounded-xl ${s.color}`}><s.icon size={20} /></div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-400 truncate">{s.label}</p>
                  <p className="text-sm font-black text-slate-900 truncate">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly Chart */}
          {data.monthlyData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 text-sm mb-4">الأرباح الشهرية</h2>
              <div className="flex items-end gap-2 h-48 overflow-x-auto">
                {data.monthlyData.map((m, i) => {
                  const heightPct = (Math.abs(m.profit) / maxMonthlyProfit) * 100;
                  const isPositive = m.profit >= 0;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 min-w-[60px] flex-1">
                      <div className="text-[10px] font-bold text-slate-500">{m.profit >= 0 ? '+' : ''}{m.profit.toLocaleString()}</div>
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t-lg ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}
                          style={{ height: `${Math.max(heightPct, 2)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">{m.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search + Sort for Products */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في المنتجات..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="profit">الربح</option>
              <option value="revenue">الإيراد</option>
              <option value="cost">التكلفة</option>
              <option value="margin">الهامش</option>
            </select>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
              {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {/* Top Products Table */}
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto touch-auto">
              <table className="w-full text-right border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold text-slate-500">المنتج</th>
                    <th className="p-4 text-xs font-semibold text-slate-500">الإيراد</th>
                    <th className="p-4 text-xs font-semibold text-slate-500">التكلفة</th>
                    <th className="p-4 text-xs font-semibold text-slate-500">الربح</th>
                    <th className="p-4 text-xs font-semibold text-slate-500">الهامش</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4"><div className="font-bold text-slate-900 text-sm">{p.name}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{fmt(p.revenue)}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{fmt(p.cost)}</div></td>
                      <td className="p-4"><div className={`font-bold text-sm ${p.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(p.profit)}</div></td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${p.margin >= 20 ? 'bg-green-50 text-green-700' : p.margin >= 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                          {p.margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Package size={28} className="mx-auto mb-2 text-slate-300" />
              <p className="text-slate-400 font-bold text-sm">لا توجد بيانات منتجات</p>
            </div>
          )}
        </>
      )}

      {/* Guide Modal */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل الأرباح</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">تحليل الأرباح والخسائر وحساب صافي الربح من جميع المصادر.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><TrendingUp size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• حساب إجمالي الأرباح والخسائر</li>
                  <li>• صافي الربح بعد المصروفات والضرائب</li>
                  <li>• هامش الربح لكل منتج وفئة</li>
                  <li>• مقارنة الأرباح بين الفترات</li>
                  <li>• تقارير الأرباح الشهرية والسنوية</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
