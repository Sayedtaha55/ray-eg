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

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  PENDING: { label: 'بانتظار التأكيد', cls: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  CONFIRMED: { label: 'مؤكد', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-600' },
  PREPARING: { label: 'قيد التجهيز', cls: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-600' },
  READY: { label: 'جاهز', cls: 'bg-teal-50 text-teal-800 border-teal-200', dot: 'bg-teal-600' },
  HANDED_TO_COURIER: { label: 'مع المندوب', cls: 'bg-indigo-50 text-indigo-800 border-indigo-200', dot: 'bg-indigo-600' },
  OUT_FOR_DELIVERY: { label: 'خارج للتوصيل', cls: 'bg-indigo-50 text-indigo-800 border-indigo-200', dot: 'bg-indigo-600' },
  DELIVERED: { label: 'تم التسليم', cls: 'bg-green-50 text-green-800 border-green-200', dot: 'bg-green-600' },
  CANCELLED: { label: 'ملغي', cls: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
  REJECTED: { label: 'مرفوض', cls: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  REFUNDED: { label: 'مرتجع', cls: 'bg-orange-50 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
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
      setOrders((Array.isArray(orders) ? orders : []) as Order[]);
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

  // 4 stat cards — صياغة مصرية مهنية
  const statCards = useMemo(() => [
    { label: 'طلبات الفترة', value: stats.total, icon: ShoppingCart, color: 'text-slate-700', bg: 'bg-slate-100', sub: `منها ${stats.pending} جديد` },
    { label: 'صافي الإيراد', value: `${stats.revenue.toLocaleString('ar-EG')} ج.م`, icon: DollarSign, color: 'text-green-700', bg: 'bg-green-50', sub: 'طلبات مؤكدة ومسلّمة' },
    { label: 'متوسط الفاتورة', value: `${stats.avgOrder.toLocaleString('ar-EG')} ج.م`, icon: TrendingUp, color: 'text-sky-700', bg: 'bg-sky-50', sub: 'للطلب الواحد' },
    { label: 'يحتاج متابعة', value: stats.pending, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', sub: 'بانتظار التأكيد' },
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
    <div className="min-h-full bg-[#F4F5F7] text-slate-900" style={{ fontFamily: "'Cairo','Tajawal',system-ui,sans-serif" }}>
      {/* شريط علوي مهني: مسار + عنوان + إجراءات */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 pt-4 pb-3 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
            <span>الرئيسية</span><span>/</span><span>المبيعات</span><span>/</span>
            <span className="text-slate-700">{isRestaurant ? 'طلبات الصالة والدليفري' : 'طلبات المتجر'}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-2">
                <h1 className="text-[20px] leading-7 font-extrabold text-slate-900">
                  {isRestaurant ? 'طلبات اليوم' : 'إدارة الطلبات'}
                </h1>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5 tabular-nums">
                  {stats.total} طلب
                </span>
                {stats.pending > 0 && (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5">
                    {stats.pending} بانتظار التأكيد
                  </span>
                )}
              </div>
              <p className="text-[12px] text-slate-500 font-semibold mt-0.5">
                {shop?.name ? `${shop.name} — ` : ''}تابع التنفيذ لحظة بلحظة: تأكيد، تجهيز، تسليم وطباعة الفاتورة
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportOrders} className="h-9 px-3 rounded-lg bg-white border border-slate-200 text-[12px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
                <Download size={14} /> تصدير
              </button>
              <button onClick={() => setShowCreateModal(true)} className="h-9 px-4 rounded-lg bg-slate-900 text-white text-[12px] font-bold hover:bg-slate-800 flex items-center gap-1.5">
                <Plus size={14} /> طلب يدوي
              </button>
            </div>
          </div>
          {/* مؤشرات مدمجة — شريط واحد بدل 8 كروت */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 border border-slate-200 rounded-lg bg-white overflow-hidden divide-x divide-x-reverse divide-slate-100">
            {statCards.map((s, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${s.bg} ${s.color}`}>
                  <s.icon size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-[15px] font-extrabold tabular-nums leading-5 truncate">{s.value}</div>
                  <div className="text-[11px] text-slate-500 font-bold leading-4">{s.label} <span className="text-slate-300">•</span> <span className="text-slate-400 font-semibold">{s.sub}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* شريط التشغيل: بحث + فلاتر */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-3">
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-3 sm:px-4 pt-3 flex flex-col lg:flex-row lg:items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="دوّر برقم الطلب، اسم العميل، أو رقم الموبايل…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-4 rounded-lg border border-slate-200 bg-slate-50 text-[13px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="h-10 px-3 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-600 bg-white focus:outline-none"
              >
                <option value="all">كل الفترات</option>
                <option value="today">النهاردة</option>
                <option value="week">آخر ٧ أيام</option>
                <option value="month">آخر ٣٠ يوم</option>
              </select>
              <select
                value={amountRange}
                onChange={(e) => setAmountRange(e.target.value as any)}
                className="h-10 px-3 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-600 bg-white focus:outline-none"
              >
                <option value="all">كل المبالغ</option>
                <option value="under100">أقل من ١٠٠ ج.م</option>
                <option value="100to500">١٠٠ – ٥٠٠ ج.م</option>
                <option value="over500">أكتر من ٥٠٠ ج.م</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="hidden md:block h-10 px-3 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-600 bg-white focus:outline-none"
              >
                <option value="date">الأحدث أولاً</option>
                <option value="amount">الأعلى قيمة</option>
                <option value="status">حسب الحالة</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-10 w-10 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center"
                title={sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
              >
                <ArrowUpDown size={15} />
              </button>
            </div>
          </div>

          {/* تبويبات الحالة */}
          <div className="px-3 sm:px-4 py-2.5 flex gap-1.5 overflow-x-auto border-t border-slate-100 mt-2.5">
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
              onClick={() => { setFilter(f.id); setCurrentPage(1); }}
              className={`h-8 px-3 rounded-lg text-[12px] font-bold border whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
                <span className={`text-[10px] font-extrabold tabular-nums rounded px-1.5 py-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
          );
        })}
          </div>
        </div>
      </div>

      {/* إجراءات جماعية */}
      {selectedIds.size > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-3">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 rounded-xl text-white">
          <span className="text-[12px] font-bold">محدد {selectedIds.size} طلب</span>
          <span className="flex-1" />
          <button
            onClick={() => bulkAction('confirm')}
            disabled={updatingId === 'bulk'}
            className="h-8 px-3 rounded-lg bg-emerald-500 text-white text-[12px] font-bold hover:bg-emerald-600 disabled:opacity-50"
          >
            تأكيد الكل
          </button>
          <button
            onClick={() => bulkAction('reject')}
            disabled={updatingId === 'bulk'}
            className="h-8 px-3 rounded-lg bg-white/10 text-white text-[12px] font-bold hover:bg-white/20 disabled:opacity-50"
          >
            رفض الكل
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="h-8 px-3 rounded-lg text-white/70 text-[12px] font-bold hover:text-white"
          >
            إلغاء
          </button>
        </div>
        </div>
      )}

      {/* قائمة الطلبات */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-3 pb-10">
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl py-16 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-[12px] font-bold text-slate-400">جاري تحميل الطلبات…</p>
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
              <div key={id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-3.5 py-3 flex items-start gap-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[13px] font-extrabold text-slate-900 tabular-nums">#{id.slice(0, 8).toUpperCase()}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.cls}`}>{meta.label}</span>
                    </div>
                    <div className="mt-1 text-[12px] font-bold text-slate-700 truncate">{order.customerName || order.customer_name || order.user?.name || 'عميل'} <span className="text-slate-400 font-semibold" dir="ltr">{order.customerPhone || order.customer_phone || order.user?.phone || order.phone || ''}</span></div>
                    <div className="text-[11px] text-slate-400 font-semibold tabular-nums">{new Date(order.createdAt || order.created_at || Date.now()).toLocaleString('ar-EG', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })} • {order.items?.length || 0} أصناف</div>
                    <div className="mt-1 text-[11px] text-slate-500 font-semibold leading-5 line-clamp-2">{formatOrderItemsSummary(order.items, true) || '—'}</div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="text-[14px] font-extrabold text-slate-900 tabular-nums">{Number(order.total || 0).toLocaleString('ar-EG')} <span className="text-[10px] font-bold text-slate-400">ج.م</span></div>
                    {busy && <Loader2 size={14} className="animate-spin text-slate-400 mt-1 ml-auto" />}
                  </div>
                </div>

                {(canAccept || canPrepare || canReady || canReject) && !busy && (
                  <div className="px-3.5 pb-3 flex gap-1.5">
                    {canAccept && (
                      <>
                        <button onClick={() => updateStatus(id, 'CONFIRMED')} className="flex-1 h-9 rounded-lg bg-emerald-600 text-white text-[12px] font-bold">تأكيد</button>
                        <button onClick={() => updateStatus(id, 'CANCELLED')} className="flex-1 h-9 rounded-lg bg-white border border-red-200 text-red-600 text-[12px] font-bold">رفض</button>
                      </>
                    )}
                    {canPrepare && !canAccept && <button onClick={() => updateStatus(id, 'PREPARING')} className="flex-1 h-9 rounded-lg bg-slate-900 text-white text-[12px] font-bold">بدء التجهيز</button>}
                    {canReady && !canAccept && !canPrepare && <button onClick={() => updateStatus(id, 'READY')} className="flex-1 h-9 rounded-lg bg-slate-900 text-white text-[12px] font-bold">{isRestaurant ? 'جاهز للتقديم' : 'جاهز'}</button>}
                    <button onClick={() => setSelectedOrder(order)} className="h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[12px] font-bold">التفاصيل</button>
                  </div>
                )}
              </div>

            );
          })}
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-xl mt-3 overflow-hidden">
          <table className="w-full text-right border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-3 py-2.5 w-10">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0 ? <CheckSquare size={16} className="text-slate-900" /> : <Square size={16} className="text-slate-300" />}
                  </button>
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">الطلب</th>
                <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">العميل</th>
                <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">الأصناف</th>
                <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">الحالة</th>
                <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">التوصيل</th>
                <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">الإجمالي</th>
                <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">إجراء سريع</th>
                <th className="px-3 py-2.5 w-16"></th>
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
                  <tr key={id} className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors ${status === 'PENDING' ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-3 py-3">
                      <button onClick={() => toggleSelect(id)} className="p-1">
                        {selectedIds.has(id) ? <CheckSquare size={16} className="text-slate-900" /> : <Square size={16} className="text-slate-300" />}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-[13px] font-extrabold text-slate-900 tabular-nums">#{id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-[11px] text-slate-400 font-semibold tabular-nums">{new Date(order.createdAt || order.created_at || Date.now()).toLocaleString('ar-EG', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-[12px] font-bold text-slate-800 max-w-[150px] truncate">{order.customerName || order.customer_name || order.user?.name || 'عميل'}</div>
                      <div className="text-[11px] text-slate-400 font-semibold tabular-nums" dir="ltr" style={{ textAlign: 'right' }}>{order.customerPhone || order.customer_phone || order.user?.phone || order.phone || '—'}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-[11px] text-slate-600 font-semibold max-w-[220px] truncate" title={formatOrderItemsSummary(order.items, true)}>{formatOrderItemsSummary(order.items, true) || '—'}</div>
                      <div className="text-[11px] text-slate-400 font-bold">{order.items?.length || 0} أصناف</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center text-[11px] font-bold px-2 py-1 rounded-md border whitespace-nowrap ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-[12px] text-slate-600 font-bold whitespace-nowrap">
                        {deliveryManagedByShop ? 'استلام ذاتي' : deliveryFeeText}
                      </div>
                      {address && !deliveryManagedByShop && (
                        <div className="text-[11px] text-slate-400 font-semibold truncate max-w-[160px]">{address}</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-[13px] font-extrabold text-slate-900 tabular-nums whitespace-nowrap">{Number(order.total || 0).toLocaleString('ar-EG')} <span className="text-[10px] font-bold text-slate-400">ج.م</span></div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        {busy ? (
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><Loader2 size={13} className="animate-spin" /> جاري…</span>
                        ) : (
                          <>
                            {canAccept && (
                              <>
                                <button onClick={() => updateStatus(id, 'CONFIRMED')} className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700">تأكيد</button>
                                <button onClick={() => updateStatus(id, 'CANCELLED')} className="h-8 px-3 rounded-lg bg-white border border-red-200 text-red-600 text-[11px] font-bold hover:bg-red-50">رفض</button>
                              </>
                            )}
                            {canPrepare && <button onClick={() => updateStatus(id, 'PREPARING')} className="h-8 px-3 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-700">تجهيز</button>}
                            {canReady && <button onClick={() => updateStatus(id, 'READY')} className="h-8 px-3 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-700">{isRestaurant ? 'جاهز للتقديم' : 'جاهز'}</button>}
                            {!canAccept && !canPrepare && !canReady && <span className="text-[11px] font-bold text-slate-300">—</span>}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100" title="التفاصيل">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => printInvoice(order)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100" title="طباعة">
                          <Printer size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>\r\n          </div>\r\n
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
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <h2 className="text-[15px] font-extrabold text-slate-900">تفاصيل الطلب <span className="text-slate-400 font-bold">#{String(selectedOrder.id || '').slice(0, 8).toUpperCase()}</span></h2>
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
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="text-[11px] font-bold text-slate-400">رقم الطلب</div>
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
