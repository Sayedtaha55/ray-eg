import React, { useEffect, useMemo, useState, memo } from 'react';
import { CheckCircle2, Eye, XCircle, Clock, Loader2, MoreVertical } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import Modal from '@/components/common/ui/Modal';
import OrderReturnsPanel from './OrderReturnsPanel';

type Props = {
  sales: any[];
  channel: 'shop' | 'pos';
};

const asCleanText = (v: any) => {
  const s = typeof v === 'string' ? v : (v == null ? '' : String(v));
  const t = s.trim();
  return t ? t : '';
};

const formatVariantSelection = (raw: any) => {
  if (!raw || typeof raw !== 'object') return '';
  const kind = asCleanText((raw as any)?.kind).toLowerCase();

  if (kind === 'pack') {
    const label = asCleanText((raw as any)?.label || (raw as any)?.name);
    const qty = (raw as any)?.qty;
    const unit = asCleanText((raw as any)?.unit);
    const qtyText = typeof qty === 'number' || typeof qty === 'string' ? asCleanText(qty) : '';
    const fallback = [qtyText, unit].filter(Boolean).join(' ');
    return label || fallback ? `باقة: ${label || fallback}` : '';
  }

  if (kind === 'fashion') {
    const color = asCleanText((raw as any)?.colorName || (raw as any)?.color || (raw as any)?.colorValue);
    const size = asCleanText((raw as any)?.size);
    const parts = [color ? `لون: ${color}` : '', size ? `مقاس: ${size}` : ''].filter(Boolean);
    return parts.join(' - ');
  }

  const size = asCleanText((raw as any)?.sizeLabel || (raw as any)?.sizeName || (raw as any)?.size);
  const type = asCleanText((raw as any)?.typeLabel || (raw as any)?.typeName || (raw as any)?.type);
  const parts = [type, size].filter(Boolean);
  if (parts.length) return `اختيار: ${parts.join(' - ')}`;

  const label = asCleanText((raw as any)?.label || (raw as any)?.name);
  return label ? `اختيار: ${label}` : '';
};

const formatAddons = (raw: any) => {
  if (!raw) return '';

  const list = Array.isArray(raw) ? raw : (Array.isArray((raw as any)?.items) ? (raw as any).items : null);
  if (Array.isArray(list)) {
    const out = list
      .map((a: any) => {
        if (typeof a === 'string') return asCleanText(a);
        if (a && typeof a === 'object') {
          const name = asCleanText(a?.name || a?.title || a?.label);
          const qty = a?.qty ?? a?.quantity;
          const qtyText = typeof qty === 'number' || typeof qty === 'string' ? asCleanText(qty) : '';
          return qtyText && name ? `${name} × ${qtyText}` : name;
        }
        return '';
      })
      .filter(Boolean);
    return out.length ? `إضافات: ${out.join('، ')}` : '';
  }

  if (raw && typeof raw === 'object') {
    const labels = Object.entries(raw)
      .map(([k, v]) => {
        const key = asCleanText(k);
        if (!key) return '';
        if (v === true) return key;
        if (typeof v === 'number' && Number.isFinite(v) && v > 0) return `${key} × ${v}`;
        const val = asCleanText(v);
        return val ? `${key}: ${val}` : '';
      })
      .filter(Boolean);
    return labels.length ? `إضافات: ${labels.join('، ')}` : '';
  }

  const s = asCleanText(raw);
  return s ? `إضافات: ${s}` : '';
};

const formatAddonsCompactParts = (raw: any): string[] => {
  if (!raw) return [];

  const list = Array.isArray(raw) ? raw : (Array.isArray((raw as any)?.items) ? (raw as any).items : null);
  if (Array.isArray(list)) {
    const out = list
      .map((a: any) => {
        if (typeof a === 'string') return asCleanText(a);
        if (!a || typeof a !== 'object') return '';

        const name = asCleanText(a?.optionName || a?.name || a?.title || a?.label);
        const size = asCleanText(a?.variantLabel || a?.variant || a?.size || a?.sizeLabel || a?.sizeName);
        const priceRaw = typeof a?.price === 'number' ? a.price : Number(a?.price ?? NaN);
        const priceText = Number.isFinite(priceRaw) && priceRaw >= 0 ? ` ج.م ${Math.round(priceRaw * 100) / 100}` : '';
        const core = [name, size].filter(Boolean).join(' ');
        if (!core) return '';
        return `${core}${priceText}`.trim();
      })
      .filter(Boolean);
    return out;
  }

  const s = asCleanText(raw);
  return s ? [s] : [];
};

const formatVariantSelectionCompact = (raw: any) => {
  if (!raw || typeof raw !== 'object') return '';
  const kind = asCleanText((raw as any)?.kind).toLowerCase();

  if (kind === 'pack') {
    const label = asCleanText((raw as any)?.label || (raw as any)?.name);
    return label || '';
  }

  if (kind === 'fashion') {
    const color = asCleanText((raw as any)?.colorName || (raw as any)?.color || (raw as any)?.colorValue);
    const size = asCleanText((raw as any)?.size);
    return [color, size].filter(Boolean).join(' ');
  }

  const size = asCleanText((raw as any)?.sizeLabel || (raw as any)?.sizeName || (raw as any)?.size);
  const type = asCleanText((raw as any)?.typeLabel || (raw as any)?.typeName || (raw as any)?.type);
  return [type, size].filter(Boolean).join(' ');
};

const formatOrderItemsSummary = (sale: any) => {
  const items = Array.isArray(sale?.items) ? sale.items : [];
  if (items.length === 0) return '';

  const parts = items.slice(0, 3).map((it: any) => {
    const name = asCleanText(it?.product?.name || it?.name || it?.title);
    const qty = Number(it?.quantity || it?.qty || 1);
    const qtyText = Number.isFinite(qty) && qty > 1 ? ` × ${qty}` : '';
    const unitPrice = Number(it?.price ?? it?.unitPrice ?? it?.unit_price ?? 0);
    const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
    const lineTotal = Number.isFinite(unitPrice) ? unitPrice * safeQty : NaN;
    const priceText = (() => {
      if (!Number.isFinite(unitPrice) || unitPrice < 0) return '';
      const useTotal = Number.isFinite(lineTotal) && safeQty > 1;
      const n = useTotal ? lineTotal : unitPrice;
      return ` ج.م ${Math.round(n * 100) / 100}`;
    })();
    const variantText = formatVariantSelectionCompact(it?.variantSelection ?? it?.variant_selection);
    const addonsParts = formatAddonsCompactParts(it?.addons ?? it?.extras ?? it?.addOns);
    const core = [name, variantText].filter(Boolean).join(' ');
    const base = [core ? `${core}${qtyText}` : '', priceText].filter(Boolean).join('');
    const addons = addonsParts.length ? ` + ${addonsParts.join(' + ')}` : '';
    return `${base}${addons}`.trim();
  }).filter(Boolean);

  const more = items.length > 3 ? ` +${items.length - 3}` : '';
  return `${parts.join(' + ')}${more}`;
};

const OrderRow = memo(({ 
  sale, 
  updatingId, 
  openMenuId, 
  setOpenMenuId, 
  updateStatus, 
  openDetails, 
  actionsEnabled,
  statusMeta, 
  renderDeliveryFee 
}: any) => {
  const id = String(sale?.id || '').trim();
  const meta = statusMeta(sale?.status);
  const status = String(sale?.status || '').toUpperCase();
  const isRefunded = status === 'REFUNDED';
  const busy = updatingId === id;
  const isFinal = status === 'DELIVERED' || status === 'CANCELLED';
  const canAccept = status === 'PENDING';
  const canInProgress = status === 'CONFIRMED';
  const canReady = status === 'PREPARING';
  const canHandToCourier = status === 'READY' && !Boolean((sale as any)?.handedToCourierAt || (sale as any)?.handed_to_courier_at);
  const canReject = status === 'PENDING' || status === 'CONFIRMED' || status === 'PREPARING';
  const itemsSummary = formatOrderItemsSummary(sale);

  return (
    <div className="border border-slate-100 rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-black text-slate-900 whitespace-normal break-words">{itemsSummary || '-'}</div>
          <div className="text-slate-500 font-bold text-xs mt-1">
            {new Date(sale.created_at || sale.createdAt).toLocaleString('ar-EG')}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {isRefunded ? (
            <span className="px-3 py-2 rounded-full text-[10px] font-black bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200">
              مرتجع
            </span>
          ) : null}
          <span className={`px-4 py-2 rounded-full text-[10px] font-black ${meta.cls}`}>{meta.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التعداد</div>
          <div className="mt-2 font-black text-slate-900 text-sm">{sale.items?.length || 0} صنف</div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجمالي</div>
          <div className="mt-2 font-black text-slate-900 text-sm">ج.م {Number(sale.total || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-slate-500 font-bold text-xs">رسوم التوصيل: {renderDeliveryFee(sale)}</div>

        <div className="flex items-center gap-2" data-sales-actions-menu="1">
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
                  setOpenMenuId(openMenuId === id ? '' : id);
                }}
                className={`p-3 bg-white border border-slate-200 rounded-xl transition-all ${busy ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900'}`}
                data-sales-actions-menu="1"
                disabled={busy}
              >
                <MoreVertical size={18} />
              </button>

              {openMenuId === id && (
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
                    className={`w-full text-right px-4 py-3 font-black text-xs ${!canAccept || busy ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-700 hover:bg-emerald-50'}`}
                    data-sales-actions-menu="1"
                  >
                    {busy && canAccept ? '...' : 'قبول'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId('');
                      if (!canInProgress || busy) return;
                      updateStatus(id, 'PREPARING');
                    }}
                    className={`w-full text-right px-4 py-3 font-black text-xs ${!canInProgress || busy ? 'text-slate-300 cursor-not-allowed' : 'text-amber-700 hover:bg-amber-50'}`}
                    data-sales-actions-menu="1"
                  >
                    {busy && canInProgress ? '...' : 'قيد التنفيذ'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId('');
                      if (!canReady || busy) return;
                      updateStatus(id, 'READY');
                    }}
                    className={`w-full text-right px-4 py-3 font-black text-xs ${!canReady || busy ? 'text-slate-300 cursor-not-allowed' : 'text-blue-700 hover:bg-blue-50'}`}
                    data-sales-actions-menu="1"
                  >
                    {busy && canReady ? '...' : 'جاهز'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId('');
                      if (!canHandToCourier || busy) return;
                      updateStatus(id, 'HANDED_TO_COURIER');
                    }}
                    className={`w-full text-right px-4 py-3 font-black text-xs ${!canHandToCourier || busy ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-700 hover:bg-indigo-50'}`}
                    data-sales-actions-menu="1"
                  >
                    {busy && canHandToCourier ? '...' : 'تم تسليمه للتوصيل'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId('');
                      if (!canReject || busy) return;
                      updateStatus(id, 'CANCELLED');
                    }}
                    className={`w-full text-right px-4 py-3 font-black text-xs ${!canReject || busy ? 'text-slate-300 cursor-not-allowed' : 'text-red-700 hover:bg-red-50'}`}
                    data-sales-actions-menu="1"
                  >
                    {busy && canReject ? '...' : 'رفض'}
                  </button>
                </div>
              )}
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
  renderDeliveryFee 
}: any) => {
  const id = String(sale?.id || '').trim();
  const meta = statusMeta(sale?.status);
  const status = String(sale?.status || '').toUpperCase();
  const isRefunded = status === 'REFUNDED';
  const busy = updatingId === id;
  const isFinal = status === 'DELIVERED' || status === 'CANCELLED';
  const canAccept = status === 'PENDING';
  const canInProgress = status === 'CONFIRMED';
  const canReady = status === 'PREPARING';
  const canHandToCourier = status === 'READY' && !Boolean((sale as any)?.handedToCourierAt || (sale as any)?.handed_to_courier_at);
  const canReject = status === 'PENDING' || status === 'CONFIRMED' || status === 'PREPARING';
  const itemsSummary = formatOrderItemsSummary(sale);

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
      <td className="p-6 font-black text-slate-900 max-w-[360px]">
        <div className="whitespace-normal break-words" title={itemsSummary || ''}>{itemsSummary || '-'}</div>
      </td>
      <td className="p-6 text-slate-500 font-bold text-sm">{new Date(sale.created_at || sale.createdAt).toLocaleString('ar-EG')}</td>
      <td className="p-6 text-slate-500 font-black text-sm">{sale.items?.length || 0} صنف</td>
      <td className="p-6">
        <div className="flex items-center justify-end gap-2">
          {isRefunded ? (
            <span className="px-3 py-2 rounded-full text-[10px] font-black bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200">
              مرتجع
            </span>
          ) : null}
          <span className={`px-4 py-2 rounded-full text-[10px] font-black ${meta.cls}`}>{meta.label}</span>
        </div>
      </td>
      <td className="p-6 text-slate-500 font-black text-sm">
        {renderDeliveryFee(sale)}
      </td>
      <td className="p-6">
        <span className="text-xl font-black text-[#00E5FF]">ج.م {Number(sale.total || 0).toLocaleString()}</span>
      </td>
      <td className="p-6">
        <div className="flex flex-wrap gap-2 justify-end" data-sales-actions-menu="1">
          {actionsEnabled ? (
            <div className="relative" data-sales-actions-menu="1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === id ? '' : id);
                }}
                className={`p-3 bg-white border border-slate-200 rounded-xl transition-all ${busy ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900'}`}
                data-sales-actions-menu="1"
                disabled={busy}
              >
                <MoreVertical size={18} />
              </button>

              {openMenuId === id && (
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
                    className={`w-full text-right px-4 py-3 font-black text-xs ${!canAccept || busy ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-700 hover:bg-emerald-50'}`}
                    data-sales-actions-menu="1"
                  >
                    {busy && canAccept ? '...' : 'قبول'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId('');
                      if (!canInProgress || busy) return;
                      updateStatus(id, 'PREPARING');
                    }}
                    className={`w-full text-right px-4 py-3 font-black text-xs ${!canInProgress || busy ? 'text-slate-300 cursor-not-allowed' : 'text-amber-700 hover:bg-amber-50'}`}
                    data-sales-actions-menu="1"
                  >
                    {busy && canInProgress ? '...' : 'قيد التنفيذ'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId('');
                      if (!canReady || busy) return;
                      updateStatus(id, 'READY');
                    }}
                    className={`w-full text-right px-4 py-3 font-black text-xs ${!canReady || busy ? 'text-slate-300 cursor-not-allowed' : 'text-blue-700 hover:bg-blue-50'}`}
                    data-sales-actions-menu="1"
                  >
                    {busy && canReady ? '...' : 'جاهز'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId('');
                      if (!canHandToCourier || busy) return;
                      updateStatus(id, 'HANDED_TO_COURIER');
                    }}
                    className={`w-full text-right px-4 py-3 font-black text-xs ${!canHandToCourier || busy ? 'text-slate-300 cursor-not-allowed' : 'text-indigo-700 hover:bg-indigo-50'}`}
                    data-sales-actions-menu="1"
                  >
                    {busy && canHandToCourier ? '...' : 'تم تسليمه للتوصيل'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId('');
                      if (!canReject || busy) return;
                      updateStatus(id, 'CANCELLED');
                    }}
                    className={`w-full text-right px-4 py-3 font-black text-xs ${!canReject || busy ? 'text-slate-300 cursor-not-allowed' : 'text-red-700 hover:bg-red-50'}`}
                    data-sales-actions-menu="1"
                  >
                    {busy && canReject ? '...' : 'رفض'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <span className="text-slate-300 font-black text-[10px]">—</span>
          )}
        </div>
      </td>
      <td className="p-6 text-left">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openDetails(sale);
          }}
          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
});

const SalesChannelView: React.FC<Props> = ({ sales, channel }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'successful' | 'rejected'>('all');
  const [localSales, setLocalSales] = useState<any[]>(Array.isArray(sales) ? sales : []);
  const [updatingId, setUpdatingId] = useState<string>('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<string>('');

  useEffect(() => {
    const list = Array.isArray(sales) ? sales : [];

    const filtered = list.filter((order: any) => {
      const orderSource = String(order?.source || '').toLowerCase();
      const status = String(order?.status || '').toUpperCase();

      // If an order is rejected, do not show it in any list on the sales screen.
      if (status === 'CANCELLED') return false;

      if (channel === 'pos') {
        return orderSource === 'pos';
      }

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
    if (s === 'DELIVERED') return { label: 'تم التوصيل', cls: 'bg-green-50 text-green-600' };
    if (s === 'READY') return { label: 'جاهز', cls: 'bg-blue-50 text-blue-600' };
    if (s === 'PREPARING') return { label: 'قيد التنفيذ', cls: 'bg-amber-50 text-amber-600' };
    if (s === 'CONFIRMED') return { label: 'تم القبول', cls: 'bg-emerald-50 text-emerald-600' };
    if (s === 'CANCELLED') return { label: 'مرفوض', cls: 'bg-red-50 text-red-600' };
    if (s === 'REFUNDED') return { label: 'مسترجع', cls: 'bg-red-50 text-red-600' };
    return { label: 'قيد المراجعة', cls: 'bg-slate-50 text-slate-600' };
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
      const updated = await ApiService.updateOrder(orderId, payload);
      const nextStatus = String(updated?.status || status || '').toUpperCase();

      // When rejecting an order, remove it from the list entirely.
      if (nextStatus === 'CANCELLED') {
        setLocalSales((prev) => prev.filter((o) => String(o?.id) !== String(updated?.id)));
      } else {
        setLocalSales((prev) => prev.map((o) => (String(o?.id) === String(updated?.id) ? { ...o, ...updated } : o)));
      }
      try {
        window.dispatchEvent(new Event('orders-updated'));
      } catch {
      }
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
    return `ج.م ${n}`;
  };

  const actionsEnabled = channel === 'shop' || channel === 'pos';

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('successful')}
          className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-black text-xs ${filter === 'successful' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'}`}
        >
          <CheckCircle2 size={16} /> {counts.successful} عملية ناجحة
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-black text-xs ${filter === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}
        >
          <XCircle size={16} /> {counts.rejected} عملية مرفوضة
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-black text-xs ${filter === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}
        >
          <Clock size={16} /> {counts.pending} قيد المراجعة
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 md:px-6 py-2 rounded-full font-black text-xs ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
        >
          الكل ({counts.total})
        </button>
      </div>

      <div className="overflow-x-auto touch-auto no-scrollbar mt-10" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
        <table className="w-full text-right border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">المنتجات</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ والوقت</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">التعداد</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">التوصيل</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجمالي</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجراءات</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">التفاصيل</th>
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
              />
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={detailsOpen} onClose={closeDetails} title="تفاصيل الطلب" size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الفاتورة</div>
              <div className="mt-2 text-white font-black">#{String(selectedSale?.id || '').slice(0, 8).toUpperCase()}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة</div>
              <div className="mt-2 text-white font-black">{statusMeta(selectedSale?.status).label}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ والوقت</div>
              <div className="mt-2 text-white font-black">
                {selectedSale ? new Date(selectedSale?.created_at || selectedSale?.createdAt).toLocaleString('ar-EG') : '-'}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجمالي</div>
              <div className="mt-2 text-white font-black">ج.م {Number(selectedSale?.total || 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">بيانات العميل</div>
            <div className="mt-3 text-white font-bold text-sm space-y-1">
              <div>الاسم: {selectedSale?.user?.fullName || selectedSale?.user?.name || '-'}</div>
              <div>الهاتف: {selectedSale?.user?.phone || selectedSale?.phone || '-'}</div>
              <div>العنوان: {selectedSale?.address || selectedSale?.user?.address || '-'}</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المنتجات</div>
            <div className="mt-3 space-y-2">
              {(Array.isArray(selectedSale?.items) ? selectedSale.items : []).map((it: any, idx: number) => {
                const name = it?.product?.name || it?.name || it?.title || `منتج ${idx + 1}`;
                const qty = Number(it?.quantity || it?.qty || 1);
                const price = Number(it?.price || it?.unitPrice || 0);
                const lineTotal = Number.isFinite(price) ? price * (Number.isFinite(qty) ? qty : 1) : 0;
                const variantText = formatVariantSelection(it?.variantSelection ?? it?.variant_selection);
                const addonsText = formatAddons(it?.addons ?? it?.extras ?? it?.addOns);
                return (
                  <div key={idx} className="flex items-center justify-between gap-3 bg-black/20 border border-white/10 rounded-xl p-3">
                    <div className="min-w-0">
                      <div className="text-white font-bold text-sm truncate">{name}</div>
                      {(variantText || addonsText) ? (
                        <div className="mt-1 space-y-1">
                          {variantText ? <div className="text-[11px] text-slate-300 font-bold">{variantText}</div> : null}
                          {addonsText ? <div className="text-[11px] text-slate-300 font-bold">{addonsText}</div> : null}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-slate-200 font-black text-xs shrink-0">
                      {qty} x ج.م {price} = ج.م {Number(lineTotal || 0).toLocaleString()}
                    </div>
                  </div>
                );
              })}
              {!Array.isArray(selectedSale?.items) || selectedSale?.items?.length === 0 ? (
                <div className="text-slate-300 font-bold text-sm">لا توجد منتجات</div>
              ) : null}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ملاحظات</div>
            <div className="mt-3 text-slate-200 font-bold text-sm whitespace-pre-wrap">{selectedSale?.notes || '-'}</div>
          </div>

          <OrderReturnsPanel order={selectedSale} />
        </div>
      </Modal>
    </>
  );
};

export default SalesChannelView;
