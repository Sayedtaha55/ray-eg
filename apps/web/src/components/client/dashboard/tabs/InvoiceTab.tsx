'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FileDown, Loader2, Plus, Printer, Save, Trash2 } from 'lucide-react';
import * as merchantApi from '@/lib/api/merchant';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

type InvoiceLine = { id: string; name: string; quantity: number; price: number };
type Props = { shopId: string; shop?: any };

const InvoiceTab: React.FC<Props> = ({ shopId, shop }) => {
  const t = useT();
  const { dir } = useLocale();
  const isArabic = dir === 'rtl';
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const [view, setView] = useState<'manage' | 'edit'>('manage');
  const [loadingManage, setLoadingManage] = useState(false);
  const [manageError, setManageError] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [invoiceList, setInvoiceList] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newPrice, setNewPrice] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
  const [discountValue, setDiscountValue] = useState('0');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk] = useState('');

  const formatMoney = (v: any) => { const n = typeof v === 'number' ? v : Number(v); if (!Number.isFinite(n)) return '0.00'; return n.toFixed(2); };

  const subtotal = useMemo(() => (lines || []).reduce((sum, l) => sum + (Number(l.price) || 0) * (Number(l.quantity) || 0), 0), [lines]);
  const discount = useMemo(() => { const n = Number(discountValue); if (!Number.isFinite(n)) return 0; return Math.max(0, Math.min(subtotal, n)); }, [discountValue, subtotal]);
  const netBeforeVat = Math.max(0, subtotal - discount);
  const total = netBeforeVat;

  const loadManage = async () => {
    if (!shopId) return;
    setLoadingManage(true); setManageError('');
    try {
      const [sum, listRes] = await Promise.all([Promise.resolve(null), merchantApi.merchantGetInvoices(shopId)]);
      setSummary(sum || null);
      const raw = listRes as any;
      setInvoiceList(Array.isArray(raw?.items) ? raw.items : (Array.isArray(raw) ? raw : []));
    } catch (e: any) { setManageError(String(e?.message || t('business.invoice.loadError'))); }
    finally { setLoadingManage(false); }
  };

  useEffect(() => { if (view === 'manage') loadManage(); }, [view, shopId]);

  const openNewInvoice = () => { setSelectedInvoiceId(''); setLines([]); setNewName(''); setNewQty('1'); setNewPrice(''); setDiscountValue('0'); setSaveError(''); setSaveOk(''); setView('edit'); };

  const addLine = () => {
    const name = String(newName || '').trim();
    const qty = Number.isFinite(Number(newQty)) ? Math.max(1, Math.floor(Number(newQty))) : 1;
    const price = Number.isFinite(Number(newPrice)) ? Math.max(0, Number(newPrice)) : 0;
    if (!name) return;
    setLines((prev) => [...prev, { id: `${Date.now()}_${Math.random().toString(16).slice(2)}`, name, quantity: qty, price }]);
    setNewName(''); setNewQty('1'); setNewPrice('');
  };

  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));

  const saveInvoice = async () => {
    if (!shopId || !lines.length) { setSaveError(t('business.invoice.addItemsFirst')); return; }
    setSaving(true); setSaveError(''); setSaveOk('');
    try {
      const itemsPayload = lines.map((l) => ({ name: l.name, quantity: l.quantity, unitPrice: l.price })).filter((it) => it.name);
      const payload = { shopId, invoiceDate: invoiceDate ? new Date(`${invoiceDate}T00:00:00`).toISOString() : undefined, discount: Number(discountValue) || 0, items: itemsPayload };
      if (selectedInvoiceId) { await merchantApi.merchantUpdateInvoice(selectedInvoiceId, payload); setSaveOk(t('business.invoice.editSaved')); }
      else { const created = await merchantApi.merchantCreateInvoice(payload); if (created?.id) setSelectedInvoiceId(String(created.id)); setSaveOk(t('business.invoice.invoiceSaved')); }
      await loadManage();
    } catch (e: any) { setSaveError(String(e?.message || t('business.invoice.saveError'))); }
    finally { setSaving(false); }
  };

  const handlePrintInvoice = () => {
    if (!lines.length) return;
    const shopName = String(shop?.name || '').trim();
    const phone = String(shop?.phone || '').trim();
    const itemsHtml = lines.map((item) => `<tr><td class="name">${item.name}</td><td class="num">${item.quantity}</td><td class="num">${item.price.toFixed(2)}</td><td class="num">${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('');
    const html = `<!doctype html><html lang="${isArabic ? 'ar' : 'en'}" dir="${isArabic ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"/><title>Invoice</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;color:#111;direction:${isArabic ? 'rtl' : 'ltr'}}.wrap{max-width:900px;margin:0 auto}.brand{text-align:right}.title{font-size:20px;font-weight:900}.meta{font-size:12px;font-weight:700;margin-top:4px;color:#333}.divider{border-top:1px dashed #000;margin:12px 0}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #e5e7eb;padding:10px 8px;font-size:12px}th{background:#f8fafc;font-weight:900}td.name{font-weight:900}td.num{text-align:left;font-weight:800}.row{display:flex;justify-content:space-between;margin-top:6px;font-weight:900;font-size:13px}</style></head><body><div class="wrap"><div class="brand"><p class="title">${t('business.invoice.invoiceTitle')}</p>${shopName ? `<div class="meta">${shopName}</div>` : ''}${phone ? `<div class="meta">${t('business.invoice.phone')}: ${phone}</div>` : ''}</div><div class="divider"></div><table><thead><tr><th style="text-align:right">${t('business.invoice.item')}</th><th style="text-align:left">${t('business.invoice.qty')}</th><th style="text-align:left">${t('business.invoice.price')}</th><th style="text-align:left">${t('business.invoice.total')}</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="divider"></div><div class="row"><span>${t('business.invoice.total')}</span><span>${t('business.pos.egp')} ${total.toFixed(2)}</span></div></div></body></html>`;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) { doc.open(); doc.write(html); doc.close(); setTimeout(() => { try { iframe.contentWindow?.print(); } catch {} setTimeout(() => { try { document.body.removeChild(iframe); } catch {} }, 300); }, 300); }
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-right"><h2 className="text-2xl md:text-3xl font-black text-slate-900">{t('business.invoice.manageTitle')}</h2></div>
          <div className="flex flex-col sm:flex-row gap-2">
            {view === 'edit' ? <button type="button" onClick={() => { setView('manage'); setSaveError(''); setSaveOk(''); }} className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm flex items-center justify-center gap-2"><ArrowRight size={18} /> {t('common.back')}</button> : null}
            {view === 'manage' ? <button type="button" onClick={openNewInvoice} className="px-4 py-3 rounded-2xl bg-[#00E5FF] text-black font-black text-sm flex items-center justify-center gap-2"><Plus size={18} /> {t('business.invoice.newInvoice')}</button> : null}
          </div>
        </div>

        {manageError ? <div className="mt-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-4 py-3 font-black text-sm text-right">{manageError}</div> : null}

        {view === 'manage' ? (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4"><div className="text-[11px] font-black text-slate-500 mb-2">{t('business.invoice.invoiceCount')}</div><div className="text-2xl font-black text-slate-900">{summary ? Number(summary?.count || 0) : (loadingManage ? '...' : '0')}</div></div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4"><div className="text-[11px] font-black text-slate-500 mb-2">{t('business.invoice.invoicesTotal')}</div><div className="text-2xl font-black text-slate-900">{t('business.pos.egp')} {summary ? formatMoney(summary?.sumTotal) : (loadingManage ? '...' : '0.00')}</div></div>
              <div className="bg-slate-900 text-white rounded-2xl p-4"><div className="text-[11px] font-black text-slate-200 mb-2">{t('business.invoice.totalEq')}</div><div className="text-2xl font-black">{t('business.pos.egp')} {summary ? formatMoney(summary?.sumVat) : (loadingManage ? '...' : '0.00')}</div></div>
            </div>
            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden">
              <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="font-black text-slate-900">{t('business.invoice.invoiceLog')}</div>
                <button type="button" onClick={loadManage} disabled={loadingManage} className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60">{loadingManage ? <Loader2 size={18} className="animate-spin" /> : null}{t('business.invoice.refresh')}</button>
              </div>
              <div className="p-4 md:p-6">
                {loadingManage ? <div className="text-sm font-black text-slate-500 text-right">{t('common.loading')}</div> :
                 invoiceList.length === 0 ? <div className="text-sm font-black text-slate-500 text-right">{t('business.invoice.noInvoices')}</div> : (
                  <div className="overflow-auto"><table className="min-w-[720px] w-full"><thead><tr className="text-right"><th className="text-[12px] font-black text-slate-500 pb-3">{t('business.invoice.number')}</th><th className="text-[12px] font-black text-slate-500 pb-3">{t('business.invoice.date')}</th><th className="text-[12px] font-black text-slate-500 pb-3">{t('business.invoice.total')}</th></tr></thead><tbody>
                    {invoiceList.map((inv: any) => { const id = String(inv?.id || '').trim(); const d = inv?.invoiceDate || inv?.createdAt ? new Date(String(inv.invoiceDate || inv.createdAt)) : null; return <tr key={id} className="border-t border-slate-100"><td className="py-3 text-right font-black text-slate-900">{inv?.sequence || '-'}</td><td className="py-3 text-right font-black text-slate-700">{d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString(locale) : '-'}</td><td className="py-3 text-right font-black text-slate-900">{t('business.pos.egp')} {formatMoney(inv?.total)}</td></tr>; })}
                  </tbody></table></div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {view === 'edit' ? (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <button type="button" onClick={saveInvoice} disabled={saving} className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60">{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}{t('common.save')}</button>
              <button type="button" onClick={handlePrintInvoice} disabled={!lines.length} className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60"><Printer size={18} /> {t('business.invoice.print')}</button>
            </div>
            {saveError ? <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl px-4 py-3 font-black text-sm text-right">{saveError}</div> : null}
            {saveOk ? <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl px-4 py-3 font-black text-sm text-right">{saveOk}</div> : null}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4"><div className="text-[11px] font-black text-slate-500 mb-2">{t('business.invoice.date')}</div><input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-900" /></div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4"><div className="text-[11px] font-black text-slate-500 mb-2">{t('business.invoice.discountEgp')}</div><input type="number" min={0} step={1} value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-900" /></div>
              <div className="bg-slate-900 text-white rounded-2xl p-4"><div className="text-[11px] font-black text-slate-200 mb-2">{t('business.invoice.totalEq')}</div><div className="text-2xl font-black">{t('business.pos.egp')} {total.toFixed(2)}</div></div>
            </div>
            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden">
              <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-100">
                <div className="font-black text-slate-900">{t('business.invoice.addItem')}</div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('business.invoice.itemName')} className="md:col-span-6 bg-white border border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-900 text-right" />
                  <input value={newQty} onChange={(e) => setNewQty(e.target.value)} type="number" min={1} step={1} placeholder={t('business.invoice.qty')} className="md:col-span-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-900 text-right" />
                  <input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} type="number" min={0} step={0.25} placeholder={t('business.invoice.price')} className="md:col-span-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-900 text-right" />
                  <button type="button" onClick={addLine} className="md:col-span-1 bg-[#00E5FF] text-black rounded-2xl font-black flex items-center justify-center gap-2 px-4 py-3"><Plus size={18} /></button>
                </div>
              </div>
              <div className="p-4 md:p-6">
                {lines.length === 0 ? <div className="text-sm font-black text-slate-500 text-right">{t('business.invoice.addItemsHint')}</div> : (
                  <div className="space-y-3">
                    {lines.map((l) => (
                      <div key={l.id} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row-reverse">
                        <div className="flex-1 text-right"><div className="font-black text-slate-900">{l.name}</div><div className="text-xs text-slate-500 font-bold">{l.quantity} x {t('business.pos.egp')} {l.price.toFixed(2)}</div></div>
                        <div className="font-black text-slate-900">{t('business.pos.egp')} {(l.price * l.quantity).toFixed(2)}</div>
                        <button type="button" onClick={() => removeLine(l.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InvoiceTab;
