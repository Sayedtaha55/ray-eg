'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Receipt, Search, Loader2, Plus, Edit, Trash2, Download, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, DollarSign, Calendar, Clock, CheckCircle2, AlertTriangle, Percent, FileText } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Tax = {
  id: string;
  name: string;
  nameAr: string;
  rate: number;
  type: 'vat' | 'sales_tax' | 'income_tax' | 'custom';
  status: 'active' | 'inactive';
  description: string;
  applicableFrom: string;
  createdAt: string;
  updatedAt: string;
};

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
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
  const [editTax, setEditTax] = useState<Tax | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    rate: 0,
    type: 'custom' as 'vat' | 'sales_tax' | 'income_tax' | 'custom',
    status: 'active' as 'active' | 'inactive',
    description: '',
    applicableFrom: new Date().toISOString().split('T')[0],
  });

  const loadTaxes = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/taxes/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setTaxes(data.map((t: any) => ({
        id: String(t.id),
        name: t.name || '---',
        nameAr: t.nameAr || t.name_ar || '---',
        rate: Number(t.rate || 0),
        type: t.type || 'custom',
        status: t.status || 'active',
        description: t.description || '',
        applicableFrom: t.applicableFrom || t.applicable_from || new Date().toISOString(),
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || new Date().toISOString(),
      })));
    } catch { setTaxes([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTaxes(); }, [loadTaxes]);

  const filtered = useMemo(() => {
    let result = taxes.filter(t =>
      t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.nameAr.includes(debouncedSearch)
    );

    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }

    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus);
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : sortBy === 'rate' ? a.rate : a.createdAt;
      const bVal = sortBy === 'name' ? b.name : sortBy === 'rate' ? b.rate : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [taxes, debouncedSearch, filterType, filterStatus, sortBy, sortOrder]);

  const paginatedTaxes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedTaxes.length && paginatedTaxes.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTaxes.map(t => t.id)));
    }
  }, [paginatedTaxes, selectedIds.size]);

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
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} ضريبة؟`)) return;
    try {
      // TODO: Implement bulk delete API call
      alert(`تم حذف ${selectedIds.size} ضريبة`);
      setSelectedIds(new Set());
      loadTaxes();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [selectedIds, loadTaxes]);

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Name (Arabic)', 'Rate %', 'Type', 'Status', 'Description', 'Applicable From', 'Created At'];
    const rows = filtered.map(t => [
      t.name,
      t.nameAr,
      t.rate,
      t.type,
      t.status,
      t.description,
      t.applicableFrom,
      t.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'taxes.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/taxes', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          shopId: sid,
        }),
      });
      setAddModal(false);
      setFormData({ name: '', nameAr: '', rate: 0, type: 'custom', status: 'active', description: '', applicableFrom: new Date().toISOString().split('T')[0] });
      loadTaxes();
    } catch (error) {
      alert('حدث خطأ أثناء إضافة الضريبة');
    }
  }, [formData, loadTaxes]);

  const handleEdit = useCallback(async () => {
    if (!editTax) return;
    try {
      await apiRequest(`/taxes/${editTax.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditTax(null);
      setFormData({ name: '', nameAr: '', rate: 0, type: 'custom', status: 'active', description: '', applicableFrom: new Date().toISOString().split('T')[0] });
      loadTaxes();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل الضريبة');
    }
  }, [editTax, formData, loadTaxes]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الضريبة؟')) return;
    try {
      await apiRequest(`/taxes/${id}`, { method: 'DELETE' });
      loadTaxes();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [loadTaxes]);

  const openEditModal = useCallback((tax: Tax) => {
    setEditTax(tax);
    setFormData({
      name: tax.name,
      nameAr: tax.nameAr,
      rate: tax.rate,
      type: tax.type,
      status: tax.status,
      description: tax.description,
      applicableFrom: tax.applicableFrom.split('T')[0],
    });
    setEditModal(true);
  }, []);

  const TYPE_CONFIG = {
    vat: { label: 'ضريبة القيمة المضافة', color: 'bg-blue-50 text-blue-600' },
    sales_tax: { label: 'ضريبة المبيعات', color: 'bg-green-50 text-green-600' },
    income_tax: { label: 'ضريبة الدخل', color: 'bg-purple-50 text-purple-600' },
    custom: { label: 'مخصص', color: 'bg-slate-50 text-slate-600' },
  };

  const stats = useMemo(() => {
    const total = taxes.length;
    const active = taxes.filter(t => t.status === 'active').length;
    const avgRate = taxes.length > 0 ? taxes.reduce((sum, t) => sum + t.rate, 0) / taxes.length : 0;
    return [
      { label: 'إجمالي الضرائب', value: total, icon: Receipt, color: 'bg-blue-50 text-blue-600' },
      { label: 'نشط', value: active, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
      { label: 'متوسط النسبة', value: `${avgRate.toFixed(1)}%`, icon: Percent, color: 'bg-purple-50 text-purple-600' },
    ];
  }, [taxes]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Receipt size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الضرائب</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة الضرائب والرسوم</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
            ضريبة جديدة
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
            <option value="vat">ضريبة القيمة المضافة</option>
            <option value="sales_tax">ضريبة المبيعات</option>
            <option value="income_tax">ضريبة الدخل</option>
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
            <option value="rate">النسبة</option>
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

      {/* Taxes List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Receipt size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد ضرائب حالياً</p>
        </div>
      ) : (
        <div className="hidden md:block overflow-x-auto touch-auto">
          <table className="w-full text-right border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedIds.size === paginatedTaxes.length && paginatedTaxes.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                  </button>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500">الاسم</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الاسم (عربي)</th>
                <th className="p-4 text-xs font-semibold text-slate-500">النوع</th>
                <th className="p-4 text-xs font-semibold text-slate-500">النسبة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">منذ</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTaxes.map((tax) => {
                const typeConfig = TYPE_CONFIG[tax.type];
                return (
                  <tr key={tax.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4">
                      <button onClick={() => toggleSelect(tax.id)} className="p-1">
                        {selectedIds.has(tax.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{tax.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">{tax.nameAr}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{tax.rate}%</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${tax.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-600'}`}>
                        {tax.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">{new Date(tax.applicableFrom).toLocaleDateString('ar-EG')}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(tax)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(tax.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف">
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
              <h2 className="text-xl font-black text-slate-900">ضريبة جديدة</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (إنجليزي)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tax Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (عربي)</label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="اسم الضريبة"
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
                  <option value="vat">ضريبة القيمة المضافة</option>
                  <option value="sales_tax">ضريبة المبيعات</option>
                  <option value="income_tax">ضريبة الدخل</option>
                  <option value="custom">مخصص</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">النسبة (%)</label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={e => setFormData({ ...formData, rate: Number(e.target.value) })}
                  placeholder="النسبة"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الضريبة"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ التطبيق</label>
                <input
                  type="date"
                  value={formData.applicableFrom}
                  onChange={e => setFormData({ ...formData, applicableFrom: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                إضافة الضريبة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && editTax && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل الضريبة</h2>
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
                  <option value="vat">ضريبة القيمة المضافة</option>
                  <option value="sales_tax">ضريبة المبيعات</option>
                  <option value="income_tax">ضريبة الدخل</option>
                  <option value="custom">مخصص</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">النسبة (%)</label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={e => setFormData({ ...formData, rate: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
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
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ التطبيق</label>
                <input
                  type="date"
                  value={formData.applicableFrom}
                  onChange={e => setFormData({ ...formData, applicableFrom: e.target.value })}
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
              <h2 className="text-xl font-black text-slate-900">دليل الضرائب</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة الضرائب والرسوم المطبقة على المتجر.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Receipt size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إضافة وتعديل وحذف الضرائب</li>
                  <li>• أنواع مختلفة (ضريبة القيمة المضافة، ضريبة المبيعات، ضريبة الدخل)</li>
                  <li>• تفعيل/تعطيل الضرائب</li>
                  <li>• تصدير تقارير الضرائب</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
