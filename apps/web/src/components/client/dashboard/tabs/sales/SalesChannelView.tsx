'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  MapPin,
  MoreVertical,
  Printer,
  XCircle,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { clientFetch } from '@/lib/api/client';
import SaleDetailsModal from './SaleDetailsModal';
import { cleanText, formatOrderItemsSummary, isDeliveryDisabledOrder, parseCodLocation } from './sales-formatters';

type Props = { sales: any[]; channel: 'shop' | 'pos' };

const ActionMenu = memo(({ id, openMenuId, setOpenMenuId, sale, busy, updateStatus, t }: any) => {
  const status = String(sale?.status || '').toUpperCase();
  const canAccept = status === 'PENDING';
  const canPreparing = status === 'CONFIRMED';
  const canReady = status === 'PREPARING';
  const canHandToCourier = status === 'READY' && !Boolean(sale?.handedToCourierAt || sale?.handed_to_courier_at);
  const canReject = status === 'PENDING' || status === 'CONFIRMED' || status === 'PREPARING';

  if (openMenuId !== id) return null;

  return (
    <div
      className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-50"
      data-sales-actions-menu="1"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId('');
          if (!canAccept || busy) return;
          updateStatus(id, 'CONFIRMED');
        }}
        className={`w-full text-right px-4 py-3 font-black text-xs ${!canAccept || busy ? 'text-slate-300' : 'text-emerald-700 hover:bg-emerald-50'}`}
      >
        {busy && canAccept ? '...' : t('business.sales.accept', 'قبول')}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId('');
          if (!canPreparing || busy) return;
          updateStatus(id, 'PREPARING');
        }}
        className={`w-full text-right px-4 py-3 font-black text-xs ${!canPreparing || busy ? 'text-slate-300' : 'text-amber-700 hover:bg-amber-50'}`}
      >
        {busy && canPreparing ? '...' : t('business.sales.statusPreparing', 'جاري التحضير')}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId('');
          if (!canReady || busy) return;
          updateStatus(id, 'READY');
        }}
        className={`w-full text-right px-4 py-3 font-black text-xs ${!canReady || busy ? 'text-slate-300' : 'text-blue-700 hover:bg-blue-50'}`}
      >
        {busy && canReady ? '...' : t('business.sales.statusReady', 'جاهز')}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId('');
          if (!canHandToCourier || busy) return;
          updateStatus(id, 'HANDED_TO_COURIER');
        }}
        className={`w-full text-right px-4 py-3 font-black text-xs ${!canHandToCourier || busy ? 'text-slate-300' : 'text-indigo-700 hover:bg-indigo-50'}`}
      >
        {busy && canHandToCourier ? '...' : t('business.sales.handedToCourier', 'تم التسليم للمندوب')}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId('');
          if (!canReject || busy) return;
          updateStatus(id, 'CANCELLED');
        }}
        className={`w-full text-right px-4 py-3 font-black text-xs ${!canReject || busy ? 'text-slate-300' : 'text-red-700 hover:bg-red-50'}`}
      >
        {busy && canReject ? '...' : t('business.sales.reject', 'رفض')}
      </button>
    </div>
  );
});

const OrderRow = memo(({
  sale,
  updatingId,
  openMenuId,
  setOpenMenuId,
  updateStatus,
  openDetails,
  actionsEnabled,
  statusMeta,
  renderDeliveryFee,
  t,
  locale,
  egpLabel,
}: any) => {
  const id = String(sale?.id || '').trim();
  const meta = statusMeta(sale?.status);
  const status = String(sale?.status || '').toUpperCase();
  const isRefunded = status === 'REFUNDED';
  const busy = updatingId === id;
  const deliveryManagedByShop = isDeliveryDisabledOrder(sale);
  const itemsSummary = formatOrderItemsSummary(sale, egpLabel);

  return (
    <div className="border border-slate-100 rounded-[1.75rem] p-4 sm:p-5 bg-white shadow-[0_16px_30px_-24px_rgba(15,23,42,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-black text-slate-900 whitespace-normal break-words">{itemsSummary || '-'}</div>
          <div className="text-slate-500 font-bold text-xs mt-1">
            {new Date(sale.created_at || sale.createdAt).toLocaleString(locale)}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {isRefunded ? (
            <span className="px-3 py-2 rounded-full text-[10px] font-black bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200">
              {t('business.sales.statusRefunded', 'مسترد')}
            </span>
          ) : null}
          <span className={`px-4 py-2 rounded-full text-[10px] font-black ${meta.cls}`}>{meta.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-4">
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {t('business.sales.colCount', 'العدد')}
          </div>
          <div className="mt-2 font-black text-slate-900 text-sm">
            {sale.items?.length || 0} {t('business.sales.item', 'عنصر')}
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {t('business.sales.colTotal', 'الإجمالي')}
          </div>
          <div className="mt-2 font-black text-slate-900 text-sm">{egpLabel} {Number(sale.total || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
        <div className="text-slate-500 font-bold text-[11px] leading-5">
          {deliveryManagedByShop
            ? t('business.sales.selfDeliveryLocation', 'استلام ذاتي')
            : `${t('business.sales.deliveryFee', 'توصيل')}: ${renderDeliveryFee(sale)}`}
        </div>
        <div className="flex items-center gap-2" data-sales-actions-menu="1">
          {deliveryManagedByShop && (parseCodLocation(sale?.notes) || hasAnyLocation(sale)) ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openMapForSale(sale);
              }}
              className="p-3 bg-white border border-slate-200 rounded-xl transition-all text-slate-400 hover:text-emerald-600"
              title={t('business.sales.showOnMap', 'خريطة')}
            >
              <MapPin size={18} />
            </button>
          ) : null}

          <button
            onClick={(e) => {
              e.stopPropagation();
              openDetails(sale);
            }}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
          >
            <Eye size={18} />
          </button>

          {actionsEnabled ? (
            <div className="relative" data-sales-actions-menu="1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId((prev: string) => (prev === id ? '' : id));
                }}
                className={`p-3 bg-white border border-slate-200 rounded-xl transition-all ${busy ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900'}`}
                disabled={busy}
              >
                <MoreVertical size={18} />
              </button>
              <ActionMenu
                id={id}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                sale={sale}
                busy={busy}
                updateStatus={updateStatus}
                t={t}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});

const OrderTableRow = memo(({
  sale,
  updatingId,
  updateStatus,
  openDetails,
  openMenuId,
  setOpenMenuId,
  actionsEnabled,
  statusMeta,
  renderDeliveryFee,
  onPrintInvoice,
  t,
  locale,
  egpLabel,
}: any) => {
  const id = String(sale?.id || '').trim();
  const meta = statusMeta(sale?.status);
  const status = String(sale?.status || '').toUpperCase();
  const isRefunded = status === 'REFUNDED';
  const busy = updatingId === id;
  const deliveryManagedByShop = isDeliveryDisabledOrder(sale);
  const itemsSummary = formatOrderItemsSummary(sale, egpLabel);
  const customerNote = cleanText(sale?.customerNote ?? sale?.customer_note);

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
      <td className="p-6 font-black text-slate-900 max-w-[360px]">
        <div className="whitespace-normal break-words" title={itemsSummary || ''}>{itemsSummary || '-'}</div>
        {customerNote ? (
          <div className="mt-2 text-[10px] font-black text-slate-500 whitespace-normal break-words">
            {t('business.sales.customerNote', 'ملاحظة')}: {customerNote}
          </div>
        ) : null}
      </td>
      <td className="p-6 text-slate-500 font-bold text-sm">{new Date(sale.created_at || sale.createdAt).toLocaleString(locale)}</td>
      <td className="p-6 text-slate-500 font-black text-sm">{sale.items?.length || 0} {t('business.sales.item', 'عنصر')}</td>
      <td className="p-6">
        <div className="flex items-center justify-end gap-2">
          {isRefunded ? (
            <span className="px-3 py-2 rounded-full text-[10px] font-black bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200">
              {t('business.sales.statusRefunded', 'مسترد')}
            </span>
          ) : null}
          <span className={`px-4 py-2 rounded-full text-[10px] font-black ${meta.cls}`}>{meta.label}</span>
        </div>
      </td>
      <td className="p-6 text-slate-500 font-black text-sm">{renderDeliveryFee(sale)}</td>
      <td className="p-6"><span className="text-xl font-black text-[#00E5FF]">{egpLabel} {Number(sale.total || 0).toLocaleString()}</span></td>
      <td className="p-6">
        <div className="flex flex-wrap gap-2 justify-end" data-sales-actions-menu="1">
          {deliveryManagedByShop && (parseCodLocation(sale?.notes) || hasAnyLocation(sale)) ? (
            <button
              onClick={(e) => { e.stopPropagation(); openMapForSale(sale); }}
              className="p-3 bg-white border border-slate-200 rounded-xl transition-all text-slate-400 hover:text-emerald-600"
              title={t('business.sales.showOnMap', 'خريطة')}
            >
              <MapPin size={18} />
            </button>
          ) : null}

          {typeof onPrintInvoice === 'function' ? (
            <button
              onClick={(e) => { e.stopPropagation(); if (busy) return; onPrintInvoice(sale); }}
              className={`p-3 bg-white border border-slate-200 rounded-xl transition-all ${busy ? 'text-slate-300' : 'text-slate-400 hover:text-slate-900'}`}
              title={t('business.sales.printInvoice', 'طباعة')}
              disabled={busy}
            >
              <Printer size={18} />
            </button>
          ) : null}

          {actionsEnabled ? (
            <div className="relative" data-sales-actions-menu="1">
              <button
                onClick={(e) => { e.stopPropagation(); setOpenMenuId((prev: string) => (prev === id ? '' : id)); }}
                className={`p-3 bg-white border border-slate-200 rounded-xl transition-all ${busy ? 'text-slate-300' : 'text-slate-400 hover:text-slate-900'}`}
                disabled={busy}
              >
                <MoreVertical size={18} />
              </button>
              <ActionMenu
                id={id}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                sale={sale}
                busy={busy}
                updateStatus={updateStatus}
                t={t}
              />
            </div>
          ) : <span className="text-slate-300 font-black text-[10px]">—</span>}
        </div>
      </td>
      <td className="p-6 text-left">
        <button
          onClick={(e) => { e.stopPropagation(); openDetails(sale); }}
          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
});

function hasAnyLocation(sale: any) {
  return Boolean(
    sale?.deliveryAddressManual ??
      sale?.delivery_address_manual ??
      sale?.deliveryAddress ??
      sale?.delivery_address ??
      sale?.address ??
      sale?.user?.address,
  );
}

function openMapForSale(sale: any) {
  const loc = parseCodLocation(sale?.notes);
  const address = String(
    sale?.deliveryAddressManual ??
      sale?.delivery_address_manual ??
      sale?.deliveryAddress ??
      sale?.delivery_address ??
      sale?.address ??
      sale?.user?.address ??
      '',
  ).trim();
  if (loc?.lat && loc?.lng) window.open(`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`, '_blank');
  else if (address) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
}

const SalesChannelView: React.FC<Props> = ({ sales, channel }) => {
  const t = useT();
  const { locale } = useLocale();
  const isArabic = String(locale || '').toLowerCase().startsWith('ar');
  const loc = isArabic ? 'ar-EG' : 'en-US';
  const egpLabel = t('business.pos.egp', 'ج.م');

  const [filter, setFilter] = useState<'all' | 'pending' | 'successful' | 'rejected'>('all');
  const [localSales, setLocalSales] = useState<any[]>(Array.isArray(sales) ? sales : []);
  const [updatingId, setUpdatingId] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState('');

  useEffect(() => {
    const list = Array.isArray(sales) ? sales : [];
    const filtered = list.filter((order: any) => {
      const orderSource = String(order?.source || '').toLowerCase();
      const status = String(order?.status || '').toUpperCase();
      if (status === 'CANCELLED') return false;
      if (channel === 'pos') return orderSource === 'pos';
      return orderSource !== 'pos';
    });
    setLocalSales(filtered);
  }, [sales, channel]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-sales-actions-menu="1"]')) return;
      setOpenMenuId('');
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const statusMeta = (status: any) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DELIVERED') return { label: t('business.sales.statusDelivered', 'تم التوصيل'), cls: 'bg-green-50 text-green-600' };
    if (s === 'READY') return { label: t('business.sales.statusReady', 'جاهز'), cls: 'bg-blue-50 text-blue-600' };
    if (s === 'PREPARING') return { label: t('business.sales.statusPreparing', 'جاري التحضير'), cls: 'bg-amber-50 text-amber-600' };
    if (s === 'CONFIRMED') return { label: t('business.sales.statusConfirmed', 'مؤكد'), cls: 'bg-emerald-50 text-emerald-600' };
    if (s === 'CANCELLED') return { label: t('business.sales.statusCancelled', 'ملغي'), cls: 'bg-red-50 text-red-600' };
    if (s === 'REFUNDED') return { label: t('business.sales.statusRefunded', 'مسترد'), cls: 'bg-red-50 text-red-600' };
    return { label: t('business.sales.statusPending', 'معلق'), cls: 'bg-slate-50 text-slate-600' };
  };

  const isSuccessful = (o: any) => {
    const s = String(o?.status || '').toUpperCase();
    return s === 'CONFIRMED' || s === 'PREPARING' || s === 'READY' || s === 'DELIVERED';
  };
  const isRejected = (o: any) => String(o?.status || '').toUpperCase() === 'CANCELLED';
  const isPending = (o: any) => String(o?.status || '').toUpperCase() === 'PENDING';

  const counts = useMemo(() => {
    const total = localSales.length;
    const successful = localSales.filter(isSuccessful).length;
    const rejected = localSales.filter(isRejected).length;
    const pending = localSales.filter(isPending).length;
    return { total, successful, rejected, pending };
  }, [localSales]);

  const filteredSales = useMemo(() => {
    if (filter === 'successful') return localSales.filter(isSuccessful);
    if (filter === 'rejected') return localSales.filter(isRejected);
    if (filter === 'pending') return localSales.filter(isPending);
    return localSales;
  }, [filter, localSales]);

  const updateStatus = async (id: string, status: string) => {
    const orderId = String(id || '').trim();
    if (!orderId) return;
    setUpdatingId(orderId);
    try {
      const upper = String(status || '').toUpperCase();
      const payload = upper === 'HANDED_TO_COURIER' ? ({ handedToCourier: true } as any) : ({ status } as any);
      const updated = await clientFetch<any>(`/v1/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      const nextStatus = String(updated?.status || status || '').toUpperCase();
      if (nextStatus === 'CANCELLED') setLocalSales((prev) => prev.filter((o) => String(o?.id) !== String(updated?.id)));
      else setLocalSales((prev) => prev.map((o) => (String(o?.id) === String(updated?.id) ? { ...o, ...updated } : o)));
      try { window.dispatchEvent(new Event('orders-updated')); } catch {}
    } finally {
      setUpdatingId('');
    }
  };

  const openDetails = (sale: any) => {
    setSelectedSale(sale);
    setDetailsOpen(true);
  };
  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedSale(null);
  };

  const renderDeliveryFee = (sale: any) => {
    if (isDeliveryDisabledOrder(sale)) return t('business.sales.deliveryDisabled', 'بدون توصيل');

    const raw = typeof sale?.notes === 'string' ? sale.notes : '';
    const lines = raw
      .split(/\r?\n/)
      .map((l: any) => String(l).trim())
      .filter(Boolean);

    const feeLine = lines.find((l: any) => String(l).toUpperCase().startsWith('DELIVERY_FEE:'));
    if (!feeLine) return '-';
    const value = String(feeLine).split(':').slice(1).join(':').trim();
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return '-';
    return `${egpLabel} ${n}`;
  };

  const printSaleInvoice = (sale: any) => {
    const orderId = String(sale?.id || '').trim();
    if (!orderId) return;

    const escapeHtml = (value: any) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const shopName = escapeHtml(sale?.shopName || sale?.shop_name || '');
    const createdAt = sale?.created_at || sale?.createdAt;
    const createdAtLabel = createdAt ? new Date(createdAt).toLocaleString(loc) : '';

    const items = Array.isArray(sale?.items) ? sale.items : [];
    const normalizeNumber = (v: any) => {
      const n = typeof v === 'number' ? v : Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const money = (v: any) => (Math.round(normalizeNumber(v) * 100) / 100).toFixed(2);

    const computedSubtotal = items.reduce((sum: number, it: any) => {
      const qty = normalizeNumber(it?.quantity ?? it?.qty ?? 0);
      const unit = normalizeNumber(it?.unitPrice ?? it?.unit_price ?? it?.price ?? 0);
      return sum + qty * unit;
    }, 0);

    const deliveryFee = normalizeNumber(sale?.deliveryFee ?? sale?.delivery_fee ?? 0);
    const discount = normalizeNumber(sale?.discount ?? 0);
    const total = normalizeNumber(sale?.total ?? computedSubtotal + deliveryFee - discount);

    const html = `<!doctype html><html lang="${isArabic ? 'ar' : 'en'}" dir="${isArabic ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"/><title>Receipt</title><style>@page{margin:8mm}body{font-family:Arial,sans-serif;direction:${isArabic ? 'rtl' : 'ltr'}}.wrap{max-width:80mm;margin:0 auto}h1{font-size:16px;margin:0 0 6px;text-align:center}.meta{font-size:11px;color:#111;text-align:center;margin-bottom:10px}.sep{border-top:1px dashed #999;margin:10px 0}table{width:100%;border-collapse:collapse;font-size:12px}.row{display:flex;justify-content:space-between;gap:10px;padding:4px 0}.foot{font-size:11px;text-align:center;margin-top:10px}</style></head><body><div class="wrap"><h1>${shopName || t('business.sales.invoice','فاتورة')}</h1><div class="meta">${orderId ? `<div><strong>${t('business.sales.order','طلب')}:</strong> ${escapeHtml(orderId)}</div>` : ''}${createdAtLabel ? `<div style="margin-top:6px">${escapeHtml(createdAtLabel)}</div>` : ''}</div><div class="sep"></div><table><tbody>${items.map((it:any)=>{ const name = escapeHtml(it?.product?.name||it?.name||it?.title||'-'); const qty = normalizeNumber(it?.quantity??it?.qty??0); const unit = normalizeNumber(it?.unitPrice??it?.unit_price??it?.price??0); const lineTotal = qty*unit; return `<tr><td style="padding:6px 0">${name}</td><td style="padding:6px 0;text-align:left">${qty||0}x</td><td style="padding:6px 0;text-align:left">${money(lineTotal)}</td></tr>`; }).join('')}</tbody></table><div class="sep"></div><div class="totals"><div class="row"><span>${t('business.sales.subtotal','المجموع الفرعي')}</span><span>${egpLabel} ${money(computedSubtotal)}</span></div>${deliveryFee>0?`<div class="row"><span>${t('business.sales.shipping','شحن')}</span><span>${egpLabel} ${money(deliveryFee)}</span></div>`:''}${discount>0?`<div class="row"><span>${t('business.sales.discount','خصم')}</span><span>${egpLabel} ${money(discount)}</span></div>`:''}<div class="row" style="font-weight:700"><span>${t('business.sales.total','الإجمالي')}</span><span>${egpLabel} ${money(total)}</span></div></div></div></body></html>`;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      try { document.body.removeChild(iframe); } catch {}
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {}
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch {}
      }, 300);
    }, 300);
  };

  const actionsEnabled = channel === 'shop' || channel === 'pos';

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible no-scrollbar snap-x snap-mandatory">
        <button onClick={() => setFilter('successful')} className={`snap-start flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-black text-xs ${filter === 'successful' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'}`}>
          <CheckCircle2 size={16} /> {t('business.sales.successfulCount', 'ناجح')} ({counts.successful})
        </button>
        <button onClick={() => setFilter('rejected')} className={`snap-start flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-black text-xs ${filter === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
          <XCircle size={16} /> {t('business.sales.rejectedCount', 'مرفوض')} ({counts.rejected})
        </button>
        <button onClick={() => setFilter('pending')} className={`snap-start flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-black text-xs ${filter === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
          <Clock size={16} /> {t('business.sales.pendingCount', 'معلق')} ({counts.pending})
        </button>
        <button onClick={() => setFilter('all')} className={`snap-start px-4 md:px-6 py-2 rounded-full font-black text-xs ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>
          {t('business.sales.all', 'الكل')} ({counts.total})
        </button>
      </div>

      <div className="mt-5 space-y-3 md:hidden">
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <OrderRow
              key={sale.id}
              sale={sale}
              updatingId={updatingId}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              updateStatus={updateStatus}
              openDetails={openDetails}
              actionsEnabled={actionsEnabled}
              statusMeta={statusMeta}
              renderDeliveryFee={renderDeliveryFee}
              t={t}
              locale={loc}
              egpLabel={egpLabel}
              isArabic={isArabic}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm font-black text-slate-400">
            {t('business.sales.noMatchingOrders', 'لا توجد طلبات')}
          </div>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto touch-auto no-scrollbar mt-10" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
        <table className="w-full text-right border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colProducts', 'المنتجات')}</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colDateTime', 'التاريخ')}</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colCount', 'العدد')}</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colStatus', 'الحالة')}</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colDelivery', 'التوصيل')}</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colTotal', 'الإجمالي')}</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('business.sales.colActions', 'إجراءات')}</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{t('business.sales.colDetails', 'تفاصيل')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <OrderTableRow
                key={sale.id}
                sale={sale}
                updatingId={updatingId}
                updateStatus={updateStatus}
                openDetails={openDetails}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                actionsEnabled={actionsEnabled}
                statusMeta={statusMeta}
                renderDeliveryFee={renderDeliveryFee}
                onPrintInvoice={actionsEnabled ? printSaleInvoice : undefined}
                t={t}
                locale={loc}
                egpLabel={egpLabel}
                isArabic={isArabic}
              />
            ))}
          </tbody>
        </table>
      </div>

      <SaleDetailsModal
        open={detailsOpen}
        onClose={closeDetails}
        sale={selectedSale}
        t={t}
        locale={loc}
        isArabic={isArabic}
        statusLabel={statusMeta(selectedSale?.status).label}
        egpLabel={egpLabel}
      />
    </>
  );
};

export default SalesChannelView;
