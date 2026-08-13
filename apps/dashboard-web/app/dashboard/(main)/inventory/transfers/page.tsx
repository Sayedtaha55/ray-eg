'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeftRight, Search, Plus, Download, RefreshCw, Info, X,
  ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, Clock,
  Package, AlertTriangle, Truck, MapPin, Calendar,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Transfer = {
  id: string;
  transferNumber: string;
  fromWarehouse: string;
  toWarehouse: string;
  items: number;
  status: 'pending' | 'in_transit' | 'received' | 'cancelled';
  date: string;
  notes: string;
  createdAt: string;
};

const emptyForm = {
  fromWarehouse: '',
  toWarehouse: '',
  notes: '',
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
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
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/transfers/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setTransfers(data.map((t: any) => ({
        id: String(t.id),
        transferNumber: t.transferNumber || t.transfer_number || `TR-${String(t.id).slice(0, 6)}`,
        fromWarehouse: t.fromWarehouse || t.from_warehouse || '---',
        toWarehouse: t.toWarehouse || t.to_warehouse || '---',
        items: Number(t.items || t.itemCount || 0),
        status: t.status || 'pending',
        date: t.date || t.createdAt || new Date().toISOString(),
        notes: t.notes || '',
        createdAt: t.createdAt || new Date().toISOString(),
      })));
      const wRes = await apiRequest(`/warehouses/shop/${sid}`);
      const wData = Array.isArray(wRes) ? wRes : (wRes?.data || []);
      setWarehouses(wData.map((w: any) => ({ id: String(w.id), name: w.name || '---' })));
    } catch { setTransfers([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTransfers(); }, [loadTransfers]);

  const filtered = useMemo(() => {
    let result = transfers.filter(t =>
      t.transferNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.fromWarehouse.includes(debouncedSearch) ||
      t.toWarehouse.includes(debouncedSearch)
    );
    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus);
    }
    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'date' ? a.date : sortBy === 'items' ? a.items : a.transferNumber;
      const bVal = sortBy === 'date' ? b.date : sortBy === 'items' ? b.items : b.transferNumber;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [transfers, debouncedSearch, filterStatus, sortBy, sortOrder]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const exportCSV = useCallback(() => {
    const headers = ['Transfer Number', 'From', 'To', 'Items', 'Status', 'Date', 'Notes'];
    const rows = filtered.map(t => [t.transferNumber, t.fromWarehouse, t.toWarehouse, t.items, t.status, t.date, t.notes]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transfers.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    if (!formData.fromWarehouse || !formData.toWarehouse) { alert('يرجى اختيار المخازن'); return; }
    if (formData.fromWarehouse === formData.toWarehouse) { alert('لا يمكن النقل لنفس المخزن'); return; }
    setSaving(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/transfers', {
        method: 'POST',
        body: JSON.stringify({ ...formData, shopId: sid }),
      });
      setAddModal(false);
      setFormData(emptyForm);
      loadTransfers();
    } catch { alert('حدث خطأ أثناء إنشاء النقل'); }
    finally { setSaving(false); }
  }, [formData, loadTransfers]);

  const handleStatusUpdate = useCallback(async (id: string, status: string) => {
    try {
      await apiRequest(`/transfers/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      loadTransfers();
    } catch { alert('حدث خطأ أثناء تحديث الحالة'); }
  }, [loadTransfers]);

  const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'قيد الانتظار', color: 'bg-amber-50 text-amber-700', icon: <Clock size={12} /> },
    in_transit: { label: 'قيد التنفيذ', color: 'bg-blue-50 text-blue-700', icon: <Truck size={12} /> },
    received: { label: 'تم الاستلام', color: 'bg-green-50 text-green-700', icon: <Check size={12} /> },
    cancelled: { label: 'ملغي', color: 'bg-red-50 text-red-700', icon: <AlertTriangle size={12} /> },
  };

  const stats = useMemo(() => {
    const total = transfers.length;
    const pending = transfers.filter(t => t.status === 'pending').length;
    const inTransit = transfers.filter(t => t.status === 'in_transit').length;
    const received = transfers.filter(t => t.status === 'received').length;
    return [
      { label: 'إجمالي النقلات', value: total, icon: ArrowLeftRight, color: 'bg-blue-50 text-blue-600' },
      { label: 'قيد الانتظار', value: pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
      { label: 'قيد التنفيذ', value: inTransit, icon: Truck, color: 'bg-cyan-50 text-cyan-600' },
      { label: 'تم الاستلام', value: received, icon: Check, color: 'bg-green-50 text-green-600' },
    ];
  }, [transfers]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <ArrowLeftRight size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">النقل بين المخازن</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">تحويل المنتجات بين المخازن وتتبع حركات النقل</p>
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
            <Plus size={18} /> نقل جديد
          </button>
          <button onClick={() => loadTransfers()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث برقم النقل أو المخزن..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الحالة:</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="all">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="in_transit">قيد التنفيذ</option>
            <option value="received">تم الاستلام</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الترتيب:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="date">التاريخ</option>
            <option value="items">عدد العناصر</option>
            <option value="transferNumber">رقم النقل</option>
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
          <ArrowLeftRight size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد عمليات نقل حالياً</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="space-y-3 md:hidden">
            {paginated.map((t) => {
              const statusConfig = STATUS_CONFIG[t.status];
              return (
                <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm">{t.transferNumber}</div>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                        <Calendar size={12} />
                        {new Date(t.date).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${statusConfig.color}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                    <span className="font-bold">{t.fromWarehouse}</span>
                    <ArrowLeftRight size={12} className="text-slate-400" />
                    <span className="font-bold">{t.toWarehouse}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <Package size={12} /><span>{t.items} عنصر</span>
                  </div>
                  {t.status === 'pending' && (
                    <button onClick={() => handleStatusUpdate(t.id, 'in_transit')} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs hover:bg-blue-100 transition-all">
                      <Truck size={12} /> بدء النقل
                    </button>
                  )}
                  {t.status === 'in_transit' && (
                    <button onClick={() => handleStatusUpdate(t.id, 'received')} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs hover:bg-green-100 transition-all">
                      <Check size={12} /> تأكيد الاستلام
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto touch-auto">
            <table className="w-full text-right border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-semibold text-slate-500">رقم النقل</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">من مخزن</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">إلى مخزن</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">العناصر</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">التاريخ</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((t) => {
                  const statusConfig = STATUS_CONFIG[t.status];
                  return (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4"><div className="font-bold text-slate-900 text-sm">{t.transferNumber}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{t.fromWarehouse}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{t.toWarehouse}</div></td>
                      <td className="p-4"><div className="font-bold text-slate-900 text-sm">{t.items}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{new Date(t.date).toLocaleDateString('ar-EG')}</div></td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit ${statusConfig.color}`}>
                          {statusConfig.icon} {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {t.status === 'pending' && (
                            <button onClick={() => handleStatusUpdate(t.id, 'in_transit')} className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all">
                              بدء النقل
                            </button>
                          )}
                          {t.status === 'in_transit' && (
                            <button onClick={() => handleStatusUpdate(t.id, 'received')} className="px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-all">
                              تأكيد الاستلام
                            </button>
                          )}
                          {(t.status === 'pending' || t.status === 'in_transit') && (
                            <button onClick={() => handleStatusUpdate(t.id, 'cancelled')} className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-all">
                              إلغاء
                            </button>
                          )}
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">نقل جديد</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">من مخزن</label>
                <select value={formData.fromWarehouse} onChange={e => setFormData({ ...formData, fromWarehouse: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                  <option value="">اختر المخزن</option>
                  {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">إلى مخزن</label>
                <select value={formData.toWarehouse} onChange={e => setFormData({ ...formData, toWarehouse: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                  <option value="">اختر المخزن</option>
                  {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">ملاحظات</label>
                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="ملاحظات إضافية..." rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
              </div>
              <button onClick={handleAdd} disabled={saving} className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all disabled:opacity-50">
                {saving ? 'جاري الإنشاء...' : 'إنشاء النقل'}
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
              <h2 className="text-xl font-black text-slate-900">دليل النقل بين المخازن</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">تحويل المنتجات بين المخازن المختلفة وتتبع حركات النقل.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Truck size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إنشاء أوامر نقل بين المخازن</li>
                  <li>• تتبع حالة النقل (قيد التنفيذ / مكتمل)</li>
                  <li>• تأكيد الاستلام في المخزن المستقبل</li>
                  <li>• سجل كامل لحركات النقل</li>
                  <li>• تقارير النقل بين الفروع</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
