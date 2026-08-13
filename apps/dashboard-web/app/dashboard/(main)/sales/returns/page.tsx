'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, Search, Loader2, Eye, X, Info, Target, BookOpen, CheckCircle2, Zap, Link2, ClipboardList, Download, RefreshCw, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type ReturnItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  items: number;
  total: number;
  status: string;
  reason?: string;
  date: string;
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'قيد المراجعة', color: 'text-amber-600', bg: 'bg-amber-100' },
  approved: { label: 'موافق عليه', color: 'text-green-600', bg: 'bg-green-100' },
  rejected: { label: 'مرفوض', color: 'text-red-600', bg: 'bg-red-100' },
  refunded: { label: 'تم الاسترجاع', color: 'text-blue-600', bg: 'bg-blue-100' },
  cancelled: { label: 'ملغي', color: 'text-slate-600', bg: 'bg-slate-100' },
};

export default function SalesReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [selected, setSelected] = useState<ReturnItem | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  
  // New state variables
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadReturns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/orders/me');
      const orders = Array.isArray(data) ? data : (data?.orders || data?.data || []);
      setReturns(orders.filter((o: any) => {
        const s = String(o.status || '').toUpperCase();
        return s === 'REFUNDED' || s === 'CANCELLED' || s === 'RETURNED';
      }).map((o: any) => ({
        id: String(o.id),
        orderNumber: o.orderNumber || `#${o.id}`,
        customerName: o.customerName || o.customer?.name || '---',
        items: o.items?.length || 0,
        total: Number(o.total || o.totalAmount || 0),
        status: String(o.status || '').toLowerCase(),
        reason: o.cancelReason || o.returnReason || '',
        date: o.createdAt || new Date().toISOString(),
      })));
    } catch { setReturns([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadReturns(); }, [loadReturns]);

  // Get shop data for category-based customization
  const { shop } = useShop();
  const shopCategory = shop?.category?.toUpperCase() || 'RETAIL';
  const isRestaurant = shopCategory === 'RESTAURANT';
  const isRetail = shopCategory === 'RETAIL';


  // Handler functions
  const filtered = useMemo(() => {
    let result = returns.filter(r =>
      r.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
      r.customerName.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(r => r.status === filterStatus);
    }

    // Date range filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (dateRange === 'today') {
      result = result.filter(r => new Date(r.date) >= today);
    } else if (dateRange === 'week') {
      result = result.filter(r => new Date(r.date) >= weekAgo);
    } else if (dateRange === 'month') {
      result = result.filter(r => new Date(r.date) >= monthAgo);
    }

    // Sorting
    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'total') {
        comparison = a.total - b.total;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [returns, debouncedSearch, filterStatus, dateRange, sortBy, sortOrder]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(r => r.id)));
    }
  }, [selectedIds, filtered]);

  const toggleSelect = useCallback((id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  }, [selectedIds]);

  const bulkApprove = useCallback(() => {
    setReturns(prev => prev.map(r => 
      selectedIds.has(r.id) ? { ...r, status: 'approved' } : r
    ));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const bulkReject = useCallback(() => {
    setReturns(prev => prev.map(r => 
      selectedIds.has(r.id) ? { ...r, status: 'rejected' } : r
    ));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const exportCSV = useCallback(() => {
    const headers = ['Order Number', 'Customer Name', 'Items', 'Total', 'Status', 'Date', 'Reason'];
    const rows = filtered.map(r => [
      r.orderNumber,
      r.customerName,
      r.items,
      r.total,
      r.status,
      new Date(r.date).toLocaleDateString('ar-EG'),
      r.reason || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `returns-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filtered]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, dateRange, sortBy, sortOrder, debouncedSearch]);

  const stats = useMemo(() => {
    const totalRefunded = returns.filter(r => r.status === 'refunded').reduce((s, r) => s + r.total, 0);
    return [
    { label: 'إجمالي المرتجعات', value: returns.length, color: 'bg-blue-50 text-blue-600' },
    { label: 'قيد المراجعة', value: returns.filter(r => r.status === 'pending').length, color: 'bg-amber-50 text-amber-600' },
    { label: 'تم الاسترجاع', value: returns.filter(r => r.status === 'refunded').length, color: 'bg-green-50 text-green-600' },
    { label: 'المبلغ المسترجع', value: `ج.م ${totalRefunded.toLocaleString()}`, color: 'bg-red-50 text-red-600' },
    ];
  }, [returns]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0"><RotateCcw size={24} className="text-[#00E5FF]" /></div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">المرتجعات</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">
            {isRestaurant ? 'إدارة إرجاع الطلبات والفواتير' : 'إدارة طلبات الإرجاع والاسترداد'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
            <div className={`p-2 rounded-xl ${s.color}`}><RotateCcw size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black text-slate-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث برقم الطلب أو العميل..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Quick Actions Section */}
      <div className="flex items-center gap-3">
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all">
          <Download size={16} />
          تصدير CSV
        </button>
        <button onClick={loadReturns} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
          <RefreshCw size={16} />
          تحديث
        </button>
      </div>

      {/* Advanced Filters Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">الحالة:</label>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">الكل</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">موافق عليه</option>
              <option value="rejected">مرفوض</option>
              <option value="refunded">تم الاسترجاع</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">التاريخ:</label>
            <select 
              value={dateRange} 
              onChange={e => setDateRange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">الكل</option>
              <option value="today">اليوم</option>
              <option value="week">آخر أسبوع</option>
              <option value="month">آخر شهر</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">ترتيب حسب:</label>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="date">التاريخ</option>
              <option value="total">الإجمالي</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button 
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-all"
          >
            {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
          </button>
        </div>
      </div>

      {/* Bulk Actions Section */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-slate-900 text-white rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Check size={20} />
            <span className="text-sm font-bold">تم تحديد {selectedIds.size} عنصر</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={bulkApprove} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all">
              <CheckCircle2 size={16} />
              موافقة على الكل
            </button>
            <button onClick={bulkReject} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all">
              <X size={16} />
              رفض الكل
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center"><RotateCcw size={48} className="mx-auto mb-3 text-slate-200" /><p className="text-slate-400 font-bold text-sm">لا توجد مرتجعات</p></div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-right border-b border-slate-100">
                <th className="p-4 font-bold text-slate-400 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                </th>
                <th className="p-4 font-bold text-slate-400">رقم الطلب</th>
                <th className="p-4 font-bold text-slate-400">العميل</th>
                <th className="p-4 font-bold text-slate-400">العناصر</th>
                <th className="p-4 font-bold text-slate-400">الإجمالي</th>
                <th className="p-4 font-bold text-slate-400">الحالة</th>
                <th className="p-4 font-bold text-slate-400">التاريخ</th>
                <th className="p-4 font-bold text-slate-400"></th>
              </tr></thead>
              <tbody>
                {paginatedData.map(r => {
                  const st = STATUS_STYLES[r.status] || { label: r.status, color: 'text-slate-600', bg: 'bg-slate-100' };
                  return (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleSelect(r.id)}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                      </td>
                      <td className="p-4 font-bold text-slate-900">{r.orderNumber}</td>
                      <td className="p-4 font-medium text-slate-700">{r.customerName}</td>
                      <td className="p-4 text-slate-500">{r.items}</td>
                      <td className="p-4 font-bold text-slate-900">ج.م {r.total.toLocaleString()}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{st.label}</span></td>
                      <td className="p-4 text-slate-500">{new Date(r.date).toLocaleDateString('ar-EG')}</td>
                      <td className="p-4"><Eye size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setSelected(r)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm text-slate-500">
                عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} من {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  السابق
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page 
                        ? 'bg-slate-900 text-white' 
                        : 'border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تفاصيل المرتجع</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-right">
              <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs font-semibold text-slate-500">رقم الطلب</div><div className="mt-1 font-bold text-slate-900 text-sm">{selected.orderNumber}</div></div>
              <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs font-semibold text-slate-500">العميل</div><div className="mt-1 font-bold text-slate-900 text-sm">{selected.customerName}</div></div>
              <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs font-semibold text-slate-500">الإجمالي</div><div className="mt-1 font-bold text-slate-900 text-sm">ج.م {selected.total.toLocaleString()}</div></div>
              {selected.reason && <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs font-semibold text-slate-500">السبب</div><div className="mt-1 text-sm text-slate-700">{selected.reason}</div></div>}
              <div className="bg-slate-50 rounded-lg p-3"><div className="text-xs font-semibold text-slate-500">التاريخ</div><div className="mt-1 font-bold text-slate-900 text-sm">{new Date(selected.date).toLocaleString('ar-EG')}</div></div>
            </div>
          </div>
        </div>
      )}

      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل المرتجعات</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Target size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة ومتابعة طلبات إرجاع المنتجات والاسترداد المالي للعملاء، مع تتبع حالة كل طلب من التقديم حتى اكتمال الاسترجاع.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><BookOpen size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">متى تستخدمها</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">عند الحاجة لمراجعة طلبات الإرجاع من العملاء، الموافقة أو رفضها، ومتابعة المبالغ المسترجعة.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><ClipboardList size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">ماذا ستجد داخلها</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إحصائيات المرتجعات (الإجمالي، قيد المراجعة، تم الاسترجاع، المبلغ المسترجع)</li>
                  <li>• جدول بجميع طلبات الإرجاع مع رقم الطلب والعميل والحالة</li>
                  <li>• بحث وفلترة حسب رقم الطلب أو اسم العميل</li>
                  <li>• نافذة تفاصيل لكل مرتجع تعرض السبب والتاريخ</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">كيفية العمل</h3></div>
                <ol className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>1. راجع قائمة المرتجعات في الجدول</li>
                  <li>2. استخدم البحث للعثور على طلب محدد</li>
                  <li>3. اضغط على أيقونة العين لعرض تفاصيل المرتجع</li>
                  <li>4. تابع حالة كل طلب (قيد المراجعة، موافق عليه، مرفوض، تم الاسترجاع)</li>
                </ol>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Zap size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">أفضل الممارسات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• راجع المرتجعات بانتظام لتجنب تأخر الرد على العملاء</li>
                  <li>• وثّق أسباب الإرجاع بدقة لتحسين جودة المنتجات</li>
                  <li>• تابع المبالغ المسترجعة للتأكد من تطابقها مع الطلبات</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Zap size={18} className="text-amber-500" /><h3 className="font-bold text-slate-900">نصائح</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• استخدم البحث للوصول السريع لطلب محدد</li>
                  <li>• راجع الإحصائيات أولاً لفهم الصورة العامة</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Link2 size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">روابط ذات صلة</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• حالة الطلب</li>
                  <li>• المدفوعات</li>
                  <li>• المبيعات</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
