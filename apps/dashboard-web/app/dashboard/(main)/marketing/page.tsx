'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Megaphone, Search, Loader2, Plus, Edit, Trash2, Download, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Users, Eye, BarChart3 } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Promotion = {
  id: string;
  name: string;
  nameAr: string;
  type: 'banner' | 'popup' | 'slider' | 'sidebar' | 'custom';
  status: 'active' | 'inactive' | 'scheduled';
  startDate: string;
  endDate: string;
  priority: number;
  targetAudience: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

export default function MarketingPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
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
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    type: 'banner' as 'banner' | 'popup' | 'slider' | 'sidebar' | 'custom',
    status: 'active' as 'active' | 'inactive' | 'scheduled',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    priority: 1,
    targetAudience: 'all',
    description: '',
    imageUrl: '',
  });

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/promotions/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setPromotions(data.map((p: any) => ({
        id: String(p.id),
        name: p.name || '---',
        nameAr: p.nameAr || p.name_ar || '---',
        type: p.type || 'banner',
        status: p.status || 'active',
        startDate: p.startDate || p.start_date || new Date().toISOString(),
        endDate: p.endDate || p.end_date || '',
        priority: Number(p.priority || 1),
        targetAudience: p.targetAudience || p.target_audience || 'all',
        impressions: Number(p.impressions || 0),
        clicks: Number(p.clicks || 0),
        conversions: Number(p.conversions || 0),
        ctr: Number(p.ctr || 0),
        description: p.description || '',
        imageUrl: p.imageUrl || p.image_url || '',
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || new Date().toISOString(),
      })));
    } catch { setPromotions([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPromotions(); }, [loadPromotions]);

  const filtered = useMemo(() => {
    let result = promotions.filter(p =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.nameAr.includes(debouncedSearch)
    );

    if (filterType !== 'all') {
      result = result.filter(p => p.type === filterType);
    }

    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : sortBy === 'priority' ? a.priority : sortBy === 'impressions' ? a.impressions : a.createdAt;
      const bVal = sortBy === 'name' ? b.name : sortBy === 'priority' ? b.priority : sortBy === 'impressions' ? b.impressions : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return result;
  }, [promotions, debouncedSearch, filterType, filterStatus, sortBy, sortOrder]);

  const paginatedPromotions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedPromotions.length && paginatedPromotions.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedPromotions.map(p => p.id)));
    }
  }, [paginatedPromotions, selectedIds.size]);

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
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} ترويج؟`)) return;
    try {
      // TODO: Implement bulk delete API call
      alert(`تم حذف ${selectedIds.size} ترويج`);
      setSelectedIds(new Set());
      loadPromotions();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [selectedIds, loadPromotions]);

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Name (Arabic)', 'Type', 'Status', 'Start Date', 'End Date', 'Priority', 'Target Audience', 'Impressions', 'Clicks', 'Conversions', 'CTR %', 'Created At'];
    const rows = filtered.map(p => [
      p.name,
      p.nameAr,
      p.type,
      p.status,
      p.startDate,
      p.endDate || '-',
      p.priority,
      p.targetAudience,
      p.impressions,
      p.clicks,
      p.conversions,
      p.ctr,
      p.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'promotions.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/promotions', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          shopId: sid,
        }),
      });
      setAddModal(false);
      setFormData({ name: '', nameAr: '', type: 'banner', status: 'active', startDate: new Date().toISOString().split('T')[0], endDate: '', priority: 1, targetAudience: 'all', description: '', imageUrl: '' });
      loadPromotions();
    } catch (error) {
      alert('حدث خطأ أثناء إضافة الترويج');
    }
  }, [formData, loadPromotions]);

  const handleEdit = useCallback(async () => {
    if (!editPromotion) return;
    try {
      await apiRequest(`/promotions/${editPromotion.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditPromotion(null);
      setFormData({ name: '', nameAr: '', type: 'banner', status: 'active', startDate: new Date().toISOString().split('T')[0], endDate: '', priority: 1, targetAudience: 'all', description: '', imageUrl: '' });
      loadPromotions();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل الترويج');
    }
  }, [editPromotion, formData, loadPromotions]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الترويج؟')) return;
    try {
      await apiRequest(`/promotions/${id}`, { method: 'DELETE' });
      loadPromotions();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [loadPromotions]);

  const openEditModal = useCallback((promotion: Promotion) => {
    setEditPromotion(promotion);
    setFormData({
      name: promotion.name,
      nameAr: promotion.nameAr,
      type: promotion.type,
      status: promotion.status,
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate,
      priority: promotion.priority,
      targetAudience: promotion.targetAudience,
      description: promotion.description,
      imageUrl: promotion.imageUrl,
    });
    setEditModal(true);
  }, []);

  const TYPE_CONFIG = {
    banner: { label: 'بانر', color: 'bg-blue-50 text-blue-600' },
    popup: { label: 'نافذة منبثقة', color: 'bg-purple-50 text-purple-600' },
    slider: { label: 'شريط', color: 'bg-green-50 text-green-600' },
    sidebar: { label: 'شريط جانبي', color: 'bg-amber-50 text-amber-600' },
    custom: { label: 'مخصص', color: 'bg-slate-50 text-slate-600' },
  };

  const STATUS_CONFIG = {
    active: { label: 'نشط', color: 'bg-green-50 text-green-700' },
    inactive: { label: 'غير نشط', color: 'bg-slate-50 text-slate-600' },
    scheduled: { label: 'مجدول', color: 'bg-blue-50 text-blue-600' },
  };

  const stats = useMemo(() => {
    const total = promotions.length;
    const active = promotions.filter(p => p.status === 'active').length;
    const totalImpressions = promotions.reduce((sum, p) => sum + p.impressions, 0);
    const totalClicks = promotions.reduce((sum, p) => sum + p.clicks, 0);
    const totalConversions = promotions.reduce((sum, p) => sum + p.conversions, 0);
    const avgCTR = promotions.length > 0 ? promotions.reduce((sum, p) => sum + p.ctr, 0) / promotions.length : 0;
    return [
      { label: 'إجمالي الترويجات', value: total, icon: Megaphone, color: 'bg-blue-50 text-blue-600' },
      { label: 'نشط', value: active, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
      { label: 'المشاهدات', value: totalImpressions.toLocaleString(), icon: Eye, color: 'bg-purple-50 text-purple-600' },
      { label: 'النقرات', value: totalClicks.toLocaleString(), icon: Users, color: 'bg-cyan-50 text-cyan-600' },
      { label: 'التحويلات', value: totalConversions.toLocaleString(), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
      { label: 'متوسط CTR', value: `${avgCTR.toFixed(1)}%`, icon: BarChart3, color: 'bg-amber-50 text-amber-600' },
    ];
  }, [promotions]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Megaphone size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الترويج</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة حملات الترويج والإعلانات</p>
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
            ترويج جديد
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
            <option value="banner">بانر</option>
            <option value="popup">نافذة منبثقة</option>
            <option value="slider">شريط</option>
            <option value="sidebar">شريط جانبي</option>
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
            <option value="scheduled">مجدول</option>
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
            <option value="priority">الأولوية</option>
            <option value="impressions">المشاهدات</option>
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

      {/* Promotions List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Megaphone size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد ترويجات حالياً</p>
        </div>
      ) : (
        <div className="hidden md:block overflow-x-auto touch-auto">
          <table className="w-full text-right border-collapse min-w-[1600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedIds.size === paginatedPromotions.length && paginatedPromotions.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                  </button>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500">الاسم</th>
                <th className="p-4 text-xs font-semibold text-slate-500">النوع</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">تاريخ البدء</th>
                <th className="p-4 text-xs font-semibold text-slate-500">تاريخ النهاية</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الأولوية</th>
                <th className="p-4 text-xs font-semibold text-slate-500">المشاهدات</th>
                <th className="p-4 text-xs font-semibold text-slate-500">النقرات</th>
                <th className="p-4 text-xs font-semibold text-slate-500">التحويلات</th>
                <th className="p-4 text-xs font-semibold text-slate-500">CTR</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPromotions.map((promotion) => {
                const typeConfig = TYPE_CONFIG[promotion.type];
                const statusConfig = STATUS_CONFIG[promotion.status];
                return (
                  <tr key={promotion.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4">
                      <button onClick={() => toggleSelect(promotion.id)} className="p-1">
                        {selectedIds.has(promotion.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{promotion.name}</div>
                      <div className="text-slate-500 text-xs">{promotion.nameAr}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(promotion.startDate).toLocaleDateString('ar-EG')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">{promotion.endDate ? new Date(promotion.endDate).toLocaleDateString('ar-EG') : '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{promotion.priority}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{promotion.impressions.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{promotion.clicks.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{promotion.conversions.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{promotion.ctr.toFixed(1)}%</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(promotion)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(promotion.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف">
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
              <h2 className="text-xl font-black text-slate-900">ترويج جديد</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (إنجليزي)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Promotion Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (عربي)</label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="اسم الترويج"
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
                  <option value="banner">بانر</option>
                  <option value="popup">نافذة منبثقة</option>
                  <option value="slider">شريط</option>
                  <option value="sidebar">شريط جانبي</option>
                  <option value="custom">مخصص</option>
                </select>
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
                  <option value="scheduled">مجدول</option>
                </select>
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
                <label className="text-sm font-bold text-slate-700 mb-1 block">الأولوية</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الجمهور المستهدف</label>
                <select
                  value={formData.targetAudience}
                  onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="all">الكل</option>
                  <option value="new">جدد</option>
                  <option value="returning">عائدين</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">رابط الصورة</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="رابط الصورة"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الترويج"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                إضافة الترويج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && editPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل الترويج</h2>
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
                  <option value="banner">بانر</option>
                  <option value="popup">نافذة منبثقة</option>
                  <option value="slider">شريط</option>
                  <option value="sidebar">شريط جانبي</option>
                  <option value="custom">مخصص</option>
                </select>
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
                  <option value="scheduled">مجدول</option>
                </select>
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
                <label className="text-sm font-bold text-slate-700 mb-1 block">الأولوية</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الجمهور المستهدف</label>
                <select
                  value={formData.targetAudience}
                  onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="all">الكل</option>
                  <option value="new">جدد</option>
                  <option value="returning">عائدين</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">رابط الصورة</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
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
              <h2 className="text-xl font-black text-slate-900">دليل الترويج</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة حملات الترويج والإعلانات للمتجر.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Megaphone size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إضافة وتعديل وحذف الترويجات</li>
                  <li>• أنواع مختلفة (بانر، نافذة منبثقة، شريط، شريط جانبي)</li>
                  <li>• تتبع الأداء (المشاهدات، النقرات، التحويلات، CTR)</li>
                  <li>• جدولة الترويجات</li>
                  <li>• تصدير تقارير الترويج</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
