import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Loader2, RefreshCw } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import Modal from '@/components/common/ui/Modal';
import { useTranslation } from 'react-i18next';

type Props = {
  sales: any[];
};

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
  const { t } = useTranslation();
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
    const hasReturns = count > 0;
    return { count, totalReturnedAmount, hasReturns };
  }, [rows]);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const concurrency = 4;
      const out: Row[] = [];

      let idx = 0;
      const worker = async () => {
        while (idx < orderIds.length) {
          const cur = idx;
          idx += 1;
          const orderId = orderIds[cur];
          const order = orders.find((o: any) => String(o?.id || '').trim() === orderId);
          if (!order) continue;

          try {
            const list = await (ApiService as any).listOrderReturns(orderId);
            const returnsList = Array.isArray(list) ? list : [];
            for (const r of returnsList) {
              out.push({
                orderId,
                orderShortId: String(orderId).slice(0, 8).toUpperCase(),
                orderSource: typeof order?.source === 'string' ? order.source : undefined,
                orderCreatedAt: order?.created_at || order?.createdAt,
                returnId: String(r?.id || ''),
                returnCreatedAt: r?.createdAt,
                totalAmount: Number(r?.totalAmount || 0) || 0,
                reason: r?.reason ?? null,
                items: Array.isArray(r?.items) ? r.items : [],
              });
            }
          } catch {
            // ignore per-order errors to avoid breaking the entire view
          }
        }
      };

      await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, orderIds.length)) }).map(() => worker()));

      out.sort((a, b) => {
        const ta = a.returnCreatedAt ? new Date(a.returnCreatedAt as any).getTime() : 0;
        const tb = b.returnCreatedAt ? new Date(b.returnCreatedAt as any).getTime() : 0;
        return tb - ta;
      });

      setRows(out);
    } catch (e: any) {
      setError(String(e?.message || t('business.sales.returnsLoadFailed')));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIds.join('|')]);

  const openDetails = (row: Row) => {
    setSelectedRow(row);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedRow(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="text-slate-900 font-black text-xl">{t('business.sales.returns')}</div>
        <button
          type="button"
          onClick={fetchAll}
          disabled={loading}
          className="px-4 py-2 rounded-full font-black text-xs bg-slate-50 text-slate-700 flex items-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {t('business.sales.returnsRefresh')}
        </button>
      </div>

      {error ? (
        <div className="p-4 rounded-3xl bg-red-50 border border-red-100 text-red-700 font-black text-sm">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returnsCount')}</div>
          <div className="mt-2 text-slate-900 font-black text-lg">{summary.count}</div>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returnsTotal')}</div>
          <div className="mt-2 text-slate-900 font-black text-lg">{t('business.sales.currency')} {Number(summary.totalReturnedAmount || 0).toLocaleString()}</div>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returnsStatus')}</div>
          <div className="mt-2 text-slate-900 font-black text-lg">
            {summary.hasReturns ? t('business.sales.returnsExist') : t('business.sales.returnsNone')}
          </div>
        </div>
      </div>

      {rows.length === 0 && !loading ? (
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-slate-600 font-black text-sm">{t('business.sales.noReturns')}</div>
      ) : null}

      <div className="overflow-x-auto touch-auto no-scrollbar" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
        <table className="w-full text-right border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colOrderNumber')}</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returnsDate')}</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returnsItemCount')}</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colReason')}</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colTotal')}</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{t('business.sales.colDetails')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.returnId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-5 font-black text-slate-900">#{r.orderShortId}</td>
                <td className="p-5 text-slate-500 font-bold text-sm">
                  {r.returnCreatedAt ? new Date(r.returnCreatedAt as any).toLocaleString('ar-EG') : '-'}
                </td>
                <td className="p-5 text-slate-500 font-black text-sm">{Array.isArray(r.items) ? r.items.length : 0}</td>
                <td className="p-5 text-slate-500 font-bold text-sm">{r.reason ? t('business.sales.returnsExist') : '—'}</td>
                <td className="p-5">
                  <span className="font-black text-slate-900 text-sm">{t('business.sales.currency')} {Number(r.totalAmount || 0).toLocaleString()}</span>
                </td>
                <td className="p-5 text-left">
                  <button
                    type="button"
                    onClick={() => openDetails(r)}
                    className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={detailsOpen} onClose={closeDetails} title={t('business.sales.returnsDetails')} size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colOrderNumber')}</div>
              <div className="mt-2 text-white font-black text-base sm:text-lg">#{selectedRow?.orderShortId || '-'}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colTotal')}</div>
              <div className="mt-2 text-white font-black text-base sm:text-lg">{t('business.sales.currency')} {Number(selectedRow?.totalAmount || 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
            <div className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colReason')}</div>
            <div className="mt-3 text-slate-200 font-bold text-base sm:text-lg whitespace-pre-wrap">{selectedRow?.reason ? String(selectedRow.reason) : '—'}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
            <div className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returnedItems')}</div>
            <div className="mt-3 space-y-2">
              {(Array.isArray(selectedRow?.items) ? selectedRow?.items : []).map((it: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 bg-black/20 border border-white/10 rounded-xl p-3 sm:p-4">
                  <div className="text-white font-bold text-base sm:text-sm truncate">{it?.product?.name || t('business.sales.productFallback')}</div>
                  <div className="text-slate-200 font-black text-sm sm:text-xs shrink-0">
                    {Number(it?.quantity || 0)} x {t('business.sales.currency')} {Number(it?.unitPrice || 0)}
                  </div>
                </div>
              ))}
              {!Array.isArray(selectedRow?.items) || selectedRow?.items?.length === 0 ? (
                <div className="text-slate-300 font-bold text-base sm:text-sm">{t('business.sales.noReturnedItems')}</div>
              ) : null}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesReturnsView;
