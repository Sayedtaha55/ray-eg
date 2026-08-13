'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layers, Search, Loader2, Plus, Edit, Trash2, Eye, Download, Upload, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, MoreVertical, Package2, BarChart3, TrendingUp, AlertTriangle, Tag, Palette } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Variant = {
  id: string;
  name: string;
  nameAr: string;
  type: 'color' | 'size' | 'material' | 'style' | 'custom';
  values: string[];
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

export default function VariantsPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editVariant, setEditVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    type: 'custom' as 'color' | 'size' | 'material' | 'style' | 'custom',
    values: '',
    status: 'active' as 'active' | 'inactive',
  });

  const loadVariants = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/variants/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setVariants(data.map((v: any) => ({
        id: String(v.id),
        name: v.name || '---',
        nameAr: v.nameAr || v.name_ar || '---',
        type: v.type || 'custom',
        values: v.values || [],
        productCount: Number(v.productCount || v.products_count || 0),
        status: v.status || 'active',
        createdAt: v.createdAt || new Date().toISOString(),
        updatedAt: v.updatedAt || new Date().toISOString(),
      })));
    } catch { setVariants([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadVariants(); }, [loadVariants]);

  const filtered = useMemo(() => {
    let result = variants.filter(v =>
      v.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      v.nameAr.includes(debouncedSearch)
    );

    if (filterType !== 'all') {
      result = result.filter(v => v.type === filterType);
    }

    if (filterStatus !== 'all') {
      result = result.filter(v => v.status === filterStatus);
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : sortBy === 'productCount' ? a.productCount : a.createdAt;
      const bVal = sortBy === 'name' ? b.name : sortBy === 'productCount' ? b.productCount : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [variants, debouncedSearch, filterType, filterStatus, sortBy, sortOrder]);

  const paginatedVariants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedVariants.length && paginatedVariants.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedVariants.map(v => v.id)));
    }
  }, [paginatedVariants, selectedIds.size]);

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
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} نوع؟`)) return;
    try {
      // TODO: Implement bulk delete API call
      alert(`تم حذف ${selectedIds.size} نوع`);
      setSelectedIds(new Set());
      loadVariants();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [selectedIds, loadVariants]);

  const bulkActivate = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      // TODO: Implement bulk activate API call
      alert(`تم تفعيل ${selectedIds.size} نوع`);
      setSelectedIds(new Set());
      loadVariants();
    } catch (error) {
      alert('حدث خطأ أثناء التفعيل');
    }
  }, [selectedIds, loadVariants]);

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Name (Arabic)', 'Type', 'Values', 'Product Count', 'Status', 'Created At'];
    const rows = filtered.map(v => [
      v.name,
      v.nameAr,
      v.type,
      v.values.join(', '),
      v.productCount,
      v.status,
      v.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'variants.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/variants', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          values: formData.values.split(',').map(v => v.trim()).filter(v => v),
          shopId: sid,
        }),
      });
      setAddModal(false);
      setFormData({ name: '', nameAr: '', type: 'custom', values: '', status: 'active' });
      loadVariants();
    } catch (error) {
      alert('حدث خطأ أثناء إضافة النوع');
    }
  }, [formData, loadVariants]);

  const handleEdit = useCallback(async () => {
    if (!editVariant) return;
    try {
      await apiRequest(`/variants/${editVariant.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...formData,
          values: formData.values.split(',').map(v => v.trim()).filter(v => v),
        }),
      });
      setEditModal(false);
      setEditVariant(null);
      setFormData({ name: '', nameAr: '', type: 'custom', values: '', status: 'active' });
      loadVariants();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل النوع');
    }
  }, [editVariant, formData, loadVariants]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا النوع؟')) return;
    try {
      await apiRequest(`/variants/${id}`, { method: 'DELETE' });
      loadVariants();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [loadVariants]);

  const openEditModal = useCallback((variant: Variant) => {
    setEditVariant(variant);
    setFormData({
      name: variant.name,
      nameAr: variant.nameAr,
      type: variant.type,
      values: variant.values.join(', '),
      status: variant.status,
    });
    setEditModal(true);
  }, []);

  const VARIANT_TYPES = [
    { id: 'color', label: 'لون', icon: <Palette size={16} /> },
    { id: 'size', label: 'حجم', icon: <Layers size={16} /> },
    { id: 'material', label: 'مادة', icon: <Package2 size={16} /> },
    { id: 'style', label: 'طراز', icon: <Tag size={16} /> },
    { id: 'custom', label: 'مخصص', icon: <MoreVertical size={16} /> },
  ];

  const stats = useMemo(() => {
    const total = variants.length;
    const active = variants.filter(v => v.status === 'active').length;
    const inactive = variants.filter(v => v.status === 'inactive').length;
    const totalProducts = variants.reduce((sum, v) => sum + v.productCount, 0);
    return [
      { label: 'إجمالي الأنواع', value: total, icon: Layers, color: 'bg-blue-50 text-blue-600' },
      { label: 'الأنواع النشطة', value: active, icon: Check, color: 'bg-green-50 text-green-600' },
      { label: 'الأنواع غير النشطة', value: inactive, icon: X, color: 'bg-red-50 text-red-600' },
      { label: 'إجمالي المنتجات', value: totalProducts.toLocaleString(), icon: Package2, color: 'bg-purple-50 text-purple-600' },
    ];
  }, [variants]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Layers size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الأنواع</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة أنواع المنتجات (ألوان، أحجام، مواد)</p>
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
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all">
            <Plus size={18} />
            إضافة نوع
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
            <button onClick={bulkActivate} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 font-bold text-xs hover:bg-green-100 transition-all">
              <Check size={14} />
              تفعيل
            </button>
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">النوع:</span>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">الكل</option>
            <option value="color">لون</option>
            <option value="size">حجم</option>
            <option value="material">مادة</option>
            <option value="style">طراز</option>
            <option value="custom">مخصص</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الحالة:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">الكل</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
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
            <option value="productCount">عدد المنتجات</option>
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

      {/* Variants List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Layers size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد أنواع حالياً</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="space-y-3 md:hidden">
            {paginatedVariants.map((variant) => {
              const typeConfig = VARIANT_TYPES.find(t => t.id === variant.type) || VARIANT_TYPES[4];
              return (
                <div key={variant.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <button onClick={() => toggleSelect(variant.id)} className="shrink-0 p-1">
                      {selectedIds.has(variant.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm">{variant.name}</div>
                      <div className="text-slate-500 text-xs">{variant.nameAr}</div>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        variant.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {variant.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    {typeConfig.icon}
                    <span>{typeConfig.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Package2 size={12} />
                    <span>{variant.productCount} منتج</span>
                  </div>
                  {variant.values.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {variant.values.slice(0, 5).map((val, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full">{val}</span>
                      ))}
                      {variant.values.length > 5 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full">+{variant.values.length - 5}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(variant)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs hover:bg-slate-100 transition-all">
                      <Edit size={12} />
                      تعديل
                    </button>
                    <button onClick={() => handleDelete(variant.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100 transition-all">
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
            <table className="w-full text-right border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="p-1">
                      {selectedIds.size === paginatedVariants.length && paginatedVariants.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                    </button>
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الاسم</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الاسم (عربي)</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">النوع</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">القيم</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">عدد المنتجات</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVariants.map((variant) => {
                  const typeConfig = VARIANT_TYPES.find(t => t.id === variant.type) || VARIANT_TYPES[4];
                  return (
                    <tr key={variant.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4">
                        <button onClick={() => toggleSelect(variant.id)} className="p-1">
                          {selectedIds.has(variant.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{variant.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{variant.nameAr}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-slate-600 text-sm">
                          {typeConfig.icon}
                          <span>{typeConfig.label}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {variant.values.slice(0, 3).map((val, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full">{val}</span>
                          ))}
                          {variant.values.length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full">+{variant.values.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{variant.productCount}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                          variant.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {variant.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(variant)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(variant.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف">
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
              <h2 className="text-xl font-black text-slate-900">إضافة نوع جديد</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (إنجليزي)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Variant Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (عربي)</label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="اسم النوع"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">نوع النوع</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  {VARIANT_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">القيم (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={formData.values}
                  onChange={e => setFormData({ ...formData, values: e.target.value })}
                  placeholder="أحمر، أزرق، أخضر"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحالة</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                إضافة النوع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && editVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل النوع</h2>
              <button onClick={() => setEditModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (إنجليزي)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (عربي)</label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">نوع النوع</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  {VARIANT_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">القيم (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={formData.values}
                  onChange={e => setFormData({ ...formData, values: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحالة</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
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
              <h2 className="text-xl font-black text-slate-900">دليل الأنواع</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة أنواع المنتجات مثل الألوان والأحجام والمواد لتنويع المخزون.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Layers size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إضافة أنواع مختلفة (ألوان، أحجام، مواد، طرازات)</li>
                  <li>• دعم قيم متعددة لكل نوع</li>
                  <li>• تفعيل/تعطيل الأنواع</li>
                  <li>• تتبع عدد المنتجات لكل نوع</li>
                  <li>• تصدير واستيراد الأنواع</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
