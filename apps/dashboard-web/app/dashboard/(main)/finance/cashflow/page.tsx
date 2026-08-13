'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowRightLeft, ArrowRight, Search, Loader2, Download, Filter, ChevronUp, ChevronDown, Info, Calendar, DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, BarChart3, X } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Cashflow = {
  id: string;
  date: string;
  type: 'inflow' | 'outflow';
  category: string;
  description: string;
  amount: number;
  balance: number;
  reference: string;
  createdAt: string;
};

export default function CashflowPage() {
  const [cashflow, setCashflow] = useState<Cashflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadCashflow = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/cashflow/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setCashflow(data.map((c: any) => ({
        id: String(c.id),
        date: c.date || new Date().toISOString(),
        type: c.type || 'inflow',
        category: c.category || '---',
        description: c.description || '---',
        amount: Number(c.amount || 0),
        balance: Number(c.balance || 0),
        reference: c.reference || '---',
        createdAt: c.createdAt || new Date().toISOString(),
      })));
    } catch { setCashflow([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCashflow(); }, [loadCashflow]);

  const filtered = useMemo(() => {
    let result = cashflow.filter(c =>
      c.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.reference.includes(debouncedSearch)
    );

    if (filterType !== 'all') {
      result = result.filter(c => c.type === filterType);
    }

    if (filterCategory !== 'all') {
      result = result.filter(c => c.category === filterCategory);
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'date' ? a.date : sortBy === 'amount' ? a.amount : a.createdAt;
      const bVal = sortBy === 'date' ? b.date : sortBy === 'amount' ? b.amount : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [cashflow, debouncedSearch, filterType, filterCategory, sortBy, sortOrder]);

  const paginatedCashflow = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const exportCSV = useCallback(() => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Balance', 'Reference', 'Created At'];
    const rows = filtered.map(c => [
      c.date,
      c.type,
      c.category,
      c.description,
      c.amount,
      c.balance,
      c.reference,
      c.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cashflow.csv';
    link.click();
  }, [filtered]);

  const stats = useMemo(() => {
    const totalInflow = cashflow.filter(c => c.type === 'inflow').reduce((sum, c) => sum + c.amount, 0);
    const totalOutflow = cashflow.filter(c => c.type === 'outflow').reduce((sum, c) => sum + c.amount, 0);
    const netCashflow = totalInflow - totalOutflow;
    const currentBalance = cashflow.length > 0 ? cashflow[cashflow.length - 1].balance : 0;
    return [
      { label: 'إجمالي الداخل', value: `ج.م ${totalInflow.toLocaleString()}`, icon: ArrowRightLeft, color: 'bg-green-50 text-green-600' },
      { label: 'إجمالي الخارج', value: `ج.م ${totalOutflow.toLocaleString()}`, icon: ArrowRight, color: 'bg-red-50 text-red-600' },
      { label: 'صافي التدفق', value: `ج.م ${netCashflow.toLocaleString()}`, icon: TrendingUp, color: netCashflow >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600' },
      { label: 'الرصيد الحالي', value: `ج.م ${currentBalance.toLocaleString()}`, icon: Wallet, color: 'bg-blue-50 text-blue-600' },
    ];
  }, [cashflow]);

  const categories = useMemo(() => {
    const cats = new Set(cashflow.map(c => c.category));
    return Array.from(cats).filter(c => c !== '---');
  }, [cashflow]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <ArrowRightLeft size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">التدفق النقدي</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">تتبع التدفق النقدي للمتجر</p>
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالوصف أو المرجع..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">النوع:</span>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">الكل</option>
            <option value="inflow">داخل</option>
            <option value="outflow">خارج</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الفئة:</span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">الكل</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الترتيب:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="date">التاريخ</option>
            <option value="amount">القيمة</option>
            <option value="createdAt">تاريخ الإنشاء</option>
          </select>
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
        >
          {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Cashflow List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ArrowRightLeft size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد بيانات تدفق نقدي</p>
        </div>
      ) : (
        <div className="hidden md:block overflow-x-auto touch-auto">
          <table className="w-full text-right border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-500">التاريخ</th>
                <th className="p-4 text-xs font-semibold text-slate-500">النوع</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الفئة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الوصف</th>
                <th className="p-4 text-xs font-semibold text-slate-500">القيمة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الرصيد</th>
                <th className="p-4 text-xs font-semibold text-slate-500">المرجع</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCashflow.map((cf) => (
                <tr key={cf.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-4">
                    <div className="text-slate-600 text-sm flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(cf.date).toLocaleDateString('ar-EG')}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${cf.type === 'inflow' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {cf.type === 'inflow' ? 'داخل' : 'خارج'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-600 text-sm">{cf.category}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-600 text-sm max-w-xs truncate">{cf.description}</div>
                  </td>
                  <td className="p-4">
                    <div className={`font-bold text-sm ${cf.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                      {cf.type === 'inflow' ? '+' : '-'}ج.م {cf.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">ج.م {cf.balance.toLocaleString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-600 text-sm">{cf.reference}</div>
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
              <h2 className="text-xl font-black text-slate-900">دليل التدفق النقدي</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">تتبع التدفق النقدي للمتجر (داخل وخارج).</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><ArrowRightLeft size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• عرض التدفق النقدي حسب الفترة</li>
                  <li>• تتبع الداخل والخارج</li>
                  <li>• إحصائيات شاملة للتدفق</li>
                  <li>• تصدير تقارير التدفق النقدي</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
