'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Loader2, RefreshCw } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';

type Props = { sales: any[] };

type Row = {
  orderId: string;
  orderShortId: string;
  orderSource?: string;
  orderCreatedAt?: string | Date;
  returnId: string;
  returnCreatedAt?: string | Date;
  totalAmount: number;
  reason?: string | null;
  items: any[];
};

const SalesReturnsView: React.FC<Props> = ({ sales }) => {
  const t = useT();
  const orders = useMemo(() => (Array.isArray(sales) ? sales : []), [sales]);
  const orderIds = useMemo(() => orders.map((o: any) => String(o?.id || '').trim()).filter(Boolean), [orders]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);

  const summary = useMemo(() => {
    const count = rows.length;
    const totalReturnedAmount = rows.reduce((sum, r) => sum + (Number(r.totalAmount || 0) || 0), 0);
    return { count, totalReturnedAmount, hasReturns: count > 0 };
  }, [rows]);

  const fetchAll = async () => {
    setLoading(true); setError('');
    try {
      const out: Row[] = [];
      const concurrency = 4;
      let idx = 0;
      const worker = async () => {
        while (idx < orderIds.length) {
          const cur = idx; idx += 1;
          const orderId = orderIds[cur];
          try {
            const list = await clientFetch<any[]>(`/v1/orders/${orderId}/returns`);
            for (const r of Array.isArray(list) ? list : []) {
              out.push({ orderId, orderShortId: orderId.slice(0, 8).toUpperCase(), orderCreatedAt: orders.find((o: any) => String(o?.id || '').trim() === orderId)?.created_at, returnId: String(r?.id || ''), returnCreatedAt: r?.createdAt, totalAmount: Number(r?.totalAmount || 0) || 0, reason: r?.reason ?? null, items: Array.isArray(r?.items) ? r.items : [] });
            }
          } catch {}
        }
      };
      await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, orderIds.length)) }).map(() => worker()));
      out.sort((a, b) => { const ta = a.returnCreatedAt ? new Date(a.returnCreatedAt as any).getTime() : 0; const tb = b.returnCreatedAt ? new Date(b.returnCreatedAt as any).getTime() : 0; return tb - ta; });
      setRows(out);
    } catch (e: any) { setError(String(e?.message || t('business.sales.returnsLoadFailed', 'فشل تحميل المرتجعات'))); setRows([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [orderIds.join('|')]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="text-slate-900 font-black text-xl">{t('business.sales.returns', 'المرتجعات')}</div>
        <button type="button" onClick={fetchAll} disabled={loading} className="px-4 py-2 rounded-full font-black text-xs bg-slate-50 text-slate-700 flex items-center gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}{t('business.sales.returnsRefresh', 'تحديث')}
        </button>
      </div>
      {error && <div className="p-4 rounded-3xl bg-red-50 border border-red-100 text-red-700 font-black text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returnsCount', 'عدد المرتجعات')}</div><div className="mt-2 text-slate-900 font-black text-lg">{summary.count}</div></div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returnsTotal', 'إجمالي المرتجعات')}</div><div className="mt-2 text-slate-900 font-black text-lg">{t('business.sales.currency', 'ج.م')} {Number(summary.totalReturnedAmount || 0).toLocaleString()}</div></div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returnsStatus', 'الحالة')}</div><div className="mt-2 text-slate-900 font-black text-lg">{summary.hasReturns ? t('business.sales.returnsExist', 'يوجد مرتجعات') : t('business.sales.returnsNone', 'لا توجد مرتجعات')}</div></div>
      </div>
      {rows.length === 0 && !loading && <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-slate-600 font-black text-sm">{t('business.sales.noReturns', 'لا توجد مرتجعات')}</div>}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-right border-collapse min-w-[900px]">
          <thead><tr className="bg-slate-50 border-b border-slate-100">
            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colOrderNumber', 'رقم الطلب')}</th>
            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returnsDate', 'التاريخ')}</th>
            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returnsItemCount', 'عدد العناصر')}</th>
            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colReason', 'السبب')}</th>
            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colTotal', 'الإجمالي')}</th>
            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{t('business.sales.colDetails', 'التفاصيل')}</th>
          </tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.returnId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-5 font-black text-slate-900">#{r.orderShortId}</td>
                <td className="p-5 text-slate-500 font-bold text-sm">{r.returnCreatedAt ? new Date(r.returnCreatedAt as any).toLocaleString() : '-'}</td>
                <td className="p-5 text-slate-500 font-black text-sm">{Array.isArray(r.items) ? r.items.length : 0}</td>
                <td className="p-5 text-slate-500 font-bold text-sm">{r.reason || '—'}</td>
                <td className="p-5"><span className="font-black text-slate-900 text-sm">{t('business.sales.currency', 'ج.م')} {Number(r.totalAmount || 0).toLocaleString()}</span></td>
                <td className="p-5 text-left"><button type="button" onClick={() => { setSelectedRow(r); setDetailsOpen(true); }} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"><Eye size={18} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detailsOpen && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDetailsOpen(false)}>
          <div className="bg-white rounded-[2rem] max-w-lg w-full mx-4 p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="font-black text-slate-900">{t('business.sales.returnsDetails', 'تفاصيل المرتجع')}</h3><button onClick={() => setDetailsOpen(false)} className="p-2 rounded-xl hover:bg-slate-100">✕</button></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colOrderNumber', 'رقم الطلب')}</div><div className="mt-2 font-black text-slate-900">#{selectedRow.orderShortId}</div></div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colTotal', 'الإجمالي')}</div><div className="mt-2 font-black text-slate-900">{t('business.sales.currency', 'ج.م')} {Number(selectedRow.totalAmount || 0).toLocaleString()}</div></div>
            </div>
            {selectedRow.reason && <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colReason', 'السبب')}</div><div className="mt-2 text-slate-700 font-bold whitespace-pre-wrap">{String(selectedRow.reason)}</div></div>}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returnedItems', 'العناصر المرتجعة')}</div>
              <div className="mt-3 space-y-2">
                {(Array.isArray(selectedRow.items) ? selectedRow.items : []).map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between gap-3 bg-white border border-slate-100 rounded-xl p-3">
                    <div className="text-slate-900 font-bold text-sm truncate">{it?.product?.name || t('business.sales.productFallback', 'منتج')}</div>
                    <div className="text-slate-500 font-black text-xs shrink-0">{Number(it?.quantity || 0)} x {t('business.sales.currency', 'ج.م')} {Number(it?.unitPrice || 0)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReturnsView;
