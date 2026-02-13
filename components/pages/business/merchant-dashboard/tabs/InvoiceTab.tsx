import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FileDown, Loader2, Plus, Printer, Save, Trash2 } from 'lucide-react';
import { RayDB } from '@/constants';
import { ApiService } from '@/services/api.service';

type InvoiceLine = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type Props = {
  shopId: string;
  shop?: any;
};

const InvoiceTab: React.FC<Props> = ({ shopId, shop }) => {
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
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [discountValue, setDiscountValue] = useState('0');
  const [receiptTheme, setReceiptTheme] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk] = useState('');

  useEffect(() => {
    const loadTheme = () => {
      const raw = RayDB.getReceiptTheme(shopId) as any;
      const merged = {
        ...raw,
        shopName: String(raw?.shopName || shop?.name || ''),
        phone: String(raw?.phone || shop?.phone || ''),
        city: String(raw?.city || shop?.city || ''),
        address: String(raw?.address || shop?.addressDetailed || shop?.address_detailed || ''),
        logoDataUrl: String(raw?.logoDataUrl || shop?.logoUrl || shop?.logo_url || ''),
      };

      setReceiptTheme(merged);
    };

    loadTheme();
    window.addEventListener('receipt-theme-update', loadTheme);
    return () => window.removeEventListener('receipt-theme-update', loadTheme);
  }, [shopId, shop?.name, shop?.phone, shop?.city, shop?.addressDetailed, shop?.address_detailed, shop?.logoUrl, shop?.logo_url]);

  const effectiveReceiptTheme = (() => {
    const raw = (receiptTheme || {}) as any;
    return {
      ...raw,
      shopName: String(raw?.shopName || shop?.name || ''),
      phone: String(raw?.phone || shop?.phone || ''),
      city: String(raw?.city || shop?.city || ''),
      address: String(raw?.address || shop?.addressDetailed || shop?.address_detailed || ''),
      logoDataUrl: String(raw?.logoDataUrl || shop?.logoUrl || shop?.logo_url || ''),
      footerNote: String(raw?.footerNote || ''),
      vatRatePercent: (() => {
        const v = raw?.vatRatePercent;
        const n = typeof v === 'number' ? v : Number(v);
        if (!Number.isFinite(n)) return 14;
        return Math.min(100, Math.max(0, n));
      })(),
    };
  })();

  const subtotal = useMemo(() => {
    return (lines || []).reduce((sum, l) => sum + (Number(l.price) || 0) * (Number(l.quantity) || 0), 0);
  }, [lines]);

  const discount = useMemo(() => {
    const n = Number(discountValue);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(subtotal, n));
  }, [discountValue, subtotal]);

  const netBeforeVat = Math.max(0, subtotal - discount);

  const vatRate = Number((effectiveReceiptTheme as any)?.vatRatePercent);
  const vatRatePct = Number.isFinite(vatRate) ? vatRate : 14;
  const vatAmount = netBeforeVat * (vatRatePct / 100);
  const total = netBeforeVat + vatAmount;
  const showVat = vatRatePct > 0;

  const formatMoney = (v: any) => {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return '0.00';
    return n.toFixed(2);
  };

  const resetEditor = () => {
    setSelectedInvoiceId('');
    setLines([]);
    setNewName('');
    setNewQty('1');
    setNewPrice('');
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setInvoiceDate(`${yyyy}-${mm}-${dd}`);
    setDiscountValue('0');
    setSaveError('');
    setSaveOk('');
  };

  const loadManage = async () => {
    if (!shopId) return;
    setLoadingManage(true);
    setManageError('');
    try {
      const [sum, listRes] = await Promise.all([
        (ApiService as any).getMyInvoiceSummary(),
        (ApiService as any).listMyInvoices({ page: 1, limit: 50 }),
      ]);
      setSummary(sum || null);
      setInvoiceList(Array.isArray(listRes?.items) ? listRes.items : (Array.isArray(listRes) ? listRes : []));
    } catch (e: any) {
      setManageError(String(e?.message || 'حدث خطأ أثناء تحميل الفواتير'));
    } finally {
      setLoadingManage(false);
    }
  };

  useEffect(() => {
    if (view !== 'manage') return;
    loadManage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, shopId]);

  const openNewInvoice = () => {
    resetEditor();
    setView('edit');
  };

  const openInvoiceForEdit = async (id: string) => {
    const invoiceId = String(id || '').trim();
    if (!invoiceId) return;
    setSaveError('');
    setSaveOk('');
    setSaving(true);
    try {
      const inv = await (ApiService as any).getInvoiceById(invoiceId);
      setSelectedInvoiceId(String(inv?.id || invoiceId));

      const dRaw = inv?.invoiceDate || inv?.invoice_date || inv?.date;
      const d = dRaw ? new Date(String(dRaw)) : new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setInvoiceDate(`${yyyy}-${mm}-${dd}`);

      const discountDb = typeof inv?.discount === 'number' ? inv.discount : Number(inv?.discount ?? 0);
      setDiscountValue(Number.isFinite(discountDb) ? String(discountDb) : '0');

      const items = Array.isArray(inv?.items) ? inv.items : [];
      setLines(
        items.map((it: any) => ({
          id: String(it?.id || `${Date.now()}_${Math.random().toString(16).slice(2)}`),
          name: String(it?.name || '').trim(),
          quantity: Number(it?.quantity) || 1,
          price: Number(it?.unitPrice ?? it?.unit_price ?? it?.price) || 0,
        })).filter((it: any) => it.name),
      );

      setView('edit');
    } catch (e: any) {
      setManageError(String(e?.message || 'تعذر فتح الفاتورة'));
      setView('manage');
    } finally {
      setSaving(false);
    }
  };

  const addLine = () => {
    const name = String(newName || '').trim();
    const qtyRaw = Number(newQty);
    const priceRaw = Number(newPrice);
    const qty = Number.isFinite(qtyRaw) ? Math.max(1, Math.floor(qtyRaw)) : 1;
    const price = Number.isFinite(priceRaw) ? Math.max(0, priceRaw) : 0;
    if (!name) return;

    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setLines((prev) => [...(Array.isArray(prev) ? prev : []), { id, name, quantity: qty, price }]);
    setNewName('');
    setNewQty('1');
    setNewPrice('');
  };

  const removeLine = (id: string) => {
    const key = String(id || '').trim();
    if (!key) return;
    setLines((prev) => (Array.isArray(prev) ? prev.filter((l) => l.id !== key) : []));
  };

  const formatInvoiceText = () => {
    const linesOut: string[] = [];
    const shopName = String(effectiveReceiptTheme?.shopName || '').trim();
    const phone = String(effectiveReceiptTheme?.phone || '').trim();
    const city = String((effectiveReceiptTheme as any)?.city || '').trim();
    const address = String(effectiveReceiptTheme?.address || '').trim();
    const footerNote = String(effectiveReceiptTheme?.footerNote || '').trim();

    linesOut.push('فاتورة حسابات');
    if (shopName) linesOut.push(shopName);
    if (phone) linesOut.push(`هاتف: ${phone}`);
    if (city) linesOut.push(`المدينة: ${city}`);
    if (address) linesOut.push(`العنوان: ${address}`);
    linesOut.push('--------------------------');
    if (invoiceDate) linesOut.push(`التاريخ: ${invoiceDate}`);
    linesOut.push('--------------------------');

    for (const item of lines) {
      const name = String(item?.name || '').trim();
      const qty = Number(item?.quantity) || 0;
      const price = Number(item?.price) || 0;
      const lineTotal = qty * price;
      linesOut.push(`${name} x${qty} = ج.م ${lineTotal.toFixed(2)}`);
    }

    linesOut.push('--------------------------');
    linesOut.push(`الإجمالي قبل الخصم: ج.م ${subtotal.toFixed(2)}`);
    if (discount > 0) linesOut.push(`خصم: ج.م ${discount.toFixed(2)}`);
    linesOut.push(`الصافي قبل الضريبة: ج.م ${netBeforeVat.toFixed(2)}`);
    if (showVat) linesOut.push(`ضريبة (${vatRatePct}%): ج.م ${vatAmount.toFixed(2)}`);
    linesOut.push(`الإجمالي: ج.م ${total.toFixed(2)}`);

    if (footerNote) {
      linesOut.push('--------------------------');
      linesOut.push(footerNote);
    }

    return linesOut.join('\n');
  };

  const handleExportPdf = () => {
    handlePrintInvoice();
  };

  const handlePrintInvoice = () => {
    if (!lines || lines.length === 0) return;

    const shopName = String(effectiveReceiptTheme?.shopName || '').trim();
    const phone = String(effectiveReceiptTheme?.phone || '').trim();
    const city = String((effectiveReceiptTheme as any)?.city || '').trim();
    const address = String(effectiveReceiptTheme?.address || '').trim();
    const footerNote = String(effectiveReceiptTheme?.footerNote || '').trim();
    const logoDataUrl = String(effectiveReceiptTheme?.logoDataUrl || '').trim();

    const itemsHtml = lines
      .map((item) => {
        const name = String(item?.name || '');
        const qty = Number(item?.quantity) || 0;
        const price = Number(item?.price) || 0;
        const lineTotal = price * qty;
        return `
          <tr>
            <td class="name">${name}</td>
            <td class="num">${qty}</td>
            <td class="num">${price.toFixed(2)}</td>
            <td class="num">${lineTotal.toFixed(2)}</td>
          </tr>
        `;
      })
      .join('');

    const html = `
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Invoice</title>
          <style>
            @page { size: A4; margin: 12mm; }
            html, body { margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; color: #111; direction: rtl; }
            .wrap { max-width: 900px; margin: 0 auto; }
            .top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
            .brand { text-align: right; }
            .title { font-size: 20px; font-weight: 900; margin: 0; }
            .meta { font-size: 12px; font-weight: 700; margin-top: 4px; color: #333; }
            .logo { width: 56px; height: 56px; border-radius: 16px; object-fit: cover; border: 1px solid #eee; }
            .divider { border-top: 1px dashed #000; margin: 12px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 10px 8px; font-size: 12px; }
            th { background: #f8fafc; font-weight: 900; }
            td.name { font-weight: 900; }
            td.num { text-align: left; font-weight: 800; }
            .totals { margin-top: 12px; }
            .row { display: flex; justify-content: space-between; margin-top: 6px; font-weight: 900; font-size: 13px; }
            .note { margin-top: 14px; font-size: 12px; font-weight: 800; color: #333; text-align: center; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="top">
              <div class="brand">
                <p class="title">فاتورة حسابات</p>
                ${selectedInvoiceId ? `<div class="meta">رقم: ${selectedInvoiceId}</div>` : ''}
                ${shopName ? `<div class="meta">${shopName}</div>` : ''}
                ${phone ? `<div class="meta">هاتف: ${phone}</div>` : ''}
                ${city ? `<div class="meta">المدينة: ${city}</div>` : ''}
                ${address ? `<div class="meta">العنوان: ${address}</div>` : ''}
                ${invoiceDate ? `<div class="meta">التاريخ: ${invoiceDate}</div>` : ''}
              </div>
              ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" alt="logo" />` : '<div style="width:56px;height:56px"></div>'}
            </div>

            <div class="divider"></div>

            <table>
              <thead>
                <tr>
                  <th style="text-align:right">الصنف</th>
                  <th style="text-align:left">الكمية</th>
                  <th style="text-align:left">السعر</th>
                  <th style="text-align:left">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="row"><span>الإجمالي قبل الخصم</span><span>ج.م ${subtotal.toFixed(2)}</span></div>
              ${discount > 0 ? `<div class="row"><span>خصم</span><span>ج.م ${discount.toFixed(2)}</span></div>` : ''}
              <div class="row"><span>الصافي قبل الضريبة</span><span>ج.م ${netBeforeVat.toFixed(2)}</span></div>
              ${showVat ? `<div class="row"><span>ضريبة ${vatRatePct}%</span><span>ج.م ${vatAmount.toFixed(2)}</span></div>` : ''}
              <div class="row"><span>الإجمالي</span><span>ج.م ${total.toFixed(2)}</span></div>
            </div>

            ${footerNote ? `<div class="note">${footerNote}</div>` : ''}
          </div>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.setAttribute('aria-hidden', 'true');

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      try {
        document.body.removeChild(iframe);
      } catch {
      }
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
      }
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {
        }
      }, 300);
    }, 300);
  };

  const saveInvoice = async () => {
    if (!shopId) return;
    if (!lines || lines.length === 0) {
      setSaveError('ضيف أصناف الأول');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveOk('');
    try {
      const itemsPayload = (lines || [])
        .map((l) => ({
          name: String(l?.name || '').trim(),
          quantity: Number(l?.quantity) || 1,
          unitPrice: Number(l?.price) || 0,
        }))
        .filter((it) => it.name);

      const vatRatePayload = Number(vatRatePct);
      const discountPayload = Number(discountValue);
      const d = invoiceDate ? new Date(`${invoiceDate}T00:00:00`) : new Date();

      const payload = {
        shopId,
        invoiceDate: Number.isNaN(d.getTime()) ? undefined : d.toISOString(),
        discount: Number.isFinite(discountPayload) ? discountPayload : 0,
        vatRate: Number.isFinite(vatRatePayload) ? vatRatePayload : 0,
        items: itemsPayload,
      };

      if (selectedInvoiceId) {
        await (ApiService as any).updateInvoice(selectedInvoiceId, payload);
        setSaveOk('تم حفظ التعديل');
      } else {
        const created = await (ApiService as any).createInvoice(payload);
        const newId = String(created?.id || '').trim();
        if (newId) setSelectedInvoiceId(newId);
        setSaveOk('تم حفظ الفاتورة');
      }

      await loadManage();
    } catch (e: any) {
      setSaveError(String(e?.message || 'تعذر حفظ الفاتورة'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-right">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">إدارة الفواتير</h2>
            <p className="mt-2 text-sm font-black text-slate-500">
              احفظ الفواتير، راجع سجل الفواتير، وعدّل/اطبع أي فاتورة في أي وقت.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {view === 'edit' ? (
              <button
                type="button"
                onClick={() => {
                  setView('manage');
                  setSaveError('');
                  setSaveOk('');
                }}
                className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm flex items-center justify-center gap-2"
              >
                <ArrowRight size={18} /> رجوع
              </button>
            ) : null}

            {view === 'manage' ? (
              <button
                type="button"
                onClick={openNewInvoice}
                className="px-4 py-3 rounded-2xl bg-[#00E5FF] text-black font-black text-sm flex items-center justify-center gap-2"
              >
                <Plus size={18} /> فاتورة جديدة
              </button>
            ) : null}
          </div>
        </div>

        {manageError ? (
          <div className="mt-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-4 py-3 font-black text-sm text-right">
            {manageError}
          </div>
        ) : null}

        {view === 'manage' ? (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="text-[11px] font-black text-slate-500 mb-2">عدد الفواتير</div>
                <div className="text-2xl font-black text-slate-900">{summary ? Number(summary?.count || 0) : (loadingManage ? '...' : '0')}</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="text-[11px] font-black text-slate-500 mb-2">إجمالي الفواتير</div>
                <div className="text-2xl font-black text-slate-900">ج.م {summary ? formatMoney(summary?.sumTotal) : (loadingManage ? '...' : '0.00')}</div>
                <div className="mt-1 text-[11px] font-black text-slate-500">خصم: {summary ? formatMoney(summary?.sumDiscount) : (loadingManage ? '...' : '0.00')}</div>
              </div>
              <div className="bg-slate-900 text-white rounded-2xl p-4">
                <div className="text-[11px] font-black text-slate-200 mb-2">ضريبة مجمعة</div>
                <div className="text-2xl font-black">ج.م {summary ? formatMoney(summary?.sumVat) : (loadingManage ? '...' : '0.00')}</div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden">
              <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="font-black text-slate-900">سجل الفواتير</div>
                <button
                  type="button"
                  onClick={loadManage}
                  disabled={loadingManage}
                  className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loadingManage ? <Loader2 size={18} className="animate-spin" /> : null}
                  تحديث
                </button>
              </div>

              <div className="p-4 md:p-6">
                {loadingManage ? (
                  <div className="text-sm font-black text-slate-500 text-right">جاري التحميل...</div>
                ) : invoiceList.length === 0 ? (
                  <div className="text-sm font-black text-slate-500 text-right">لا توجد فواتير محفوظة بعد.</div>
                ) : (
                  <div className="overflow-auto">
                    <table className="min-w-[720px] w-full">
                      <thead>
                        <tr className="text-right">
                          <th className="text-[12px] font-black text-slate-500 pb-3">رقم</th>
                          <th className="text-[12px] font-black text-slate-500 pb-3">التاريخ</th>
                          <th className="text-[12px] font-black text-slate-500 pb-3">الإجمالي</th>
                          <th className="text-[12px] font-black text-slate-500 pb-3">خصم</th>
                          <th className="text-[12px] font-black text-slate-500 pb-3">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceList.map((inv: any) => {
                          const id = String(inv?.id || '').trim();
                          const seq = inv?.sequence;
                          const dateRaw = inv?.invoiceDate || inv?.invoice_date || inv?.createdAt;
                          const d = dateRaw ? new Date(String(dateRaw)) : null;
                          const dateLabel = d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('ar-EG') : '-';
                          return (
                            <tr key={id} className="border-t border-slate-100">
                              <td className="py-3 text-right font-black text-slate-900">{typeof seq === 'number' ? seq : '-'}</td>
                              <td className="py-3 text-right font-black text-slate-700">{dateLabel}</td>
                              <td className="py-3 text-right font-black text-slate-900">ج.م {formatMoney(inv?.total)}</td>
                              <td className="py-3 text-right font-black text-slate-700">ج.م {formatMoney(inv?.discount)}</td>
                              <td className="py-3 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => openInvoiceForEdit(id)}
                                    className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm"
                                  >
                                    تعديل
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {view === 'edit' ? (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <button
                type="button"
                onClick={saveInvoice}
                disabled={saving}
                className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                حفظ
              </button>
              <button
                type="button"
                onClick={handlePrintInvoice}
                disabled={!lines || lines.length === 0}
                className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Printer size={18} /> طباعة
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={!lines || lines.length === 0}
                className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <FileDown size={18} /> PDF
              </button>
            </div>

            {saveError ? (
              <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl px-4 py-3 font-black text-sm text-right">
                {saveError}
              </div>
            ) : null}
            {saveOk ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl px-4 py-3 font-black text-sm text-right">
                {saveOk}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="text-[11px] font-black text-slate-500 mb-2">التاريخ</div>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-900"
                />
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="text-[11px] font-black text-slate-500 mb-2">خصم (جنيه)</div>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-900"
                />
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-4">
                <div className="text-[11px] font-black text-slate-200 mb-2">الإجمالي (=)</div>
                <div className="text-2xl font-black">ج.م {total.toFixed(2)}</div>
                <div className="mt-1 text-[11px] font-black text-slate-300">
                  قبل الخصم: {subtotal.toFixed(2)} {discount > 0 ? ` • خصم: ${discount.toFixed(2)}` : ''}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden">
              <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-100">
                <div className="font-black text-slate-900">إضافة صنف</div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="اسم الصنف"
                    className="md:col-span-6 bg-white border border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-900 text-right"
                  />
                  <input
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    type="number"
                    min={1}
                    step={1}
                    placeholder="الكمية"
                    className="md:col-span-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-900 text-right"
                  />
                  <input
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    type="number"
                    min={0}
                    step={0.25}
                    placeholder="السعر"
                    className="md:col-span-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-900 text-right"
                  />
                  <button
                    type="button"
                    onClick={addLine}
                    className="md:col-span-1 bg-[#00E5FF] text-black rounded-2xl font-black flex items-center justify-center gap-2 px-4 py-3"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6">
                {lines.length === 0 ? (
                  <div className="text-sm font-black text-slate-500 text-right">ضيف أصناف عشان تبدأ الفاتورة.</div>
                ) : (
                  <div className="space-y-3">
                    {lines.map((l) => {
                      const lineTotal = (Number(l.price) || 0) * (Number(l.quantity) || 0);
                      return (
                        <div
                          key={l.id}
                          className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row-reverse"
                        >
                          <div className="flex-1 text-right">
                            <div className="font-black text-slate-900">{l.name}</div>
                            <div className="mt-1 text-[12px] font-black text-slate-500">
                              {l.quantity} × {Number(l.price).toFixed(2)} = <span className="text-slate-900">{lineTotal.toFixed(2)}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(l.id)}
                            className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-red-300 text-slate-900"
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      );
                    })}

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between font-black text-slate-900">
                          <span>الإجمالي قبل الخصم</span>
                          <span>ج.م {subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 ? (
                          <div className="mt-2 flex items-center justify-between font-black text-slate-700">
                            <span>خصم</span>
                            <span>ج.م {discount.toFixed(2)}</span>
                          </div>
                        ) : null}
                        <div className="mt-2 flex items-center justify-between font-black text-slate-900">
                          <span>الصافي قبل الضريبة</span>
                          <span>ج.م {netBeforeVat.toFixed(2)}</span>
                        </div>
                        {showVat ? (
                          <div className="mt-2 flex items-center justify-between font-black text-slate-700">
                            <span>ضريبة {vatRatePct}%</span>
                            <span>ج.م {vatAmount.toFixed(2)}</span>
                          </div>
                        ) : null}
                        <div className="mt-3 flex items-center justify-between font-black text-slate-900 text-lg">
                          <span>الإجمالي (=)</span>
                          <span>ج.م {total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-2xl p-4">
                        <div className="font-black text-slate-900">ثيم الفاتورة</div>
                        <div className="mt-2 text-sm font-black text-slate-500 leading-relaxed">
                          البيانات دي بتتسحب من إعدادات <span className="text-slate-900">ثيم الفاتورة</span> (نفس الثيم المستخدم في الريسيت).
                        </div>
                        <div className="mt-3 text-[12px] font-black text-slate-700">
                          <div>{effectiveReceiptTheme?.shopName ? `المحل: ${effectiveReceiptTheme.shopName}` : ''}</div>
                          <div>{effectiveReceiptTheme?.phone ? `هاتف: ${effectiveReceiptTheme.phone}` : ''}</div>
                          <div>{(effectiveReceiptTheme as any)?.city ? `مدينة: ${String((effectiveReceiptTheme as any).city)}` : ''}</div>
                        </div>
                      </div>
                    </div>
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
