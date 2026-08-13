'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Loader2, RefreshCw, ShoppingCart, ChevronRight, X, Check, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';

const isArabic = true;

type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'processed';

type Row = {
  orderId: string; orderShortId: string; orderSource?: string; orderCreatedAt?: string | Date;
  returnId: string; returnCreatedAt?: string | Date; totalAmount: number; reason?: string | null; items: any[];
  status?: ReturnStatus;
};

const WebsiteReturnsPage: React.FC = () => {
  const { shop } = useShop();
  const shopId = shop?.id || '';
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const orderIds = useMemo(() => orders.map((o: any) => String(o?.id || '').trim()).filter(Boolean), [orders]);
  const summary = useMemo(() => {
    const count = rows.length;
    const totalReturnedAmount = rows.reduce((sum, r) => sum + (Number(r.totalAmount || 0) || 0), 0);
    return { count, totalReturnedAmount, hasReturns: count > 0 };
  }, [rows]);

  const fetchAll = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiRequest(`/shops/${shopId}/orders`);
      const websiteOrders = (Array.isArray(data) ? data : (data?.orders ? data.orders : [])).filter((o: any) => o?.source !== 'pos' && o?.source !== 'POS');
      setOrders(websiteOrders);
    } catch (e: any) { setError(String(e?.message || 'Error loading orders')); setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [shopId]);

  const updateReturnStatus = async (returnId: string, status: ReturnStatus) => {
    if (!returnId) return;
    setActionLoading(true); setActionError('');
    try {
      await apiRequest(`/shops/${shopId}/orders/returns/${returnId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setRows((prev) => prev.map((r) => r.returnId === returnId ? { ...r, status } : r));
      if (selectedRow?.returnId === returnId) setSelectedRow((prev) => prev ? { ...prev, status } : prev);
    } catch (e: any) {
      setActionError(String(e?.message || 'Failed to update status'));
      // Optimistic local update for offline
      setRows((prev) => prev.map((r) => r.returnId === returnId ? { ...r, status } : r));
      if (selectedRow?.returnId === returnId) setSelectedRow((prev) => prev ? { ...prev, status } : prev);
    } finally { setActionLoading(false); }
  };

  const statusLabel = (s?: ReturnStatus) => {
    if (s === 'approved') return isArabic ? 'موافق عليه' : 'Approved';
    if (s === 'rejected') return isArabic ? 'مرفوض' : 'Rejected';
    if (s === 'processed') return isArabic ? 'منفذ' : 'Processed';
    return isArabic ? 'قيد الانتظار' : 'Pending';
  };
  const statusColor = (s?: ReturnStatus) => {
    if (s === 'approved') return 'text-emerald-600 bg-emerald-50';
    if (s === 'rejected') return 'text-red-600 bg-red-50';
    if (s === 'processed') return 'text-blue-600 bg-blue-50';
    return 'text-amber-600 bg-amber-50';
  };

  useEffect(() => {
    if (orderIds.length === 0) { setRows([]); return; }
    (async () => {
      setLoading(true);
      try {
        const out: Row[] = [];
        for (const orderId of orderIds) {
          const order = orders.find((o: any) => String(o?.id || '').trim() === orderId);
          if (!order) continue;
          try {
            const list = await apiRequest(`/shops/${shopId}/orders/${orderId}/returns`);
            const returnsList = Array.isArray(list) ? list : (list?.returns ? list.returns : []);
            for (const r of returnsList) {
              out.push({
                orderId, orderShortId: String(orderId).slice(0, 8).toUpperCase(),
                orderSource: typeof order?.source === 'string' ? order.source : undefined,
                orderCreatedAt: order?.created_at || order?.createdAt,
                returnId: String(r?.id || ''), returnCreatedAt: r?.createdAt,
                totalAmount: Number(r?.totalAmount || 0) || 0, reason: r?.reason ?? null,
                items: Array.isArray(r?.items) ? r.items : [],
              });
            }
          } catch {}
        }
        out.sort((a, b) => { const ta = a.returnCreatedAt ? new Date(a.returnCreatedAt as any).getTime() : 0; const tb = b.returnCreatedAt ? new Date(b.returnCreatedAt as any).getTime() : 0; return tb - ta; });
        setRows(out);
      } catch (e: any) { setError(String(e?.message || 'Error loading returns')); }
      finally { setLoading(false); }
    })();
  }, [orderIds.join('|')]);

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm min-h-[60vh]">
      <div className="flex flex-col gap-4 md:gap-6 mb-6 md:flex-row md:items-center md:justify-between md:flex-row-reverse">
        <div className="text-right">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-2">
            <ShoppingCart size={24} className="text-[#BD00FF]" />
            {isArabic ? 'مرتجعات الموقع' : 'Website Returns'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'مرتجعات الطلبات من الموقع' : 'Website order returns'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/pos" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all w-fit">
            <ChevronRight size={16} className="rotate-180" />
            {isArabic ? 'العودة للكاشير' : 'Back to POS'}
          </Link>
          <button type="button" onClick={fetchAll} disabled={loading} className="px-4 py-2 rounded-full font-black text-xs bg-slate-50 text-slate-700 flex items-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {isArabic ? 'تحديث' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div className="p-4 rounded-3xl bg-red-50 border border-red-100 text-red-700 font-black text-sm mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'عدد المرتجعات' : 'Returns Count'}</div>
          <div className="mt-2 text-slate-900 font-black text-lg">{summary.count}</div>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'إجمالي المرتجعات' : 'Total Returned'}</div>
          <div className="mt-2 text-slate-900 font-black text-lg">ج.م {Number(summary.totalReturnedAmount || 0).toLocaleString()}</div>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'الحالة' : 'Status'}</div>
          <div className="mt-2 text-slate-900 font-black text-lg">{summary.hasReturns ? (isArabic ? 'يوجد مرتجعات' : 'Has returns') : (isArabic ? 'لا يوجد' : 'None')}</div>
        </div>
      </div>

      {rows.length === 0 && !loading && <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-slate-600 font-black text-sm">{isArabic ? 'لا توجد مرتجعات' : 'No returns found'}</div>}

      {rows.length > 0 && (
        <div className="overflow-x-auto touch-auto">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'رقم الطلب' : 'Order #'}</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'التاريخ' : 'Date'}</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'العناصر' : 'Items'}</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'الإجمالي' : 'Total'}</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{isArabic ? 'تفاصيل' : 'Details'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.returnId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 font-black text-slate-900">#{r.orderShortId}</td>
                  <td className="p-5 text-slate-500 font-bold text-sm">{r.returnCreatedAt ? new Date(r.returnCreatedAt as any).toLocaleString('ar-EG') : '-'}</td>
                  <td className="p-5 text-slate-500 font-black text-sm">{Array.isArray(r.items) ? r.items.length : 0}</td>
                  <td className="p-5"><span className="font-black text-slate-900 text-sm">ج.م {Number(r.totalAmount || 0).toLocaleString()}</span></td>
                  <td className="p-5"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${statusColor(r.status)}`}>{statusLabel(r.status)}</span></td>
                  <td className="p-5 text-left">
                    <button type="button" onClick={() => { setSelectedRow(r); setDetailsOpen(true); }} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details modal */}
      {detailsOpen && selectedRow && (
        <div className="fixed inset-0 z-[800] bg-black/40 flex items-center justify-center p-4" onClick={() => { setDetailsOpen(false); setSelectedRow(null); }}>
          <div className="w-full max-w-lg bg-white rounded-[2rem] p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 flex-row-reverse">
              <h3 className="text-lg font-black">{isArabic ? 'تفاصيل المرتجع' : 'Return Details'}</h3>
              <button type="button" onClick={() => { setDetailsOpen(false); setSelectedRow(null); }} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold"><span className="text-slate-500">{isArabic ? 'رقم الطلب' : 'Order #'}</span><span>#{selectedRow.orderShortId}</span></div>
              <div className="flex justify-between text-sm font-bold"><span className="text-slate-500">{isArabic ? 'التاريخ' : 'Date'}</span><span>{selectedRow.returnCreatedAt ? new Date(selectedRow.returnCreatedAt as any).toLocaleString('ar-EG') : '-'}</span></div>
              <div className="flex justify-between text-sm font-bold"><span className="text-slate-500">{isArabic ? 'الإجمالي' : 'Total'}</span><span className="font-black text-[#BD00FF]">ج.م {Number(selectedRow.totalAmount || 0).toLocaleString()}</span></div>
              {selectedRow.reason && <div className="p-3 rounded-xl bg-slate-50 text-sm font-bold text-slate-600">{selectedRow.reason}</div>}
              {Array.isArray(selectedRow.items) && selectedRow.items.length > 0 && (
                <div className="space-y-2">
                  <div className="font-black text-xs text-slate-700">{isArabic ? 'العناصر' : 'Items'}</div>
                  {selectedRow.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs font-bold text-slate-600 py-1 border-t border-slate-100">
                      <span>{item?.name || item?.productName || '—'} × {item?.quantity || 0}</span>
                      <span>ج.م {Number(item?.price || 0) * Number(item?.quantity || 0)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Status badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-xs font-black text-slate-500">{isArabic ? 'الحالة الحالية' : 'Current status'}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black ${statusColor(selectedRow.status)}`}>{statusLabel(selectedRow.status)}</span>
              </div>

              {/* Action buttons */}
              {actionError && <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold">{actionError}</div>}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                {selectedRow.status !== 'approved' && (
                  <button type="button" disabled={actionLoading} onClick={() => updateReturnStatus(selectedRow.returnId, 'approved')}
                    className="py-2.5 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 hover:bg-emerald-600">
                    <Check size={14} /> {isArabic ? 'موافقة' : 'Approve'}
                  </button>
                )}
                {selectedRow.status !== 'rejected' && (
                  <button type="button" disabled={actionLoading} onClick={() => updateReturnStatus(selectedRow.returnId, 'rejected')}
                    className="py-2.5 rounded-xl bg-red-500 text-white font-black text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 hover:bg-red-600">
                    <XCircle size={14} /> {isArabic ? 'رفض' : 'Reject'}
                  </button>
                )}
                {selectedRow.status === 'approved' && (
                  <button type="button" disabled={actionLoading} onClick={() => updateReturnStatus(selectedRow.returnId, 'processed')}
                    className="py-2.5 rounded-xl bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 hover:bg-blue-600">
                    <Clock size={14} /> {isArabic ? 'تنفيذ' : 'Process'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteReturnsPage;
