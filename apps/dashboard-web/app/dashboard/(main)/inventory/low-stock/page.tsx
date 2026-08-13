'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle, Search, Loader2, Plus, Edit, Trash2, Eye, Download, Upload, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, MoreVertical, Package2, BarChart3, TrendingUp, Calendar, Clock, ShoppingCart, RefreshCw, Bell, Zap } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type LowStockAlert = {
  id: string;
  productId: string;
  productName: string;
  productNameAr: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  category: string;
  supplier: string;
  lastRestockDate: string;
  status: 'critical' | 'low' | 'warning' | 'ok';
  createdAt: string;
  updatedAt: string;
};

export default function LowStockPage() {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('currentStock');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editModal, setEditModal] = useState(false);
  const [editAlert, setEditAlert] = useState<LowStockAlert | null>(null);
  const [formData, setFormData] = useState({
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    reorderQuantity: 0,
  });

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/inventory/low-stock/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setAlerts(data.map((a: any) => ({
        id: String(a.id),
        productId: a.productId || a.product_id || '---',
        productName: a.productName || a.product_name || '---',
        productNameAr: a.productNameAr || a.product_name_ar || '---',
        sku: a.sku || '---',
        currentStock: Number(a.currentStock || a.current_stock || 0),
        minStock: Number(a.minStock || a.min_stock || 0),
        maxStock: Number(a.maxStock || a.max_stock || 0),
        reorderPoint: Number(a.reorderPoint || a.reorder_point || 0),
        reorderQuantity: Number(a.reorderQuantity || a.reorder_quantity || 0),
        category: a.category || '---',
        supplier: a.supplier || '---',
        lastRestockDate: a.lastRestockDate || a.last_restock_date || new Date().toISOString(),
        status: a.status || 'warning',
        createdAt: a.createdAt || new Date().toISOString(),
        updatedAt: a.updatedAt || new Date().toISOString(),
      })));
    } catch { setAlerts([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const filtered = useMemo(() => {
    let result = alerts.filter(a =>
      a.productName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      a.productNameAr.includes(debouncedSearch) ||
      a.sku.includes(debouncedSearch)
    );

    if (filterStatus !== 'all') {
      result = result.filter(a => a.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      result = result.filter(a => a.category === filterCategory);
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'currentStock' ? a.currentStock : sortBy === 'productName' ? a.productName : a.createdAt;
      const bVal = sortBy === 'currentStock' ? b.currentStock : sortBy === 'productName' ? b.productName : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [alerts, debouncedSearch, filterStatus, filterCategory, sortBy, sortOrder]);

  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedAlerts.length && paginatedAlerts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedAlerts.map(a => a.id)));
    }
  }, [paginatedAlerts, selectedIds.size]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const bulkReorder = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      // TODO: Implement bulk reorder API call
      alert(`تم إنشاء أوامر إعادة طلب لـ ${selectedIds.size} منتج`);
      setSelectedIds(new Set());
    } catch (error) {
      alert('حدث خطأ أثناء إنشاء أوامر إعادة الطلب');
    }
  }, [selectedIds]);

  const exportCSV = useCallback(() => {
    const headers = ['Product Name', 'SKU', 'Current Stock', 'Min Stock', 'Max Stock', 'Reorder Point', 'Reorder Quantity', 'Category', 'Supplier', 'Status', 'Last Restock Date'];
    const rows = filtered.map(a => [
      a.productName,
      a.sku,
      a.currentStock,
      a.minStock,
      a.maxStock,
      a.reorderPoint,
      a.reorderQuantity,
      a.category,
      a.supplier,
      a.status,
      a.lastRestockDate
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'low-stock-alerts.csv';
    link.click();
  }, [filtered]);

  const handleEdit = useCallback(async () => {
    if (!editAlert) return;
    try {
      await apiRequest(`/inventory/low-stock/${editAlert.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditAlert(null);
      setFormData({ minStock: 0, maxStock: 0, reorderPoint: 0, reorderQuantity: 0 });
      loadAlerts();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل التنبيه');
    }
  }, [editAlert, formData, loadAlerts]);

  const handleReorder = useCallback(async (id: string) => {
    try {
      // TODO: Implement reorder API call
      alert('تم إنشاء أمر إعادة طلب');
    } catch (error) {
      alert('حدث خطأ أثناء إنشاء أمر إعادة الطلب');
    }
  }, []);

  const openEditModal = useCallback((alert: LowStockAlert) => {
    setEditAlert(alert);
    setFormData({
      minStock: alert.minStock,
      maxStock: alert.maxStock,
      reorderPoint: alert.reorderPoint,
      reorderQuantity: alert.reorderQuantity,
    });
    setEditModal(true);
  }, []);

  const STATUS_CONFIG = {
    critical: { label: 'حرج', color: 'bg-red-50 text-red-700', icon: <AlertTriangle size={12} /> },
    low: { label: 'منخفض', color: 'bg-orange-50 text-orange-700', icon: <Bell size={12} /> },
    warning: { label: 'تحذير', color: 'bg-amber-50 text-amber-600', icon: <Zap size={12} /> },
    ok: { label: 'موافق', color: 'bg-green-50 text-green-700', icon: <Check size={12} /> },
  };

  const categories = useMemo(() => {
    const cats = new Set(alerts.map(a => a.category));
    return Array.from(cats).filter(c => c !== '---');
  }, [alerts]);

  const stats = useMemo(() => {
    const total = alerts.length;
    const critical = alerts.filter(a => a.status === 'critical').length;
    const low = alerts.filter(a => a.status === 'low').length;
    const warning = alerts.filter(a => a.status === 'warning').length;
    const ok = alerts.filter(a => a.status === 'ok').length;
    return [
      { label: 'إجمالي التنبيهات', value: total, icon: AlertTriangle, color: 'bg-blue-50 text-blue-600' },
      { label: 'حرج', value: critical, icon: AlertTriangle, color: 'bg-red-50 text-red-700' },
      { label: 'منخفض', value: low, icon: Bell, color: 'bg-orange-50 text-orange-700' },
      { label: 'تحذير', value: warning, icon: Zap, color: 'bg-amber-50 text-amber-600' },
      { label: 'موافق', value: ok, icon: Check, color: 'bg-green-50 text-green-700' },
    ];
  }, [alerts]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <AlertTriangle size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">تنبيهات المخزون</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">تتبع المنتجات منخفضة المخزون</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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
          <button onClick={() => loadAlerts()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
            <RefreshCw size={18} />
            تحديث
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
            <Download size={18} />
            تصدير CSV
          </button>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{selectedIds.size} محدد</span>
            <button onClick={bulkReorder} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00E5FF] text-slate-900 font-bold text-xs hover:bg-[#00B8CC] transition-all">
              <ShoppingCart size={14} />
              إعادة طلب
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو SKU..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
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
            <option value="critical">حرج</option>
            <option value="low">منخفض</option>
            <option value="warning">تحذير</option>
            <option value="ok">موافق</option>
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
            <option value="currentStock">المخزون الحالي</option>
            <option value="productName">اسم المنتج</option>
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

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد تنبيهات حالياً</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="space-y-3 md:hidden">
            {paginatedAlerts.map((alert) => {
              const statusConfig = STATUS_CONFIG[alert.status];
              const stockPercentage = alert.maxStock > 0 ? (alert.currentStock / alert.maxStock) * 100 : 0;
              return (
                <div key={alert.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <button onClick={() => toggleSelect(alert.id)} className="shrink-0 p-1">
                      {selectedIds.has(alert.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm">{alert.productName}</div>
                      <div className="text-slate-500 text-xs">{alert.sku}</div>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">المخزون</span>
                      <span className={`font-bold ${alert.status === 'critical' ? 'text-red-600' : alert.status === 'low' ? 'text-orange-600' : 'text-slate-900'}`}>
                        {alert.currentStock} / {alert.maxStock}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          alert.status === 'critical' ? 'bg-red-500' : 
                          alert.status === 'low' ? 'bg-orange-500' : 
                          alert.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Package2 size={12} />
                    <span>إعادة طلب: {alert.reorderQuantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(alert)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs hover:bg-slate-100 transition-all">
                      <Edit size={12} />
                      تعديل
                    </button>
                    <button onClick={() => handleReorder(alert.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#00E5FF] text-slate-900 text-xs hover:bg-[#00B8CC] transition-all">
                      <ShoppingCart size={12} />
                      إعادة طلب
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
                      {selectedIds.size === paginatedAlerts.length && paginatedAlerts.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                    </button>
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500">المنتج</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">SKU</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الفئة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">المخزون الحالي</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحد الأدنى</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحد الأقصى</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">نقطة إعادة الطلب</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">كمية إعادة الطلب</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAlerts.map((alert) => {
                  const statusConfig = STATUS_CONFIG[alert.status];
                  const stockPercentage = alert.maxStock > 0 ? (alert.currentStock / alert.maxStock) * 100 : 0;
                  return (
                    <tr key={alert.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4">
                        <button onClick={() => toggleSelect(alert.id)} className="p-1">
                          {selectedIds.has(alert.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{alert.productName}</div>
                        <div className="text-slate-500 text-xs">{alert.productNameAr}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{alert.sku}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{alert.category}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{alert.currentStock}</div>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full transition-all ${
                              alert.status === 'critical' ? 'bg-red-500' : 
                              alert.status === 'low' ? 'bg-orange-500' : 
                              alert.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{alert.minStock}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{alert.maxStock}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{alert.reorderPoint}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{alert.reorderQuantity}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(alert)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleReorder(alert.id)} className="p-1.5 rounded-lg bg-[#00E5FF] text-slate-900 hover:bg-[#00B8CC] transition-all" title="إعادة طلب">
                            <ShoppingCart size={14} />
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

      {/* Edit Modal */}
      {editModal && editAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل إعدادات المخزون</h2>
              <button onClick={() => setEditModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحد الأدنى</label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحد الأقصى</label>
                <input
                  type="number"
                  value={formData.maxStock}
                  onChange={e => setFormData({ ...formData, maxStock: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">نقطة إعادة الطلب</label>
                <input
                  type="number"
                  value={formData.reorderPoint}
                  onChange={e => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">كمية إعادة الطلب</label>
                <input
                  type="number"
                  value={formData.reorderQuantity}
                  onChange={e => setFormData({ ...formData, reorderQuantity: Number(e.target.value) })}
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
              <h2 className="text-xl font-black text-slate-900">دليل تنبيهات المخزون</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">تتبع المنتجات منخفضة المخزون وإنشاء أوامر إعادة الطلب تلقائياً.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><AlertTriangle size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• تتبع المخزون الحالي للمنتجات</li>
                  <li>• إعدادات الحد الأدنى والأقصى</li>
                  <li>• نقاط إعادة الطلب التلقائية</li>
                  <li>• إنشاء أوامر إعادة الطلب بضغطة واحدة</li>
                  <li>• تصدير تقارير المخزون المنخفض</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
