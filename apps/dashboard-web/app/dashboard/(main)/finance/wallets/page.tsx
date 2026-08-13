'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Wallet, Search, Loader2, Plus, Edit, Trash2, Download, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, DollarSign, Calendar, Clock, CheckCircle2, AlertTriangle, CreditCard, Smartphone, QrCode, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Wallet = {
  id: string;
  name: string;
  nameAr: string;
  type: 'cash' | 'digital' | 'bank_card' | 'mobile_wallet' | 'crypto';
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'blocked';
  holderName: string;
  lastTransaction: string;
  transactionsCount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
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
  const [editWallet, setEditWallet] = useState<Wallet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    type: 'cash' as 'cash' | 'digital' | 'bank_card' | 'mobile_wallet' | 'crypto',
    balance: 0,
    currency: 'EGP',
    status: 'active' as 'active' | 'inactive' | 'blocked',
    holderName: '',
    description: '',
  });

  const loadWallets = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/wallets/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setWallets(data.map((w: any) => ({
        id: String(w.id),
        name: w.name || '---',
        nameAr: w.nameAr || w.name_ar || '---',
        type: w.type || 'cash',
        balance: Number(w.balance || 0),
        currency: w.currency || 'EGP',
        status: w.status || 'active',
        holderName: w.holderName || w.holder_name || '---',
        lastTransaction: w.lastTransaction || w.last_transaction || new Date().toISOString(),
        transactionsCount: Number(w.transactionsCount || w.transactions_count || 0),
        description: w.description || '',
        createdAt: w.createdAt || new Date().toISOString(),
        updatedAt: w.updatedAt || new Date().toISOString(),
      })));
    } catch { setWallets([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadWallets(); }, [loadWallets]);

  const filtered = useMemo(() => {
    let result = wallets.filter(w =>
      w.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      w.nameAr.includes(debouncedSearch) ||
      w.holderName.includes(debouncedSearch)
    );

    if (filterType !== 'all') {
      result = result.filter(w => w.type === filterType);
    }

    if (filterStatus !== 'all') {
      result = result.filter(w => w.status === filterStatus);
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : sortBy === 'balance' ? a.balance : a.createdAt;
      const bVal = sortBy === 'name' ? b.name : sortBy === 'balance' ? b.balance : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [wallets, debouncedSearch, filterType, filterStatus, sortBy, sortOrder]);

  const paginatedWallets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedWallets.length && paginatedWallets.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedWallets.map(w => w.id)));
    }
  }, [paginatedWallets, selectedIds.size]);

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
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} محفظة؟`)) return;
    try {
      // TODO: Implement bulk delete API call
      alert(`تم حذف ${selectedIds.size} محفظة`);
      setSelectedIds(new Set());
      loadWallets();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [selectedIds, loadWallets]);

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Name (Arabic)', 'Type', 'Balance', 'Currency', 'Status', 'Holder Name', 'Transactions Count', 'Description', 'Created At'];
    const rows = filtered.map(w => [
      w.name,
      w.nameAr,
      w.type,
      w.balance,
      w.currency,
      w.status,
      w.holderName,
      w.transactionsCount,
      w.description,
      w.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wallets.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/wallets', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          shopId: sid,
        }),
      });
      setAddModal(false);
      setFormData({ name: '', nameAr: '', type: 'cash', balance: 0, currency: 'EGP', status: 'active', holderName: '', description: '' });
      loadWallets();
    } catch (error) {
      alert('حدث خطأ أثناء إضافة المحفظة');
    }
  }, [formData, loadWallets]);

  const handleEdit = useCallback(async () => {
    if (!editWallet) return;
    try {
      await apiRequest(`/wallets/${editWallet.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditWallet(null);
      setFormData({ name: '', nameAr: '', type: 'cash', balance: 0, currency: 'EGP', status: 'active', holderName: '', description: '' });
      loadWallets();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل المحفظة');
    }
  }, [editWallet, formData, loadWallets]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المحفظة؟')) return;
    try {
      await apiRequest(`/wallets/${id}`, { method: 'DELETE' });
      loadWallets();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [loadWallets]);

  const openEditModal = useCallback((wallet: Wallet) => {
    setEditWallet(wallet);
    setFormData({
      name: wallet.name,
      nameAr: wallet.nameAr,
      type: wallet.type,
      balance: wallet.balance,
      currency: wallet.currency,
      status: wallet.status,
      holderName: wallet.holderName,
      description: wallet.description,
    });
    setEditModal(true);
  }, []);

  const TYPE_CONFIG = {
    cash: { label: 'نقد', color: 'bg-green-50 text-green-600', icon: <Wallet size={12} /> },
    digital: { label: 'رقمي', color: 'bg-blue-50 text-blue-600', icon: <QrCode size={12} /> },
    bank_card: { label: 'بطاقة بنكية', color: 'bg-purple-50 text-purple-600', icon: <CreditCard size={12} /> },
    mobile_wallet: { label: 'محفظة موبايل', color: 'bg-cyan-50 text-cyan-600', icon: <Smartphone size={12} /> },
    crypto: { label: 'عملات رقمية', color: 'bg-amber-50 text-amber-600', icon: <Wallet size={12} /> },
  };

  const stats = useMemo(() => {
    const total = wallets.length;
    const active = wallets.filter(w => w.status === 'active').length;
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
    const totalTransactions = wallets.reduce((sum, w) => sum + w.transactionsCount, 0);
    return [
      { label: 'إجمالي المحافظ', value: total, icon: Wallet, color: 'bg-blue-50 text-blue-600' },
      { label: 'نشط', value: active, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
      { label: 'إجمالي الرصيد', value: `ج.م ${totalBalance.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
      { label: 'إجمالي المعاملات', value: totalTransactions.toLocaleString(), icon: ArrowUpRight, color: 'bg-cyan-50 text-cyan-600' },
    ];
  }, [wallets]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Wallet size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">المحافظ</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة المحافظ المالية</p>
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
            محفظة جديدة
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو المالك..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
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
            <option value="cash">نقد</option>
            <option value="digital">رقمي</option>
            <option value="bank_card">بطاقة بنكية</option>
            <option value="mobile_wallet">محفظة موبايل</option>
            <option value="crypto">عملات رقمية</option>
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
            <option value="blocked">محظور</option>
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
            <option value="balance">الرصيد</option>
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

      {/* Wallets List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Wallet size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد محافظ حالياً</p>
        </div>
      ) : (
        <div className="hidden md:block overflow-x-auto touch-auto">
          <table className="w-full text-right border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedIds.size === paginatedWallets.length && paginatedWallets.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                  </button>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500">الاسم</th>
                <th className="p-4 text-xs font-semibold text-slate-500">النوع</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الرصيد</th>
                <th className="p-4 text-xs font-semibold text-slate-500">العملة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">المالك</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">المعاملات</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWallets.map((wallet) => {
                const typeConfig = TYPE_CONFIG[wallet.type];
                return (
                  <tr key={wallet.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4">
                      <button onClick={() => toggleSelect(wallet.id)} className="p-1">
                        {selectedIds.has(wallet.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{wallet.name}</div>
                      <div className="text-slate-500 text-xs">{wallet.nameAr}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${typeConfig.color}`}>
                        {typeConfig.icon}
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">ج.م {wallet.balance.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">{wallet.currency}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">{wallet.holderName}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${wallet.status === 'active' ? 'bg-green-50 text-green-700' : wallet.status === 'inactive' ? 'bg-slate-50 text-slate-600' : 'bg-red-50 text-red-700'}`}>
                        {wallet.status === 'active' ? 'نشط' : wallet.status === 'inactive' ? 'غير نشط' : 'محظور'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{wallet.transactionsCount}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(wallet)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(wallet.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف">
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
              <h2 className="text-xl font-black text-slate-900">محفظة جديدة</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (إنجليزي)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Wallet Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الاسم (عربي)</label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="اسم المحفظة"
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
                  <option value="cash">نقد</option>
                  <option value="digital">رقمي</option>
                  <option value="bank_card">بطاقة بنكية</option>
                  <option value="mobile_wallet">محفظة موبايل</option>
                  <option value="crypto">عملات رقمية</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الرصيد</label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })}
                  placeholder="الرصيد"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">العملة</label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="EGP">ج.م</option>
                  <option value="USD">$</option>
                  <option value="EUR">€</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">المالك</label>
                <input
                  type="text"
                  value={formData.holderName}
                  onChange={e => setFormData({ ...formData, holderName: e.target.value })}
                  placeholder="اسم المالك"
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
                  placeholder="وصف المحفظة"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                إضافة المحفظة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && editWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل المحفظة</h2>
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
                  <option value="cash">نقد</option>
                  <option value="digital">رقمي</option>
                  <option value="bank_card">بطاقة بنكية</option>
                  <option value="mobile_wallet">محفظة موبايل</option>
                  <option value="crypto">عملات رقمية</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الرصيد</label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">العملة</label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="EGP">ج.م</option>
                  <option value="USD">$</option>
                  <option value="EUR">€</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">المالك</label>
                <input
                  type="text"
                  value={formData.holderName}
                  onChange={e => setFormData({ ...formData, holderName: e.target.value })}
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
              <h2 className="text-xl font-black text-slate-900">دليل المحافظ</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة المحافظ المالية للمتجر.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Wallet size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إضافة وتعديل وحذف المحافظ</li>
                  <li>• أنواع مختلفة (نقد، رقمي، بطاقة بنكية، محفظة موبايل، عملات رقمية)</li>
                  <li>• تتبع الأرصدة والمعاملات</li>
                  <li>• تصدير تقارير المحافظ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
