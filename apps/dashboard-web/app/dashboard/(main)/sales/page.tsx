'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CheckCircle2, Clock, XCircle, Eye, MoreVertical, Loader2,
  ShoppingCart, DollarSign, Package2, MapPin, Printer, ReceiptText,
  X, Info, Target, BookOpen, Zap, Link2, ClipboardList,
  Download, Upload, Plus, Filter, ChevronDown, CheckSquare, Square,
  ArrowUpDown, ChevronLeft, ChevronRight, Utensils, Calendar, Table,
  Package, Tag, Percent, Truck,
  ChefHat, PackageCheck, TrendingUp, Repeat, Ban,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { fetchMyOrders } from '@/lib/api/orders';
import {
  formatOrderItemsSummary,
  getDeliveryAddress,
  renderDeliveryFee,
  parseLocationFromNotes,
  hasLocationData,
  isDeliveryDisabledOrder,
} from '@/lib/sales-utils';
import InfoButton from '@/components/InfoButton';
import { getPageHelpConfig } from '@/config/pageHelp';
import { useShop } from '@/hooks/useShop';
import OrderReturnsPanel from '@/components/sales/OrderReturnsPanel';

type Order = {
  id: string;
  status: string;
  total: number;
  items?: any[];
  createdAt?: string;
  created_at?: string;
  customerName?: string;
  customer_name?: string;
  customerPhone?: string;
  customer_phone?: string;
  deliveryAddress?: string;
  delivery_address?: string;
  deliveryAddressManual?: string;
  delivery_address_manual?: string;
  customerNote?: string;
  customer_note?: string;
  notes?: string;
  user?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  phone?: string;
};

type FilterType = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'handed_to_courier' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'rejected' | 'refunded' | 'successful';

const STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'قيد الانتظار', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'مؤكد', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PREPARING: { label: 'قيد التجهيز', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  READY: { label: 'جاهز', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  HANDED_TO_COURIER: { label: 'سُلّم للمندوب', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  OUT_FOR_DELIVERY: { label: 'خرج للتوصيل', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  DELIVERED: { label: 'تم التوصيل', cls: 'bg-green-50 text-green-700 border-green-200' },
  CANCELLED: { label: 'ملغي', cls: 'bg-red-50 text-red-700 border-red-200' },
  REJECTED: { label: 'مرفوض', cls: 'bg-red-100 text-red-700 border-red-200' },
  REFUNDED: { label: 'مسترجع', cls: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
};

const RESTAURANT_FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'successful', label: 'ناجح' },
  { id: 'pending', label: 'قيد الانتظار' },
  { id: 'confirmed', label: 'مؤكد' },
  { id: 'preparing', label: 'قيد التجهيز' },
  { id: 'ready', label: 'جاهز للتقديم' },
  { id: 'handed_to_courier', label: 'سُلّم للمندوب' },
  { id: 'delivered', label: 'تم التوصيل' },
  { id: 'cancelled', label: 'ملغي' },
  { id: 'rejected', label: 'مرفوض' },
  { id: 'refunded', label: 'مسترجع' },
];

const RETAIL_FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'successful', label: 'ناجح' },
  { id: 'pending', label: 'قيد الانتظار' },
  { id: 'confirmed', label: 'مؤكد' },
  { id: 'preparing', label: 'قيد التجهيز' },
  { id: 'ready', label: 'جاهز' },
  { id: 'out_for_delivery', label: 'خرج للتوصيل' },
  { id: 'delivered', label: 'تم التوصيل' },
  { id: 'cancelled', label: 'ملغي' },
  { id: 'rejected', label: 'مرفوض' },
  { id: 'refunded', label: 'مسترجع' },
];

function formatItemsSummary(order: Order): string {
  return formatOrderItemsSummary(order, undefined, true) || '-';
}

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [updatingId, setUpdatingId] = useState('');
  const [openMenuId, setOpenMenuId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({ customerName: '', customerPhone: '', customerAddress: '' });
  const [creating, setCreating] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Advanced filters
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [amountRange, setAmountRange] = useState<'all' | 'under100' | '100to500' | 'over500'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const helpConfig = getPageHelpConfig('sales');

  // Get shop data for category-based customization
  const { shop } = useShop();
  const shopCategory = shop?.category?.toUpperCase() || 'RETAIL';
  const isRestaurant = shopCategory === 'RESTAURANT';
  const isRetail = shopCategory === 'RETAIL';

  const printInvoice = useCallback((order: Order) => {
    const escapeHtml = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    const normalizeNumber = (v: any) => {
      const n = Number(v ?? 0);
      return Number.isFinite(n) ? n : 0;
    };

    const money = (n: number) => Math.round(n * 100) / 100;

    const items = Array.isArray(order?.items) ? order.items : [];
    const total = normalizeNumber(order?.total);
    const computedSubtotal = items.reduce((sum: number, it: any) => {
      const qty = normalizeNumber(it?.quantity ?? it?.qty ?? 0);
      const unit = normalizeNumber(it?.unitPrice ?? it?.unit_price ?? it?.price ?? 0);
      return sum + (qty * unit);
    }, 0);
    
    const deliveryFee = total - computedSubtotal;
    const discount = 0;
    
    const orderId = String(order?.id || '').slice(0, 8).toUpperCase();
    const customerName = order?.customerName || order?.customer_name || order?.user?.name || '';
    const customerPhone = order?.customerPhone || order?.customer_phone || order?.user?.phone || '';
    const customerAddress = getDeliveryAddress(order);
    const customerNote = order?.customerNote || order?.customer_note || '';
    const createdAtLabel = order?.createdAt || order?.created_at 
      ? new Date(order.createdAt || order.created_at || '').toLocaleString('ar-EG') 
      : '';
    
    const shopName = 'المتجر';
    const phone = '';
    const city = '';
    const address = '';
    const deliveryNote = '';
    const footerNote = 'شكراً لتسوقك معنا!';

    const html = `
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>فاتورة</title>
          <style>
            @page { margin: 8mm; }
            body { font-family: Arial, sans-serif; direction: rtl; }
            .wrap { max-width: 80mm; margin: 0 auto; }
            h1 { font-size: 16px; margin: 0 0 6px; text-align: center; }
            .meta { font-size: 11px; color: #111; text-align: center; margin-bottom: 10px; }
            .sep { border-top: 1px dashed #999; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            .totals { font-size: 12px; }
            .row { display:flex; justify-content: space-between; gap: 10px; padding: 4px 0; }
            .foot { font-size: 11px; text-align:center; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <h1>${shopName}</h1>
            <div class="meta">
              ${orderId ? `<div><strong>طلب:</strong> ${escapeHtml(orderId)}</div>` : ''}
              ${phone ? `<div>${phone}</div>` : ''}
              ${city ? `<div>${city}</div>` : ''}
              ${address ? `<div>${address}</div>` : ''}
              ${customerName ? `<div style="margin-top:6px;"><strong>العميل:</strong> ${customerName}</div>` : ''}
              ${customerAddress ? `<div style="margin-top:4px;"><strong>العنوان:</strong> ${customerAddress}</div>` : ''}
              ${deliveryNote ? `<div style="margin-top:4px;"><strong>ملاحظة التوصيل:</strong> ${deliveryNote}</div>` : ''}
              ${customerNote ? `<div style="margin-top:4px;"><strong>ملاحظة:</strong> ${customerNote}</div>` : ''}
              ${customerPhone ? `<div style="margin-top:6px;"><strong>الهاتف:</strong> ${customerPhone}</div>` : ''}
              ${createdAtLabel ? `<div style="margin-top:6px;">${escapeHtml(createdAtLabel)}</div>` : ''}
            </div>
            <div class="sep"></div>
            <table>
              <tbody>
                ${items
                  .map((it: any) => {
                    const baseName = it?.product?.name || it?.name || it?.title || '-';
                    const name = escapeHtml(String(baseName).trim());
                    const qty = normalizeNumber(it?.quantity ?? it?.qty ?? 0);
                    const unit = normalizeNumber(it?.unitPrice ?? it?.unit_price ?? it?.price ?? 0);
                    const lineTotal = qty * unit;
                    return `
                      <tr>
                        <td style="padding: 6px 0;">${name || '-'}</td>
                        <td style="padding: 6px 0; text-align:left;">${qty || 0}x</td>
                        <td style="padding: 6px 0; text-align:left;">${money(lineTotal)}</td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
            <div class="sep"></div>
            <div class="totals">
              <div class="row"><span>المجموع الفرعي</span><span>ج.م ${money(computedSubtotal)}</span></div>
              ${deliveryFee > 0 ? `<div class="row"><span>الشحن</span><span>ج.م ${money(deliveryFee)}</span></div>` : ''}
              ${discount > 0 ? `<div class="row"><span>الخصم</span><span>ج.م ${money(discount)}</span></div>` : ''}
              <div class="row" style="font-weight:700;"><span>الإجمالي</span><span>ج.م ${money(total)}</span></div>
            </div>
            ${footerNote ? `<div class="sep"></div><div class="foot">${footerNote}</div>` : ''}
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
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { orders } = await fetchMyOrders({ limit: 200 });
      setOrders(Array.isArray(orders) ? orders : []);
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = useCallback(async (id: string, status: string) => {
    setUpdatingId(id);
    setOpenMenuId('');
    try {
      const upper = String(status || '').toUpperCase();
      const payload = upper === 'HANDED_TO_COURIER' ? { handedToCourier: true } : { status };
      await apiRequest(`/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (upper === 'CANCELLED') {
        setOrders((prev) => prev.filter((o) => String(o.id) !== String(id)));
        if (selectedOrder?.id === id) setSelectedOrder(null);
      } else {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: upper } : o)));
        if (selectedOrder?.id === id) {
          setSelectedOrder((prev) => prev ? { ...prev, status: upper } : prev);
        }
      }
      try { window.dispatchEvent(new Event('orders-updated')); } catch {}
    } catch (err: any) {
      setError(err?.message || 'فشل تحديث الحالة');
    } finally {
      setUpdatingId('');
    }
  }, [selectedOrder]);

  const createOrder = useCallback(async () => {
    if (!createFormData.customerName.trim() && !createFormData.customerPhone.trim()) {
      setError('أدخل اسم العميل أو رقم الهاتف على الأقل');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setError('لم يتم العثور على المتجر'); return; }
      await apiRequest(`/shops/${sid}/orders`, {
        method: 'POST',
        body: JSON.stringify({
          customerName: createFormData.customerName.trim(),
          customerPhone: createFormData.customerPhone.trim(),
          deliveryAddress: createFormData.customerAddress.trim() || undefined,
          items: [],
          total: 0,
          status: 'PENDING',
          source: 'manual',
        }),
      });
      setShowCreateModal(false);
      setCreateFormData({ customerName: '', customerPhone: '', customerAddress: '' });
      await fetchOrders();
      try { window.dispatchEvent(new Event('orders-updated')); } catch {}
    } catch (err: any) {
      setError(err?.message || 'فشل إنشاء الطلب');
    } finally {
      setCreating(false);
    }
  }, [createFormData, fetchOrders]);

  const isSuccessful = (o: Order) => {
    const s = String(o?.status || '').toUpperCase();
    return s === 'CONFIRMED' || s === 'PREPARING' || s === 'READY' || s === 'DELIVERED';
  };

  const isRejected = (o: Order) => String(o?.status || '').toUpperCase() === 'CANCELLED';
  const isPending = (o: Order) => String(o?.status || '').toUpperCase() === 'PENDING';

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status filter
    if (filter === 'successful') result = result.filter(isSuccessful);
    else if (filter === 'rejected') result = result.filter(isRejected);
    else if (filter === 'pending') result = result.filter(isPending);
    else if (filter === 'handed_to_courier') result = result.filter((o) => String(o.status || '').toUpperCase() === 'HANDED_TO_COURIER');
    else if (filter === 'out_for_delivery') result = result.filter((o) => ['OUT_FOR_DELIVERY', 'HANDED_TO_COURIER'].includes(String(o.status || '').toUpperCase()));
    else if (filter === 'refunded') result = result.filter((o) => String(o.status || '').toUpperCase() === 'REFUNDED');
    else if (filter !== 'all') result = result.filter((o) => String(o.status || '').toUpperCase() === filter.toUpperCase());

    // Date range filter
    const now = new Date();
    if (dateRange === 'today') {
      result = result.filter(o => {
        const date = new Date(o.createdAt || o.created_at || Date.now());
        return date.toDateString() === now.toDateString();
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(o => new Date(o.createdAt || o.created_at || Date.now()) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(o => new Date(o.createdAt || o.created_at || Date.now()) >= monthAgo);
    }

    // Amount range filter
    if (amountRange === 'under100') {
      result = result.filter(o => Number(o.total || 0) < 100);
    } else if (amountRange === '100to500') {
      result = result.filter(o => Number(o.total || 0) >= 100 && Number(o.total || 0) <= 500);
    } else if (amountRange === 'over500') {
      result = result.filter(o => Number(o.total || 0) > 500);
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        (o.customerName || o.customer_name || o.user?.name || '').toLowerCase().includes(q) ||
        (o.customerPhone || o.customer_phone || o.user?.phone || o.phone || '').includes(q) ||
        String(o.id || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt || a.created_at || 0).getTime() - new Date(b.createdAt || b.created_at || 0).getTime();
      } else if (sortBy === 'amount') {
        comparison = Number(a.total || 0) - Number(b.total || 0);
      } else if (sortBy === 'status') {
        comparison = String(a.status || '').localeCompare(String(b.status || ''));
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [orders, filter, dateRange, amountRange, searchQuery, sortBy, sortOrder]);

  // Pagination
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => String(o.status).toUpperCase() === 'PENDING').length;
    const confirmed = orders.filter((o) => String(o.status).toUpperCase() === 'CONFIRMED').length;
    const delivered = orders.filter((o) => String(o.status).toUpperCase() === 'DELIVERED').length;
    const ready = orders.filter((o) => String(o.status).toUpperCase() === 'READY').length;
    const preparing = orders.filter((o) => String(o.status).toUpperCase() === 'PREPARING').length;
    const handedToCourier = orders.filter((o) => String(o.status).toUpperCase() === 'HANDED_TO_COURIER').length;
    const outForDelivery = orders.filter((o) => ['OUT_FOR_DELIVERY', 'HANDED_TO_COURIER'].includes(String(o.status).toUpperCase())).length;
    const successful = orders.filter(isSuccessful).length;
    const rejected = orders.filter(isRejected).length;
    const cancelled = orders.filter((o) => String(o.status).toUpperCase() === 'CANCELLED').length;
    const refunded = orders.filter((o) => String(o.status).toUpperCase() === 'REFUNDED').length;
    const revenue = orders
      .filter((o) => ['DELIVERED', 'CONFIRMED', 'PREPARING', 'READY'].includes(String(o.status).toUpperCase()))
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    const avgOrder = total > 0 ? Math.round(revenue / total) : 0;
    return { total, pending, confirmed, delivered, ready, preparing, handedToCourier, outForDelivery, successful, rejected, cancelled, refunded, revenue, avgOrder };
  }, [orders]);

  // 4 stat cards
  const statCards = useMemo(() => [
    { label: 'إجمالي الطلبات', value: stats.total, icon: ShoppingCart, color: 'text-slate-700', bg: 'bg-slate-100', sub: 'طلب' },
    { label: 'الإيرادات', value: `ج.م ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', sub: 'إجمالي' },
    { label: 'متوسط قيمة الطلب', value: `ج.م ${stats.avgOrder.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'لكل طلب' },
    { label: 'قيد الانتظار', value: stats.pending, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100', sub: 'بانتظار' },
  ], [stats]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedOrders.map(o => String(o.id))));
    }
  }, [paginatedOrders, selectedIds.size]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const bulkAction = useCallback(async (action: 'confirm' | 'reject' | 'cancel') => {
    setUpdatingId('bulk');
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          apiRequest(`/orders/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: action === 'confirm' ? 'CONFIRMED' : action === 'reject' ? 'CANCELLED' : 'CANCELLED' }),
          })
        )
      );
      await fetchOrders();
      setSelectedIds(new Set());
    } catch (err: any) {
      setError(err?.message || 'فشل الإجراء الجماعي');
    } finally {
      setUpdatingId('');
    }
  }, [selectedIds, fetchOrders]);

  const exportOrders = useCallback(() => {
    const csv = [
      ['رقم الطلب', 'العميل', 'الهاتف', 'الحالة', 'المبلغ', 'التاريخ'].join(','),
      ...paginatedOrders.map(o => [
        o.id,
        o.customerName || o.customer_name || o.user?.name || '',
        o.customerPhone || o.customer_phone || o.user?.phone || '',
        o.status,
        o.total,
        new Date(o.createdAt || o.created_at || Date.now()).toLocaleString('ar-EG'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [paginatedOrders]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <ShoppingCart size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {isRestaurant ? 'الطلبات' : 'المبيعات'}
            </h1>
            <button
              onClick={() => setGuideOpen(true)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
              title="معلومات / Info"
            >
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">
            {isRestaurant ? 'إدارة طلبات المطعم' : 'إدارة طلبات المتجر'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-right">
          {error}
        </div>
      )}

      {/* Stats - 8 comprehensive cards (from old version) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 ${s.bg} ${s.color}`}>
              <s.icon size={20} />
            </div>
            <span className="text-slate-500 font-semibold text-xs mb-1">{s.label}</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900">{s.value}</span>
            <span className="text-[10px] text-slate-400 font-bold mt-1">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={exportOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all"
        >
          <Download size={16} />
          تصدير CSV
        </button>
        <button
          onClick={() => { /* TODO: Import */ }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all"
        >
          <Upload size={16} />
          استيراد
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
        >
          <Plus size={16} />
          طلب جديد
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث بالعميل أو رقم الطلب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 px-4 py-2 pr-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50"
          />
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50"
        >
          <option value="all">كل التواريخ</option>
          <option value="today">اليوم</option>
          <option value="week">آخر 7 أيام</option>
          <option value="month">آخر 30 يوم</option>
        </select>

        <select
          value={amountRange}
          onChange={(e) => setAmountRange(e.target.value as any)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50"
        >
          <option value="all">كل المبالغ</option>
          <option value="under100">أقل من 100</option>
          <option value="100to500">100 - 500</option>
          <option value="over500">أكثر من 500</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50"
        >
          <option value="date">ترتيب بالتاريخ</option>
          <option value="amount">ترتيب بالمبلغ</option>
          <option value="status">ترتيب بالحالة</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
          title={sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
        >
          <ArrowUpDown size={16} />
        </button>
      </div>

      {/* Status Filters - Category-specific */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
        {(isRestaurant ? RESTAURANT_FILTERS : RETAIL_FILTERS).map((f) => {
          const isActive = filter === f.id;
          const count = f.id === 'all' ? stats.total :
                        f.id === 'successful' ? stats.successful :
                        f.id === 'rejected' ? stats.rejected :
                        f.id === 'pending' ? stats.pending :
                        f.id === 'confirmed' ? stats.confirmed :
                        f.id === 'preparing' ? stats.preparing :
                        f.id === 'ready' ? stats.ready :
                        f.id === 'handed_to_courier' ? stats.handedToCourier :
                        f.id === 'out_for_delivery' ? stats.outForDelivery :
                        f.id === 'delivered' ? stats.delivered :
                        f.id === 'cancelled' ? stats.cancelled :
                        f.id === 'refunded' ? stats.refunded : 0;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-600">تم تحديد {selectedIds.size} طلب</span>
          <button
            onClick={() => bulkAction('confirm')}
            disabled={updatingId === 'bulk'}
            className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-all disabled:opacity-50"
          >
            تأكيد الكل
          </button>
          <button
            onClick={() => bulkAction('reject')}
            disabled={updatingId === 'bulk'}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
          >
            رفض الكل
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-4 py-2 rounded-lg bg-white text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all"
          >
            إلغاء التحديد
          </button>
        </div>
      )}

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Package2 size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد طلبات</p>
        </div>
      ) : (
        <>
          {/* Mobile view */}
          <div className="space-y-3 md:hidden">
            {filteredOrders.map((order) => {
            const id = String(order.id || '');
            const status = String(order.status || '').toUpperCase();
            const meta = STATUS_META[status] || { label: status, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
            const busy = updatingId === id;
            const canAccept = status === 'PENDING';
            const canPrepare = status === 'CONFIRMED';
            const canReady = status === 'PREPARING';
            const canReject = ['PENDING', 'CONFIRMED', 'PREPARING'].includes(status);
            const address = getDeliveryAddress(order);
            const deliveryManagedByShop = isDeliveryDisabledOrder(order);
            const hasLocation = hasLocationData(order);
            const deliveryFeeText = renderDeliveryFee(order);

            return (
              <div key={id} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => toggleSelect(id)}
                    className="shrink-0 p-1"
                  >
                    {selectedIds.has(id) ? <CheckSquare size={18} className="text-[#00E5FF]" /> : <Square size={18} className="text-slate-300" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-sm sm:text-base">{formatItemsSummary(order)}</div>
                    <div className="text-slate-500 font-medium text-xs mt-1">
                      {new Date(order.createdAt || order.created_at || Date.now()).toLocaleString('ar-EG')}
                    </div>
                    {order.customerNote || order.customer_note ? (
                      <div className="text-xs text-slate-400 mt-1">
                        ملاحظة: {order.customerNote || order.customer_note}
                      </div>
                    ) : null}
                  </div>
                  <div className="shrink-0">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold border ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-slate-500">عدد المنتجات</div>
                    <div className="mt-1 font-bold text-slate-900 text-sm">{order.items?.length || 0} عنصر</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-slate-500">الإجمالي</div>
                    <div className="mt-1 font-bold text-slate-900 text-sm">ج.م {Number(order.total || 0).toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
                  <div className="text-xs text-slate-500">
                    {deliveryManagedByShop ? (
                      <span>توصيل ذاتي</span>
                    ) : (
                      <span>رسوم التوصيل: {deliveryFeeText}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {deliveryManagedByShop && hasLocation && (
                      <button
                        onClick={() => {
                          const loc = parseLocationFromNotes(order.notes);
                          const addr = getDeliveryAddress(order);
                          
                          if (loc?.lat && loc?.lng) {
                            window.open(`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`, '_blank');
                          } else if (addr) {
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, '_blank');
                          }
                        }}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 transition-all"
                        title="عرض على الخريطة"
                      >
                        <MapPin size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {address && !deliveryManagedByShop && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{address}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => printInvoice(order)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                    title="طباعة الفاتورة"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                  >
                    <Eye size={18} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === id ? '' : id)}
                      disabled={busy}
                      className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all ${busy ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900'}`}
                    >
                      {busy ? <Loader2 size={18} className="animate-spin" /> : <MoreVertical size={18} />}
                    </button>
                    {openMenuId === id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId('')} />
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                          {canAccept && (
                            <button
                              onClick={() => updateStatus(id, 'CONFIRMED')}
                              className="w-full text-right px-4 py-3 font-bold text-xs text-emerald-700 hover:bg-emerald-50"
                            >
                              تأكيد الطلب
                            </button>
                          )}
                          {canPrepare && (
                            <button
                              onClick={() => updateStatus(id, 'PREPARING')}
                              className="w-full text-right px-4 py-3 font-bold text-xs text-amber-700 hover:bg-amber-50"
                            >
                              بدء التجهيز
                            </button>
                          )}
                          {canReady && (
                            <button
                              onClick={() => updateStatus(id, 'READY')}
                              className="w-full text-right px-4 py-3 font-bold text-xs text-blue-700 hover:bg-blue-50"
                            >
                              {isRestaurant ? 'جاهز للتقديم' : 'جاهز للتوصيل'}
                            </button>
                          )}
                          {canReady && !isRestaurant && (
                            <button
                              onClick={() => updateStatus(id, 'HANDED_TO_COURIER')}
                              className="w-full text-right px-4 py-3 font-bold text-xs text-indigo-700 hover:bg-indigo-50"
                            >
                              سُلّم للمندوب
                            </button>
                          )}
                          {!isRestaurant && (
                            <button
                              onClick={() => updateStatus(id, 'DELIVERED')}
                              className="w-full text-right px-4 py-3 font-bold text-xs text-green-700 hover:bg-green-50"
                            >
                              تم التوصيل
                            </button>
                          )}
                          {canReject && (
                            <>
                              <div className="border-t border-slate-100" />
                              <button
                                onClick={() => updateStatus(id, 'CANCELLED')}
                                className="w-full text-right px-4 py-3 font-bold text-xs text-red-700 hover:bg-red-50"
                              >
                                رفض الطلب
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto touch-auto mt-6">
          <table className="w-full text-right border-collapse min-w-[1250px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0 ? <CheckSquare size={18} className="text-[#00E5FF]" /> : <Square size={18} className="text-slate-300" />}
                  </button>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500">المنتجات</th>
                <th className="p-4 text-xs font-semibold text-slate-500">العميل</th>
                <th className="p-4 text-xs font-semibold text-slate-500">التاريخ والوقت</th>
                <th className="p-4 text-xs font-semibold text-slate-500">العدد</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">التوصيل</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الإجمالي</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
                <th className="p-4 text-xs font-semibold text-slate-500 text-left">التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const id = String(order.id || '');
                const status = String(order.status || '').toUpperCase();
                const meta = STATUS_META[status] || { label: status, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
                const busy = updatingId === id;
                const canAccept = status === 'PENDING';
                const canPrepare = status === 'CONFIRMED';
                const canReady = status === 'PREPARING';
                const canReject = ['PENDING', 'CONFIRMED', 'PREPARING'].includes(status);
                const address = getDeliveryAddress(order);
                const deliveryManagedByShop = isDeliveryDisabledOrder(order);
                const deliveryFeeText = renderDeliveryFee(order);

                return (
                  <tr key={id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4">
                      <button onClick={() => toggleSelect(id)} className="p-1">
                        {selectedIds.has(id) ? <CheckSquare size={18} className="text-[#00E5FF]" /> : <Square size={18} className="text-slate-300" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{formatItemsSummary(order)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 text-sm">{order.customerName || order.customer_name || order.user?.name || '-'}</div>
                      <div className="text-xs text-slate-400">{order.customerPhone || order.customer_phone || order.user?.phone || order.phone || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">
                        {new Date(order.createdAt || order.created_at || Date.now()).toLocaleString('ar-EG')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{order.items?.length || 0} عنصر</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold border ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">
                        {deliveryManagedByShop ? 'توصيل ذاتي' : deliveryFeeText}
                      </div>
                      {address && !deliveryManagedByShop && (
                        <div className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{address}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">ج.م {Number(order.total || 0).toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => printInvoice(order)}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all"
                          title="طباعة الفاتورة"
                        >
                          <Printer size={16} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === id ? '' : id)}
                            disabled={busy}
                            className={`p-2 bg-white border border-slate-200 rounded-lg transition-all ${busy ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900'}`}
                          >
                            {busy ? <Loader2 size={16} className="animate-spin" /> : <MoreVertical size={16} />}
                          </button>
                          {openMenuId === id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId('')} />
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                                {canAccept && (
                                  <button
                                    onClick={() => updateStatus(id, 'CONFIRMED')}
                                    className="w-full text-right px-4 py-3 font-bold text-xs text-emerald-700 hover:bg-emerald-50"
                                  >
                                    تأكيد الطلب
                                  </button>
                                )}
                                {canPrepare && (
                                  <button
                                    onClick={() => updateStatus(id, 'PREPARING')}
                                    className="w-full text-right px-4 py-3 font-bold text-xs text-amber-700 hover:bg-amber-50"
                                  >
                                    بدء التجهيز
                                  </button>
                                )}
                                {canReady && (
                                  <button
                                    onClick={() => updateStatus(id, 'READY')}
                                    className="w-full text-right px-4 py-3 font-bold text-xs text-blue-700 hover:bg-blue-50"
                                  >
                                    {isRestaurant ? 'جاهز للتقديم' : 'جاهز للتوصيل'}
                                  </button>
                                )}
                                {canReady && !isRestaurant && (
                                  <button
                                    onClick={() => updateStatus(id, 'HANDED_TO_COURIER')}
                                    className="w-full text-right px-4 py-3 font-bold text-xs text-indigo-700 hover:bg-indigo-50"
                                  >
                                    سُلّم للمندوب
                                  </button>
                                )}
                                {!isRestaurant && (
                                  <button
                                    onClick={() => updateStatus(id, 'DELIVERED')}
                                    className="w-full text-right px-4 py-3 font-bold text-xs text-green-700 hover:bg-green-50"
                                  >
                                    تم التوصيل
                                  </button>
                                )}
                                {canReject && (
                                  <>
                                    <div className="border-t border-slate-100" />
                                    <button
                                      onClick={() => updateStatus(id, 'CANCELLED')}
                                      className="w-full text-right px-4 py-3 font-bold text-xs text-red-700 hover:bg-red-50"
                                    >
                                      رفض الطلب
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-left">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-xs font-bold text-slate-500">
              عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} من {filteredOrders.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-xs font-bold text-slate-600 px-3">
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </>
      )}

      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تفاصيل الطلب</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printInvoice(selectedOrder)}
                  className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900"
                  title="طباعة الفاتورة"
                >
                  <Printer size={18} />
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-50 rounded-lg">
                  <XCircle size={20} className="text-slate-400" />
                </button>
              </div>
            </div>
            <div className="space-y-4 text-right">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الطلب</div>
                  <div className="mt-2 font-bold text-slate-900 text-sm truncate">#{String(selectedOrder.id || '').slice(0, 8).toUpperCase() || '-'}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة</div>
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${STATUS_META[String(selectedOrder.status).toUpperCase()]?.cls || ''}`}>
                      {STATUS_META[String(selectedOrder.status).toUpperCase()]?.label || selectedOrder.status}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ</div>
                  <div className="mt-2 font-bold text-slate-900 text-sm leading-6">
                    {new Date(selectedOrder.createdAt || selectedOrder.created_at || Date.now()).toLocaleString('ar-EG')}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجمالي</div>
                  <div className="mt-2 font-bold text-slate-900 text-sm">ج.م {Number(selectedOrder.total || 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                  <ReceiptText size={16} /> ملخص الطلب
                </div>
                <div className="mt-3 space-y-2 text-sm font-bold text-slate-600">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-400">الاسم</span>
                    <span className="text-slate-900 text-left">{selectedOrder.customerName || selectedOrder.customer_name || selectedOrder.user?.name || '-'}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-400">الهاتف</span>
                    <span className="text-slate-900 text-left" dir="ltr">{selectedOrder.customerPhone || selectedOrder.customer_phone || selectedOrder.user?.phone || selectedOrder.phone || '-'}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-400">طريقة التوصيل</span>
                    <span className="text-slate-900 text-left">{isDeliveryDisabledOrder(selectedOrder) ? 'استلام ذاتي' : 'عبر المندوب'}</span>
                  </div>
                  {isDeliveryDisabledOrder(selectedOrder) ? (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-400">العنوان</span>
                      <span className="text-slate-900 text-left">{getDeliveryAddress(selectedOrder) || '-'}</span>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-400">رسوم التوصيل</span>
                      <span className="text-slate-900 text-left">{renderDeliveryFee(selectedOrder)}</span>
                    </div>
                  )}
                  {selectedOrder.customerNote || selectedOrder.customer_note ? (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-400">ملاحظة</span>
                      <span className="text-slate-900 text-left">{selectedOrder.customerNote || selectedOrder.customer_note}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">المنتجات</div>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((it: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 flex-row-reverse">
                      <div className="text-right flex-1">
                        <div className="font-bold text-slate-900 text-sm">{it?.product?.name || it?.name || '-'}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {Number(it?.quantity || it?.qty || 1)} × ج.م {Number(it?.price || it?.unitPrice || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        ج.م {(Number(it?.price || it?.unitPrice || 0) * Number(it?.quantity || it?.qty || 1)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Returns Panel (from old version) */}
              <OrderReturnsPanel order={selectedOrder} />
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal (from old version) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !creating && setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">طلب جديد</h2>
              <button onClick={() => !creating && setShowCreateModal(false)} className="p-2 hover:bg-slate-50 rounded-lg" disabled={creating}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">اسم العميل</label>
                <input
                  type="text"
                  value={createFormData.customerName}
                  onChange={(e) => setCreateFormData({ ...createFormData, customerName: e.target.value })}
                  placeholder="اسم العميل"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">رقم الهاتف</label>
                <input
                  type="tel"
                  value={createFormData.customerPhone}
                  onChange={(e) => setCreateFormData({ ...createFormData, customerPhone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">عنوان التوصيل</label>
                <input
                  type="text"
                  value={createFormData.customerAddress}
                  onChange={(e) => setCreateFormData({ ...createFormData, customerAddress: e.target.value })}
                  placeholder="عنوان التوصيل (اختياري)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
                />
              </div>
              <button
                onClick={createOrder}
                disabled={creating}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {creating ? 'جاري الإنشاء...' : 'إنشاء الطلب'}
              </button>
            </div>
          </div>
        </div>
      )}

      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل المبيعات</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Target size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة ومتابعة جميع طلبات المتجر، من قيد الانتظار حتى التوصيل أو الإلغاء، مع إمكانية تحديث الحالات وطباعة الفواتير.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><BookOpen size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">متى تستخدمها</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">عند الحاجة لمراجعة الطلبات الجديدة، تحديث حالات الطلبات، طباعة الفواتير، أو متابعة تفاصيل كل طلب.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><ClipboardList size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">ماذا ستجد داخلها</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• 8 بطاقات إحصائية (إجمالي، إيرادات، متوسط، قيد الانتظار، قيد التجهيز، جاهز، تم التوصيل، ملغي/مرفوض)</li>
                  <li>• 10 فلاتر حالة (الكل، ناجح، قيد الانتظار، مؤكد، قيد التجهيز، جاهز، سُلّم للمندوب، خرج للتوصيل، تم التوصيل، ملغي، مرفوض، مسترجع)</li>
                  <li>• فلترة بالنطاق الزمني (اليوم/أسبوع/شهر) ونطاق المبلغ</li>
                  <li>• ترتيب بالتاريخ/المبلغ/الحالة + ترقيم صفحات</li>
                  <li>• تحديد متعدد + إجراءات جماعية (تأكيد/رفض الكل)</li>
                  <li>• جدول بجميع الطلبات مع العميل والمبلغ والحالة والتوصيل</li>
                  <li>• قائمة منسدلة لكل طلب لتحديث الحالة (قبول/تجهيز/جاهز/سُلّم للمندوب/تم التوصيل/رفض)</li>
                  <li>• زر طباعة فاتورة لكل طلب</li>
                  <li>• تفاصيل الطلب مع لوحة المرتجعات (إنشاء/عرض المرتجعات)</li>
                  <li>• إنشاء طلب جديد يدوياً</li>
                  <li>• تصدير CSV</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">كيفية العمل</h3></div>
                <ol className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>1. راجع الإحصائيات الـ 8 لفهم حجم الطلبات</li>
                  <li>2. استخدم الفلاتر للتركيز على حالة معينة</li>
                  <li>3. اضغط على القائمة المنسدلة للطلب لتحديث الحالة</li>
                  <li>4. اضغط على أيقونة العين لعرض تفاصيل الطلب والمرتجعات</li>
                  <li>5. اضغط على أيقونة الطابعة لطباعة الفاتورة</li>
                  <li>6. حدد عدة طلبات لإجراءات جماعية</li>
                  <li>7. اضغط "طلب جديد" لإنشاء طلب يدوياً</li>
                </ol>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Zap size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">أفضل الممارسات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• راجع الطلبات قيد الانتظار بانتظام لتسريع المعالجة</li>
                  <li>• استخدم الفلترة للتركيز على الطلبات الناجحة أو المرفوضة</li>
                  <li>• طباعة الفواتير للطلبات المكتملة</li>
                  <li>• راجع تفاصيل الطلب قبل تحديث الحالة</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Zap size={18} className="text-amber-500" /><h3 className="font-bold text-slate-900">نصائح</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• الطلبات قيد الانتظار تحتاج متابعة سريعة</li>
                  <li>• استخدم الطباعة المباشرة للفاتورة لسرعة الإنجاز</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Link2 size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">روابط ذات صلة</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• حالة الطلب</li>
                  <li>• المدفوعات</li>
                  <li>• المرتجعات</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
