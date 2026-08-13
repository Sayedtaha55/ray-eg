import React, { useEffect, useMemo, useState, memo, useCallback } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  ChefHat,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Ban,
  MoreVertical,
  Eye,
  Printer,
  Search as SearchIcon,
  Download,
  Upload,
  BookOpen,
  Plus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';
import { RayDB } from '@/constants';
import Modal from '@/components/common/ui/Modal';
import OrderReturnsPanel from './sales/OrderReturnsPanel';
import { formatPackLabelArabic, toArabicUnitLabel } from '@/lib/utils';
import {
  SalesPageShell,
  SalesPageHeader,
  SalesStatsGrid,
  SalesStatusFilters,
  SalesToolbar,
  SalesTable,
  SalesMobileCards,
  SalesStatusBadge,
  SalesEmptyState,
  SalesLoading,
  SalesHelpfulSection,
  FilterField,
  FilterInput,
  type StatCard,
  type StatusFilter,
  type TableColumn,
  type ToolbarAction,
  type SalesGuideData,
} from '../components/SalesDesignSystem';

const asCleanText = (v: any) => {
  const s = typeof v === 'string' ? v : (v == null ? '' : String(v));
  const t = s.trim();
  return t ? t : '';
};

const toLocalizedUnitLabel = (raw: any, isArabic: boolean) => {
  const value = asCleanText(raw);
  if (!value) return '';
  return isArabic ? toArabicUnitLabel(value) : value;
};

const formatPackLabel = (input: any, fallbackUnit: any, isArabic: boolean) => {
  if (isArabic) return asCleanText(formatPackLabelArabic(input, fallbackUnit));
  if (!input || typeof input !== 'object') return '';
  const label = asCleanText((input as any)?.label || (input as any)?.name);
  if (label) return label;
  const qty = (input as any)?.qty;
  const qtyText = typeof qty === 'number' || typeof qty === 'string' ? asCleanText(qty) : '';
  const unit = toLocalizedUnitLabel((input as any)?.unit || fallbackUnit, false);
  return [qtyText, unit].filter(Boolean).join(' ');
};

const formatVariantSelectionCompact = (raw: any, _isArabic = false) => {
  if (!raw || typeof raw !== 'object') return '';
  const kind = asCleanText((raw as any)?.kind).toLowerCase();
  if (kind === 'pack') {
    const label = formatPackLabel(raw, (raw as any)?.unit, _isArabic);
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

const formatAddonsCompactParts = (raw: any, t?: any): string[] => {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : (Array.isArray((raw as any)?.items) ? (raw as any).items : null);
  if (Array.isArray(list)) {
    const out = list.map((a: any) => {
      if (typeof a === 'string') return asCleanText(a);
      if (!a || typeof a !== 'object') return '';
      const name = asCleanText(a?.optionName || a?.name || a?.title || a?.label);
      const size = asCleanText(a?.variantLabel || a?.variant || a?.size || a?.sizeLabel || a?.sizeName);
      const priceRaw = typeof a?.price === 'number' ? a.price : Number(a?.price ?? NaN);
      const priceText = Number.isFinite(priceRaw) && priceRaw >= 0 ? ` ${t('business.pos.egp')} ${Math.round(priceRaw * 100) / 100}` : '';
      const core = [name, size].filter(Boolean).join(' ');
      if (!core) return '';
      return `${core}${priceText}`.trim();
    }).filter(Boolean);
    return out;
  }
  const s = asCleanText(raw);
  return s ? [s] : [];
};

const isDeliveryDisabledOrder = (order: any) => {
  return Boolean(
    order?.shops?.deliveryDisabled ??
    order?.shops?.delivery_disabled ??
    order?.shop?.deliveryDisabled ??
    order?.shop?.delivery_disabled ??
    order?.deliveryDisabled ??
    order?.delivery_disabled ??
    false
  );
};

const formatOrderItemsSummary = (sale: any, t?: any, isArabic = false) => {
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
      return ` ${t('business.pos.egp')} ${Math.round(n * 100) / 100}`;
    })();
    const variantText = formatVariantSelectionCompact(it?.variantSelection ?? it?.variant_selection, isArabic);
    const addonsParts = formatAddonsCompactParts(it?.addons ?? it?.extras ?? it?.addOns);
    const core = [name, variantText].filter(Boolean).join(' ');
    const base = [core ? `${core}${qtyText}` : '', priceText].filter(Boolean).join('');
    const addons = addonsParts.length ? ` + ${addonsParts.join(' + ')}` : '';
    return `${base}${addons}`.trim();
  }).filter(Boolean);
  const more = items.length > 3 ? ` +${items.length - 3}` : '';
  return `${parts.join(' + ')}${more}`;
};

const STATUS_META: Record<string, { key: string; color: string; bg: string }> = {
  PENDING: { key: 'pending', color: 'text-slate-600', bg: 'bg-slate-100' },
  CONFIRMED: { key: 'confirmed', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  PREPARING: { key: 'preparing', color: 'text-amber-600', bg: 'bg-amber-50' },
  READY: { key: 'ready', color: 'text-blue-600', bg: 'bg-blue-50' },
  OUT_FOR_DELIVERY: { key: 'out_for_delivery', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  DELIVERED: { key: 'delivered', color: 'text-green-600', bg: 'bg-green-50' },
  CANCELLED: { key: 'cancelled', color: 'text-red-600', bg: 'bg-red-50' },
  REJECTED: { key: 'rejected', color: 'text-red-700', bg: 'bg-red-100' },
  REFUNDED: { key: 'refunded', color: 'text-fuchsia-700', bg: 'bg-fuchsia-50' },
};

const getStatusMeta = (status: any, t: any) => {
  const s = String(status || '').toUpperCase();
  const meta = STATUS_META[s] || STATUS_META.PENDING;
  const labels: Record<string, string> = {
    pending: t('business.sales.statusPending'),
    confirmed: t('business.sales.statusConfirmed'),
    preparing: t('business.sales.statusPreparing'),
    ready: t('business.sales.statusReady'),
    out_for_delivery: t('business.sales.statusDelivered'),
    delivered: t('business.sales.statusDelivered'),
    cancelled: t('business.sales.statusCancelled'),
    rejected: t('business.sales.statusCancelled'),
    refunded: t('business.sales.statusRefunded'),
  };
  return { label: labels[meta.key] || labels.pending, color: meta.color, bg: meta.bg };
};

const OrderMobileCard = memo(({ sale, t, locale, isArabic, updatingId, openDetails, updateStatus, openMenuId, setOpenMenuId, renderDeliveryFee, onPrintInvoice }: any) => {
  const id = String(sale?.id || '').trim();
  const meta = getStatusMeta(sale?.status, t);
  const status = String(sale?.status || '').toUpperCase();
  const busy = updatingId === id;
  const itemsSummary = formatOrderItemsSummary(sale, t, isArabic);
  const deliveryManagedByShop = isDeliveryDisabledOrder(sale);
  const canAccept = status === 'PENDING';
  const canInProgress = status === 'CONFIRMED';
  const canReady = status === 'PREPARING';
  const canReject = status === 'PENDING' || status === 'CONFIRMED' || status === 'PREPARING';

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-slate-900 text-sm whitespace-normal break-words">{itemsSummary || '-'}</div>
          <div className="text-slate-500 font-medium text-xs mt-1">{new Date(sale.created_at || sale.createdAt).toLocaleString(locale)}</div>
        </div>
        <SalesStatusBadge label={meta.label} color={meta.color} bg={meta.bg} />
      </div>
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs font-semibold text-slate-500">{t('business.sales.colCount')}</div>
          <div className="mt-1 font-bold text-slate-900 text-sm">{sale.items?.length || 0} {t('business.sales.item')}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs font-semibold text-slate-500">{t('business.sales.colTotal')}</div>
          <div className="mt-1 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {Number(sale.total || 0).toLocaleString()}</div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
        <div className="text-slate-500 font-medium text-[11px]">{deliveryManagedByShop ? t('business.sales.selfDeliveryLocation') : `${t('business.sales.deliveryFee')}: ${renderDeliveryFee(sale)}`}</div>
        <div className="flex items-center gap-2" data-sales-actions-menu="1">
          <button onClick={(e) => { e.stopPropagation(); openDetails(sale); }} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
            <Eye size={18} />
          </button>
          {typeof onPrintInvoice === 'function' && (
            <button onClick={(e) => { e.stopPropagation(); if (!busy) onPrintInvoice(sale); }} className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all ${busy ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900'}`} disabled={busy}>
              <Printer size={18} />
            </button>
          )}
          <div className="relative" data-sales-actions-menu="1">
            <button onClick={(e) => { e.stopPropagation(); setOpenMenuId((prev: string) => prev === id ? '' : id); }} className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all ${busy ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900'}`} disabled={busy} data-sales-actions-menu="1">
              <MoreVertical size={18} />
            </button>
            {openMenuId === id && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50" data-sales-actions-menu="1">
                {canAccept && <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(''); if (!busy) updateStatus(id, 'CONFIRMED'); }} className={`w-full text-right px-4 py-3 font-semibold text-xs ${busy ? 'text-slate-300' : 'text-emerald-700 hover:bg-emerald-50'}`} data-sales-actions-menu="1">{busy ? '...' : t('business.sales.accept')}</button>}
                {canInProgress && <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(''); if (!busy) updateStatus(id, 'PREPARING'); }} className={`w-full text-right px-4 py-3 font-semibold text-xs ${busy ? 'text-slate-300' : 'text-amber-700 hover:bg-amber-50'}`} data-sales-actions-menu="1">{busy ? '...' : t('business.sales.statusPreparing')}</button>}
                {canReady && <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(''); if (!busy) updateStatus(id, 'READY'); }} className={`w-full text-right px-4 py-3 font-semibold text-xs ${busy ? 'text-slate-300' : 'text-blue-700 hover:bg-blue-50'}`} data-sales-actions-menu="1">{busy ? '...' : t('business.sales.statusReady')}</button>}
                {canReject && <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(''); if (!busy) updateStatus(id, 'CANCELLED'); }} className={`w-full text-right px-4 py-3 font-semibold text-xs ${busy ? 'text-slate-300' : 'text-red-700 hover:bg-red-50'}`} data-sales-actions-menu="1">{busy ? '...' : t('business.sales.reject')}</button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const OrderTableRow = memo(({ sale, t, locale, isArabic, updatingId, openDetails, updateStatus, openMenuId, setOpenMenuId, renderDeliveryFee, onPrintInvoice }: any) => {
  const id = String(sale?.id || '').trim();
  const meta = getStatusMeta(sale?.status, t);
  const status = String(sale?.status || '').toUpperCase();
  const busy = updatingId === id;
  const itemsSummary = formatOrderItemsSummary(sale, t, isArabic);
  const customerName = asCleanText(sale?.user?.fullName || sale?.user?.name || sale?.customerName || sale?.customer_name);
  const customerPhone = asCleanText(sale?.customerPhone || sale?.customer_phone || sale?.user?.phone || sale?.phone);
  const canAccept = status === 'PENDING';
  const canInProgress = status === 'CONFIRMED';
  const canReady = status === 'PREPARING';
  const canReject = status === 'PENDING' || status === 'CONFIRMED' || status === 'PREPARING';

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td className="p-4 font-bold text-slate-900 text-sm max-w-[280px]">
        <div className="whitespace-normal break-words" title={itemsSummary || ''}>{itemsSummary || '-'}</div>
      </td>
      <td className="p-4 text-sm">
        <div className="font-semibold text-slate-900">{customerName || '-'}</div>
        <div className="text-xs text-slate-400">{customerPhone || '-'}</div>
      </td>
      <td className="p-4 text-slate-500 font-semibold text-sm">{sale.items?.length || 0}</td>
      <td className="p-4 text-slate-500 font-medium text-sm">{new Date(sale.created_at || sale.createdAt).toLocaleString(locale)}</td>
      <td className="p-4">
        <SalesStatusBadge label={meta.label} color={meta.color} bg={meta.bg} />
      </td>
      <td className="p-4 text-slate-500 font-semibold text-sm">{renderDeliveryFee(sale)}</td>
      <td className="p-4">
        <span className="text-base font-bold text-slate-900">{t('business.pos.egp')} {Number(sale.total || 0).toLocaleString()}</span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2" data-sales-actions-menu="1">
          <button onClick={(e) => { e.stopPropagation(); openDetails(sale); }} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
            <Eye size={16} />
          </button>
          {typeof onPrintInvoice === 'function' && (
            <button onClick={(e) => { e.stopPropagation(); if (!busy) onPrintInvoice(sale); }} className={`p-2 bg-white border border-slate-200 rounded-lg transition-all ${busy ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900'}`} disabled={busy}>
              <Printer size={16} />
            </button>
          )}
          <div className="relative" data-sales-actions-menu="1">
            <button onClick={(e) => { e.stopPropagation(); setOpenMenuId((prev: string) => prev === id ? '' : id); }} className={`p-2 bg-white border border-slate-200 rounded-lg transition-all ${busy ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900'}`} disabled={busy} data-sales-actions-menu="1">
              <MoreVertical size={16} />
            </button>
            {openMenuId === id && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50" data-sales-actions-menu="1">
                {canAccept && <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(''); if (!busy) updateStatus(id, 'CONFIRMED'); }} className={`w-full text-right px-4 py-3 font-semibold text-xs ${busy ? 'text-slate-300' : 'text-emerald-700 hover:bg-emerald-50'}`} data-sales-actions-menu="1">{busy ? '...' : t('business.sales.accept')}</button>}
                {canInProgress && <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(''); if (!busy) updateStatus(id, 'PREPARING'); }} className={`w-full text-right px-4 py-3 font-semibold text-xs ${busy ? 'text-slate-300' : 'text-amber-700 hover:bg-amber-50'}`} data-sales-actions-menu="1">{busy ? '...' : t('business.sales.statusPreparing')}</button>}
                {canReady && <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(''); if (!busy) updateStatus(id, 'READY'); }} className={`w-full text-right px-4 py-3 font-semibold text-xs ${busy ? 'text-slate-300' : 'text-blue-700 hover:bg-blue-50'}`} data-sales-actions-menu="1">{busy ? '...' : t('business.sales.statusReady')}</button>}
                {canReject && <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(''); if (!busy) updateStatus(id, 'CANCELLED'); }} className={`w-full text-right px-4 py-3 font-semibold text-xs ${busy ? 'text-slate-300' : 'text-red-700 hover:bg-red-50'}`} data-sales-actions-menu="1">{busy ? '...' : t('business.sales.reject')}</button>}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
});

type Props = { sales: any[]; shop?: any };

const SalesTab: React.FC<Props> = ({ sales, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';

  const [localSales, setLocalSales] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [updatingId, setUpdatingId] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const list = Array.isArray(sales) ? sales : [];
    const filtered = list.filter((order: any) => {
      const orderSource = String(order?.source || '').toLowerCase();
      const status = String(order?.status || '').toUpperCase();
      if (status === 'CANCELLED') return false;
      return orderSource !== 'pos';
    });
    setLocalSales(filtered);
  }, [sales]);

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

  const stats = useMemo(() => {
    const total = localSales.length;
    const revenue = localSales.reduce((s, o) => s + Number(o?.total || 0), 0);
    const avgOrder = total > 0 ? Math.round(revenue / total) : 0;
    const counts: Record<string, number> = {};
    localSales.forEach((o) => {
      const s = String(o?.status || '').toUpperCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return { total, revenue, avgOrder, counts };
  }, [localSales]);

  const statCards: StatCard[] = [
    { label: isArabic ? 'إجمالي الطلبات' : 'Total Orders', value: stats.total, icon: ShoppingCart, color: 'text-slate-700', bgColor: 'bg-slate-100', trend: { value: isArabic ? 'طلب' : 'orders', direction: 'neutral' } },
    { label: isArabic ? 'الإيرادات' : 'Revenue', value: `${t('business.pos.egp')} ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: isArabic ? 'إجمالي' : 'total', direction: 'up' } },
    { label: isArabic ? 'متوسط قيمة الطلب' : 'Avg Order Value', value: `${t('business.pos.egp')} ${stats.avgOrder.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: { value: isArabic ? 'لكل طلب' : 'per order', direction: 'up' } },
    { label: isArabic ? 'قيد الانتظار' : 'Pending', value: stats.counts['PENDING'] || 0, icon: Clock, color: 'text-slate-600', bgColor: 'bg-slate-100', trend: { value: isArabic ? 'بانتظار' : 'awaiting', direction: 'neutral' } },
    { label: isArabic ? 'قيد التجهيز' : 'Preparing', value: stats.counts['PREPARING'] || 0, icon: ChefHat, color: 'text-amber-600', bgColor: 'bg-amber-50', trend: { value: isArabic ? 'قيد التحضير' : 'in progress', direction: 'neutral' } },
    { label: isArabic ? 'جاهز' : 'Ready', value: stats.counts['READY'] || 0, icon: PackageCheck, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: { value: isArabic ? 'جاهز' : 'ready', direction: 'up' } },
    { label: isArabic ? 'تم التوصيل' : 'Delivered', value: stats.counts['DELIVERED'] || 0, icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: stats.total > 0 ? `${Math.round(((stats.counts['DELIVERED'] || 0) / stats.total) * 100)}%` : '0%', direction: 'up' } },
    { label: isArabic ? 'ملغي/مرفوض' : 'Cancelled/Rejected', value: (stats.counts['CANCELLED'] || 0) + (stats.counts['REJECTED'] || 0), icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', trend: { value: isArabic ? 'إلغاء' : 'cancelled', direction: 'down' } },
  ];

  const statusFilters: StatusFilter[] = [
    { key: 'all', label: isArabic ? 'الكل' : 'ALL', count: stats.total, color: '', activeColor: 'bg-slate-900 text-white' },
    { key: 'PENDING', label: isArabic ? 'قيد الانتظار' : 'Pending', count: stats.counts['PENDING'] || 0, color: '', activeColor: 'bg-slate-100 text-slate-700' },
    { key: 'CONFIRMED', label: isArabic ? 'مؤكد' : 'Confirmed', count: stats.counts['CONFIRMED'] || 0, color: '', activeColor: 'bg-emerald-50 text-emerald-600' },
    { key: 'PREPARING', label: isArabic ? 'قيد التجهيز' : 'Preparing', count: stats.counts['PREPARING'] || 0, color: '', activeColor: 'bg-amber-50 text-amber-600' },
    { key: 'READY', label: isArabic ? 'جاهز' : 'Ready', count: stats.counts['READY'] || 0, color: '', activeColor: 'bg-blue-50 text-blue-600' },
    { key: 'OUT_FOR_DELIVERY', label: isArabic ? 'خرج للتوصيل' : 'Out for Delivery', count: stats.counts['OUT_FOR_DELIVERY'] || 0, color: '', activeColor: 'bg-indigo-50 text-indigo-600' },
    { key: 'DELIVERED', label: isArabic ? 'تم التوصيل' : 'Delivered', count: stats.counts['DELIVERED'] || 0, color: '', activeColor: 'bg-green-50 text-green-600' },
    { key: 'CANCELLED', label: isArabic ? 'ملغي' : 'Cancelled', count: stats.counts['CANCELLED'] || 0, color: '', activeColor: 'bg-red-50 text-red-600' },
    { key: 'REJECTED', label: isArabic ? 'مرفوض' : 'Rejected', count: stats.counts['REJECTED'] || 0, color: '', activeColor: 'bg-red-100 text-red-700' },
    { key: 'REFUNDED', label: isArabic ? 'مسترجع' : 'Refunded', count: stats.counts['REFUNDED'] || 0, color: '', activeColor: 'bg-fuchsia-50 text-fuchsia-700' },
  ];

  const filteredSales = useMemo(() => {
    let result = localSales;
    if (filter !== 'all') {
      result = result.filter((o) => String(o?.status || '').toUpperCase() === filter);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((o) => {
        const itemsSummary = formatOrderItemsSummary(o, t, isArabic).toLowerCase();
        const customerName = asCleanText(o?.user?.fullName || o?.user?.name || o?.customerName).toLowerCase();
        const orderId = String(o?.id || '').toLowerCase();
        return itemsSummary.includes(q) || customerName.includes(q) || orderId.includes(q);
      });
    }
    return result;
  }, [localSales, filter, debouncedSearch, t, isArabic]);

  const columns: TableColumn[] = [
    { key: 'products', label: isArabic ? 'المنتجات' : 'Products' },
    { key: 'customer', label: isArabic ? 'العميل' : 'Customer' },
    { key: 'count', label: isArabic ? 'العدد' : 'Items' },
    { key: 'date', label: isArabic ? 'التاريخ' : 'Created At' },
    { key: 'status', label: isArabic ? 'الحالة' : 'Status' },
    { key: 'delivery', label: isArabic ? 'التوصيل' : 'Delivery' },
    { key: 'total', label: isArabic ? 'الإجمالي' : 'Total' },
    { key: 'actions', label: isArabic ? 'إجراءات' : 'Actions', align: 'center' as const },
  ];

  const toolbarActions: ToolbarAction[] = [
    { label: isArabic ? 'تصدير' : 'Export', icon: Download, onClick: () => {} },
    { label: isArabic ? 'استيراد' : 'Import', icon: Upload, onClick: () => {} },
    { label: isArabic ? 'طباعة' : 'Print', icon: Printer, onClick: () => {} },
  ];

  const updateStatus = async (id: string, status: string) => {
    const orderId = String(id || '').trim();
    if (!orderId) return;
    setUpdatingId(orderId);
    try {
      const upper = String(status || '').toUpperCase();
      const payload = upper === 'HANDED_TO_COURIER' ? ({ handedToCourier: true } as any) : ({ status } as any);
      const updated = await ApiService.updateOrder(orderId, payload);
      const nextStatus = String(updated?.status || status || '').toUpperCase();
      if (nextStatus === 'CANCELLED') {
        setLocalSales((prev) => prev.filter((o) => String(o?.id) !== String(updated?.id)));
      } else {
        setLocalSales((prev) => prev.map((o) => (String(o?.id) === String(updated?.id) ? { ...o, ...updated } : o)));
      }
      try { window.dispatchEvent(new Event('orders-updated')); } catch {}
    } finally {
      setUpdatingId('');
    }
  };

  const openDetails = (sale: any) => { setSelectedSale(sale); setDetailsOpen(true); };
  const closeDetails = () => { setDetailsOpen(false); setSelectedSale(null); };

  const renderDeliveryFee = (sale: any) => {
    if (isDeliveryDisabledOrder(sale)) return t('business.sales.deliveryDisabled');
    const raw = typeof sale?.notes === 'string' ? sale.notes : '';
    const lines = raw.split(/\r?\n/).map((l: any) => String(l).trim()).filter(Boolean);
    const feeLine = lines.find((l: any) => String(l).toUpperCase().startsWith('DELIVERY_FEE:'));
    if (!feeLine) return '-';
    const value = String(feeLine).split(':').slice(1).join(':').trim();
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return '-';
    return `${t('business.pos.egp')} ${n}`;
  };

  const printSaleInvoice = async (sale: any) => {
    const orderId = String(sale?.id || '').trim();
    if (!orderId) return;
    const escapeHtml = (value: any) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const shopId = String((sale as any)?.shopId || (sale as any)?.shop_id || '').trim();
    const theme = shopId ? (RayDB as any)?.getReceiptTheme?.(shopId) : null;
    const shopName = escapeHtml(String((theme as any)?.shopName || (sale as any)?.shopName || ''));
    const phone = escapeHtml(String((theme as any)?.phone || ''));
    const items = Array.isArray((sale as any)?.items) ? (sale as any).items : [];
    const total = Number((sale as any)?.total || 0);
    const html = `<!doctype html><html lang="${isArabic ? 'ar' : 'en'}" dir="${isArabic ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"/><title>Receipt</title><style>@page{margin:8mm}body{font-family:Arial,sans-serif;direction:${isArabic ? 'rtl' : 'ltr'}}.wrap{max-width:80mm;margin:0 auto}h1{font-size:16px;margin:0 0 6px;text-align:center}.meta{font-size:11px;color:#111;text-align:center;margin-bottom:10px}.sep{border-top:1px dashed #999;margin:10px 0}table{width:100%;border-collapse:collapse;font-size:12px}.row{display:flex;justify-content:space-between;gap:10px;padding:4px 0}.foot{font-size:11px;text-align:center;margin-top:10px}</style></head><body><div class="wrap"><h1>${shopName || t('business.sales.invoice')}</h1><div class="meta">${orderId ? `<div><strong>${t('business.sales.order')}:</strong> ${escapeHtml(orderId)}</div>` : ''}${phone ? `<div>${phone}</div>` : ''}</div><div class="sep"></div><table><tbody>${items.map((it: any) => { const name = escapeHtml(String(it?.name || it?.product?.name || '-')); const qty = Number(it?.quantity || it?.qty || 0); const unit = Number(it?.price || it?.unitPrice || 0); return `<tr><td style="padding:6px 0;">${name}</td><td style="padding:6px 0;text-align:left;">${qty}x</td><td style="padding:6px 0;text-align:left;">${(Math.round(unit * 100) / 100).toFixed(2)}</td></tr>`; }).join('')}</tbody></table><div class="sep"></div><div class="row" style="font-weight:700;"><span>${t('business.sales.total')}</span><span>${t('business.pos.egp')} ${(Math.round(total * 100) / 100).toFixed(2)}</span></div></div></body></html>`;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) { try { document.body.removeChild(iframe); } catch {} return; }
    doc.open(); doc.write(html); doc.close();
    setTimeout(() => { try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch {} setTimeout(() => { try { document.body.removeChild(iframe); } catch {} }, 300); }, 300);
  };

  const advancedFilters = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <FilterField label={isArabic ? 'التاريخ' : 'Date'}><FilterInput type="date" /></FilterField>
      <FilterField label={isArabic ? 'الفرع' : 'Branch'}><FilterInput placeholder={isArabic ? 'كل الفروع' : 'All branches'} /></FilterField>
      <FilterField label={isArabic ? 'الموظف' : 'Employee'}><FilterInput placeholder={isArabic ? 'كل الموظفين' : 'All employees'} /></FilterField>
      <FilterField label={isArabic ? 'التوصيل' : 'Delivery'}><FilterInput placeholder={isArabic ? 'نوع التوصيل' : 'Delivery type'} /></FilterField>
      <FilterField label={isArabic ? 'الدفع' : 'Payment'}><FilterInput placeholder={isArabic ? 'طريقة الدفع' : 'Payment method'} /></FilterField>
      <FilterField label={isArabic ? 'العميل' : 'Customer'}><FilterInput placeholder={isArabic ? 'اسم العميل' : 'Customer name'} /></FilterField>
      <FilterField label={isArabic ? 'القناة' : 'Channel'}><FilterInput placeholder={isArabic ? 'قناة البيع' : 'Sales channel'} /></FilterField>
      <FilterField label={isArabic ? 'الوسوم' : 'Tags'}><FilterInput placeholder={isArabic ? 'الوسوم' : 'Tags'} /></FilterField>
    </div>
  );

  /* ---- Guide ---- */
  const guide: SalesGuideData = {
    purpose: isArabic ? 'إدارة جميع طلبات متجرك في مكان واحد. تابع حالة كل طلب من لحظة استلامه حتى التوصيل.' : 'Manage all your store orders in one place. Track each order from receipt to delivery.',
    whenToUse: isArabic ? 'يومياً لمتابعة الطلبات الجديدة وتحديث حالاتها. عند الحاجة لطباعة فاتورة أو تغيير حالة طلب.' : 'Daily to track new orders and update statuses. When you need to print an invoice or change order status.',
    whatsInside: isArabic
      ? ['لوحة إحصائيات (إجمالي، مكتمل، معلق، ملغي، إيراد)', 'فلاتر الحالة', 'بحث بالرقم أو اسم العميل', 'جدول احترافي بكل التفاصيل', 'بطاقات موبايل متجاوبة', 'زر إنشاء طلب جديد', 'طباعة الفواتير']
      : ['Dashboard stats (total, completed, pending, cancelled, revenue)', 'Status filters', 'Search by order number or customer', 'Professional table with details', 'Responsive mobile cards', 'Create new order button', 'Invoice printing'],
    steps: isArabic
      ? [
          { title: 'اضغط "طلب جديد"', description: 'لفتح نافذة إنشاء طلب جديد' },
          { title: 'استخدم الفلاتر', description: 'لتصفية الطلبات حسب الحالة' },
          { title: 'اضغط على أيقونة العين', description: 'لعرض تفاصيل الطلب' },
          { title: 'استخدم قائمة الإجراءات', description: 'لتغيير حالة الطلب' },
          { title: 'اضغط على طباعة', description: 'لطباعة فاتورة الطلب' },
        ]
      : [
          { title: 'Click "New Order"', description: 'To open the create order dialog' },
          { title: 'Use filters', description: 'To narrow orders by status' },
          { title: 'Click the eye icon', description: 'To view order details' },
          { title: 'Use actions menu', description: 'To change order status' },
          { title: 'Click print', description: 'To print the order invoice' },
        ],
    bestPractices: isArabic
      ? ['قم بتحديث حالة الطلب فور تغييرها', 'راجع الطلبات المعلقة بانتظام', 'استخدم البحث للعثور سريعاً', 'صدّر الطلبات لملف Excel للتحليل']
      : ['Update order status immediately when changed', 'Review pending orders regularly', 'Use search to quickly find orders', 'Export orders to Excel for analysis'],
    tips: isArabic
      ? ['استخدم البحث للعثور سريعاً على طلبات بالاسم أو رقم الطلب', 'يمكنك تصدير الطلبات لملف Excel للتحليل', 'الفلاتر تساعد في تركيز القائمة']
      : ['Use search to quickly find orders by name or order number', 'You can export orders to Excel for analysis', 'Filters help focus the list'],
    shortcuts: isArabic
      ? ['اضغط على أي طلب لعرض التفاصيل بسرعة', 'استخدم الفلاتر لتقليل القائمة', 'اضغط ESC لإغلاق النوافذ']
      : ['Click any order to quickly view details', 'Use filters to reduce the list', 'Press ESC to close dialogs'],
    relatedLinks: [
      { label: isArabic ? 'حالة الطلب' : 'Order Status', onClick: () => {} },
      { label: isArabic ? 'المدفوعات' : 'Payments', onClick: () => {} },
      { label: isArabic ? 'المرتجعات' : 'Returns', onClick: () => {} },
    ],
  };

  const isEmpty = filteredSales.length === 0 && !debouncedSearch;

  return (
    <SalesPageShell>
      <SalesPageHeader
        icon={ShoppingCart}
        title={isArabic ? 'الطلبات' : 'Orders'}
        subtitle={isArabic ? 'إدارة ومتابعة جميع طلبات متجرك من مكان واحد' : 'Manage and track all your store orders in one place'}
        guide={guide}
        primaryAction={{ label: isArabic ? 'طلب جديد' : 'New Order', icon: Plus, onClick: () => setShowCreateModal(true) }}
      />

      <SalesStatsGrid stats={statCards} />

      <SalesStatusFilters filters={statusFilters} active={filter} onChange={setFilter} />

      <SalesToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={isArabic ? 'بحث برقم الطلب أو اسم العميل...' : 'Search by order number or customer...'}
        actions={toolbarActions}
        advancedFilters={advancedFilters}
      />

      {isEmpty ? (
        <SalesEmptyState
          emoji="🛒"
          icon={ShoppingCart}
          title={isArabic ? 'لا توجد طلبات بعد' : 'No orders yet'}
          description={isArabic ? 'ابدأ باستقبال الطلبات من متجرك. ستظهر جميع الطلبات هنا مع إمكانية تتبعها وإدارتها.' : 'Start receiving orders from your store. All orders will appear here with full tracking and management.'}
          primaryAction={{ label: isArabic ? 'إنشاء طلب جديد' : 'Create New Order', icon: Plus, onClick: () => setShowCreateModal(true) }}
          secondaryActions={[
            { label: isArabic ? 'استيراد الطلبات' : 'Import Orders', icon: Upload, onClick: () => {} },
            { label: isArabic ? 'معرفة المزيد' : 'Learn More', icon: BookOpen, onClick: () => {} },
          ]}
        />
      ) : filteredSales.length === 0 ? (
        <div className="py-12 text-center">
          <SearchIcon size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">{isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results'}</p>
        </div>
      ) : (
        <>
          <SalesTable columns={columns}>
            {filteredSales.map((sale) => (
              <OrderTableRow key={sale.id} sale={sale} t={t} locale={locale} isArabic={isArabic} updatingId={updatingId} openDetails={openDetails} updateStatus={updateStatus} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} renderDeliveryFee={renderDeliveryFee} onPrintInvoice={printSaleInvoice} />
            ))}
          </SalesTable>
          <SalesMobileCards>
            {filteredSales.map((sale) => (
              <OrderMobileCard key={sale.id} sale={sale} t={t} locale={locale} isArabic={isArabic} updatingId={updatingId} openDetails={openDetails} updateStatus={updateStatus} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} renderDeliveryFee={renderDeliveryFee} onPrintInvoice={printSaleInvoice} />
            ))}
          </SalesMobileCards>
        </>
      )}

      <Modal isOpen={detailsOpen} onClose={closeDetails} title={t('business.sales.orderDetails')} size="lg">
        <div className="space-y-4 text-right">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('business.sales.orderNumber')}</div>
              <div className="mt-2 text-slate-900 font-bold">#{String(selectedSale?.id || '').slice(0, 8).toUpperCase() || '-'}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('business.sales.colStatus')}</div>
              <div className="mt-2 text-slate-900 font-bold">{getStatusMeta(selectedSale?.status, t).label}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('business.sales.colDateTime')}</div>
              <div className="mt-2 text-slate-900 font-bold text-sm">{selectedSale ? new Date(selectedSale?.created_at || selectedSale?.createdAt).toLocaleString(locale) : '-'}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('business.sales.colTotal')}</div>
              <div className="mt-2 text-slate-900 font-bold">{t('business.pos.egp')} {Number(selectedSale?.total || 0).toLocaleString()}</div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">{isArabic ? 'معلومات العميل' : 'Customer Info'}</div>
            <div className="space-y-2 text-sm font-semibold text-slate-600">
              <div className="flex items-start justify-between gap-3"><span className="text-slate-400">{t('business.sales.name')}</span><span className="text-slate-900 text-left">{selectedSale?.user?.fullName || selectedSale?.user?.name || '-'}</span></div>
              <div className="flex items-start justify-between gap-3"><span className="text-slate-400">{t('business.sales.customerPhone')}</span><span className="text-slate-900 text-left">{selectedSale?.customerPhone || selectedSale?.customer_phone || selectedSale?.user?.phone || selectedSale?.phone || '-'}</span></div>
              <div className="flex items-start justify-between gap-3"><span className="text-slate-400">{t('business.sales.deliveryMethod')}</span><span className="text-slate-900 text-left">{isDeliveryDisabledOrder(selectedSale) ? t('business.sales.selfPickup') : t('business.sales.viaCourier')}</span></div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">{t('business.sales.products')}</div>
            <div className="space-y-2">
              {(Array.isArray(selectedSale?.items) ? selectedSale.items : []).map((it: any, idx: number) => {
                const name = it?.product?.name || it?.name || it?.title || t('business.sales.productFallback', { index: idx + 1 });
                const qty = Number(it?.quantity || it?.qty || 1);
                const price = Number(it?.price || it?.unitPrice || 0);
                return (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-slate-900 font-bold text-sm">{name}</div>
                      <div className="shrink-0 text-left">
                        <div className="text-slate-900 font-bold text-sm">× {qty}</div>
                        <div className="text-xs text-slate-500 font-bold">{t('business.pos.egp')} {Number(price || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!Array.isArray(selectedSale?.items) || selectedSale?.items?.length === 0 ? (
                <div className="text-slate-400 font-bold text-sm">{t('business.sales.noProducts')}</div>
              ) : null}
            </div>
          </div>
          <OrderReturnsPanel order={selectedSale} />
        </div>
      </Modal>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-bold mb-4">{isArabic ? 'طلب جديد' : 'New Order'}</h4>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم العميل' : 'Customer name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowCreateModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
      <SalesHelpfulSection
        tips={isArabic
          ? ['استخدم البحث للعثور سريعاً على طلبات بالاسم أو رقم الطلب', 'يمكنك تصدير الطلبات لملف Excel للتحليل', 'الفلاتر تساعد في تركيز القائمة']
          : ['Use search to quickly find orders by name or order number', 'You can export orders to Excel for analysis', 'Filters help focus the list']
        }
        documentation={[
          { label: isArabic ? 'دليل الطلبات' : 'Orders Guide', onClick: () => {} },
          { label: isArabic ? 'إدارة الحالات' : 'Managing Statuses', onClick: () => {} },
        ]}
        nextSteps={[
          { label: isArabic ? 'إنشاء طلب جديد' : 'Create New Order', description: isArabic ? 'أضف طلب جديد يدوياً' : 'Add a new order manually', onClick: () => setShowCreateModal(true) },
          { label: isArabic ? 'تصدير الطلبات' : 'Export Orders', description: isArabic ? 'صدّر الطلبات لملف Excel' : 'Export orders to Excel', onClick: () => {} },
        ]}
      />
    </SalesPageShell>
  );
};

export default SalesTab;
