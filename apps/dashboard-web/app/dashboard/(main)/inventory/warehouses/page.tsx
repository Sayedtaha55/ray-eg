'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Warehouse, Search, Plus, Edit, Trash2, Download, Upload, Filter,
  ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info,
  RefreshCw, MapPin, Phone, User, Package, AlertTriangle, Building2,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type WarehouseItem = {
  id: string;
  name: string;
  nameAr: string;
  location: string;
  city: string;
  capacity: number;
  used: number;
  manager: string;
  phone: string;
  status: 'active' | 'inactive' | 'full';
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

const emptyForm = {
  name: '',
  nameAr: '',
  location: '',
  city: '',
  capacity: 1000,
  manager: '',
  phone: '',
  status: 'active' as 'active' | 'inactive' | 'full',
};

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState<WarehouseItem | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/warehouses/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setWarehouses(data.map((w: any) => ({
        id: String(w.id),
        name: w.name || '---',
        nameAr: w.nameAr || w.name_ar || '---',
        location: w.location || w.address || '---',
        city: w.city || '---',
        capacity: Number(w.capacity || 1000),
        used: Number(w.used || w.currentStock || 0),
        manager: w.manager || w.managerName || '---',
        phone: w.phone || '---',
        status: w.status || 'active',
        productCount: Number(w.productCount || w.products_count || 0),
        createdAt: w.createdAt || new Date().toISOString(),
        updatedAt: w.updatedAt || new Date().toISOString(),
      })));
    } catch { setWarehouses([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadWarehouses(); }, [loadWarehouses]);

  const filtered = useMemo(() => {
    let result = warehouses.filter(w =>
      w.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      w.nameAr.includes(debouncedSearch) ||
      w.location.includes(debouncedSearch) ||
      w.manager.includes(debouncedSearch)
    );
    if (filterStatus !== 'all') {
      result = result.filter(w => w.status === filterStatus);
    }
    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : sortBy === 'capacity' ? a.capacity : sortBy === 'used' ? a.used : a.createdAt;
      const bVal = sortBy === 'name' ? b.name : sortBy === 'capacity' ? b.capacity : sortBy === 'used' ? b.used : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [warehouses, debouncedSearch, filterStatus, sortBy, sortOrder]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginated.length && paginated.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(w => w.id)));
    }
  }, [paginated, selectedIds.size]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Name (Arabic)', 'Location', 'City', 'Capacity', 'Used', 'Manager', 'Phone', 'Status', 'Products', 'Created At'];
    const rows = filtered.map(w => [w.name, w.nameAr, w.location, w.city, w.capacity, w.used, w.manager, w.phone, w.status, w.productCount, w.createdAt]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'warehouses.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    setSaving(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/warehouses', {
        method: 'POST',
        body: JSON.stringify({ ...formData, shopId: sid }),
      });
      setAddModal(false);
      setFormData(emptyForm);
      loadWarehouses();
    } catch { alert('حدث خطأ أثناء إضافة المخزن'); }
    finally { setSaving(false); }
  }, [formData, loadWarehouses]);

  const handleEdit = useCallback(async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await apiRequest(`/warehouses/${editItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditItem(null);
      setFormData(emptyForm);
      loadWarehouses();
    } catch { alert('حدث خطأ أثناء تعديل المخزن'); }
    finally { setSaving(false); }
  }, [editItem, formData, loadWarehouses]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المخزن؟')) return;
    try {
      await apiRequest(`/warehouses/${id}`, { method: 'DELETE' });
      loadWarehouses();
    } catch { alert('حدث خطأ أثناء الحذف'); }
  }, [loadWarehouses]);

  const openEditModal = useCallback((w: WarehouseItem) => {
    setEditItem(w);
    setFormData({
      name: w.name,
      nameAr: w.nameAr,
      location: w.location,
      city: w.city,
      capacity: w.capacity,
      manager: w.manager,
      phone: w.phone,
      status: w.status,
    });
    setEditModal(true);
  }, []);

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    active: { label: 'نشط', color: 'bg-green-50 text-green-700' },
    inactive: { label: 'غير نشط', color: 'bg-slate-50 text-slate-600' },
    full: { label: 'ممتلئ', color: 'bg-red-50 text-red-700' },
  };

  const stats = useMemo(() => {
    const total = warehouses.length;
    const active = warehouses.filter(w => w.status === 'active').length;
    const full = warehouses.filter(w => w.status === 'full').length;
    const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
    const totalUsed = warehouses.reduce((sum, w) => sum + w.used, 0);
    return [
      { label: 'إجمالي المخازن', value: total, icon: Warehouse, color: 'bg-blue-50 text-blue-600' },
      { label: 'نشط', value: active, icon: Check, color: 'bg-green-50 text-green-600' },
      { label: 'ممتلئ', value: full, icon: AlertTriangle, color: 'bg-red-50 text-red-700' },
      { label: 'السعة المستخدمة', value: `${totalUsed.toLocaleString()} / ${totalCapacity.toLocaleString()}`, icon: Package, color: 'bg-purple-50 text-purple-600' },
    ];
  }, [warehouses]);

  const renderForm = (isEdit: boolean) => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (إنجليزي)</label>
        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Warehouse Name" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (عربي)</label>
        <input type="text" value={formData.nameAr} onChange={e => setFormData({ ...formData, nameAr: e.target.value })} placeholder="اسم المخزن" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">العنوان</label>
        <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="العنوان" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">المدينة</label>
        <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="المدينة" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">السعة</label>
        <input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">المسؤول</label>
        <input type="text" value={formData.manager} onChange={e => setFormData({ ...formData, manager: e.target.value })} placeholder="اسم المسؤول" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">الهاتف</label>
        <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="رقم الهاتف" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">الحالة</label>
        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="full">ممتلئ</option>
        </select>
      </div>
      <div className="col-span-2">
        <button onClick={isEdit ? handleEdit : handleAdd} disabled={saving} className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all disabled:opacity-50">
          {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة المخزن'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Warehouse size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">المخازن</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة المخازن المتعددة وتتبع المخزون</p>
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
            <Plus size={18} /> إضافة مخزن
          </button>
          <button onClick={() => loadWarehouses()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
            <RefreshCw size={18} /> تحديث
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
            <Download size={18} /> تصدير CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الموقع..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الحالة:</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="all">الكل</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="full">ممتلئ</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الترتيب:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="name">الاسم</option>
            <option value="capacity">السعة</option>
            <option value="used">المستخدم</option>
            <option value="createdAt">تاريخ الإنشاء</option>
          </select>
        </div>
        <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
          {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Warehouse size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد مخازن حالياً</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="space-y-3 md:hidden">
            {paginated.map((w) => {
              const statusConfig = STATUS_CONFIG[w.status];
              const usagePct = w.capacity > 0 ? (w.used / w.capacity) * 100 : 0;
              return (
                <div key={w.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm">{w.name}</div>
                      <div className="text-slate-500 text-xs">{w.nameAr}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusConfig.color}`}>{statusConfig.label}</span>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">السعة</span>
                      <span className="font-bold text-slate-900">{w.used.toLocaleString()} / {w.capacity.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${usagePct > 90 ? 'bg-red-500' : usagePct > 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(usagePct, 100)}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <MapPin size={12} /><span>{w.location}, {w.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <User size={12} /><span>{w.manager}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <Phone size={12} /><span>{w.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(w)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs hover:bg-slate-100 transition-all">
                      <Edit size={12} /> تعديل
                    </button>
                    <button onClick={() => handleDelete(w.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100 transition-all">
                      <Trash2 size={12} /> حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto touch-auto">
            <table className="w-full text-right border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-semibold text-slate-500">الاسم</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الموقع</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">المسؤول</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الهاتف</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">السعة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">المنتجات</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((w) => {
                  const statusConfig = STATUS_CONFIG[w.status];
                  const usagePct = w.capacity > 0 ? (w.used / w.capacity) * 100 : 0;
                  return (
                    <tr key={w.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{w.name}</div>
                        <div className="text-slate-500 text-xs">{w.nameAr}</div>
                      </td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{w.location}, {w.city}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{w.manager}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{w.phone}</div></td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{w.used.toLocaleString()} / {w.capacity.toLocaleString()}</div>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div className={`h-full ${usagePct > 90 ? 'bg-red-500' : usagePct > 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(usagePct, 100)}%` }} />
                        </div>
                      </td>
                      <td className="p-4"><div className="font-bold text-slate-900 text-sm">{w.productCount}</div></td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusConfig.color}`}>{statusConfig.label}</span></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(w)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(w.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف">
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
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight size={18} />
                </button>
                <span className="text-xs font-bold text-slate-600 px-3">صفحة {currentPage} من {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">إضافة مخزن جديد</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            {renderForm(false)}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل المخزن</h2>
              <button onClick={() => setEditModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            {renderForm(true)}
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل المخازن</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة المخازن المتعددة وتتبع المخزون في كل فرع.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Building2 size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إنشاء وإدارة مخازن متعددة</li>
                  <li>• تتبع مخزون كل مخزن على حدة</li>
                  <li>• توزيع المنتجات على المخازن</li>
                  <li>• تقارير مخزون لكل مخزن</li>
                  <li>• إعدادات عنوان ومسؤول كل مخزن</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
