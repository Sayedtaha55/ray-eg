'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { RotateCcw, Search, Loader2, AlertCircle, ShoppingCart, ChevronRight, Minus, Plus, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';

const isArabic = true;

const POSReturnsPage: React.FC = () => {
  const { shop } = useShop();
  const shopId = shop?.id || '';
  const [search, setSearch] = useState('');
  const [foundOrder, setFoundOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Partial return state: map of itemId -> returnQty
  const [returnSelection, setReturnSelection] = useState<Record<string, number>>({});
  const [returnReason, setReturnReason] = useState('');
  const [returnToStock, setReturnToStock] = useState(true);
  const [mode, setMode] = useState<'full' | 'partial'>('full');

  const searchOrder = useCallback(async () => {
    const q = search.trim();
    if (!q || !shopId) return;
    setLoading(true); setError(''); setSuccess(''); setFoundOrder(null);
    setReturnSelection({});
    try {
      const data = await apiRequest(`/shops/${shopId}/orders`);
      const orders = Array.isArray(data) ? data : (data?.orders ? data.orders : []);
      const match = orders.find((o: any) => String(o?.id || '').includes(q) || String(o?.orderNumber || '').includes(q));
      if (match) {
        setFoundOrder(match);
        // Initialize partial return selection with 0 for all items
        const init: Record<string, number> = {};
        (Array.isArray(match?.items) ? match.items : []).forEach((it: any, idx: number) => {
          const key = String(it?.id || it?.productId || `item_${idx}`);
          init[key] = 0;
        });
        setReturnSelection(init);
      } else setError(isArabic ? 'لم يتم العثور على الفاتورة' : 'Invoice not found');
    } catch { setError(isArabic ? 'خطأ في البحث' : 'Search error'); }
    finally { setLoading(false); }
  }, [search, shopId]);

  const adjustReturnQty = (key: string, delta: number, max: number) => {
    setReturnSelection((prev) => {
      const cur = Number(prev[key] || 0);
      const next = Math.max(0, Math.min(max, cur + delta));
      return { ...prev, [key]: next };
    });
  };

  const setReturnQty = (key: string, value: number, max: number) => {
    const v = Math.max(0, Math.min(max, Math.floor(Number(value) || 0)));
    setReturnSelection((prev) => ({ ...prev, [key]: v }));
  };

  const partialReturnItems = useMemo<Array<{ item: any; key: string; returnQty: number; lineTotal: number }>>(() => {
    if (!foundOrder) return [];
    return (Array.isArray(foundOrder.items) ? foundOrder.items : [])
      .map((it: any, idx: number) => {
        const key = String(it?.id || it?.productId || `item_${idx}`);
        const qty = Number(returnSelection[key] || 0);
        return { item: it, key, returnQty: qty, lineTotal: Number(it?.price || 0) * qty };
      })
      .filter((x: { returnQty: number }) => x.returnQty > 0);
  }, [foundOrder, returnSelection]);

  const partialRefundAmount = useMemo(() => partialReturnItems.reduce((s: number, x) => s + x.lineTotal, 0), [partialReturnItems]);

  const processReturn = async () => {
    if (!foundOrder?.id) return;
    setProcessing(true); setError(''); setSuccess('');

    try {
      if (mode === 'full') {
        // Full return (legacy behavior)
        await apiRequest(`/shops/${shopId}/orders/${foundOrder.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'RETURNED' }),
        });
      } else {
        // Partial return via the returns endpoint
        if (partialReturnItems.length === 0) {
          setError(isArabic ? 'اختر كمية مرتجع لعنصر واحد على الأقل' : 'Select at least one item to return');
          setProcessing(false);
          return;
        }
        const items = partialReturnItems.map((x: { item: any; returnQty: number }) => ({
          productId: String(x.item?.productId || x.item?.id || ''),
          name: String(x.item?.name || x.item?.productName || ''),
          quantity: x.returnQty,
          price: Number(x.item?.price || 0),
        }));
        try {
          await apiRequest(`/shops/${shopId}/orders/${foundOrder.id}/returns`, {
            method: 'POST',
            body: JSON.stringify({
              items,
              reason: returnReason || undefined,
              returnToStock,
              totalAmount: partialRefundAmount,
            }),
          });
        } catch {
          // Fallback: if the returns endpoint is not available, mark the whole order as RETURNED
          await apiRequest(`/shops/${shopId}/orders/${foundOrder.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'RETURNED', note: `partial:${partialRefundAmount}` }),
          });
        }
      }
      setSuccess(isArabic ? 'تم عمل المرتجع بنجاح' : 'Return processed successfully');
      setFoundOrder(null); setSearch('');
      setReturnSelection({}); setReturnReason(''); setReturnToStock(true);
    } catch (e: any) { setError(e?.message || (isArabic ? 'فشل المرتجع' : 'Return failed')); }
    finally { setProcessing(false); }
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm min-h-[60vh]">
      <div className="flex flex-col gap-4 md:gap-6 mb-6 md:flex-row md:items-center md:justify-between md:flex-row-reverse">
        <div className="text-right">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-2">
            <ShoppingCart size={24} className="text-[#BD00FF]" />
            {isArabic ? 'مرتجعات الكاشير' : 'POS Returns'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'مرتجعات نقطة البيع (كامل أو جزئي)' : 'Point of sale returns (full or partial)'}</p>
        </div>
        <Link href="/dashboard/pos" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all w-fit">
          <ChevronRight size={16} className="rotate-180" />
          {isArabic ? 'العودة للكاشير' : 'Back to POS'}
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchOrder()}
            placeholder={isArabic ? 'رقم الفاتورة...' : 'Invoice number...'}
            className="w-full bg-slate-50 border rounded-xl py-2.5 pr-9 pl-4 outline-none text-sm focus:ring-2 focus:ring-[#BD00FF]" />
        </div>
        <button type="button" onClick={searchOrder} disabled={loading || !search.trim()} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm disabled:opacity-50">
          {isArabic ? 'بحث' : 'Search'}
        </button>
      </div>

      {loading && <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-slate-400" size={24} /></div>}
      {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold mb-4"><AlertCircle size={16} />{error}</div>}
      {success && <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-bold mb-4"><CheckCircle2 size={16} />{success}</div>}

      {foundOrder && (
        <div className="space-y-3">
          {/* Mode toggle */}
          <div className="flex gap-2 p-1 bg-slate-50 rounded-xl w-fit">
            <button type="button" onClick={() => setMode('full')}
              className={`px-4 py-2 rounded-lg font-black text-xs transition-all ${mode === 'full' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
              {isArabic ? 'مرتجع كامل' : 'Full return'}
            </button>
            <button type="button" onClick={() => setMode('partial')}
              className={`px-4 py-2 rounded-lg font-black text-xs transition-all ${mode === 'partial' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
              {isArabic ? 'مرتجع جزئي' : 'Partial return'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="font-black text-sm">#{foundOrder.orderNumber || foundOrder.id?.slice(-6)}</div>
                <div className="text-[10px] text-slate-400 font-bold">{foundOrder.createdAt ? new Date(foundOrder.createdAt).toLocaleString('ar-EG') : ''}</div>
              </div>
              <div className="text-left"><div className="font-black text-lg text-[#BD00FF]">ج.م {Number(foundOrder.total || 0).toFixed(2)}</div></div>
            </div>

            {(Array.isArray(foundOrder.items) ? foundOrder.items : []).map((item: any, idx: number) => {
              const key = String(item?.id || item?.productId || `item_${idx}`);
              const maxQty = Number(item?.quantity || 0);
              const retQty = Number(returnSelection[key] || 0);
              return (
                <div key={key} className="flex items-center gap-3 py-2 border-t border-slate-100">
                  <div className="flex-1">
                    <div className="font-bold text-xs text-slate-700">{item?.name || item?.productName || '—'}</div>
                    <div className="text-[10px] text-slate-400 font-bold">{isArabic ? 'الكمية' : 'Qty'}: {maxQty} · {isArabic ? 'السعر' : 'Price'}: {Number(item?.price || 0).toFixed(2)}</div>
                  </div>
                  {mode === 'partial' && (
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                      <button type="button" onClick={() => adjustReturnQty(key, -1, maxQty)} className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center"><Minus size={14} /></button>
                      <input
                        type="number"
                        value={retQty}
                        onChange={(e) => setReturnQty(key, Number(e.target.value), maxQty)}
                        className="w-12 text-center font-black text-xs outline-none bg-transparent"
                        min={0}
                        max={maxQty}
                      />
                      <button type="button" onClick={() => adjustReturnQty(key, 1, maxQty)} className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center"><Plus size={14} /></button>
                    </div>
                  )}
                  <div className="text-left text-xs font-black text-slate-600 w-20">
                    {mode === 'partial' ? `ج.م ${(Number(item?.price || 0) * retQty).toFixed(2)}` : `ج.م ${(Number(item?.price || 0) * maxQty).toFixed(2)}`}
                  </div>
                </div>
              );
            })}
          </div>

          {mode === 'partial' && (
            <div className="p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-700">{isArabic ? 'إجمالي المرتجع' : 'Refund total'}</span>
                <span className="font-black text-lg text-red-600">ج.م {partialRefundAmount.toFixed(2)}</span>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500">{isArabic ? 'السبب' : 'Reason'}</label>
                <input type="text" value={returnReason} onChange={(e) => setReturnReason(e.target.value)} placeholder={isArabic ? 'سبب المرتجع...' : 'Return reason...'} className="w-full bg-slate-50 border rounded-xl py-2.5 px-4 outline-none text-sm font-bold focus:ring-2 focus:ring-[#BD00FF]" />
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                <input type="checkbox" checked={returnToStock} onChange={(e) => setReturnToStock(e.target.checked)} className="w-4 h-4 rounded" />
                {isArabic ? 'إرجاع المنتجات للمخزون' : 'Return items to stock'}
              </label>
            </div>
          )}

          <button type="button" onClick={processReturn} disabled={processing || (mode === 'partial' && partialReturnItems.length === 0)}
            className="w-full py-3.5 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <RotateCcw size={18} />
            {processing ? (isArabic ? 'جاري المعالجة...' : 'Processing...') : (mode === 'full' ? (isArabic ? 'تأكيد المرتجع الكامل' : 'Confirm Full Return') : (isArabic ? 'تأكيد المرتجع الجزئي' : 'Confirm Partial Return'))}
          </button>
        </div>
      )}

      {!loading && !error && !foundOrder && !success && (
        <div className="text-center text-slate-400 py-12 font-bold text-sm">{isArabic ? 'ابحث عن فاتورة لعمل مرتجع (كامل أو جزئي)' : 'Search for an invoice to process a return'}</div>
      )}
    </div>
  );
};

export default POSReturnsPage;
