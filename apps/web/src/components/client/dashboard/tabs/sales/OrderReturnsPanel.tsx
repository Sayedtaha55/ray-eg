'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';

type Props = { order: any };

const OrderReturnsPanel: React.FC<Props> = ({ order }) => {
  const t = useT();
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
      for (const it of Array.isArray(r?.items) ? r.items : []) {
        const k = String(it?.orderItemId || it?.order_item_id || '').trim();
        const q = Number(it?.quantity || 0);
        if (k) map.set(k, (map.get(k) || 0) + (Number.isFinite(q) ? q : 0));
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

  const refresh = async () => {
    if (!orderId) return;
    setLoading(true); setError('');
    try {
      const data = await clientFetch<any[]>(`/v1/orders/${orderId}/returns`);
      setReturnsList(Array.isArray(data) ? data : []);
    } catch (e: any) { setError(String(e?.message || t('business.sales.returnsLoadFailed', 'فشل تحميل المرتجعات'))); setReturnsList([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (orderId) { setReason(''); setReturnToStock(true); setQtyByOrderItemId({}); refresh(); } }, [orderId]);

  const canCreate = useMemo(() => {
    if (!orderId || creating) return false;
    return orderItems.some((it: any) => computeRemainingQty(it) > 0);
  }, [orderId, creating, orderItems, returnedQtyByOrderItemId]);

  const createReturn = async () => {
    if (!orderId || !canCreate) return;
    const itemsPayload = orderItems.map((it: any) => {
      const id = String(it?.id || '').trim();
      if (!id) return null;
      const remaining = computeRemainingQty(it);
      const raw = qtyByOrderItemId[id];
      const n = raw == null || raw === '' ? NaN : Number(raw);
      const qty = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
      if (qty <= 0) return null;
      if (qty > remaining) return { orderItemId: id, quantity: remaining };
      return { orderItemId: id, quantity: qty };
    }).filter(Boolean);

    if (itemsPayload.length === 0) { setError(t('business.sales.specifyReturnQty', 'حدد كمية المرتجع')); return; }
    setCreating(true); setError('');
    try {
      await clientFetch<any>(`/v1/orders/${orderId}/returns`, { method: 'POST', body: JSON.stringify({ returnToStock, reason: reason.trim() || undefined, items: itemsPayload }) });
      setReason(''); setQtyByOrderItemId({});
      try { window.dispatchEvent(new Event('orders-updated')); } catch {}
      await refresh();
    } catch (e: any) { setError(String(e?.message || t('business.sales.createReturnFailed', 'فشل إنشاء المرتجع'))); }
    finally { setCreating(false); }
  };

  if (!orderId) return null;

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.returns', 'المرتجعات')}</div>
        <button type="button" onClick={refresh} className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-xs flex items-center gap-2" disabled={loading}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}{t('business.sales.returnsRefresh', 'تحديث')}
        </button>
      </div>
      {error && <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-bold">{error}</div>}
      <div className="mt-4 space-y-3">
        {(returnsList || []).length === 0 && !loading && <div className="text-slate-400 font-bold text-sm">{t('business.sales.noReturnsForOrder', 'لا توجد مرتجعات لهذا الطلب')}</div>}
        {(returnsList || []).map((r: any) => (
          <div key={String(r?.id)} className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3"><div className="text-slate-900 font-black text-sm">{t('business.sales.returnItem', 'مرتجع')}</div><div className="text-slate-400 font-bold text-xs">{r?.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</div></div>
            <div className="mt-2 text-slate-600 font-bold text-xs">{t('business.sales.colTotal', 'الإجمالي')}: {t('business.sales.currency', 'ج.م')} {Number(r?.totalAmount || 0).toLocaleString()}</div>
            {r?.reason && <div className="mt-2 text-slate-500 font-bold text-xs whitespace-pre-wrap">{String(r.reason)}</div>}
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="text-slate-900 font-black text-sm">{t('business.sales.createReturn', 'إنشاء مرتجع')}</div>
        <div className="mt-3"><label className="flex items-center gap-3 text-slate-600 font-bold text-sm"><input type="checkbox" checked={returnToStock} onChange={e => setReturnToStock(e.target.checked)} className="w-4 h-4" />{t('business.sales.returnToStock', 'إرجاع للمخزون')}</label></div>
        <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder={t('business.sales.returnReasonOptional', 'سبب الإرجاع (اختياري)')} className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-3 text-slate-900 font-bold text-sm outline-none" rows={3} />
        <div className="mt-4 space-y-3">
          {orderItems.map((it: any, idx: number) => {
            const id = String(it?.id || '').trim();
            const name = it?.product?.name || it?.name || `${t('business.sales.productDefault', 'منتج')} ${idx + 1}`;
            const remaining = computeRemainingQty(it);
            const value = qtyByOrderItemId[id] ?? '';
            const disabled = remaining <= 0 || creating;
            return (
              <div key={id || idx} className="flex items-center justify-between gap-3 bg-white border border-slate-100 rounded-2xl p-3">
                <div className="min-w-0"><div className="text-slate-900 font-bold text-sm truncate">{name}</div><div className="text-slate-400 font-black text-[10px] mt-1">{t('business.sales.availableForReturn', 'متاح للإرجاع')}: {remaining}</div></div>
                <input type="number" min={0} max={remaining} value={value} disabled={disabled} onChange={e => setQtyByOrderItemId(prev => ({ ...prev, [id]: e.target.value }))} className="w-24 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-black text-right outline-none disabled:opacity-60" />
              </div>
            );
          })}
        </div>
        <button type="button" onClick={createReturn} disabled={!canCreate} className="mt-4 w-full px-5 py-3 rounded-2xl bg-[#00E5FF] text-black font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {creating && <Loader2 size={18} className="animate-spin" />}{t('business.sales.createReturn', 'إنشاء مرتجع')}
        </button>
      </div>
    </div>
  );
};

export default OrderReturnsPanel;
