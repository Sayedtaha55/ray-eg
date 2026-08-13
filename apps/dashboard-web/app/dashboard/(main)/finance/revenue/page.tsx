'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Search, Loader2, Download, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Info, Calendar, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type RevenueData = {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  growth: number;
  category: string;
};

export default function RevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadRevenue = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/revenue/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setRevenueData(data.map((r: any) => ({
        id: String(r.id),
        period: r.period || '---',
        startDate: r.startDate || r.start_date || new Date().toISOString(),
        endDate: r.endDate || r.end_date || new Date().toISOString(),
        totalRevenue: Number(r.totalRevenue || r.total_revenue || 0),
        totalOrders: Number(r.totalOrders || r.total_orders || 0),
        averageOrderValue: Number(r.averageOrderValue || r.average_order_value || 0),
        growth: Number(r.growth || 0),
        category: r.category || 'all',
      })));
    } catch { setRevenueData([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRevenue(); }, [loadRevenue]);

  const filtered = useMemo(() => {
    let result = revenueData;
    if (filterPeriod !== 'all') {
      result = result.filter(r => r.period === filterPeriod);
    }
    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'totalRevenue' ? a.totalRevenue : sortBy === 'startDate' ? a.startDate : a.growth;
      const bVal = sortBy === 'totalRevenue' ? b.totalRevenue : sortBy === 'startDate' ? b.startDate : b.growth;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [revenueData, filterPeriod, sortBy, sortOrder]);

  const exportCSV = useCallback(() => {
    const headers = ['Period', 'Start Date', 'End Date', 'Total Revenue', 'Total Orders', 'Average Order Value', 'Growth %'];
    const rows = filtered.map(r => [
      r.period,
      r.startDate,
      r.endDate,
      r.totalRevenue,
      r.totalOrders,
      r.averageOrderValue,
      r.growth
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'revenue.csv';
    link.click();
  }, [filtered]);

  const stats = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalOrders = revenueData.reduce((sum, r) => sum + r.totalOrders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgGrowth = revenueData.length > 0 ? revenueData.reduce((sum, r) => sum + r.growth, 0) / revenueData.length : 0;
    return [
      { label: 'إجمالي الإيرادات', value: `ج.م ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
      { label: 'إجمالي الطلبات', value: totalOrders.toLocaleString(), icon: BarChart3, color: 'bg-blue-50 text-blue-600' },
      { label: 'متوسط قيمة الطلب', value: `ج.م ${avgOrderValue.toLocaleString()}`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
      { label: 'متوسط النمو', value: `${avgGrowth.toFixed(1)}%`, icon: ArrowUpRight, color: avgGrowth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600' },
    ];
  }, [revenueData]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <TrendingUp size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الإيرادات</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">تتبع الإيرادات والنمو</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
            <div className={`p-2 rounded-xl ${s.color}`}><s.icon size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black text-slate-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
          <Download size={18} />
          تصدير CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الفترة:</span>
          <select
            value={filterPeriod}
            onChange={e => setFilterPeriod(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">الكل</option>
            <option value="daily">يومي</option>
            <option value="weekly">أسبوعي</option>
            <option value="monthly">شهري</option>
            <option value="yearly">سنوي</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الترتيب:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="startDate">التاريخ</option>
            <option value="totalRevenue">الإيرادات</option>
            <option value="growth">النمو</option>
          </select>
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
        >
          {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Revenue List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <TrendingUp size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد بيانات إيرادات</p>
        </div>
      ) : (
        <div className="hidden md:block overflow-x-auto touch-auto">
          <table className="w-full text-right border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-500">الفترة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">تاريخ البدء</th>
                <th className="p-4 text-xs font-semibold text-slate-500">تاريخ النهاية</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الإيرادات</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الطلبات</th>
                <th className="p-4 text-xs font-semibold text-slate-500">متوسط الطلب</th>
                <th className="p-4 text-xs font-semibold text-slate-500">النمو</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((revenue) => (
                <tr key={revenue.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-4">
                    <div className="text-slate-600 text-sm">{revenue.period}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-600 text-sm flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(revenue.startDate).toLocaleDateString('ar-EG')}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-600 text-sm">{new Date(revenue.endDate).toLocaleDateString('ar-EG')}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">ج.م {revenue.totalRevenue.toLocaleString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">{revenue.totalOrders}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">ج.م {revenue.averageOrderValue.toLocaleString()}</div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center gap-1 text-sm font-bold ${revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {revenue.growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {revenue.growth.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Guide Modal */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل الإيرادات</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">تتبع الإيرادات والنمو المالي للمتجر.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><TrendingUp size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• عرض الإيرادات حسب الفترة (يومي، أسبوعي، شهري، سنوي)</li>
                  <li>• تتبع النمو المالي</li>
                  <li>• إحصائيات شاملة للإيرادات</li>
                  <li>• تصدير تقارير الإيرادات</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
