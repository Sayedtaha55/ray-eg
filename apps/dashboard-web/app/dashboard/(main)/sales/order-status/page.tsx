'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClipboardList, Search, Loader2, Package, Truck, CheckCircle2, Clock, XCircle, X, Info, Target, BookOpen, Zap, Link2, Download, RefreshCw, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useShop } from '@/hooks/useShop';

type OrderStatusItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  items: number;
  total: number;
  date: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'قيد الانتظار', color: 'text-amber-600', bg: 'bg-amber-100', icon: <Clock size={12} /> },
  confirmed: { label: 'مؤكد', color: 'text-blue-600', bg: 'bg-blue-100', icon: <CheckCircle2 size={12} /> },
  processing: { label: 'قيد المعالجة', color: 'text-purple-600', bg: 'bg-purple-100', icon: <Package size={12} /> },
  shipped: { label: 'تم الشحن', color: 'text-indigo-600', bg: 'bg-indigo-100', icon: <Truck size={12} /> },
  delivered: { label: 'تم التوصيل', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle2 size={12} /> },
  cancelled: { label: 'ملغي', color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle size={12} /> },
  returned: { label: 'مرتجع', color: 'text-orange-600', bg: 'bg-orange-100', icon: <ClipboardList size={12} /> },
};

export default function SalesOrderStatusPage() {
  const [orders, setOrders] = useState<OrderStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filterStatus, setFilterStatus] = useState('all');
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/orders/me');
      const list = Array.isArray(data) ? data : (data?.orders || data?.data || []);
      setOrders(list.map((o: any) => ({
        id: String(o.id),
        orderNumber: o.orderNumber || `#${o.id}`,
        customerName: o.customerName || o.customer?.name || '---',
        status: String(o.status || o.orderStatus || 'pending').toLowerCase(),
        items: o.items?.length || 0,
        total: Number(o.total || o.totalAmount || 0),
        date: o.createdAt || new Date().toISOString(),
      })));
    } catch { setOrders([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Get shop data for category-based customization
  const { shop } = useShop();
  const shopCategory = shop?.category?.toUpperCase() || 'RETAIL';
  const isRestaurant = shopCategory === 'RESTAURANT';
  const isRetail = shopCategory === 'RETAIL';


  const filtered = useMemo(() => orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) || o.customerName.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  }), [orders, debouncedSearch, filterStatus]);

  const filteredAndSorted = useMemo(() => {
    let result = [...filtered];

    // Apply date range filter
    const now = new Date();
    if (dateRange === 'today') {
      result = result.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.toDateString() === now.toDateString();
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(o => new Date(o.date) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(o => new Date(o.date) >= monthAgo);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'total') {
        comparison = a.total - b.total;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [filtered, dateRange, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map(o => o.id)));
    }
  }, [selectedIds, paginatedData]);

  const toggleSelect = useCallback((id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  }, [selectedIds]);

  const exportCSV = useCallback(() => {
    const headers = ['Order Number', 'Customer Name', 'Status', 'Items', 'Total', 'Date'];
    const rows = filteredAndSorted.map(o => [
      o.orderNumber,
      o.customerName,
      o.status,
      o.items,
      o.total,
      new Date(o.date).toLocaleDateString('ar-EG')
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'orders.csv';
    link.click();
  }, [filteredAndSorted]);

  useEffect(() => { setCurrentPage(1); }, [dateRange, sortBy, sortOrder, filterStatus, debouncedSearch]);

  const statusCounts = useMemo(() => Object.keys(STATUS_CONFIG).map(key => ({ key, count: orders.filter(o => o.status === key).length, ...STATUS_CONFIG[key] })), [orders]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0"><ClipboardList size={24} className="text-[#00E5FF]" /></div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">حالات الطلب</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">تتبع حالة جميع الطلبات</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all">
          <Download size={16} />
          <span>تصدير CSV</span>
        </button>
        <button onClick={loadOrders} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
          <RefreshCw size={16} />
          <span>تحديث</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {statusCounts.map(s => (
          <button key={s.key} onClick={() => setFilterStatus(filterStatus === s.key ? 'all' : s.key)} className={`p-3 rounded-xl border text-center transition-all ${filterStatus === s.key ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
            <div className={`flex items-center justify-center gap-1 mb-1 ${s.color}`}>{s.icon}<span className="text-xs font-bold">{s.label}</span></div>
            <p className="text-lg font-black text-slate-900">{s.count}</p>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث برقم الطلب أو العميل..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-slate-600">نطاق التاريخ:</label>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="all">الكل</option>
            <option value="today">اليوم</option>
            <option value="week">الأسبوع</option>
            <option value="month">الشهر</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-slate-600">ترتيب حسب:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="date">التاريخ</option>
            <option value="total">الإجمالي</option>
          </select>
        </div>
        <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-all">
          {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>{sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center"><ClipboardList size={48} className="mx-auto mb-3 text-slate-200" /><p className="text-slate-400 font-bold text-sm">لا توجد طلبات</p></div>
      ) : (
        <>
          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-sm font-bold text-slate-700">تم تحديد {selectedIds.size} طلب</span>
              <div className="flex items-center gap-2">
                <select value={bulkUpdateStatus} onChange={e => setBulkUpdateStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
                  <option value="">تحديث الحالة...</option>
                  {Object.keys(STATUS_CONFIG).map(key => (
                    <option key={key} value={key}>{STATUS_CONFIG[key].label}</option>
                  ))}
                </select>
                <button onClick={() => {
                  // Handle bulk status update
                  console.log('Bulk update status:', bulkUpdateStatus, 'for orders:', Array.from(selectedIds));
                  setBulkUpdateStatus('');
                  setSelectedIds(new Set());
                }} disabled={!bulkUpdateStatus} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  تحديث
                </button>
              </div>
              <button onClick={() => setSelectedIds(new Set())} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-all">
                إلغاء التحديد
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-right border-b border-slate-100">
                <th className="p-4 font-bold text-slate-400 w-10">
                  <input type="checkbox" checked={selectedIds.size === paginatedData.length && paginatedData.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-slate-300" />
                </th>
                <th className="p-4 font-bold text-slate-400">رقم الطلب</th>
                <th className="p-4 font-bold text-slate-400">العميل</th>
                <th className="p-4 font-bold text-slate-400">العناصر</th>
                <th className="p-4 font-bold text-slate-400">الإجمالي</th>
                <th className="p-4 font-bold text-slate-400">الحالة</th>
                <th className="p-4 font-bold text-slate-400">التاريخ</th>
              </tr></thead>
              <tbody>
                {paginatedData.map(o => {
                  const st = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={o.id} className={`border-b border-slate-50 hover:bg-slate-50/50 ${selectedIds.has(o.id) ? 'bg-slate-50' : ''}`}>
                      <td className="p-4">
                        <input type="checkbox" checked={selectedIds.has(o.id)} onChange={() => toggleSelect(o.id)} className="w-4 h-4 rounded border-slate-300" />
                      </td>
                      <td className="p-4 font-bold text-slate-900">{o.orderNumber}</td>
                      <td className="p-4 font-medium text-slate-700">{o.customerName}</td>
                      <td className="p-4 text-slate-500">{o.items}</td>
                      <td className="p-4 font-bold text-slate-900">ج.م {o.total.toLocaleString()}</td>
                      <td className="p-4"><span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color} w-fit`}>{st.icon} {st.label}</span></td>
                      <td className="p-4 text-slate-500">{new Date(o.date).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-600">عرض</span>
              <select value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm font-bold text-slate-600">لكل صفحة</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                السابق
              </button>
              <span className="text-sm font-bold text-slate-700">
                صفحة {currentPage} من {totalPages}
              </span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                التالي
              </button>
            </div>
          </div>
        </>
      )}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل حالات الطلب</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Target size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">تتبع ومتابعة حالة جميع الطلبات في المتجر، من قيد الانتظار حتى التوصيل أو الإلغاء، مع إمكانية الفلترة حسب الحالة.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><BookOpen size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">متى تستخدمها</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">عند الحاجة لمراجعة حالة الطلبات، متابعة الطلبات المعلقة، أو فلترة الطلبات حسب حالة معينة.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><ClipboardList size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">ماذا ستجد داخلها</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• بطاقات الحالات (قيد الانتظار، مؤكد، قيد المعالجة، تم الشحن، تم التوصيل، ملغي، مرتجع)</li>
                  <li>• بحث برقم الطلب أو اسم العميل</li>
                  <li>• فلترة بالضغط على بطاقة الحالة</li>
                  <li>• جدول بجميع الطلبات مع التفاصيل</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">كيفية العمل</h3></div>
                <ol className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>1. راجع بطاقات الحالات لفهم توزيع الطلبات</li>
                  <li>2. اضغط على بطاقة حالة لفلترة الطلبات</li>
                  <li>3. استخدم البحث للعثور على طلب محدد</li>
                  <li>4. تابع حالة كل طلب في الجدول</li>
                </ol>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Zap size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">أفضل الممارسات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• تابع الطلبات المعلقة بانتظام لتجنب تأخر المعالجة</li>
                  <li>• استخدم الفلترة للتركيز على حالة معينة</li>
                  <li>• راجع الطلبات الملغية لفهم أسباب الإلغاء</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Zap size={18} className="text-amber-500" /><h3 className="font-bold text-slate-900">نصائح</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• الطلبات قيد الانتظار تحتاج متابعة سريعة</li>
                  <li>• استخدم البحث بالرقم للوصول المباشر للطلب</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Link2 size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">روابط ذات صلة</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• المبيعات</li>
                  <li>• المدفوعات</li>
                  <li>• المرتجعات</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
