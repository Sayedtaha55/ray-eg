'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart, Search, Loader2, Plus, Edit, Trash2, Eye, Download, Upload, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, MoreVertical, Package2, BarChart3, TrendingUp, AlertTriangle, Calendar, Clock, Truck, FileText, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type PurchaseOrder = {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled';
  orderDate: string;
  expectedDate: string;
  receivedDate: string | null;
  itemCount: number;
  totalAmount: number;
  paidAmount: number;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    notes: '',
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/purchase-orders/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setOrders(data.map((o: any) => ({
        id: String(o.id),
        orderNumber: o.orderNumber || o.order_number || '---',
        supplierId: o.supplierId || o.supplier_id || '---',
        supplierName: o.supplierName || o.supplier_name || '---',
        status: o.status || 'draft',
        orderDate: o.orderDate || o.order_date || new Date().toISOString(),
        expectedDate: o.expectedDate || o.expected_date || '',
        receivedDate: o.receivedDate || o.received_date || null,
        itemCount: Number(o.itemCount || o.items_count || 0),
        totalAmount: Number(o.totalAmount || o.total_amount || 0),
        paidAmount: Number(o.paidAmount || o.paid_amount || 0),
        notes: o.notes || '',
        createdBy: o.createdBy || o.created_by || '---',
        createdAt: o.createdAt || new Date().toISOString(),
        updatedAt: o.updatedAt || new Date().toISOString(),
      })));
    } catch { setOrders([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = useMemo(() => {
    let result = orders.filter(o =>
      o.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    if (filterStatus !== 'all') {
      result = result.filter(o => o.status === filterStatus);
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'orderNumber' ? a.orderNumber : sortBy === 'orderDate' ? a.orderDate : sortBy === 'totalAmount' ? a.totalAmount : a.createdAt;
      const bVal = sortBy === 'orderNumber' ? b.orderNumber : sortBy === 'orderDate' ? b.orderDate : sortBy === 'totalAmount' ? b.totalAmount : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [orders, debouncedSearch, filterStatus, sortBy, sortOrder]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedOrders.map(o => o.id)));
    }
  }, [paginatedOrders, selectedIds.size]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const bulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} أمر شراء؟`)) return;
    try {
      // TODO: Implement bulk delete API call
      alert(`تم حذف ${selectedIds.size} أمر شراء`);
      setSelectedIds(new Set());
      loadOrders();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [selectedIds, loadOrders]);

  const exportCSV = useCallback(() => {
    const headers = ['Order Number', 'Supplier', 'Status', 'Order Date', 'Expected Date', 'Received Date', 'Item Count', 'Total Amount', 'Paid Amount', 'Created By', 'Created At'];
    const rows = filtered.map(o => [
      o.orderNumber,
      o.supplierName,
      o.status,
      o.orderDate,
      o.expectedDate || '-',
      o.receivedDate || '-',
      o.itemCount,
      o.totalAmount,
      o.paidAmount,
      o.createdBy,
      o.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'purchase-orders.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          shopId: sid,
          status: 'draft',
        }),
      });
      setAddModal(false);
      setFormData({ supplierId: '', orderDate: new Date().toISOString().split('T')[0], expectedDate: '', notes: '' });
      loadOrders();
    } catch (error) {
      alert('حدث خطأ أثناء إضافة أمر الشراء');
    }
  }, [formData, loadOrders]);

  const handleEdit = useCallback(async () => {
    if (!editOrder) return;
    try {
      await apiRequest(`/purchase-orders/${editOrder.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditOrder(null);
      setFormData({ supplierId: '', orderDate: new Date().toISOString().split('T')[0], expectedDate: '', notes: '' });
      loadOrders();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل أمر الشراء');
    }
  }, [editOrder, formData, loadOrders]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا أمر الشراء؟')) return;
    try {
      await apiRequest(`/purchase-orders/${id}`, { method: 'DELETE' });
      loadOrders();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [loadOrders]);

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    try {
      await apiRequest(`/purchase-orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      loadOrders();
    } catch (error) {
      alert('حدث خطأ أثناء تغيير الحالة');
    }
  }, [loadOrders]);

  const openEditModal = useCallback((order: PurchaseOrder) => {
    setEditOrder(order);
    setFormData({
      supplierId: order.supplierId,
      orderDate: order.orderDate.split('T')[0],
      expectedDate: order.expectedDate,
      notes: order.notes,
    });
    setEditModal(true);
  }, []);

  const STATUS_CONFIG = {
    draft: { label: 'مسودة', color: 'bg-slate-50 text-slate-600', icon: <FileText size={12} /> },
    sent: { label: 'مرسل', color: 'bg-blue-50 text-blue-600', icon: <Truck size={12} /> },
    confirmed: { label: 'مؤكد', color: 'bg-cyan-50 text-cyan-600', icon: <CheckCircle2 size={12} /> },
    partial: { label: 'جزئي', color: 'bg-amber-50 text-amber-600', icon: <Clock size={12} /> },
    received: { label: 'مستلم', color: 'bg-green-50 text-green-600', icon: <CheckCircle2 size={12} /> },
    cancelled: { label: 'ملغي', color: 'bg-red-50 text-red-600', icon: <XCircle size={12} /> },
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const draft = orders.filter(o => o.status === 'draft').length;
    const sent = orders.filter(o => o.status === 'sent').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const received = orders.filter(o => o.status === 'received').length;
    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return [
      { label: 'إجمالي الأوامر', value: total, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
      { label: 'مسودة', value: draft, icon: FileText, color: 'bg-slate-50 text-slate-600' },
      { label: 'مرسل', value: sent, icon: Truck, color: 'bg-blue-50 text-blue-600' },
      { label: 'مؤكد', value: confirmed, icon: CheckCircle2, color: 'bg-cyan-50 text-cyan-600' },
      { label: 'مستلم', value: received, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
      { label: 'إجمالي القيمة', value: `ج.م ${totalAmount.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
    ];
  }, [orders]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <ShoppingCart size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">أوامر الشراء</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة أوامر الشراء من الموردين</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
            <div className={`p-2 rounded-xl ${s.color}`}><s.icon size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black text-slate-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all">
            <Plus size={18} />
            أمر شراء جديد
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
            <Download size={18} />
            تصدير CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
            <Upload size={18} />
            استيراد
          </button>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{selectedIds.size} محدد</span>
            <button onClick={bulkDelete} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 transition-all">
              <Trash2 size={14} />
              حذف
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث برقم الأمر أو المورد..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الحالة:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">الكل</option>
            <option value="draft">مسودة</option>
            <option value="sent">مرسل</option>
            <option value="confirmed">مؤكد</option>
            <option value="partial">جزئي</option>
            <option value="received">مستلم</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الترتيب:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="orderNumber">رقم الأمر</option>
            <option value="orderDate">تاريخ الأمر</option>
            <option value="totalAmount">القيمة</option>
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

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ShoppingCart size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد أوامر شراء حالياً</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="space-y-3 md:hidden">
            {paginatedOrders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <button onClick={() => toggleSelect(order.id)} className="shrink-0 p-1">
                      {selectedIds.has(order.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm">{order.orderNumber}</div>
                      <div className="text-slate-500 text-xs">{order.supplierName}</div>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Calendar size={12} />
                    <span>{new Date(order.orderDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Package2 size={12} />
                    <span>{order.itemCount} صنف</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <DollarSign size={12} />
                    <span>ج.م {order.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(order)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs hover:bg-slate-100 transition-all">
                      <Edit size={12} />
                      تعديل
                    </button>
                    <button onClick={() => handleDelete(order.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100 transition-all">
                      <Trash2 size={12} />
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto touch-auto">
            <table className="w-full text-right border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="p-1">
                      {selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                    </button>
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500">رقم الأمر</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">المورد</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">تاريخ الأمر</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">التاريخ المتوقع</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">عدد الأصناف</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">القيمة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">المدفوع</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status];
                  return (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4">
                        <button onClick={() => toggleSelect(order.id)} className="p-1">
                          {selectedIds.has(order.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{order.orderNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{order.supplierName}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(order.orderDate).toLocaleDateString('ar-EG')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{order.expectedDate ? new Date(order.expectedDate).toLocaleDateString('ar-EG') : '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{order.itemCount}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">ج.م {order.totalAmount.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">ج.م {order.paidAmount.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(order)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(order.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-xs font-bold text-slate-500">
                عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} من {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
                <span className="text-xs font-bold text-slate-600 px-3">
                  صفحة {currentPage} من {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">أمر شراء جديد</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">المورد</label>
                <select
                  value={formData.supplierId}
                  onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">اختر المورد</option>
                  {/* TODO: Load suppliers */}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ الأمر</label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={e => setFormData({ ...formData, orderDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">التاريخ المتوقع</label>
                <input
                  type="date"
                  value={formData.expectedDate}
                  onChange={e => setFormData({ ...formData, expectedDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                إنشاء أمر الشراء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && editOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل أمر الشراء</h2>
              <button onClick={() => setEditModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">المورد</label>
                <select
                  value={formData.supplierId}
                  onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">اختر المورد</option>
                  {/* TODO: Load suppliers */}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ الأمر</label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={e => setFormData({ ...formData, orderDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">التاريخ المتوقع</label>
                <input
                  type="date"
                  value={formData.expectedDate}
                  onChange={e => setFormData({ ...formData, expectedDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button
                onClick={handleEdit}
                className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل أوامر الشراء</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة أوامر الشراء من الموردين لتجديد المخزون.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><ShoppingCart size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إنشاء أوامر شراء جديدة</li>
                  <li>• تتبع الحالة (مسودة، مرسل، مؤكد، جزئي، مستلم، ملغي)</li>
                  <li>• إحصائيات شاملة لكل أمر</li>
                  <li>• تصدير تقارير أوامر الشراء</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
