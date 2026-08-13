'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CreditCard, Search, Loader2, CheckCircle2, Clock, XCircle, X, Info, Target, BookOpen, Zap, Link2, ClipboardList, Download, RefreshCw, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Payment = {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  method: string;
  status: string;
  date: string;
};

const METHOD_LABELS: Record<string, string> = { cash: 'كاش', card: 'بطاقة', online: 'أونلاين', wallet: 'محفظة', cod: 'دفع عند الاستلام' };
const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  paid: { label: 'مدفوع', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle2 size={12} /> },
  pending: { label: 'قيد الانتظار', color: 'text-amber-600', bg: 'bg-amber-100', icon: <Clock size={12} /> },
  failed: { label: 'فشل', color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle size={12} /> },
  refunded: { label: 'مسترجع', color: 'text-blue-600', bg: 'bg-blue-100', icon: <CreditCard size={12} /> },
};

export default function SalesPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  
  // New state variables
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/orders/me');
      const orders = Array.isArray(data) ? data : (data?.orders || data?.data || []);
      setPayments(orders.map((o: any) => ({
        id: String(o.id),
        orderNumber: o.orderNumber || `#${o.id}`,
        customerName: o.customerName || o.customer?.name || '---',
        amount: Number(o.total || o.totalAmount || 0),
        method: o.paymentMethod || 'cod',
        status: o.paymentStatus || (o.isPaid ? 'paid' : 'pending'),
        date: o.createdAt || new Date().toISOString(),
      })));
    } catch { setPayments([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  // Get shop data for category-based customization
  const { shop } = useShop();
  const shopCategory = shop?.category?.toUpperCase() || 'RETAIL';
  const isRestaurant = shopCategory === 'RESTAURANT';
  const isRetail = shopCategory === 'RETAIL';


  const filteredAndSorted = useMemo(() => {
    let result = payments.filter(p =>
      p.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
      p.customerName.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    // Apply payment method filter
    if (filterMethod !== 'all') {
      result = result.filter(p => p.method === filterMethod);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      if (dateRange === 'today') {
        result = result.filter(p => {
          const d = new Date(p.date);
          return d.toDateString() === now.toDateString();
        });
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter(p => new Date(p.date) >= weekAgo);
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        result = result.filter(p => new Date(p.date) >= monthAgo);
      }
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [payments, debouncedSearch, filterMethod, filterStatus, dateRange, sortBy, sortOrder]);

  // Handler functions
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredAndSorted.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSorted.map(p => p.id)));
    }
  }, [selectedIds, filteredAndSorted]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const bulkMarkPaid = useCallback(async () => {
    if (selectedIds.size === 0) return;
    console.log('Marking as paid:', Array.from(selectedIds));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const bulkMarkFailed = useCallback(async () => {
    if (selectedIds.size === 0) return;
    console.log('Marking as failed:', Array.from(selectedIds));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const exportCSV = useCallback(() => {
    const headers = ['Order Number', 'Customer Name', 'Amount', 'Method', 'Status', 'Date'];
    const rows = filteredAndSorted.map(p => [
      p.orderNumber,
      p.customerName,
      p.amount,
      p.method,
      p.status,
      p.date
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'payments.csv';
    link.click();
  }, [filteredAndSorted]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterMethod, filterStatus, dateRange, sortBy, sortOrder, debouncedSearch]);

  const stats = useMemo(() => {
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    return [
      { label: 'إجمالي المدفوعات', value: payments.length, color: 'bg-blue-50 text-blue-600' },
      { label: 'المبلغ المدفوع', value: `ج.م ${totalPaid.toLocaleString()}`, color: 'bg-green-50 text-green-600' },
      { label: 'قيد الانتظار', value: `ج.م ${totalPending.toLocaleString()}`, color: 'bg-amber-50 text-amber-600' },
      { label: 'فشل', value: payments.filter(p => p.status === 'failed').length, color: 'bg-red-50 text-red-600' },
    ];
  }, [payments]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0"><CreditCard size={24} className="text-[#00E5FF]" /></div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">المدفوعات</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">
            {isRestaurant ? 'تتبع مدفوعات المطعم والفواتير' : 'تتبع جميع المدفوعات والمعاملات'}
          </p>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all"
        >
          <Download size={16} />
          تصدير CSV
        </button>
        <button
          onClick={loadPayments}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all"
        >
          <RefreshCw size={16} />
          تحديث
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
            <div className={`p-2 rounded-xl ${s.color}`}><CreditCard size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black text-slate-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث برقم الطلب أو العميل..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Advanced Filters Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-slate-400 mb-1.5">طريقة الدفع</label>
            <select
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">الكل</option>
              <option value="cash">كاش</option>
              <option value="card">بطاقة</option>
              <option value="online">أونلاين</option>
              <option value="wallet">محفظة</option>
              <option value="cod">دفع عند الاستلام</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-slate-400 mb-1.5">الحالة</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">الكل</option>
              <option value="paid">مدفوع</option>
              <option value="pending">قيد الانتظار</option>
              <option value="failed">فشل</option>
              <option value="refunded">مسترجع</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-slate-400 mb-1.5">الفترة</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">الكل</option>
              <option value="today">اليوم</option>
              <option value="week">أسبوع</option>
              <option value="month">شهر</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-bold text-slate-400 mb-1.5">ترتيب حسب</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="date">التاريخ</option>
              <option value="amount">المبلغ</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">الترتيب</label>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold hover:bg-slate-50 transition-all"
            >
              {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Section */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-bold text-blue-700">تم تحديد {selectedIds.size} دفعة</span>
          <button
            onClick={bulkMarkPaid}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all"
          >
            <Check size={16} />
            تحديد كمدفوع
          </button>
          <button
            onClick={bulkMarkFailed}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all"
          >
            <XCircle size={16} />
            تحديد كفاشل
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-all"
          >
            إلغاء التحديد
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center"><CreditCard size={48} className="mx-auto mb-3 text-slate-200" /><p className="text-slate-400 font-bold text-sm">لا توجد مدفوعات</p></div>
      ) : (
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
              <th className="p-4 font-bold text-slate-400">المبلغ</th>
              <th className="p-4 font-bold text-slate-400">طريقة الدفع</th>
              <th className="p-4 font-bold text-slate-400">الحالة</th>
            </tr></thead>
            <tbody>
              {paginatedData.map(p => {
                const st = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                return (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="p-4 font-bold text-slate-900">{p.orderNumber}</td>
                    <td className="p-4 font-medium text-slate-700">{p.customerName}</td>
                    <td className="p-4 font-bold text-slate-900">ج.م {p.amount.toLocaleString()}</td>
                    <td className="p-4 text-slate-500">{METHOD_LABELS[p.method] || p.method}</td>
                    <td className="p-4"><span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color} w-fit`}>{st.icon} {st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Section */}
      {filteredAndSorted.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            عرض {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} من {filteredAndSorted.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              السابق
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              التالي
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">عرض</label>
            <select
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <label className="text-sm text-slate-500">لكل صفحة</label>
          </div>
        </div>
      )}

      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل المدفوعات</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Target size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">تتبع ومتابعة جميع المدفوعات والمعاملات المالية في المتجر، مراجعة حالات الدفع (مدفوع، قيد الانتظار، فشل، مسترجع) وطرق الدفع المختلفة.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><BookOpen size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">متى تستخدمها</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">عند الحاجة لمراجعة المدفوعات، متابعة المبالغ المعلقة، أو التحقق من المعاملات الفاشلة.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><ClipboardList size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">ماذا ستجد داخلها</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إحصائيات (إجمالي المدفوعات، المبلغ المدفوع، قيد الانتظار، فشل)</li>
                  <li>• جدول بجميع المعاملات مع رقم الطلب والعميل</li>
                  <li>• بحث برقم الطلب أو اسم العميل</li>
                  <li>• حالات الدفع (مدفوع، قيد الانتظار، فشل، مسترجع)</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">كيفية العمل</h3></div>
                <ol className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>1. راجع الإحصائيات لفهم الصورة العامة</li>
                  <li>2. استخدم البحث للعثور على دفعة محددة</li>
                  <li>3. تابع حالة كل دفعة في الجدول</li>
                  <li>4. راجع المبالغ المعلقة والفاشلة للمتابعة</li>
                </ol>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Zap size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">أفضل الممارسات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• تابع المدفوعات المعلقة بانتظام لتسريعة تحصيلها</li>
                  <li>• راجع المعاملات الفاشلة لتحديد الأسباب</li>
                  <li>• طابق المدفوعات مع الطلبات للتأكد من التطابق</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Zap size={18} className="text-amber-500" /><h3 className="font-bold text-slate-900">نصائح</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• المبالغ المعلقة تحتاج متابعة سريعة</li>
                  <li>• استخدم البحث بالرقم للوصول المباشر للدفعة</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Link2 size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">روابط ذات صلة</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• الدفع الإلكتروني</li>
                  <li>• المبيعات</li>
                  <li>• حالة الطلب</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
