'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Receipt, Printer, Search, Loader2, ShoppingCart, ChevronLeft, Download, X, Eye, Filter } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';
import { ChevronRight } from 'lucide-react';
import { exportToCsv, paginate } from '@/lib/pos-utils';

const isArabic = true;
const PAGE_SIZE = 25;

const POSInvoicesPage: React.FC = () => {
  const { shop } = useShop();
  const shopId = shop?.id || '';
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const data = await apiRequest(`/shops/${shopId}/orders`);
      const all = Array.isArray(data) ? data : (data?.orders ? data.orders : []);
      const posOrders = all.filter((o: any) => o?.source === 'pos' || o?.source === 'POS');
      setOrders(posOrders);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, [shopId]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = useMemo(() => orders.filter((o) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const id = String(o?.id || o?.orderNumber || '').toLowerCase();
      const name = String(o?.customerName || o?.customer_name || '').toLowerCase();
      const phone = String(o?.customerPhone || o?.customer_phone || '');
      if (!id.includes(q) && !name.includes(q) && !phone.includes(q)) return false;
    }
    if (filterPayment !== 'all') {
      const pm = String(o?.paymentMethod || 'COD').toUpperCase();
      if (pm !== filterPayment) return false;
    }
    if (filterStatus !== 'all' && String(o?.status || '') !== filterStatus) return false;
    if (filterDate !== 'all') {
      const created = new Date(o?.createdAt || 0);
      const now = new Date();
      if (filterDate === 'today' && created.toDateString() !== now.toDateString()) return false;
      if (filterDate === 'yesterday') {
        const y = new Date(now); y.setDate(y.getDate() - 1);
        if (created.toDateString() !== y.toDateString()) return false;
      }
      if (filterDate === 'last7days') {
        const w = new Date(now); w.setDate(w.getDate() - 7);
        if (created < w) return false;
      }
    }
    return true;
  }), [orders, search, filterPayment, filterStatus, filterDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  useEffect(() => { setPage(1); }, [search, filterPayment, filterStatus, filterDate]);

  const handleExportCsv = () => {
    const rows = filtered.map((o) => ({
      'رقم الفاتورة': o?.orderNumber || o?.id || '',
      'التاريخ': o?.createdAt ? new Date(o.createdAt).toLocaleString('ar-EG') : '',
      'العميل': o?.customerName || o?.customer_name || '',
      'الهاتف': o?.customerPhone || o?.customer_phone || '',
      'الإجمالي': Number(o?.total || 0).toFixed(2),
      'طريقة الدفع': o?.paymentMethod || 'COD',
      'الحالة': o?.status || '',
    }));
    exportToCsv(`pos-invoices-${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const reprintReceipt = (order: any) => {
    const escapeHtml = (v: any) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fmt = (n: any) => (Number.isFinite(Number(n)) ? Number(n).toFixed(2) : '0.00');
    const items = Array.isArray(order?.items) ? order.items : [];
    const linesHtml = items.map((i: any) => `<tr><td style="padding: 6px 0;">${escapeHtml(i?.name || i?.productName || '')}</td><td style="padding: 6px 0; text-align:left;">${Number(i?.quantity || 0)}x</td><td style="padding: 6px 0; text-align:left;">${fmt(Number(i?.price || 0) * Number(i?.quantity || 0))}</td></tr>`).join('');

    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Receipt</title><style>@page{margin:8mm}body{font-family:Arial,sans-serif;direction:rtl}.wrap{max-width:80mm;margin:0 auto}h1{font-size:16px;text-align:center}.meta{font-size:11px;text-align:center;margin-bottom:10px}.sep{border-top:1px dashed #999;margin:10px 0}table{width:100%;border-collapse:collapse;font-size:12px}.row{display:flex;justify-content:space-between;padding:4px 0}.foot{font-size:11px;text-align:center;margin-top:10px}</style></head><body><div class="wrap"><h1>${escapeHtml(order?.shopName || shop?.name || 'Receipt')}</h1><div class="meta"><div>#${escapeHtml(order?.orderNumber || order?.id || '')}</div><div>${escapeHtml(order?.createdAt ? new Date(order.createdAt).toLocaleString() : '')}</div></div><div class="sep"></div><table><tbody>${linesHtml}</tbody></table><div class="sep"></div><div class="row" style="font-weight:700"><span>الإجمالي</span><span>ج.م ${fmt(order?.total)}</span></div></div></body></html>`;

    try {
      const w = window.open('', '_blank', 'width=480,height=720');
      if (!w) return;
      w.document.open(); w.document.write(html); w.document.close(); w.focus(); w.print();
      setTimeout(() => { try { w.close(); } catch {} }, 15000);
    } catch {}
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm min-h-[60vh]">
      <div className="flex flex-col gap-4 md:gap-6 mb-6 md:flex-row md:items-center md:justify-between md:flex-row-reverse">
        <div className="text-right">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-2">
            <ShoppingCart size={24} className="text-[#BD00FF]" />
            {isArabic ? 'فواتير الكاشير' : 'POS Invoices'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'فواتير نقطة البيع' : 'Point of sale invoices'}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={handleExportCsv} disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-600 transition-all disabled:opacity-50">
            <Download size={16} />
            {isArabic ? 'تصدير CSV' : 'Export CSV'}
          </button>
          <Link href="/dashboard/pos" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all w-fit">
            <ChevronRight size={16} className="rotate-180" />
            {isArabic ? 'العودة للكاشير' : 'Back to POS'}
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={isArabic ? 'بحث برقم الفاتورة أو العميل...' : 'Search by invoice # or customer...'}
            className="w-full bg-slate-50 border rounded-xl py-2.5 pr-9 pl-4 outline-none text-sm focus:ring-2 focus:ring-[#BD00FF]" />
        </div>
        <button type="button" onClick={() => setShowFilters((v) => !v)}
          className={`px-3 py-2.5 rounded-xl border text-xs font-black flex items-center gap-1.5 ${showFilters || filterPayment !== 'all' || filterStatus !== 'all' || filterDate !== 'all' ? 'bg-[#BD00FF]/10 border-[#BD00FF] text-[#BD00FF]' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
          <Filter size={14} /> {isArabic ? 'فلترة' : 'Filter'}
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="text-xs font-black border rounded-lg px-2 py-2 outline-none bg-white">
            <option value="all">{isArabic ? 'كل الدفع' : 'All payments'}</option>
            <option value="COD">{isArabic ? 'كاش' : 'Cash'}</option>
            <option value="CARD">{isArabic ? 'بطاقة' : 'Card'}</option>
            <option value="WALLET">{isArabic ? 'محفظة' : 'Wallet'}</option>
            <option value="CREDIT">{isArabic ? 'آجل' : 'Credit'}</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-xs font-black border rounded-lg px-2 py-2 outline-none bg-white">
            <option value="all">{isArabic ? 'كل الحالات' : 'All status'}</option>
            <option value="PENDING">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="COMPLETED">{isArabic ? 'مكتمل' : 'Completed'}</option>
            <option value="RETURNED">{isArabic ? 'مرتجع' : 'Returned'}</option>
            <option value="CANCELLED">{isArabic ? 'ملغي' : 'Cancelled'}</option>
          </select>
          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="text-xs font-black border rounded-lg px-2 py-2 outline-none bg-white">
            <option value="all">{isArabic ? 'كل التواريخ' : 'All dates'}</option>
            <option value="today">{isArabic ? 'اليوم' : 'Today'}</option>
            <option value="yesterday">{isArabic ? 'أمس' : 'Yesterday'}</option>
            <option value="last7days">{isArabic ? 'آخر ٧ أيام' : 'Last 7 days'}</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-slate-400" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-400 py-12 font-bold text-sm">{isArabic ? 'لا توجد فواتير' : 'No invoices found'}</div>
      ) : (
        <div className="space-y-2">
          {paged.map((order) => (
            <div key={order?.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Receipt size={18} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm text-slate-900">#{order?.orderNumber || order?.id?.slice(-6) || '—'}</div>
                <div className="text-[10px] text-slate-400 font-bold">
                  {order?.createdAt ? new Date(order.createdAt).toLocaleString('ar-EG') : '—'}
                  {(order?.customerName || order?.customer_name) ? ` · ${order.customerName || order.customer_name}` : ''}
                </div>
              </div>
              <div className="text-left shrink-0">
                <div className="font-black text-sm text-[#BD00FF]">ج.م {Number(order?.total || 0).toFixed(2)}</div>
                <div className="text-[10px] text-slate-400 font-bold">{order?.paymentMethod || 'COD'}</div>
              </div>
              <button type="button" onClick={() => setSelectedOrder(order)} className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all shrink-0" title={isArabic ? 'تفاصيل' : 'Details'}>
                <Eye size={16} className="text-slate-600" />
              </button>
              <button type="button" onClick={() => reprintReceipt(order)} className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all shrink-0" title={isArabic ? 'إعادة طباعة' : 'Reprint'}>
                <Printer size={16} className="text-slate-600" />
              </button>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-2 rounded-xl bg-white border border-slate-100 disabled:opacity-40 hover:bg-slate-50"><ChevronRight size={16} /></button>
              <span className="text-xs font-black text-slate-500 px-3">{page} / {totalPages} <span className="text-slate-300">({filtered.length})</span></span>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="p-2 rounded-xl bg-white border border-slate-100 disabled:opacity-40 hover:bg-slate-50"><ChevronLeft size={16} /></button>
            </div>
          )}
        </div>
      )}

      {/* Invoice details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[800] bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-md bg-white rounded-[2rem] p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 flex-row-reverse">
              <h3 className="text-lg font-black flex items-center gap-2"><Receipt size={18} /> {isArabic ? 'تفاصيل الفاتورة' : 'Invoice Details'}</h3>
              <button type="button" onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="p-2.5 rounded-xl bg-slate-50"><div className="text-slate-400 text-[10px]">{isArabic ? 'رقم الفاتورة' : 'Invoice #'}</div><div className="font-black text-slate-900">#{selectedOrder.orderNumber || selectedOrder.id?.slice(-6)}</div></div>
                <div className="p-2.5 rounded-xl bg-slate-50"><div className="text-slate-400 text-[10px]">{isArabic ? 'التاريخ' : 'Date'}</div><div className="font-black text-slate-900">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('ar-EG') : '—'}</div></div>
                <div className="p-2.5 rounded-xl bg-slate-50"><div className="text-slate-400 text-[10px]">{isArabic ? 'العميل' : 'Customer'}</div><div className="font-black text-slate-900">{selectedOrder.customerName || selectedOrder.customer_name || '—'}</div></div>
                <div className="p-2.5 rounded-xl bg-slate-50"><div className="text-slate-400 text-[10px]">{isArabic ? 'الهاتف' : 'Phone'}</div><div className="font-black text-slate-900">{selectedOrder.customerPhone || selectedOrder.customer_phone || '—'}</div></div>
                <div className="p-2.5 rounded-xl bg-slate-50"><div className="text-slate-400 text-[10px]">{isArabic ? 'طريقة الدفع' : 'Payment'}</div><div className="font-black text-slate-900">{selectedOrder.paymentMethod || 'COD'}</div></div>
                <div className="p-2.5 rounded-xl bg-slate-50"><div className="text-slate-400 text-[10px]">{isArabic ? 'الحالة' : 'Status'}</div><div className="font-black text-slate-900">{selectedOrder.status || '—'}</div></div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="text-xs font-black text-slate-500 mb-2">{isArabic ? 'العناصر' : 'Items'}</div>
                <div className="space-y-1.5">
                  {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs font-bold p-2 rounded-lg bg-slate-50">
                      <span className="text-slate-700">{item?.name || item?.productName || '—'} × {item?.quantity || 0}</span>
                      <span className="text-[#BD00FF] font-black">ج.م {(Number(item?.price || 0) * Number(item?.quantity || 0)).toFixed(2)}</span>
                    </div>
                  ))}
                  {(!selectedOrder.items || selectedOrder.items.length === 0) && <div className="text-center text-slate-400 text-xs py-4">{isArabic ? 'لا توجد عناصر' : 'No items'}</div>}
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="font-black text-sm">{isArabic ? 'الإجمالي' : 'Total'}</span>
                <span className="font-black text-lg text-[#BD00FF]">ج.م {Number(selectedOrder.total || 0).toFixed(2)}</span>
              </div>
              {selectedOrder.notes && (
                <div className="p-2.5 rounded-xl bg-amber-50 text-[10px] font-bold text-amber-700">{isArabic ? 'ملاحظات' : 'Notes'}: {selectedOrder.notes}</div>
              )}
              <button type="button" onClick={() => reprintReceipt(selectedOrder)} className="w-full py-3 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center gap-2">
                <Printer size={16} /> {isArabic ? 'إعادة طباعة' : 'Reprint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSInvoicesPage;
