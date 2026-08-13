'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CreditCard, Search, Loader2, Plus, Edit, Trash2, Eye, Download, Upload, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, MoreVertical, DollarSign, Calendar, Clock, User, CheckCircle2, XCircle, AlertTriangle, Receipt, Building2, Tag } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Expense = {
  id: string;
  expenseNumber: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  expenseDate: string;
  approvedBy: string;
  approvedAt: string | null;
  paidBy: string;
  paidAt: string | null;
  notes: string;
  receiptUrl: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('expenseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: 0,
    currency: 'EGP',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
    receiptUrl: '',
  });

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/expenses/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setExpenses(data.map((e: any) => ({
        id: String(e.id),
        expenseNumber: e.expenseNumber || e.expense_number || '---',
        category: e.category || '---',
        description: e.description || '---',
        amount: Number(e.amount || 0),
        currency: e.currency || 'EGP',
        status: e.status || 'pending',
        expenseDate: e.expenseDate || e.expense_date || new Date().toISOString(),
        approvedBy: e.approvedBy || e.approved_by || '---',
        approvedAt: e.approvedAt || e.approved_at || null,
        paidBy: e.paidBy || e.paid_by || '---',
        paidAt: e.paidAt || e.paid_at || null,
        notes: e.notes || '',
        receiptUrl: e.receiptUrl || e.receipt_url || '',
        createdBy: e.createdBy || e.created_by || '---',
        createdAt: e.createdAt || new Date().toISOString(),
        updatedAt: e.updatedAt || new Date().toISOString(),
      })));
    } catch { setExpenses([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  const filtered = useMemo(() => {
    let result = expenses.filter(e =>
      e.expenseNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      e.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      e.category.includes(debouncedSearch)
    );

    if (filterCategory !== 'all') {
      result = result.filter(e => e.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      result = result.filter(e => e.status === filterStatus);
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'expenseNumber' ? a.expenseNumber : sortBy === 'expenseDate' ? a.expenseDate : sortBy === 'amount' ? a.amount : a.createdAt;
      const bVal = sortBy === 'expenseNumber' ? b.expenseNumber : sortBy === 'expenseDate' ? b.expenseDate : sortBy === 'amount' ? b.amount : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [expenses, debouncedSearch, filterCategory, filterStatus, sortBy, sortOrder]);

  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedExpenses.length && paginatedExpenses.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedExpenses.map(e => e.id)));
    }
  }, [paginatedExpenses, selectedIds.size]);

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
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} مصروف؟`)) return;
    try {
      // TODO: Implement bulk delete API call
      alert(`تم حذف ${selectedIds.size} مصروف`);
      setSelectedIds(new Set());
      loadExpenses();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [selectedIds, loadExpenses]);

  const bulkApprove = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      // TODO: Implement bulk approve API call
      alert(`تم اعتماد ${selectedIds.size} مصروف`);
      setSelectedIds(new Set());
      loadExpenses();
    } catch (error) {
      alert('حدث خطأ أثناء الاعتماد');
    }
  }, [selectedIds, loadExpenses]);

  const exportCSV = useCallback(() => {
    const headers = ['Expense Number', 'Category', 'Description', 'Amount', 'Currency', 'Status', 'Expense Date', 'Approved By', 'Paid By', 'Created At'];
    const rows = filtered.map(e => [
      e.expenseNumber,
      e.category,
      e.description,
      e.amount,
      e.currency,
      e.status,
      e.expenseDate,
      e.approvedBy,
      e.paidBy,
      e.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'expenses.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          shopId: sid,
          status: 'pending',
        }),
      });
      setAddModal(false);
      setFormData({ category: '', description: '', amount: 0, currency: 'EGP', expenseDate: new Date().toISOString().split('T')[0], notes: '', receiptUrl: '' });
      loadExpenses();
    } catch (error) {
      alert('حدث خطأ أثناء إضافة المصروف');
    }
  }, [formData, loadExpenses]);

  const handleEdit = useCallback(async () => {
    if (!editExpense) return;
    try {
      await apiRequest(`/expenses/${editExpense.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditExpense(null);
      setFormData({ category: '', description: '', amount: 0, currency: 'EGP', expenseDate: new Date().toISOString().split('T')[0], notes: '', receiptUrl: '' });
      loadExpenses();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل المصروف');
    }
  }, [editExpense, formData, loadExpenses]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      await apiRequest(`/expenses/${id}`, { method: 'DELETE' });
      loadExpenses();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [loadExpenses]);

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    try {
      await apiRequest(`/expenses/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      loadExpenses();
    } catch (error) {
      alert('حدث خطأ أثناء تغيير الحالة');
    }
  }, [loadExpenses]);

  const openEditModal = useCallback((expense: Expense) => {
    setEditExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      expenseDate: expense.expenseDate.split('T')[0],
      notes: expense.notes,
      receiptUrl: expense.receiptUrl,
    });
    setEditModal(true);
  }, []);

  const STATUS_CONFIG = {
    pending: { label: 'معلق', color: 'bg-amber-50 text-amber-600', icon: <Clock size={12} /> },
    approved: { label: 'معتمد', color: 'bg-green-50 text-green-600', icon: <CheckCircle2 size={12} /> },
    rejected: { label: 'مرفوض', color: 'bg-red-50 text-red-600', icon: <XCircle size={12} /> },
    paid: { label: 'مدفوع', color: 'bg-blue-50 text-blue-600', icon: <CheckCircle2 size={12} /> },
  };

  const categories = useMemo(() => {
    const cats = new Set(expenses.map(e => e.category));
    return Array.from(cats).filter(c => c !== '---');
  }, [expenses]);

  const stats = useMemo(() => {
    const total = expenses.length;
    const pending = expenses.filter(e => e.status === 'pending').length;
    const approved = expenses.filter(e => e.status === 'approved').length;
    const paid = expenses.filter(e => e.status === 'paid').length;
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    return [
      { label: 'إجمالي المصروفات', value: total, icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
      { label: 'معلق', value: pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
      { label: 'معتمد', value: approved, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
      { label: 'مدفوع', value: paid, icon: CheckCircle2, color: 'bg-blue-50 text-blue-600' },
      { label: 'إجمالي القيمة', value: `ج.م ${totalAmount.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
    ];
  }, [expenses]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <CreditCard size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">المصروفات</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة مصروف الشركة</p>
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
            مصروف جديد
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
            <button onClick={bulkApprove} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 font-bold text-xs hover:bg-green-100 transition-all">
              <CheckCircle2 size={14} />
              اعتماد
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالرقم أو الوصف..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الفئة:</span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">الكل</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
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
            <option value="pending">معلق</option>
            <option value="approved">معتمد</option>
            <option value="rejected">مرفوض</option>
            <option value="paid">مدفوع</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الترتيب:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="expenseNumber">رقم المصروف</option>
            <option value="expenseDate">تاريخ المصروف</option>
            <option value="amount">القيمة</option>
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

      {/* Expenses List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CreditCard size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد مصروفات حالياً</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="space-y-3 md:hidden">
            {paginatedExpenses.map((expense) => {
              const statusConfig = STATUS_CONFIG[expense.status];
              return (
                <div key={expense.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <button onClick={() => toggleSelect(expense.id)} className="shrink-0 p-1">
                      {selectedIds.has(expense.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm">{expense.expenseNumber}</div>
                      <div className="text-slate-500 text-xs">{expense.category}</div>
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
                    <span>{new Date(expense.expenseDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <DollarSign size={12} />
                    <span>ج.م {expense.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(expense)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs hover:bg-slate-100 transition-all">
                      <Edit size={12} />
                      تعديل
                    </button>
                    <button onClick={() => handleDelete(expense.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100 transition-all">
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
            <table className="w-full text-right border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="p-1">
                      {selectedIds.size === paginatedExpenses.length && paginatedExpenses.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                    </button>
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500">رقم المصروف</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الفئة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الوصف</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">القيمة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">تاريخ المصروف</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.map((expense) => {
                  const statusConfig = STATUS_CONFIG[expense.status];
                  return (
                    <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4">
                        <button onClick={() => toggleSelect(expense.id)} className="p-1">
                          {selectedIds.has(expense.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{expense.expenseNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm">{expense.category}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-600 text-sm max-w-xs truncate">{expense.description}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">ج.م {expense.amount.toLocaleString()}</div>
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
                          {new Date(expense.expenseDate).toLocaleDateString('ar-EG')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(expense)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(expense.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف">
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
              <h2 className="text-xl font-black text-slate-900">مصروف جديد</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الفئة</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">اختر الفئة</option>
                  <option value="رواتب">رواتب</option>
                  <option value="إيجار">إيجار</option>
                  <option value="مرافق">مرافق</option>
                  <option value="تسويق">تسويق</option>
                  <option value="معدات">معدات</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف المصروف"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">القيمة</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  placeholder="القيمة"
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
                <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ المصروف</label>
                <input
                  type="date"
                  value={formData.expenseDate}
                  onChange={e => setFormData({ ...formData, expenseDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">رابط الإيصال</label>
                <input
                  type="text"
                  value={formData.receiptUrl}
                  onChange={e => setFormData({ ...formData, receiptUrl: e.target.value })}
                  placeholder="رابط الإيصال"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                إضافة المصروف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && editExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل المصروف</h2>
              <button onClick={() => setEditModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الفئة</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">اختر الفئة</option>
                  <option value="رواتب">رواتب</option>
                  <option value="إيجار">إيجار</option>
                  <option value="مرافق">مرافق</option>
                  <option value="تسويق">تسويق</option>
                  <option value="معدات">معدات</option>
                  <option value="أخرى">أخرى</option>
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
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">القيمة</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
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
                <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ المصروف</label>
                <input
                  type="date"
                  value={formData.expenseDate}
                  onChange={e => setFormData({ ...formData, expenseDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">رابط الإيصال</label>
                <input
                  type="text"
                  value={formData.receiptUrl}
                  onChange={e => setFormData({ ...formData, receiptUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">ملاحظات</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
              <h2 className="text-xl font-black text-slate-900">دليل المصروفات</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة مصروف الشركة وتتبع الإنفاق.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><CreditCard size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إضافة وتعديل وحذف المصروفات</li>
                  <li>• تصنيف المصروفات حسب الفئة</li>
                  <li>• تتبع الحالة (معلق، معتمد، مرفوض، مدفوع)</li>
                  <li>• إحصائيات شاملة للمصروفات</li>
                  <li>• تصدير تقارير المصروفات</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
