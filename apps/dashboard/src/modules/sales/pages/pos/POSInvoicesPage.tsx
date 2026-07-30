import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Printer, Search, Loader2 } from 'lucide-react';
import { ApiService } from '@/services/api.service';

interface Props {
  shopId: string;
  isArabic: boolean;
}

const POSInvoicesPage: React.FC<Props> = ({ shopId, isArabic }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadOrders = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const data = await ApiService.getAllOrders({ shopId });
      const posOrders = (Array.isArray(data) ? data : []).filter((o: any) => o?.source === 'pos' || o?.source === 'POS');
      setOrders(posOrders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const id = String(o?.id || o?.orderNumber || '').toLowerCase();
    const name = String(o?.customerName || '').toLowerCase();
    const phone = String(o?.customerPhone || '');
    return id.includes(q) || name.includes(q) || phone.includes(q);
  });

  const reprintReceipt = (order: any) => {
    const escapeHtml = (v: any) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fmt = (n: any) => (Number.isFinite(Number(n)) ? Number(n).toFixed(2) : '0.00');
    const items = Array.isArray(order?.items) ? order.items : [];
    const linesHtml = items.map((i: any) => `
      <tr>
        <td style="padding: 6px 0;">${escapeHtml(i?.name || i?.productName || '')}</td>
        <td style="padding: 6px 0; text-align:left;">${Number(i?.quantity || 0)}x</td>
        <td style="padding: 6px 0; text-align:left;">${fmt(Number(i?.price || 0) * Number(i?.quantity || 0))}</td>
      </tr>
    `).join('');

    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Receipt</title>
    <style>@page{margin:8mm}body{font-family:Arial,sans-serif;direction:rtl}.wrap{max-width:80mm;margin:0 auto}h1{font-size:16px;text-align:center}.meta{font-size:11px;text-align:center;margin-bottom:10px}.sep{border-top:1px dashed #999;margin:10px 0}table{width:100%;border-collapse:collapse;font-size:12px}.row{display:flex;justify-content:space-between;padding:4px 0}.foot{font-size:11px;text-align:center;margin-top:10px}</style>
    </head><body><div class="wrap">
    <h1>${escapeHtml(order?.shopName || 'Receipt')}</h1>
    <div class="meta"><div>#${escapeHtml(order?.orderNumber || order?.id || '')}</div><div>${escapeHtml(order?.createdAt ? new Date(order.createdAt).toLocaleString() : '')}</div></div>
    <div class="sep"></div><table><tbody>${linesHtml}</tbody></table><div class="sep"></div>
    <div class="row" style="font-weight:700"><span>Total</span><span>${fmt(order?.total)}</span></div>
    </div></body></html>`;

    try {
      const w = window.open('', '_blank', 'width=480,height=720');
      if (!w) return;
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();
      w.print();
      setTimeout(() => { try { w.close(); } catch {} }, 15000);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={isArabic ? 'بحث برقم الفاتورة أو العميل...' : 'Search by invoice # or customer...'}
          className="w-full bg-slate-50 border rounded-xl py-2.5 pr-9 pl-4 outline-none text-sm focus:ring-2 focus:ring-[#BD00FF]" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-400 py-12 font-bold text-sm">
          {isArabic ? 'لا توجد فواتير' : 'No invoices found'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.slice(0, 100).map((order) => (
            <div key={order?.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Receipt size={18} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm text-slate-900">
                  #{order?.orderNumber || order?.id?.slice(-6) || '—'}
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  {order?.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                  {order?.customerName ? ` · ${order.customerName}` : ''}
                </div>
              </div>
              <div className="text-left shrink-0">
                <div className="font-black text-sm text-[#BD00FF]">
                  {isArabic ? 'ج.م' : 'EGP'} {Number(order?.total || 0).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  {order?.paymentMethod || 'COD'}
                </div>
              </div>
              <button type="button" onClick={() => reprintReceipt(order)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all shrink-0"
                title={isArabic ? 'إعادة طباعة' : 'Reprint'}>
                <Printer size={16} className="text-slate-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default POSInvoicesPage;
