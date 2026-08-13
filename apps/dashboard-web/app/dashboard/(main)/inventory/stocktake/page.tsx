'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClipboardCheck, Search, Loader2, Plus, Edit, Trash2, Eye, Download, Upload, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, MoreVertical, Package2, BarChart3, TrendingUp, AlertTriangle, Calendar, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Stocktake = {
  id: string;
  name: string;
  reference: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string | null;
  location: string;
  notes: string;
  itemCount: number;
  discrepancyCount: number;
  totalValue: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export default function StocktakePage() {
  const [stocktakes, setStocktakes] = useState<Stocktake[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editStocktake, setEditStocktake] = useState<Stocktake | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    location: '',
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const loadStocktakes = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/stocktakes/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setStocktakes(data.map((s: any) => ({
        id: String(s.id),
        name: s.name || '---',
        reference: s.reference || '---',
        status: s.status || 'draft',
        startDate: s.startDate || new Date().toISOString(),
        endDate: s.endDate || null,
        location: s.location || '---',
        notes: s.notes || '',
        itemCount: Number(s.itemCount || s.items_count || 0),
        discrepancyCount: Number(s.discrepancyCount || s.discrepancy_count || 0),
        totalValue: Number(s.totalValue || s.total_value || 0),
        createdBy: s.createdBy || s.created_by || '---',
        createdAt: s.createdAt || new Date().toISOString(),
        updatedAt: s.updatedAt || new Date().toISOString(),
      })));
    } catch { setStocktakes([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadStocktakes(); }, [loadStocktakes]);

  const filtered = useMemo(() => {
    let result = stocktakes.filter(s =>
      s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.reference.includes(debouncedSearch) ||
      s.location.includes(debouncedSearch)
    );

    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus);
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : sortBy === 'createdAt' ? a.createdAt : a.startDate;
      const bVal = sortBy === 'name' ? b.name : sortBy === 'createdAt' ? b.createdAt : b.startDate;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return result;
  }, [stocktakes, debouncedSearch, filterStatus, sortBy, sortOrder]);

  const paginatedStocktakes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedStocktakes.length && paginatedStocktakes.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedStocktakes.map(s => s.id)));
    }
  }, [paginatedStocktakes, selectedIds.size]);

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
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} جرد؟`)) return;
    try {
      // TODO: Implement bulk delete API call
      alert(`تم حذف ${selectedIds.size} جرد`);
      setSelectedIds(new Set());
      loadStocktakes();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [selectedIds, loadStocktakes]);

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Reference', 'Status', 'Start Date', 'End Date', 'Location', 'Item Count', 'Discrepancy Count', 'Total Value', 'Created By', 'Created At'];
    const rows = filtered.map(s => [
      s.name,
      s.reference,
      s.status,
      s.startDate,
      s.endDate || '-',
      s.location,
      s.itemCount,
      s.discrepancyCount,
      s.totalValue,
      s.createdBy,
      s.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'stocktakes.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/stocktakes', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          shopId: sid,
          status: 'draft',
        }),
      });
      setAddModal(false);
      setFormData({ name: '', reference: '', location: '', notes: '', startDate: new Date().toISOString().split('T')[0] });
      loadStocktakes();
    } catch (error) {
      alert('حدث خطأ أثناء إضافة الجرد');
    }
  }, [formData, loadStocktakes]);

  const handleEdit = useCallback(async () => {
    if (!editStocktake) return;
    try {
      await apiRequest(`/stocktakes/${editStocktake.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditStocktake(null);
      setFormData({ name: '', reference: '', location: '', notes: '', startDate: new Date().toISOString().split('T')[0] });
      loadStocktakes();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل الجرد');
    }
  }, [editStocktake, formData, loadStocktakes]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الجرد؟')) return;
    try {
      await apiRequest(`/stocktakes/${id}`, { method: 'DELETE' });
      loadStocktakes();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [loadStocktakes]);

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    try {
      await apiRequest(`/stocktakes/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      loadStocktakes();
    } catch (error) {
      alert('حدث خطأ أثناء تغيير الحالة');
    }
  }, [loadStocktakes]);

  const openEditModal = useCallback((stocktake: Stocktake) => {
    setEditStocktake(stocktake);
    setFormData({
      name: stocktake.name,
      reference: stocktake.reference,
      location: stocktake.location,
      notes: stocktake.notes,
      startDate: stocktake.startDate.split('T')[0],
    });
    setEditModal(true);
  }, []);

  const STATUS_CONFIG = {
    draft: { label: 'مسودة', color: 'bg-slate-50 text-slate-600', icon: <FileText size={12} /> },
    in_progress: { label: 'جاري', color: 'bg-blue-50 text-blue-600', icon: <Clock size={12} /> },
    completed: { label: 'مكتمل', color: 'bg-green-50 text-green-600', icon: <CheckCircle2 size={12} /> },
    cancelled: { label: 'ملغي', color: 'bg-red-50 text-red-600', icon: <XCircle size={12} /> },
  };

  const stats = useMemo(() => {
    const total = stocktakes.length;
    const draft = stocktakes.filter(s => s.status === 'draft').length;
    const inProgress = stocktakes.filter(s => s.status === 'in_progress').length;
    const completed = stocktakes.filter(s => s.status === 'completed').length;
    const totalDiscrepancies = stocktakes.reduce((sum, s) => sum + s.discrepancyCount, 0);
    return [
      { label: 'إجمالي الجرد', value: total, icon: ClipboardCheck, color: 'bg-blue-50 text-blue-600' },
      { label: 'مسودة', value: draft, icon: FileText, color: 'bg-slate-50 text-slate-600' },
      { label: 'جاري', value: inProgress, icon: Clock, color: 'bg-blue-50 text-blue-600' },
      { label: 'مكتمل', value: completed, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
      { label: 'الاختلافات', value: totalDiscrepancies, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
    ];
  }, [stocktakes]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <ClipboardCheck size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">جرد المخزون</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة عمليات جرد المخزون</p>
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
          <button onClick={() => setAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all">
            <Plus size={18} />
            جرد جديد
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو المرجع..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
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
            <option value="in_progress">جاري</option>
            <option value="completed">مكتمل</option>
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
            <option value="name">الاسم</option>
            <option value="startDate">تاريخ البدء</option>
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

      {/* Stocktakes List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ClipboardCheck size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد عمليات جرد حالياً</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="space-y-3 md:hidden">
            {paginatedStocktakes.map((stocktake) => {
              const statusConfig = STATUS_CONFIG[stocktake.status];
              return (
                <div key={stocktake.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <button onClick={() => toggleSelect(stocktake.id)} className="shrink-0 p-1">
                      {selectedIds.has(stocktake.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm">{stocktake.name}</div>
                      <div className="text-slate-500 text-xs">{stocktake.reference}</div>
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
                    <span>{new Date(stocktake.startDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Package2 size={12} />
                    <span>{stocktake.itemCount} صنف</span>
                  </div>
                  {stocktake.discrepancyCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 mb-2">
                      <AlertTriangle size={12} />
                      <span>{stocktake.discrepancyCount} اختلاف</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(stocktake)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs hover:bg-slate-100 transition-all">
                      <Edit size={12} />
                      تعديل
                    </button>
                    <button onClick={() => handleDelete(stocktake.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100 transition-all">
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
            <table className="w-full text-right border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="p-1">
                      {selectedIds.size === paginatedStocktakes.length && paginatedStocktakes.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                    </button>
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الاسم</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">المرجع</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">تاريخ البدء</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الموقع</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">عدد الأصناف</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الاختلافات</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">القيمة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStocktakes.map((stocktake) => {
                  const statusConfig = STATUS_CONFIG[stocktake.status];
                  return (
                    <tr key={stocktake.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4">
                        <button onClick={() => toggleSelect(stocktake.id)} className="p-1">
                          {selectedIds.has(stocktake.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{stocktake.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{stocktake.reference}</div>
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
                          {new Date(stocktake.startDate).toLocaleDateString('ar-EG')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{stocktake.location}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{stocktake.itemCount}</div>
                      </td>
                      <td className="p-4">
                        {stocktake.discrepancyCount > 0 ? (
                          <div className="flex items-center gap-1 text-amber-600 text-sm font-bold">
                            <AlertTriangle size={12} />
                            {stocktake.discrepancyCount}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">ج.م {stocktake.totalValue.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(stocktake)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(stocktake.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف">
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
              <h2 className="text-xl font-black text-slate-900">جرد جديد</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">اسم الجرد</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="اسم الجرد"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">المرجع</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={e => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="رقم المرجع"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الموقع</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="موقع الجرد"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ البدء</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
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
                إنشاء الجرد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && editStocktake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل الجرد</h2>
              <button onClick={() => setEditModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">اسم الجرد</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">المرجع</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={e => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الموقع</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ البدء</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
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
              <h2 className="text-xl font-black text-slate-900">دليل جرد المخزون</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة عمليات جرد المخزون الدورية لضمان دقة البيانات.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><ClipboardCheck size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إنشاء عمليات جرد جديدة</li>
                  <li>• تتبع الحالة (مسودة، جاري، مكتمل، ملغي)</li>
                  <li>• تسجيل الاختلافات بين المخزون الفعلي والنظامي</li>
                  <li>• إحصائيات شاملة لكل جرد</li>
                  <li>• تصدير تقارير الجرد</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
