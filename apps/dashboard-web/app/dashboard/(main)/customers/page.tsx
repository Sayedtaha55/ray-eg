'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Search, Loader2, Plus, Edit, Trash2, Download, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Mail, Phone, MapPin, ShoppingBag, Star, TrendingUp, Crown, Repeat, Megaphone, UserCheck, UserMinus, Wallet, Eye } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Customer = {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: 'active' | 'inactive' | 'blocked';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  registrationDate: string;
  loyaltyPoints: number;
  averageOrderValue: number;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
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
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    status: 'active' as 'active' | 'inactive' | 'blocked',
    description: '',
  });

  // ===== New: Smart analytics & sections =====
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<'all' | 'top' | 'atRisk' | 'churned'>('all');
  const [spendingFilter, setSpendingFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedDetailCustomer, setSelectedDetailCustomer] = useState<Customer | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/customers/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setCustomers(data.map((c: any) => ({
        id: String(c.id),
        name: c.name || '---',
        nameAr: c.nameAr || c.name_ar || '---',
        email: c.email || '---',
        phone: c.phone || '---',
        address: c.address || '---',
        city: c.city || '---',
        country: c.country || '---',
        status: c.status || 'active',
        totalOrders: Number(c.totalOrders || c.total_orders || 0),
        totalSpent: Number(c.totalSpent || c.total_spent || 0),
        lastOrderDate: c.lastOrderDate || c.last_order_date || null,
        registrationDate: c.registrationDate || c.registration_date || new Date().toISOString(),
        loyaltyPoints: Number(c.loyaltyPoints || c.loyalty_points || 0),
        averageOrderValue: Number(c.averageOrderValue || c.average_order_value || 0),
        description: c.description || '',
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: c.updatedAt || new Date().toISOString(),
      })));
    } catch { setCustomers([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  // ===== New: Load analytics =====
  const loadAnalytics = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      const data = await apiRequest(`/shops/${sid}/customers/analytics`);
      setAnalytics(data);
    } catch { setAnalytics(null); }
  }, []);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  // ===== New: Customer detail drawer =====
  const openCustomerDetail = useCallback(async (customer: Customer) => {
    setSelectedDetailCustomer(customer);
    setDetailLoading(true);
    setCustomerDetail(null);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (sid) {
        const detail = await apiRequest(`/shops/${sid}/customers/${customer.id}/detail`);
        setCustomerDetail(detail);
      }
    } catch { setCustomerDetail(null); }
    finally { setDetailLoading(false); }
  }, []);

  const closeCustomerDetail = useCallback(() => {
    setSelectedDetailCustomer(null);
    setCustomerDetail(null);
  }, []);

  // ===== New: Send promotion =====
  const sendPromotion = useCallback(async (customerId: string) => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest(`/shops/${sid}/customers/${customerId}/promote`, { method: 'POST' });
      alert('تم إرسال العرض الترويجي بنجاح');
    } catch { alert('فشل إرسال العرض الترويجي'); }
  }, []);

  // ===== New: Toggle status (active/blocked) =====
  const toggleStatus = useCallback(async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await apiRequest(`/customers/${id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
    } catch { alert('فشل تحديث حالة العميل'); }
  }, []);

  const filtered = useMemo(() => {
    let result = customers.filter(c =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.nameAr.includes(debouncedSearch) ||
      c.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.phone.includes(debouncedSearch)
    );

    if (filterStatus !== 'all') {
      result = result.filter(c => c.status === filterStatus);
    }

    // New: spending filter
    if (spendingFilter !== 'all') {
      result = result.filter(c => {
        const t = Number(c.totalSpent);
        return spendingFilter === 'high' ? t >= 1000 : spendingFilter === 'medium' ? t >= 200 && t < 1000 : t < 200;
      });
    }

    // New: section filter (top/atRisk/churned)
    if (analytics && activeSection !== 'all') {
      if (activeSection === 'top') {
        const topIds = new Set((analytics.topCustomers || []).map((c: any) => c.id));
        result = result.filter(c => topIds.has(c.id));
      } else if (activeSection === 'atRisk') {
        const riskIds = new Set((analytics.atRiskCustomers || []).map((c: any) => c.id));
        result = result.filter(c => riskIds.has(c.id));
      } else if (activeSection === 'churned') {
        const churnedIds = new Set((analytics.churnedCustomers || []).map((c: any) => c.id));
        result = result.filter(c => churnedIds.has(c.id));
      }
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : sortBy === 'totalSpent' ? a.totalSpent : sortBy === 'totalOrders' ? a.totalOrders : a.createdAt;
      const bVal = sortBy === 'name' ? b.name : sortBy === 'totalSpent' ? b.totalSpent : sortBy === 'totalOrders' ? b.totalOrders : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return result;
  }, [customers, debouncedSearch, filterStatus, sortBy, sortOrder, spendingFilter, activeSection, analytics]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedCustomers.length && paginatedCustomers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedCustomers.map(c => c.id)));
    }
  }, [paginatedCustomers, selectedIds.size]);

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
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} عميل؟`)) return;
    try {
      // TODO: Implement bulk delete API call
      alert(`تم حذف ${selectedIds.size} عميل`);
      setSelectedIds(new Set());
      loadCustomers();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [selectedIds, loadCustomers]);

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Name (Arabic)', 'Email', 'Phone', 'Address', 'City', 'Country', 'Status', 'Total Orders', 'Total Spent', 'Last Order Date', 'Registration Date', 'Loyalty Points', 'Average Order Value', 'Created At'];
    const rows = filtered.map(c => [
      c.name,
      c.nameAr,
      c.email,
      c.phone,
      c.address,
      c.city,
      c.country,
      c.status,
      c.totalOrders,
      c.totalSpent,
      c.lastOrderDate || '-',
      c.registrationDate,
      c.loyaltyPoints,
      c.averageOrderValue,
      c.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'customers.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/customers', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          shopId: sid,
        }),
      });
      setAddModal(false);
      setFormData({ name: '', nameAr: '', email: '', phone: '', address: '', city: '', country: '', status: 'active', description: '' });
      loadCustomers();
    } catch (error) {
      alert('حدث خطأ أثناء إضافة العميل');
    }
  }, [formData, loadCustomers]);

  const handleEdit = useCallback(async () => {
    if (!editCustomer) return;
    try {
      await apiRequest(`/customers/${editCustomer.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditCustomer(null);
      setFormData({ name: '', nameAr: '', email: '', phone: '', address: '', city: '', country: '', status: 'active', description: '' });
      loadCustomers();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل العميل');
    }
  }, [editCustomer, formData, loadCustomers]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    try {
      await apiRequest(`/customers/${id}`, { method: 'DELETE' });
      loadCustomers();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [loadCustomers]);

  const openEditModal = useCallback((customer: Customer) => {
    setEditCustomer(customer);
    setFormData({
      name: customer.name,
      nameAr: customer.nameAr,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      status: customer.status,
      description: customer.description,
    });
    setEditModal(true);
  }, []);

  const STATUS_CONFIG = {
    active: { label: 'نشط', color: 'bg-green-50 text-green-700' },
    inactive: { label: 'غير نشط', color: 'bg-slate-50 text-slate-600' },
    blocked: { label: 'محظور', color: 'bg-red-50 text-red-600' },
  };

  // New: format days helper
  const formatDays = (days: number) => {
    if (days === 0) return 'اليوم';
    if (days === 1) return 'أمس';
    if (days < 7) return `منذ ${days} أيام`;
    if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
    if (days < 365) return `منذ ${Math.floor(days / 30)} أشهر`;
    return `منذ ${Math.floor(days / 365)} سنوات`;
  };

  const getLastVisitDays = (customer: Customer) => {
    if (!customer.lastOrderDate) return null;
    return Math.floor((Date.now() - new Date(customer.lastOrderDate).getTime()) / 86400000);
  };

  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
    const avgOrderValue = customers.length > 0 ? totalSpent / totalOrders : 0;
    const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
    return [
      { label: 'إجمالي العملاء', value: total, icon: Users, color: 'bg-blue-50 text-blue-600' },
      { label: 'نشط', value: active, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
      { label: 'إجمالي الإنفاق', value: `ج.م ${totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
      { label: 'إجمالي الطلبات', value: totalOrders.toLocaleString(), icon: ShoppingBag, color: 'bg-amber-50 text-amber-600' },
      { label: 'متوسط الطلب', value: `ج.م ${avgOrderValue.toFixed(0)}`, icon: Star, color: 'bg-cyan-50 text-cyan-600' },
      { label: 'نقاط الولاء', value: totalLoyaltyPoints.toLocaleString(), icon: Star, color: 'bg-emerald-50 text-emerald-600' },
    ];
  }, [customers]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Users size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">العملاء</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة بيانات العملاء</p>
        </div>
      </div>

      {/* Smart Analytics Cards (from old version) */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><Users className="w-4 h-4 text-blue-600" /></div>
              <span className="text-xs font-bold text-slate-500">إجمالي العملاء</span>
            </div>
            <p className="text-xl font-black text-slate-900">{analytics.totalCustomers || 0}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">+{analytics.newCustomersThisMonth || 0} جديد هذا الشهر</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center"><Repeat className="w-4 h-4 text-green-600" /></div>
              <span className="text-xs font-bold text-slate-500">نسبة العائدين</span>
            </div>
            <p className="text-xl font-black text-slate-900">{analytics.retentionRate || 0}%</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">{analytics.returningCustomers || 0} عميل عائد</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-purple-600" /></div>
              <span className="text-xs font-bold text-slate-500">متوسط الزيارات</span>
            </div>
            <p className="text-xl font-black text-slate-900">{analytics.avgVisitsPerCustomer || 0}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">زيارة لكل عميل</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-amber-600" /></div>
              <span className="text-xs font-bold text-slate-500">معرضون للتوقف</span>
            </div>
            <p className="text-xl font-black text-slate-900">{analytics.atRiskCustomers?.length || 0}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">{analytics.churnedCustomers?.length || 0} توقفوا بالفعل</p>
          </div>
        </div>
      )}

      {/* Section Tabs (from old version) */}
      {analytics && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveSection('all')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${activeSection === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <Users size={14} /> كل العملاء
          </button>
          <button onClick={() => setActiveSection('top')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${activeSection === 'top' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <Crown size={14} /> أفضل العملاء
          </button>
          <button onClick={() => setActiveSection('atRisk')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${activeSection === 'atRisk' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <AlertTriangle size={14} /> معرضون للتوقف
            {analytics.atRiskCustomers?.length > 0 && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[10px]">{analytics.atRiskCustomers.length}</span>}
          </button>
          <button onClick={() => setActiveSection('churned')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${activeSection === 'churned' ? 'bg-red-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <Clock size={14} /> توقفوا عن الشراء
            {analytics.churnedCustomers?.length > 0 && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-[10px]">{analytics.churnedCustomers.length}</span>}
          </button>
        </div>
      )}

      {/* At-Risk Alert Banner */}
      {analytics && activeSection === 'atRisk' && analytics.atRiskCustomers?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-xs font-bold text-amber-800">هؤلاء العملاء لم يطلبوا منذ 60-90 يوماً — تواصل معهم قبل أن يتركوا نهائياً!</p>
        </div>
      )}

      {/* Churned Alert Banner */}
      {analytics && activeSection === 'churned' && analytics.churnedCustomers?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
          <Clock className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-xs font-bold text-red-800">هؤلاء العملاء لم يطلبوا منذ أكثر من 90 يوماً — أرسل لهم عرضاً خاصاً لإعادتهم!</p>
        </div>
      )}

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
            عميل جديد
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الإيميل أو الهاتف..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
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
            <option value="blocked">محظور</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الإنفاق:</span>
          <select
            value={spendingFilter}
            onChange={e => setSpendingFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">كل المستويات</option>
            <option value="high">عالي (1000+)</option>
            <option value="medium">متوسط (200-1000)</option>
            <option value="low">منخفض (&lt;200)</option>
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
            <option value="totalSpent">إجمالي الإنفاق</option>
            <option value="totalOrders">إجمالي الطلبات</option>
            <option value="createdAt">تاريخ التسجيل</option>
          </select>
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
        >
          {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا يوجد عملاء حالياً</p>
        </div>
      ) : (
        <div className="hidden md:block overflow-x-auto touch-auto">
          <table className="w-full text-right border-collapse min-w-[1600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedIds.size === paginatedCustomers.length && paginatedCustomers.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                  </button>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500">الاسم</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الإيميل</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الهاتف</th>
                <th className="p-4 text-xs font-semibold text-slate-500">العنوان</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الطلبات</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الإنفاق</th>
                <th className="p-4 text-xs font-semibold text-slate-500">آخر طلب</th>
                <th className="p-4 text-xs font-semibold text-slate-500">نقاط الولاء</th>
                <th className="p-4 text-xs font-semibold text-slate-500">متوسط الطلب</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer) => {
                const statusConfig = STATUS_CONFIG[customer.status];
                return (
                  <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4">
                      <button onClick={() => toggleSelect(customer.id)} className="p-1">
                        {selectedIds.has(customer.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{customer.name}</div>
                      <div className="text-slate-500 text-xs">{customer.nameAr}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm flex items-center gap-1">
                        <Mail size={12} />
                        {customer.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm flex items-center gap-1">
                        <Phone size={12} />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm flex items-center gap-1">
                        <MapPin size={12} />
                        {customer.city}, {customer.country}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{customer.totalOrders}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">ج.م {customer.totalSpent.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('ar-EG') : '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                        <Star size={12} className="text-amber-500" />
                        {customer.loyaltyPoints}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">ج.م {customer.averageOrderValue.toFixed(0)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openCustomerDetail(customer)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all" title="عرض التفاصيل">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => sendPromotion(customer.id)} className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all" title="إرسال عرض ترويجي">
                          <Megaphone size={14} />
                        </button>
                        <button onClick={() => openEditModal(customer)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => toggleStatus(customer.id, customer.status)} className={`p-1.5 rounded-lg transition-all ${customer.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-500 hover:text-white'}`} title={customer.status === 'active' ? 'حظر' : 'تفعيل'}>
                          {customer.status === 'active' ? <UserMinus size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف">
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
              <h2 className="text-xl font-black text-slate-900">عميل جديد</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (إنجليزي)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (عربي)</label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="اسم العميل"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الإيميل</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الهاتف</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+20 123 456 7890"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">العنوان</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="العنوان"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">المدينة</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="المدينة"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">البلد</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  placeholder="البلد"
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
                  <option value="blocked">محظور</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف العميل"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                إضافة العميل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && editCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل العميل</h2>
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
                <label className="text-sm font-bold text-slate-700 mb-1 block">الإيميل</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الهاتف</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">العنوان</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">المدينة</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">البلد</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
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
                  <option value="blocked">محظور</option>
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
              <h2 className="text-xl font-black text-slate-900">دليل العملاء</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة بيانات العملاء والمعلومات الشخصية.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Users size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إضافة وتعديل وحذف العملاء</li>
                  <li>• تتبع الطلبات والإنفاق</li>
                  <li>• إدارة نقاط الولاء</li>
                  <li>• تصدير تقارير العملاء</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer (from old version) */}
      {selectedDetailCustomer && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeCustomerDetail} />
          <div className="relative ml-auto w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg ${customerDetail?.stats?.isChurned ? 'bg-red-100 text-red-500' : customerDetail?.stats?.isAtRisk ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                  {selectedDetailCustomer.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">{customerDetail?.customer?.name || selectedDetailCustomer.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold">
                    {customerDetail?.stats?.isChurned ? 'توقف عن الشراء' : customerDetail?.stats?.isAtRisk ? 'معرض للتوقف' : 'عميل نشط'}
                  </p>
                </div>
              </div>
              <button onClick={closeCustomerDetail} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-all">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
              </div>
            ) : customerDetail ? (
              <div className="p-5 space-y-5">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-2">
                  {customerDetail.customer?.phone && (
                    <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 truncate">{customerDetail.customer.phone}</span>
                    </div>
                  )}
                  {customerDetail.customer?.email && (
                    <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 truncate">{customerDetail.customer.email}</span>
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <ShoppingBag className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-black text-slate-900">{customerDetail.stats?.totalOrders || 0}</p>
                    <p className="text-[10px] font-bold text-slate-500">طلبات</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <Wallet className="w-4 h-4 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-black text-slate-900">{(customerDetail.stats?.totalSpent || 0).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-500">إجمالي الإنفاق</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <TrendingUp className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-black text-slate-900">{customerDetail.stats?.avgOrderValue || 0}</p>
                    <p className="text-[10px] font-bold text-slate-500">متوسط الطلب</p>
                  </div>
                </div>

                {/* Spending Chart (MiniBarChart) */}
                {customerDetail.monthlySpending && customerDetail.monthlySpending.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-500 mb-2">الإنفاق الشهري (آخر 6 أشهر)</p>
                    <div className="flex items-end gap-1.5 h-12">
                      {customerDetail.monthlySpending.map((d: any, i: number) => {
                        const max = Math.max(...customerDetail.monthlySpending.map((x: any) => x.total), 1);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full rounded-t bg-blue-500 opacity-80 transition-all hover:opacity-100" style={{ height: `${Math.max((d.total / max) * 100, 4)}%` }} title={`${d.month}: ${d.total}`} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {customerDetail.monthlySpending.map((m: any, i: number) => (
                        <span key={i} className="text-[9px] text-slate-400 font-bold">{m.month?.split(' ')[0]}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Favorite Products */}
                {customerDetail.favoriteProducts && customerDetail.favoriteProducts.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 mb-2">المنتجات المفضلة</p>
                    <div className="space-y-1.5">
                      {customerDetail.favoriteProducts.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl p-2.5">
                          <span className="text-xs font-bold text-slate-700">{p.name}</span>
                          <span className="text-[10px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-lg">{p.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order History */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 mb-2">سجل الطلبات</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {customerDetail.orders && customerDetail.orders.length > 0 ? (
                      customerDetail.orders.map((o: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${o.status === 'DELIVERED' ? 'bg-green-100 text-green-600' : o.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">ج.م {o.total?.toLocaleString()}</p>
                              <p className="text-[10px] text-slate-500">{o.date ? new Date(o.date).toLocaleDateString('ar-EG') : ''}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${o.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : o.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>{o.status}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-3">لا يوجد طلبات</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => sendPromotion(selectedDetailCustomer.id)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black text-white bg-purple-500 hover:bg-purple-600 transition-all">
                    <Megaphone className="w-4 h-4" /> إرسال عرض ترويجي
                  </button>
                  <button onClick={() => { toggleStatus(selectedDetailCustomer.id, selectedDetailCustomer.status); closeCustomerDetail(); }} className={`px-3 py-2.5 rounded-xl text-xs font-black transition-all ${selectedDetailCustomer.status === 'active' ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'}`}>
                    {selectedDetailCustomer.status === 'active' ? 'حظر' : 'تفعيل'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-slate-400 font-bold">لا توجد بيانات متاحة</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
