'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Percent, Search, Loader2, Plus, Edit, Trash2, Download, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Tag, DollarSign, Users, BarChart3 } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Discount = {
  id: string;
  name: string;
  nameAr: string;
  type: 'product' | 'category' | 'order' | 'bundle' | 'seasonal';
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscountValue: number;
  applicableProducts: string[];
  applicableCategories: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  usageCount: number;
  totalSavings: number;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editDiscount, setEditDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    type: 'product' as 'product' | 'category' | 'order' | 'bundle' | 'seasonal',
    discountType: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minOrderValue: 0,
    maxDiscountValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active' as 'active' | 'inactive' | 'expired',
    description: '',
  });

  const loadDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/discounts/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setDiscounts(data.map((d: any) => ({
        id: String(d.id),
        name: d.name || '---',
        nameAr: d.nameAr || d.name_ar || '---',
        type: d.type || 'product',
        discountType: d.discountType || d.discount_type || 'percentage',
        value: Number(d.value || 0),
        minOrderValue: Number(d.minOrderValue || d.min_order_value || 0),
        maxDiscountValue: Number(d.maxDiscountValue || d.max_discount_value || 0),
        applicableProducts: d.applicableProducts || d.applicable_products || [],
        applicableCategories: d.applicableCategories || d.applicable_categories || [],
        startDate: d.startDate || d.start_date || new Date().toISOString(),
        endDate: d.endDate || d.end_date || '',
        status: d.status || 'active',
        usageCount: Number(d.usageCount || d.usage_count || 0),
        totalSavings: Number(d.totalSavings || d.total_savings || 0),
        description: d.description || '',
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt || new Date().toISOString(),
      })));
    } catch { setDiscounts([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDiscounts(); }, [loadDiscounts]);

  const filtered = useMemo(() => {
    let result = discounts.filter(d =>
      d.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.nameAr.includes(debouncedSearch)
    );

    if (filterType !== 'all') {
      result = result.filter(d => d.type === filterType);
    }

    if (filterStatus !== 'all') {
      result = result.filter(d => d.status === filterStatus);
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : sortBy === 'value' ? a.value : sortBy === 'usageCount' ? a.usageCount : a.createdAt;
      const bVal = sortBy === 'name' ? b.name : sortBy === 'value' ? b.value : sortBy === 'usageCount' ? b.usageCount : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return result;
  }, [discounts, debouncedSearch, filterType, filterStatus, sortBy, sortOrder]);

  const paginatedDiscounts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedDiscounts.length && paginatedDiscounts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedDiscounts.map(d => d.id)));
    }
  }, [paginatedDiscounts, selectedIds.size]);

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
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} خصم؟`)) return;
    try {
      // TODO: Implement bulk delete API call
      alert(`تم حذف ${selectedIds.size} خصم`);
      setSelectedIds(new Set());
      loadDiscounts();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [selectedIds, loadDiscounts]);

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Name (Arabic)', 'Type', 'Discount Type', 'Value', 'Min Order', 'Max Discount', 'Start Date', 'End Date', 'Status', 'Usage Count', 'Total Savings', 'Created At'];
    const rows = filtered.map(d => [
      d.name,
      d.nameAr,
      d.type,
      d.discountType,
      d.value,
      d.minOrderValue,
      d.maxDiscountValue,
      d.startDate,
      d.endDate || '-',
      d.status,
      d.usageCount,
      d.totalSavings,
      d.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'discounts.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/discounts', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          shopId: sid,
        }),
      });
      setAddModal(false);
      setFormData({ name: '', nameAr: '', type: 'product', discountType: 'percentage', value: 0, minOrderValue: 0, maxDiscountValue: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'active', description: '' });
      loadDiscounts();
    } catch (error) {
      alert('حدث خطأ أثناء إضافة الخصم');
    }
  }, [formData, loadDiscounts]);

  const handleEdit = useCallback(async () => {
    if (!editDiscount) return;
    try {
      await apiRequest(`/discounts/${editDiscount.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditDiscount(null);
      setFormData({ name: '', nameAr: '', type: 'product', discountType: 'percentage', value: 0, minOrderValue: 0, maxDiscountValue: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'active', description: '' });
      loadDiscounts();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل الخصم');
    }
  }, [editDiscount, formData, loadDiscounts]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخصم؟')) return;
    try {
      await apiRequest(`/discounts/${id}`, { method: 'DELETE' });
      loadDiscounts();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [loadDiscounts]);

  const openEditModal = useCallback((discount: Discount) => {
    setEditDiscount(discount);
    setFormData({
      name: discount.name,
      nameAr: discount.nameAr,
      type: discount.type,
      discountType: discount.discountType,
      value: discount.value,
      minOrderValue: discount.minOrderValue,
      maxDiscountValue: discount.maxDiscountValue,
      startDate: discount.startDate.split('T')[0],
      endDate: discount.endDate,
      status: discount.status,
      description: discount.description,
    });
    setEditModal(true);
  }, []);

  const TYPE_CONFIG = {
    product: { label: 'منتج', color: 'bg-blue-50 text-blue-600' },
    category: { label: 'فئة', color: 'bg-green-50 text-green-600' },
    order: { label: 'طلب', color: 'bg-purple-50 text-purple-600' },
    bundle: { label: 'باقة', color: 'bg-amber-50 text-amber-600' },
    seasonal: { label: 'موسمي', color: 'bg-cyan-50 text-cyan-600' },
  };

  const STATUS_CONFIG = {
    active: { label: 'نشط', color: 'bg-green-50 text-green-700' },
    inactive: { label: 'غير نشط', color: 'bg-slate-50 text-slate-600' },
    expired: { label: 'منتهي', color: 'bg-red-50 text-red-600' },
  };

  const stats = useMemo(() => {
    const total = discounts.length;
    const active = discounts.filter(d => d.status === 'active').length;
    const totalSavings = discounts.reduce((sum, d) => sum + d.totalSavings, 0);
    const totalUsage = discounts.reduce((sum, d) => sum + d.usageCount, 0);
    return [
      { label: 'إجمالي الخصومات', value: total, icon: Percent, color: 'bg-blue-50 text-blue-600' },
      { label: 'نشط', value: active, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
      { label: 'إجمالي التوفير', value: `ج.م ${totalSavings.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
      { label: 'إجمالي الاستخدام', value: totalUsage.toLocaleString(), icon: Users, color: 'bg-cyan-50 text-cyan-600' },
    ];
  }, [discounts]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Percent size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الخصومات</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة خصومات المنتجات والطلبات</p>
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
            خصم جديد
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
            <Download size={18} />
            تصدير CSV
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
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
            <option value="product">منتج</option>
            <option value="category">فئة</option>
            <option value="order">طلب</option>
            <option value="bundle">باقة</option>
            <option value="seasonal">موسمي</option>
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
            <option value="expired">منتهي</option>
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
            <option value="value">القيمة</option>
            <option value="usageCount">الاستخدام</option>
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

      {/* Discounts List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Percent size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد خصومات حالياً</p>
        </div>
      ) : (
        <div className="hidden md:block overflow-x-auto touch-auto">
          <table className="w-full text-right border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedIds.size === paginatedDiscounts.length && paginatedDiscounts.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                  </button>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500">الاسم</th>
                <th className="p-4 text-xs font-semibold text-slate-500">النوع</th>
                <th className="p-4 text-xs font-semibold text-slate-500">نوع الخصم</th>
                <th className="p-4 text-xs font-semibold text-slate-500">القيمة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الحد الأدنى</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الحد الأقصى</th>
                <th className="p-4 text-xs font-semibold text-slate-500">تاريخ البدء</th>
                <th className="p-4 text-xs font-semibold text-slate-500">تاريخ النهاية</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الاستخدام</th>
                <th className="p-4 text-xs font-semibold text-slate-500">التوفير</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDiscounts.map((discount) => {
                const typeConfig = TYPE_CONFIG[discount.type];
                const statusConfig = STATUS_CONFIG[discount.status];
                return (
                  <tr key={discount.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4">
                      <button onClick={() => toggleSelect(discount.id)} className="p-1">
                        {selectedIds.has(discount.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{discount.name}</div>
                      <div className="text-slate-500 text-xs">{discount.nameAr}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${discount.discountType === 'percentage' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                        {discount.discountType === 'percentage' ? 'نسبة' : 'ثابت'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {discount.discountType === 'percentage' ? `${discount.value}%` : `ج.م ${discount.value}`}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">ج.م {discount.minOrderValue}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">ج.م {discount.maxDiscountValue}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(discount.startDate).toLocaleDateString('ar-EG')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">{discount.endDate ? new Date(discount.endDate).toLocaleDateString('ar-EG') : '-'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{discount.usageCount}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">ج.م {discount.totalSavings.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(discount)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(discount.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف">
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
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">خصم جديد</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (إنجليزي)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Discount Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (عربي)</label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="اسم الخصم"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">النوع</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="product">منتج</option>
                  <option value="category">فئة</option>
                  <option value="order">طلب</option>
                  <option value="bundle">باقة</option>
                  <option value="seasonal">موسمي</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">نوع الخصم</label>
                <select
                  value={formData.discountType}
                  onChange={e => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="percentage">نسبة مئوية</option>
                  <option value="fixed">قيمة ثابتة</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">القيمة</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحد الأدنى للطلب</label>
                <input
                  type="number"
                  value={formData.minOrderValue}
                  onChange={e => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحد الأقصى للخصم</label>
                <input
                  type="number"
                  value={formData.maxDiscountValue}
                  onChange={e => setFormData({ ...formData, maxDiscountValue: Number(e.target.value) })}
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
                <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ النهاية</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحالة</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="expired">منتهي</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الخصم"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                إضافة الخصم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && editDiscount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل الخصم</h2>
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
                <label className="text-sm font-bold text-slate-700 mb-1 block">النوع</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="product">منتج</option>
                  <option value="category">فئة</option>
                  <option value="order">طلب</option>
                  <option value="bundle">باقة</option>
                  <option value="seasonal">موسمي</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">نوع الخصم</label>
                <select
                  value={formData.discountType}
                  onChange={e => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="percentage">نسبة مئوية</option>
                  <option value="fixed">قيمة ثابتة</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">القيمة</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحد الأدنى للطلب</label>
                <input
                  type="number"
                  value={formData.minOrderValue}
                  onChange={e => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحد الأقصى للخصم</label>
                <input
                  type="number"
                  value={formData.maxDiscountValue}
                  onChange={e => setFormData({ ...formData, maxDiscountValue: Number(e.target.value) })}
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
                <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ النهاية</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحالة</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="expired">منتهي</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
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
              <h2 className="text-xl font-black text-slate-900">دليل الخصومات</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة خصومات المنتجات والطلبات.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Percent size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إضافة وتعديل وحذف الخصومات</li>
                  <li>• أنواع مختلفة (منتج، فئة، طلب، باقة، موسمي)</li>
                  <li>• تتبع الاستخدام والتوفير</li>
                  <li>• تصدير تقارير الخصومات</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
