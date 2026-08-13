'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BookOpen, Search, Plus, Download, RefreshCw, Info, X, Edit, Trash2,
  ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check,
  DollarSign, Calendar, CheckCircle2, Clock, AlertTriangle,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type JournalEntry = {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  accountName: string;
  debit: number;
  credit: number;
  reference: string;
  status: 'draft' | 'posted' | 'reversed';
  createdBy: string;
  createdAt: string;
};

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  description: '',
  accountName: '',
  debit: 0,
  credit: 0,
  reference: '',
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/finance/journal/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setEntries(data.map((j: any) => ({
        id: String(j.id),
        entryNumber: j.entryNumber || j.entry_number || `JE-${String(j.id).slice(0, 6)}`,
        date: j.date || j.createdAt || new Date().toISOString(),
        description: j.description || '',
        accountName: j.accountName || j.account_name || '---',
        debit: Number(j.debit ?? 0),
        credit: Number(j.credit ?? 0),
        reference: j.reference || '',
        status: j.status || 'draft',
        createdBy: j.createdBy || j.created_by || '---',
        createdAt: j.createdAt || new Date().toISOString(),
      })));
    } catch { setEntries([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const filtered = useMemo(() => {
    let result = entries.filter(j =>
      j.entryNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      j.description.includes(debouncedSearch) ||
      j.accountName.includes(debouncedSearch) ||
      j.reference.includes(debouncedSearch)
    );
    if (filterStatus !== 'all') {
      result = result.filter(j => j.status === filterStatus);
    }
    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'date' ? a.date : sortBy === 'debit' ? a.debit : sortBy === 'credit' ? a.credit : a.entryNumber;
      const bVal = sortBy === 'date' ? b.date : sortBy === 'debit' ? b.debit : sortBy === 'credit' ? b.credit : b.entryNumber;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [entries, debouncedSearch, filterStatus, sortBy, sortOrder]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const exportCSV = useCallback(() => {
    const headers = ['Entry Number', 'Date', 'Description', 'Account', 'Debit', 'Credit', 'Reference', 'Status', 'Created By'];
    const rows = filtered.map(j => [j.entryNumber, j.date, j.description, j.accountName, j.debit, j.credit, j.reference, j.status, j.createdBy]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'journal-entries.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    if (!formData.description || !formData.accountName) { alert('يرجى إدخال الوصف واسم الحساب'); return; }
    if (formData.debit === 0 && formData.credit === 0) { alert('يجب إدخال مدين أو دائن'); return; }
    setSaving(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/finance/journal', {
        method: 'POST',
        body: JSON.stringify({ ...formData, shopId: sid }),
      });
      setAddModal(false);
      setFormData(emptyForm);
      loadEntries();
    } catch { alert('حدث خطأ أثناء إضافة القيد'); }
    finally { setSaving(false); }
  }, [formData, loadEntries]);

  const handleEdit = useCallback(async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await apiRequest(`/finance/journal/${editItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditItem(null);
      setFormData(emptyForm);
      loadEntries();
    } catch { alert('حدث خطأ أثناء تعديل القيد'); }
    finally { setSaving(false); }
  }, [editItem, formData, loadEntries]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القيد؟')) return;
    try {
      await apiRequest(`/finance/journal/${id}`, { method: 'DELETE' });
      loadEntries();
    } catch { alert('حدث خطأ أثناء الحذف'); }
  }, [loadEntries]);

  const handlePost = useCallback(async (id: string) => {
    try {
      await apiRequest(`/finance/journal/${id}/post`, { method: 'PUT' });
      loadEntries();
    } catch { alert('حدث خطأ أثناء الترحيل'); }
  }, [loadEntries]);

  const openEditModal = useCallback((j: JournalEntry) => {
    setEditItem(j);
    setFormData({
      date: j.date.split('T')[0],
      description: j.description,
      accountName: j.accountName,
      debit: j.debit,
      credit: j.credit,
      reference: j.reference,
    });
    setEditModal(true);
  }, []);

  const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    draft: { label: 'مسودة', color: 'bg-slate-50 text-slate-600', icon: <Clock size={12} /> },
    posted: { label: 'مرحل', color: 'bg-green-50 text-green-700', icon: <CheckCircle2 size={12} /> },
    reversed: { label: 'ملغي', color: 'bg-red-50 text-red-700', icon: <AlertTriangle size={12} /> },
  };

  const stats = useMemo(() => {
    const total = entries.length;
    const drafts = entries.filter(j => j.status === 'draft').length;
    const posted = entries.filter(j => j.status === 'posted').length;
    const totalDebit = entries.reduce((sum, j) => sum + j.debit, 0);
    const totalCredit = entries.reduce((sum, j) => sum + j.credit, 0);
    return [
      { label: 'إجمالي القيود', value: total, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
      { label: 'مسودات', value: drafts, icon: Clock, color: 'bg-amber-50 text-amber-600' },
      { label: 'مرحلة', value: posted, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
      { label: 'إجمالي مدين', value: totalDebit.toLocaleString(), icon: DollarSign, color: 'bg-cyan-50 text-cyan-600' },
      { label: 'إجمالي دائن', value: totalCredit.toLocaleString(), icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
      { label: 'الرصيد', value: (totalDebit - totalCredit).toLocaleString(), icon: AlertTriangle, color: Math.abs(totalDebit - totalCredit) < 0.01 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-700' },
    ];
  }, [entries]);

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const renderForm = (isEdit: boolean) => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">التاريخ</label>
        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">المرجع</label>
        <input type="text" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} placeholder="رقم الفاتورة / المرجع" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div className="col-span-2">
        <label className="text-sm font-bold text-slate-700 mb-1 block">الوصف</label>
        <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="وصف القيد" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div className="col-span-2">
        <label className="text-sm font-bold text-slate-700 mb-1 block">اسم الحساب</label>
        <input type="text" value={formData.accountName} onChange={e => setFormData({ ...formData, accountName: e.target.value })} placeholder="مثال: النقدية، المبيعات، المشتريات" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">مدين (Debit)</label>
        <input type="number" value={formData.debit} onChange={e => setFormData({ ...formData, debit: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1 block">دائن (Credit)</label>
        <input type="number" value={formData.credit} onChange={e => setFormData({ ...formData, credit: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>
      <div className="col-span-2">
        <button onClick={isEdit ? handleEdit : handleAdd} disabled={saving} className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all disabled:opacity-50">
          {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة القيد'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <BookOpen size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">القيود اليومية</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة القيود المحاسبية اليومية</p>
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
          <Plus size={18} /> قيد جديد
        </button>
        <button onClick={() => loadEntries()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
          <RefreshCw size={18} /> تحديث
        </button>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
          <Download size={18} /> تصدير CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث برقم القيد أو الوصف أو الحساب..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الحالة:</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="all">الكل</option>
            <option value="draft">مسودة</option>
            <option value="posted">مرحل</option>
            <option value="reversed">ملغي</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الترتيب:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="date">التاريخ</option>
            <option value="entryNumber">رقم القيد</option>
            <option value="debit">مدين</option>
            <option value="credit">دائن</option>
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
          <BookOpen size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد قيود حالياً</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="space-y-3 md:hidden">
            {paginated.map((j) => {
              const statusConfig = STATUS_CONFIG[j.status];
              return (
                <div key={j.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm">{j.entryNumber}</div>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-1"><Calendar size={12} />{new Date(j.date).toLocaleDateString('ar-EG')}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${statusConfig.color}`}>{statusConfig.icon} {statusConfig.label}</span>
                  </div>
                  <div className="text-sm text-slate-700 mb-2">{j.description}</div>
                  <div className="text-xs text-slate-500 mb-2">الحساب: {j.accountName}</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center p-2 rounded-lg bg-cyan-50">
                      <div className="text-xs text-slate-400">مدين</div>
                      <div className="font-bold text-cyan-700 text-sm">{fmt(j.debit)}</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-purple-50">
                      <div className="text-xs text-slate-400">دائن</div>
                      <div className="font-bold text-purple-700 text-sm">{fmt(j.credit)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {j.status === 'draft' && (
                      <button onClick={() => handlePost(j.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs hover:bg-green-100 transition-all">
                        <CheckCircle2 size={12} /> ترحيل
                      </button>
                    )}
                    <button onClick={() => openEditModal(j)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs hover:bg-slate-100 transition-all">
                      <Edit size={12} /> تعديل
                    </button>
                    <button onClick={() => handleDelete(j.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100 transition-all">
                      <Trash2 size={12} /> حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto touch-auto">
            <table className="w-full text-right border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-semibold text-slate-500">رقم القيد</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">التاريخ</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الوصف</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحساب</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">مدين</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">دائن</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((j) => {
                  const statusConfig = STATUS_CONFIG[j.status];
                  return (
                    <tr key={j.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4"><div className="font-bold text-slate-900 text-sm">{j.entryNumber}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{new Date(j.date).toLocaleDateString('ar-EG')}</div></td>
                      <td className="p-4"><div className="text-slate-700 text-sm">{j.description}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{j.accountName}</div></td>
                      <td className="p-4"><div className="font-bold text-cyan-700 text-sm">{fmt(j.debit)}</div></td>
                      <td className="p-4"><div className="font-bold text-purple-700 text-sm">{fmt(j.credit)}</div></td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit ${statusConfig.color}`}>{statusConfig.icon} {statusConfig.label}</span></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {j.status === 'draft' && (
                            <button onClick={() => handlePost(j.id)} className="px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-all">ترحيل</button>
                          )}
                          <button onClick={() => openEditModal(j)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(j.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف"><Trash2 size={14} /></button>
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
              <h2 className="text-xl font-black text-slate-900">قيد جديد</h2>
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
              <h2 className="text-xl font-black text-slate-900">تعديل القيد</h2>
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
              <h2 className="text-xl font-black text-slate-900">دليل القيود اليومية</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة القيود المحاسبية اليومية وتسجيل الحركات المالية.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><BookOpen size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• تسجيل القيود المحاسبية (مدين/دائن)</li>
                  <li>• ربط القيود بالفواتير والمصروفات</li>
                  <li>• تتبع أرصدة الحسابات تلقائياً</li>
                  <li>• مراجعة واعتماد القيود (ترحيل)</li>
                  <li>• تصدير دفتر اليومية</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
