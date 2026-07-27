import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useTranslation } from 'react-i18next';

type Props = {
  order: any;
};

const OrderReturnsPanel: React.FC<Props> = ({ order }) => {
  const { t, i18n } = useTranslation();
  const locale = String(i18n.language || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US';
  const orderId = String(order?.id || '').trim();
  const orderItems = Array.isArray(order?.items) ? order.items : [];

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [returnsList, setReturnsList] = useState<any[]>([]);

  const [reason, setReason] = useState('');
  const [returnToStock, setReturnToStock] = useState(true);
  const [qtyByOrderItemId, setQtyByOrderItemId] = useState<Record<string, string>>({});

  const returnedQtyByOrderItemId = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of returnsList || []) {
      const items = Array.isArray(r?.items) ? r.items : [];
      for (const it of items) {
        const k = String(it?.orderItemId || it?.order_item_id || '').trim();
        const q = Number(it?.quantity || 0);
        if (!k) continue;
        map.set(k, (map.get(k) || 0) + (Number.isFinite(q) ? q : 0));
      }
    }
    return map;
  }, [returnsList]);

  const computeRemainingQty = (orderItem: any) => {
    const id = String(orderItem?.id || '').trim();
    const sold = Math.max(0, Math.floor(Number(orderItem?.quantity || 0)));
    const returned = Math.max(0, Math.floor(Number(returnedQtyByOrderItemId.get(id) || 0)));
    return Math.max(0, sold - returned);
  };

  const returnsSummary = useMemo(() => {
    const count = Array.isArray(returnsList) ? returnsList.length : 0;
    const totalReturnedAmount = (returnsList || []).reduce((sum, r) => sum + (Number(r?.totalAmount || 0) || 0), 0);
    const remainingTotalQty = orderItems.reduce((sum: number, it: any) => sum + computeRemainingQty(it), 0);
    const soldTotalQty = orderItems.reduce((sum: number, it: any) => sum + Math.max(0, Math.floor(Number(it?.quantity || 0))), 0);
    const returnedTotalQty = Math.max(0, soldTotalQty - remainingTotalQty);

    const hasAnyReturn = returnedTotalQty > 0;
    const isFullyReturned = hasAnyReturn && remainingTotalQty <= 0;
    const isPartialReturned = hasAnyReturn && remainingTotalQty > 0;

    return {
      count,
      totalReturnedAmount,
      remainingTotalQty,
      returnedTotalQty,
      isFullyReturned,
      isPartialReturned,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnsList, orderItems, returnedQtyByOrderItemId]);

  const refresh = async () => {
    if (!orderId) return;
    setLoading(true);
    setError('');
    try {
      const data = await (ApiService as any).listOrderReturns(orderId);
      setReturnsList(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(String(e?.message || t('business.sales.returnsLoadFailed')));
      setReturnsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    setReason('');
    setReturnToStock(true);
    setQtyByOrderItemId({});
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const canCreate = useMemo(() => {
    if (!orderId) return false;
    if (creating) return false;
    const anyRemaining = orderItems.some((it: any) => computeRemainingQty(it) > 0);
    return anyRemaining;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, creating, orderItems, returnedQtyByOrderItemId]);

  const createReturn = async () => {
    if (!orderId) return;
    if (!canCreate) return;

    const itemsPayload = orderItems
      .map((it: any) => {
        const id = String(it?.id || '').trim();
        if (!id) return null;

        const remaining = computeRemainingQty(it);
        const raw = qtyByOrderItemId[id];
        const n = raw == null || raw === '' ? NaN : Number(raw);
        const qty = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;

        if (qty <= 0) return null;
        if (qty > remaining) return { orderItemId: id, quantity: remaining };
        return { orderItemId: id, quantity: qty };
      })
      .filter(Boolean);

    if (itemsPayload.length === 0) {
      setError(t('business.sales.specifyReturnQty'));
      return;
    }

    setCreating(true);
    setError('');
    try {
      await (ApiService as any).createOrderReturn(orderId, {
        returnToStock: returnToStock === true,
        reason: String(reason || '').trim() || undefined,
        items: itemsPayload,
      });

      setReason('');
      setQtyByOrderItemId({});

      try {
        window.dispatchEvent(new Event('orders-updated'));
      } catch {
      }

      await refresh();
    } catch (e: any) {
      setError(String(e?.message || t('business.sales.createReturnFailed')));
    } finally {
      setCreating(false);
    }
  };

  if (!orderId) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returns')}</div>
        <button
          type="button"
          onClick={refresh}
          className="px-3 py-2 rounded-2xl bg-white/10 text-white font-black text-xs flex items-center gap-2"
          disabled={loading}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {t('business.sales.returnsRefresh')}
        </button>
      </div>

      {error ? (
        <div className="mt-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-bold">
          {error}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {(returnsList || []).length === 0 && !loading ? (
          <div className="text-slate-300 font-bold text-sm">{t('business.sales.noReturnsForOrder')}</div>
        ) : null}

        {(returnsList || []).map((r: any) => (
          <div key={String(r?.id)} className="bg-black/20 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-white font-black text-sm">{t('business.sales.returnItem')}</div>
              <div className="text-slate-300 font-bold text-xs">
                {r?.createdAt ? new Date(r.createdAt).toLocaleString(locale) : '-'}
              </div>
            </div>
            <div className="mt-2 text-slate-200 font-bold text-xs">
              {t('business.sales.colTotal')}: {t('business.sales.currency')} {Number(r?.totalAmount || 0).toLocaleString()}
            </div>
            {r?.reason ? <div className="mt-2 text-slate-200 font-bold text-xs whitespace-pre-wrap">{String(r.reason)}</div> : null}
            <div className="mt-3 space-y-2">
              {(Array.isArray(r?.items) ? r.items : []).map((it: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="text-slate-200 font-bold text-xs truncate">{it?.product?.name || t('business.sales.productDefault')}</div>
                  <div className="text-slate-300 font-black text-[10px] shrink-0">
                    {Number(it?.quantity || 0)} x {t('business.sales.currency')} {Number(it?.unitPrice || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="text-white font-black text-sm">{t('business.sales.createReturn')}</div>

        <div className="mt-3">
          <label className="flex items-center gap-3 text-slate-200 font-bold text-sm">
            <input
              type="checkbox"
              checked={returnToStock}
              onChange={(e) => setReturnToStock(e.target.checked)}
              className="w-4 h-4"
            />
            {t('business.sales.returnToStock')}
          </label>
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('business.sales.returnReasonOptional')}
          className="mt-3 w-full bg-black/20 border border-white/10 rounded-2xl p-3 text-white font-bold text-sm outline-none"
          rows={3}
        />

        <div className="mt-4 space-y-3">
          {orderItems.map((it: any, idx: number) => {
            const id = String(it?.id || '').trim();
            const name = it?.product?.name || it?.name || it?.title || `${t('business.sales.productDefault')} ${idx + 1}`;
            const remaining = computeRemainingQty(it);
            const value = qtyByOrderItemId[id] ?? '';
            const disabled = remaining <= 0 || creating;

            return (
              <div key={id || idx} className="flex items-center justify-between gap-3 bg-black/20 border border-white/10 rounded-2xl p-3">
                <div className="min-w-0">
                  <div className="text-white font-bold text-sm truncate">{name}</div>
                  <div className="text-slate-300 font-black text-[10px] mt-1">{t('business.sales.availableForReturn')}: {remaining}</div>
                </div>
                <input
                  type="number"
                  min={0}
                  max={remaining}
                  value={value}
                  disabled={disabled}
                  onChange={(e) => {
                    const next = (e.target as any).value;
                    setQtyByOrderItemId((prev) => ({ ...prev, [id]: next }));
                  }}
                  className="w-24 bg-black/30 border border-white/10 rounded-xl py-2 px-3 text-white font-black text-right outline-none disabled:opacity-60"
                />
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={createReturn}
          disabled={!canCreate}
          className="mt-4 w-full px-5 py-3 rounded-2xl bg-[#00E5FF] text-black font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {creating ? <Loader2 size={18} className="animate-spin" /> : null}
          {t('business.sales.createReturn')}
        </button>
      </div>
    </div>
  );
};

export default OrderReturnsPanel;
