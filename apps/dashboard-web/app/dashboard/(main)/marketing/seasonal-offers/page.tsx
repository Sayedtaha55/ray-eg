'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarHeart, Search, Plus, Download, RefreshCw, Info, X, Edit, Trash2,
  ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check,
  Calendar, Tag, Percent, TrendingUp, Clock, Sparkles,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type SeasonalOffer = {
  id: string;
  name: string;
  description: string;
  occasion: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  categories: string[];
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'active' | 'paused' | 'ended' | 'expired' | 'draft';
  bannerColor: string;
  usageCount: number;
  revenue: number;
  createdAt: string;
};

const OCCASIONS = [
  { name: 'رمضان', color: 'bg-green-50 text-green-700', banner: '#059669' },
  { name: 'عيد الفطر', color: 'bg-amber-50 text-amber-700', banner: '#d97706' },
  { name: 'عيد الأضحى', color: 'bg-orange-50 text-orange-700', banner: '#ea580c' },
  { name: 'الجمعة البيضاء', color: 'bg-slate-50 text-slate-700', banner: '#475569' },
  { name: 'العيد الوطني', color: 'bg-red-50 text-red-700', banner: '#dc2626' },
  { name: 'العودة للمدارس', color: 'bg-blue-50 text-blue-700', banner: '#2563eb' },
  { name: 'نهاية العام', color: 'bg-purple-50 text-purple-700', banner: '#7c3aed' },
  { name: 'عيد الحب', color: 'bg-pink-50 text-pink-700', banner: '#db2777' },
  { name: 'البلاك فرايداي', color: 'bg-slate-900 text-white', banner: '#000000' },
  { name: 'موسم الصيف', color: 'bg-cyan-50 text-cyan-700', banner: '#0891b2' },
];

const emptyForm = {
  name: '',
  description: '',
  occasion: '',
  discountType: 'percentage' as 'percentage' | 'fixed',
  discountValue: 10,
  categories: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  bannerColor: '#00E5FF',
};

export default function SeasonalOffersPage() {
  const [offers, setOffers] = useState<SeasonalOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOccasion, setFilterOccasion] = useState('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState<SeasonalOffer | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/marketing/seasonal-offers/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setOffers(data.map((o: any) => ({
        id: String(o.id),
        name: o.name || '',
        description: o.description || '',
        occasion: o.occasion || '',
        discountType: o.discountType || 'percentage',
        discountValue: Number(o.discountValue ?? 0),
        categories: Array.isArray(o.categories) ? o.categories : [],
        startDate: o.startDate || new Date().toISOString(),
        endDate: o.endDate || '',
        status: (o.status === 'ended' ? 'expired' : o.status) || 'draft',
        bannerColor: o.bannerColor || '#00E5FF',
        usageCount: Number(o.usageCount ?? 0),
        revenue: Number(o.revenue ?? 0),
        createdAt: o.createdAt || new Date().toISOString(),
      })));
    } catch { setOffers([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  const filtered = useMemo(() => {
    let result = offers.filter(o =>
      o.name.includes(debouncedSearch) ||
      o.description.includes(debouncedSearch) ||
      o.occasion.includes(debouncedSearch)
    );
    if (filterStatus !== 'all') {
      result = result.filter(o => o.status === filterStatus);
    }
    if (filterOccasion !== 'all') {
      result = result.filter(o => o.occasion === filterOccasion);
    }
    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'startDate' ? a.startDate : sortBy === 'endDate' ? a.endDate : sortBy === 'usageCount' ? a.usageCount : sortBy === 'revenue' ? a.revenue : a.discountValue;
      const bVal = sortBy === 'startDate' ? b.startDate : sortBy === 'endDate' ? b.endDate : sortBy === 'usageCount' ? b.usageCount : sortBy === 'revenue' ? b.revenue : b.discountValue;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [offers, debouncedSearch, filterStatus, filterOccasion, sortBy, sortOrder]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleSave = useCallback(async (isEdit: boolean) => {
    if (!formData.name || !formData.occasion) { alert('يرجى إدخال الاسم والمناسبة'); return; }
    if (!formData.endDate) { alert('يرجى تحديد تاريخ الانتهاء'); return; }
    setSaving(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      const payload = {
        ...formData,
        shopId: sid,
        categories: formData.categories ? formData.categories.split(',').map(c => c.trim()) : [],
      };
      if (isEdit && editItem) {
        await apiRequest(`/marketing/seasonal-offers/${editItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setEditModal(false);
        setEditItem(null);
      } else {
        await apiRequest('/marketing/seasonal-offers', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setAddModal(false);
      }
      setFormData(emptyForm);
      loadOffers();
    } catch { alert('حدث خطأ أثناء الحفظ'); }
    finally { setSaving(false); }
  }, [formData, editItem, loadOffers]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
    try {
      await apiRequest(`/marketing/seasonal-offers/${id}`, { method: 'DELETE' });
      loadOffers();
    } catch { alert('حدث خطأ أثناء الحذف'); }
  }, [loadOffers]);

  const openEditModal = useCallback((o: SeasonalOffer) => {
    setEditItem(o);
    setFormData({
      name: o.name,
      description: o.description,
      occasion: o.occasion,
      discountType: o.discountType,
      discountValue: o.discountValue,
      categories: o.categories.join(', '),
      startDate: o.startDate.split('T')[0],
      endDate: o.endDate.split('T')[0],
      bannerColor: o.bannerColor,
    });
    setEditModal(true);
  }, []);

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Occasion', 'Discount Type', 'Discount Value', 'Start Date', 'End Date', 'Status', 'Usage Count', 'Revenue'];
    const rows = filtered.map(o => [o.name, o.occasion, o.discountType, o.discountValue, o.startDate, o.endDate, o.status, o.usageCount, o.revenue]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'seasonal-offers.csv';
    link.click();
  }, [filtered]);

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    draft: { label: 'مسودة', color: 'bg-slate-50 text-slate-600' },
    scheduled: { label: 'مجدول', color: 'bg-blue-50 text-blue-700' },
    active: { label: 'نشط', color: 'bg-green-50 text-green-700' },
    expired: { label: 'منتهي', color: 'bg-red-50 text-red-700' },
  };

  const stats = useMemo(() => {
    const total = offers.length;
    const active = offers.filter(o => o.status === 'active').length;
    const scheduled = offers.filter(o => o.status === 'scheduled').length;
    const expired = offers.filter(o => o.status === 'expired').length;
    const totalUsage = offers.reduce((s, o) => s + o.usageCount, 0);
    const totalRevenue = offers.reduce((s, o) => s + o.revenue, 0);
    return [
      { label: 'إجمالي العروض', value: total, icon: CalendarHeart, color: 'bg-blue-50 text-blue-600' },
      { label: 'نشطة', value: active, icon: Sparkles, color: 'bg-green-50 text-green-600' },
      { label: 'مجدولة', value: scheduled, icon: Clock, color: 'bg-cyan-50 text-cyan-600' },
      { label: 'منتهية', value: expired, icon: Calendar, color: 'bg-slate-50 text-slate-600' },
      { label: 'مرات الاستخدام', value: totalUsage.toLocaleString(), icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
      { label: 'الإيرادات', value: `${totalRevenue.toLocaleString()} ج.م`, icon: Tag, color: 'bg-amber-50 text-amber-600' },
    ];
  }, [offers]);

  const renderForm = (isEdit: boolean) => (
    <div className="space-y-4">
      {/* Occasion Templates */}
      <div>
        <label className="text-sm font-bold text-slate-700 mb-2 block">قوالب المناسبات</label>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((occ) => (
            <button key={occ.name} onClick={() => setFormData({ ...formData, occasion: occ.name, bannerColor: occ.banner, name: formData.name || `عرض ${occ.name}` })} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${occ.color} hover:opacity-80 transition-all`}>
              {occ.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">اسم العرض</label>
        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="مثال: عروض رمضان 2026" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">الوصف</label>
        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="وصف العرض" rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">المناسبة</label>
        <input type="text" value={formData.occasion} onChange={e => setFormData({ ...formData, occasion: e.target.value })} placeholder="المناسبة" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">نوع الخصم</label>
          <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="percentage">نسبة مئوية %</option>
            <option value="fixed">مبلغ ثابت</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">قيمة الخصم</label>
          <input type="number" value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">الفئات (افصل بفاصلة)</label>
        <input type="text" value={formData.categories} onChange={e => setFormData({ ...formData, categories: e.target.value })} placeholder="مثال: إلكترونيات، ملابس، أحذية" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ البداية</label>
          <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ النهاية</label>
          <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">لون البانر</label>
        <div className="flex items-center gap-2">
          <input type="color" value={formData.bannerColor} onChange={e => setFormData({ ...formData, bannerColor: e.target.value })} className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer" />
          <input type="text" value={formData.bannerColor} onChange={e => setFormData({ ...formData, bannerColor: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
      </div>
      <button onClick={() => handleSave(isEdit)} disabled={saving} className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all disabled:opacity-50">
        {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إنشاء العرض'}
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <CalendarHeart size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">العروض الموسمية</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إنشاء وإدارة العروض الموسمية والمناسبات</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
            <div className={`p-2 rounded-xl ${s.color}`}><s.icon size={20} /></div>
            <div className="min-w-0"><p className="text-xs font-bold text-slate-400 truncate">{s.label}</p><p className="text-sm font-black text-slate-900 truncate">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all">
          <Plus size={18} /> عرض موسمي جديد
        </button>
        <button onClick={() => loadOffers()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
          <RefreshCw size={18} /> تحديث
        </button>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
          <Download size={18} /> تصدير CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في العروض الموسمية..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الحالة:</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="all">الكل</option>
            <option value="draft">مسودة</option>
            <option value="scheduled">مجدول</option>
            <option value="active">نشط</option>
            <option value="expired">منتهي</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">المناسبة:</span>
          <select value={filterOccasion} onChange={e => setFilterOccasion(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="all">الكل</option>
            {OCCASIONS.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الترتيب:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="startDate">تاريخ البداية</option>
            <option value="endDate">تاريخ النهاية</option>
            <option value="discountValue">قيمة الخصم</option>
            <option value="usageCount">الاستخدام</option>
            <option value="revenue">الإيرادات</option>
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
          <CalendarHeart size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد عروض موسمية حالياً</p>
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((o) => {
              const statusConfig = STATUS_CONFIG[o.status];
              return (
                <div key={o.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Banner */}
                  <div className="h-20 flex items-center justify-center relative" style={{ backgroundColor: o.bannerColor }}>
                    <div className="text-white font-black text-lg text-center px-2">{o.name}</div>
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold ${statusConfig.color}`}>{statusConfig.label}</span>
                  </div>
                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">{o.occasion}</span>
                      <span className="flex items-center gap-1 text-xs font-black text-[#00E5FF]">
                        <Percent size={12} />
                        {o.discountType === 'percentage' ? `${o.discountValue}%` : `${o.discountValue} ج.م`}
                      </span>
                    </div>
                    {o.description && <p className="text-xs text-slate-600 line-clamp-2">{o.description}</p>}
                    {o.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {o.categories.slice(0, 3).map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">{c}</span>
                        ))}
                        {o.categories.length > 3 && <span className="text-[10px] text-slate-400">+{o.categories.length - 3}</span>}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(o.startDate).toLocaleDateString('ar-EG')} - {new Date(o.endDate).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><TrendingUp size={12} /> {o.usageCount}</span>
                        <span className="flex items-center gap-1"><Tag size={12} /> {o.revenue.toLocaleString()} ج.م</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(o)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(o.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-xs font-bold text-slate-500">عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} من {filtered.length}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
                <span className="text-xs font-bold text-slate-600 px-3">صفحة {currentPage} من {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={18} /></button>
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
              <h2 className="text-xl font-black text-slate-900">عرض موسمي جديد</h2>
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
              <h2 className="text-xl font-black text-slate-900">تعديل العرض</h2>
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
              <h2 className="text-xl font-black text-slate-900">دليل العروض الموسمية</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إنشاء وإدارة العروض الموسمية والمناسبات (رمضان، الأعياد، الجمعة البيضاء).</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Sparkles size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إنشاء عروض موسمية محددة المدة</li>
                  <li>• قوالب جاهزة للمناسبات</li>
                  <li>• جدولة تلقائية للتفعيل والإيقاف</li>
                  <li>• خصومات موسمية على فئات محددة</li>
                  <li>• تقارير أداء العروض الموسمية</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
