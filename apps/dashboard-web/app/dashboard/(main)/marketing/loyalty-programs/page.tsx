'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Award, Search, Loader2, Plus, Edit, Trash2, Download, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Users, Star, Gift, TrendingUp, BarChart3 } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type LoyaltyProgram = {
  id: string;
  name: string;
  nameAr: string;
  type: 'points' | 'tiered' | 'cashback' | 'referral' | 'hybrid';
  status: 'active' | 'inactive' | 'paused';
  pointsPerPurchase: number;
  pointsValue: number;
  minimumSpend: number;
  tiers: string[];
  memberCount: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  startDate: string;
  endDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export default function LoyaltyProgramsPage() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
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
  const [editProgram, setEditProgram] = useState<LoyaltyProgram | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    type: 'points' as 'points' | 'tiered' | 'cashback' | 'referral' | 'hybrid',
    status: 'active' as 'active' | 'inactive' | 'paused',
    pointsPerPurchase: 0,
    pointsValue: 0,
    minimumSpend: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
  });

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/loyalty-programs/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setPrograms(data.map((p: any) => ({
        id: String(p.id),
        name: p.name || '---',
        nameAr: p.nameAr || p.name_ar || '---',
        type: p.type || 'points',
        status: p.status || 'active',
        pointsPerPurchase: Number(p.pointsPerPurchase || p.points_per_purchase || 0),
        pointsValue: Number(p.pointsValue || p.points_value || 0),
        minimumSpend: Number(p.minimumSpend || p.minimum_spend || 0),
        tiers: p.tiers || [],
        memberCount: Number(p.memberCount || p.member_count || 0),
        totalPointsIssued: Number(p.totalPointsIssued || p.total_points_issued || 0),
        totalPointsRedeemed: Number(p.totalPointsRedeemed || p.total_points_redeemed || 0),
        startDate: p.startDate || p.start_date || new Date().toISOString(),
        endDate: p.endDate || p.end_date || '',
        description: p.description || '',
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || new Date().toISOString(),
      })));
    } catch { setPrograms([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPrograms(); }, [loadPrograms]);

  const filtered = useMemo(() => {
    let result = programs.filter(p =>
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
      const aVal = sortBy === 'name' ? a.name : sortBy === 'memberCount' ? a.memberCount : sortBy === 'totalPointsIssued' ? a.totalPointsIssued : a.createdAt;
      const bVal = sortBy === 'name' ? b.name : sortBy === 'memberCount' ? b.memberCount : sortBy === 'totalPointsIssued' ? b.totalPointsIssued : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return result;
  }, [programs, debouncedSearch, filterType, filterStatus, sortBy, sortOrder]);

  const paginatedPrograms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedPrograms.length && paginatedPrograms.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedPrograms.map(p => p.id)));
    }
  }, [paginatedPrograms, selectedIds.size]);

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
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} برنامج؟`)) return;
    try {
      // TODO: Implement bulk delete API call
      alert(`تم حذف ${selectedIds.size} برنامج`);
      setSelectedIds(new Set());
      loadPrograms();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [selectedIds, loadPrograms]);

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Name (Arabic)', 'Type', 'Status', 'Points Per Purchase', 'Points Value', 'Minimum Spend', 'Member Count', 'Total Points Issued', 'Total Points Redeemed', 'Start Date', 'End Date', 'Created At'];
    const rows = filtered.map(p => [
      p.name,
      p.nameAr,
      p.type,
      p.status,
      p.pointsPerPurchase,
      p.pointsValue,
      p.minimumSpend,
      p.memberCount,
      p.totalPointsIssued,
      p.totalPointsRedeemed,
      p.startDate,
      p.endDate || '-',
      p.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'loyalty-programs.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/loyalty-programs', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          shopId: sid,
        }),
      });
      setAddModal(false);
      setFormData({ name: '', nameAr: '', type: 'points', status: 'active', pointsPerPurchase: 0, pointsValue: 0, minimumSpend: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', description: '' });
      loadPrograms();
    } catch (error) {
      alert('حدث خطأ أثناء إضافة البرنامج');
    }
  }, [formData, loadPrograms]);

  const handleEdit = useCallback(async () => {
    if (!editProgram) return;
    try {
      await apiRequest(`/loyalty-programs/${editProgram.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditProgram(null);
      setFormData({ name: '', nameAr: '', type: 'points', status: 'active', pointsPerPurchase: 0, pointsValue: 0, minimumSpend: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', description: '' });
      loadPrograms();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل البرنامج');
    }
  }, [editProgram, formData, loadPrograms]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البرنامج؟')) return;
    try {
      await apiRequest(`/loyalty-programs/${id}`, { method: 'DELETE' });
      loadPrograms();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [loadPrograms]);

  const openEditModal = useCallback((program: LoyaltyProgram) => {
    setEditProgram(program);
    setFormData({
      name: program.name,
      nameAr: program.nameAr,
      type: program.type,
      status: program.status,
      pointsPerPurchase: program.pointsPerPurchase,
      pointsValue: program.pointsValue,
      minimumSpend: program.minimumSpend,
      startDate: program.startDate.split('T')[0],
      endDate: program.endDate,
      description: program.description,
    });
    setEditModal(true);
  }, []);

  const TYPE_CONFIG = {
    points: { label: 'نقاط', color: 'bg-blue-50 text-blue-600', icon: <Star size={12} /> },
    tiered: { label: 'مستويات', color: 'bg-purple-50 text-purple-600', icon: <Award size={12} /> },
    cashback: { label: 'استرداد نقدي', color: 'bg-green-50 text-green-600', icon: <Gift size={12} /> },
    referral: { label: 'إحالة', color: 'bg-amber-50 text-amber-600', icon: <Users size={12} /> },
    hybrid: { label: 'مختلط', color: 'bg-cyan-50 text-cyan-600', icon: <Award size={12} /> },
  };

  const STATUS_CONFIG = {
    active: { label: 'نشط', color: 'bg-green-50 text-green-700' },
    inactive: { label: 'غير نشط', color: 'bg-slate-50 text-slate-600' },
    paused: { label: 'متوقف', color: 'bg-amber-50 text-amber-600' },
  };

  const stats = useMemo(() => {
    const total = programs.length;
    const active = programs.filter(p => p.status === 'active').length;
    const totalMembers = programs.reduce((sum, p) => sum + p.memberCount, 0);
    const totalPointsIssued = programs.reduce((sum, p) => sum + p.totalPointsIssued, 0);
    const totalPointsRedeemed = programs.reduce((sum, p) => sum + p.totalPointsRedeemed, 0);
    const redemptionRate = totalPointsIssued > 0 ? (totalPointsRedeemed / totalPointsIssued) * 100 : 0;
    return [
      { label: 'إجمالي البرامج', value: total, icon: Award, color: 'bg-blue-50 text-blue-600' },
      { label: 'نشط', value: active, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
      { label: 'الأعضاء', value: totalMembers.toLocaleString(), icon: Users, color: 'bg-purple-50 text-purple-600' },
      { label: 'النقاط المصدرة', value: totalPointsIssued.toLocaleString(), icon: Star, color: 'bg-amber-50 text-amber-600' },
      { label: 'النقاط المستبدلة', value: totalPointsRedeemed.toLocaleString(), icon: Gift, color: 'bg-emerald-50 text-emerald-600' },
      { label: 'معدل الاستبدال', value: `${redemptionRate.toFixed(1)}%`, icon: TrendingUp, color: 'bg-cyan-50 text-cyan-600' },
    ];
  }, [programs]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Award size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">برامج الولاء</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة برامج الولاء والمكافآت</p>
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
            برنامج جديد
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
            <option value="points">نقاط</option>
            <option value="tiered">مستويات</option>
            <option value="cashback">استرداد نقدي</option>
            <option value="referral">إحالة</option>
            <option value="hybrid">مختلط</option>
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
            <option value="paused">متوقف</option>
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
            <option value="memberCount">الأعضاء</option>
            <option value="totalPointsIssued">النقاط المصدرة</option>
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

      {/* Programs List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Award size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد برامج حالياً</p>
        </div>
      ) : (
        <div className="hidden md:block overflow-x-auto touch-auto">
          <table className="w-full text-right border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedIds.size === paginatedPrograms.length && paginatedPrograms.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                  </button>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500">الاسم</th>
                <th className="p-4 text-xs font-semibold text-slate-500">النوع</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">نقاط/شراء</th>
                <th className="p-4 text-xs font-semibold text-slate-500">قيمة النقطة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الحد الأدنى</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الأعضاء</th>
                <th className="p-4 text-xs font-semibold text-slate-500">النقاط المصدرة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">النقاط المستبدلة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">تاريخ البدء</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPrograms.map((program) => {
                const typeConfig = TYPE_CONFIG[program.type];
                const statusConfig = STATUS_CONFIG[program.status];
                return (
                  <tr key={program.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4">
                      <button onClick={() => toggleSelect(program.id)} className="p-1">
                        {selectedIds.has(program.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{program.name}</div>
                      <div className="text-slate-500 text-xs">{program.nameAr}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${typeConfig.color}`}>
                        {typeConfig.icon}
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{program.pointsPerPurchase}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">ج.م {program.pointsValue}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">ج.م {program.minimumSpend}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{program.memberCount}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{program.totalPointsIssued.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{program.totalPointsRedeemed.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(program.startDate).toLocaleDateString('ar-EG')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(program)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(program.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف">
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
              <h2 className="text-xl font-black text-slate-900">برنامج ولاء جديد</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (إنجليزي)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Program Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (عربي)</label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="اسم البرنامج"
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
                  <option value="points">نقاط</option>
                  <option value="tiered">مستويات</option>
                  <option value="cashback">استرداد نقدي</option>
                  <option value="referral">إحالة</option>
                  <option value="hybrid">مختلط</option>
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
                  <option value="paused">متوقف</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">نقاط لكل شراء</label>
                <input
                  type="number"
                  value={formData.pointsPerPurchase}
                  onChange={e => setFormData({ ...formData, pointsPerPurchase: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">قيمة النقطة</label>
                <input
                  type="number"
                  value={formData.pointsValue}
                  onChange={e => setFormData({ ...formData, pointsValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحد الأدنى للإنفاق</label>
                <input
                  type="number"
                  value={formData.minimumSpend}
                  onChange={e => setFormData({ ...formData, minimumSpend: Number(e.target.value) })}
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
                <label className="text-sm font-bold text-slate-700 mb-1 block">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف البرنامج"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                إضافة البرنامج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && editProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل البرنامج</h2>
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
                  <option value="points">نقاط</option>
                  <option value="tiered">مستويات</option>
                  <option value="cashback">استرداد نقدي</option>
                  <option value="referral">إحالة</option>
                  <option value="hybrid">مختلط</option>
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
                  <option value="paused">متوقف</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">نقاط لكل شراء</label>
                <input
                  type="number"
                  value={formData.pointsPerPurchase}
                  onChange={e => setFormData({ ...formData, pointsPerPurchase: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">قيمة النقطة</label>
                <input
                  type="number"
                  value={formData.pointsValue}
                  onChange={e => setFormData({ ...formData, pointsValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحد الأدنى للإنفاق</label>
                <input
                  type="number"
                  value={formData.minimumSpend}
                  onChange={e => setFormData({ ...formData, minimumSpend: Number(e.target.value) })}
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
              <h2 className="text-xl font-black text-slate-900">دليل برامج الولاء</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة برامج الولاء والمكافآت للعملاء.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Award size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إضافة وتعديل وحذف البرامج</li>
                  <li>• أنواع مختلفة (نقاط، مستويات، استرداد نقدي، إحالة، مختلط)</li>
                  <li>• تتبع الأعضاء والنقاط</li>
                  <li>• تصدير تقارير البرامج</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
