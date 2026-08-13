'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CheckCircle2, Clock, XCircle, Eye, MoreVertical, Loader2,
  ShoppingCart, DollarSign, Package2, MapPin, RotateCcw, CreditCard,
  Gift, Repeat, Zap, Truck,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';

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
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'قيد الانتظار', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'مؤكد', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PREPARING: { label: 'قيد التجهيز', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  READY: { label: 'جاهز', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  HANDED_TO_COURIER: { label: 'سُلّم للمندوب', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  DELIVERED: { label: 'تم التوصيل', cls: 'bg-green-50 text-green-700 border-green-200' },
  CANCELLED: { label: 'ملغي', cls: 'bg-red-50 text-red-700 border-red-200' },
  REFUNDED: { label: 'مسترجع', cls: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
};

type SubPageConfig = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  statusFilter?: string[];
  emptyMessage: string;
};

const CONFIGS: Record<string, SubPageConfig> = {
  quotes: {
    title: 'عروض الأسعار',
    subtitle: 'إدارة عروض الأسعار المرسلة للعملاء',
    icon: FileText,
    emptyMessage: 'لا توجد عروض أسعار حالياً',
  },
  returns: {
    title: 'المرتجعات',
    subtitle: 'إدارة طلبات الإرجاع والاسترداد',
    icon: RotateCcw,
    statusFilter: ['REFUNDED'],
    emptyMessage: 'لا توجد مرتجعات حالياً',
  },
  payments: {
    title: 'المدفوعات',
    subtitle: 'متابعة المدفوعات والمتحصلات',
    icon: CreditCard,
    statusFilter: ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'],
    emptyMessage: 'لا توجد مدفوعات حالياً',
  },
  loyalty: {
    title: 'ولاء العملاء',
    subtitle: 'برامج مكافآت ونقاط العملاء',
    icon: Gift,
    emptyMessage: 'لا توجد بيانات ولاء حالياً',
  },
  subscriptions: {
    title: 'الاشتراكات',
    subtitle: 'إدارة اشتراكات العملاء المتكررة',
    icon: Repeat,
    emptyMessage: 'لا توجد اشتراكات حالياً',
  },
  epayment: {
    title: 'الدفع الإلكتروني',
    subtitle: 'مدفوعات البطاقات والمحافظ الإلكترونية',
    icon: Zap,
    emptyMessage: 'لا توجد مدفوعات إلكترونية حالياً',
  },
  'order-status': {
    title: 'حالة الطلب',
    subtitle: 'تتبع حالة الطلبات',
    icon: Truck,
    emptyMessage: 'لا توجد طلبات للتتبع',
  },
  'abandoned-cart': {
    title: 'السلات المتروكة',
    subtitle: 'السلات التي لم تكتمل عملية الشراء',
    icon: ShoppingCart,
    emptyMessage: 'لا توجد سلات متروكة حالياً',
  },
};

function formatItemsSummary(order: Order): string {
  const items = Array.isArray(order?.items) ? order.items : [];
  if (!items.length) return '-';
  const parts = items.slice(0, 3).map((it: any) => {
    const name = it?.product?.name || it?.name || it?.title || '';
    const qty = Number(it?.quantity || it?.qty || 1);
    const qtyText = qty > 1 ? ` × ${qty}` : '';
    return `${name}${qtyText}`;
  }).filter(Boolean);
  const more = items.length > 3 ? ` +${items.length - 3}` : '';
  return `${parts.join(' + ')}${more}`;
}

export { CONFIGS, STATUS_META, formatItemsSummary };
export type { Order, SubPageConfig };

import { FileText } from 'lucide-react';

export default function SalesSubPage({ pageId }: { pageId: keyof typeof CONFIGS }) {
  const config = CONFIGS[pageId];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/orders/me');
      const list = Array.isArray(data) ? data : (data?.orders || data?.data || []);
      setOrders(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (!config.statusFilter) return orders;
    return orders.filter((o) =>
      config.statusFilter!.includes(String(o.status || '').toUpperCase())
    );
  }, [orders, config]);

  const Icon = config.icon;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-row-reverse">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Icon size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{config.title}</h1>
          <p className="text-sm font-bold text-slate-400 mt-1">{config.subtitle}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-right">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
          <span className="text-slate-500 font-semibold text-xs mb-1">العدد</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">{filteredOrders.length}</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
          <span className="text-slate-500 font-semibold text-xs mb-1">الإجمالي</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">
            ج.م {filteredOrders.reduce((s, o) => s + Number(o.total || 0), 0).toLocaleString()}
          </span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
          <span className="text-slate-500 font-semibold text-xs mb-1">متوسط الطلب</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">
            ج.م {filteredOrders.length > 0
              ? Math.round(filteredOrders.reduce((s, o) => s + Number(o.total || 0), 0) / filteredOrders.length).toLocaleString()
              : 0}
          </span>
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Icon size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">{config.emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const id = String(order.id || '');
            const status = String(order.status || '').toUpperCase();
            const meta = STATUS_META[status] || { label: status, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
            const address = String(
              order?.deliveryAddressManual ||
              order?.delivery_address_manual ||
              order?.deliveryAddress ||
              order?.delivery_address ||
              ''
            ).trim();

            return (
              <div key={id} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-sm sm:text-base">{formatItemsSummary(order)}</div>
                    <div className="text-slate-500 font-medium text-xs mt-1">
                      {new Date(order.createdAt || order.created_at || Date.now()).toLocaleString('ar-EG')}
                    </div>
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

                {address && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{address}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تفاصيل الطلب</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-50 rounded-lg">
                <XCircle size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-4 text-right">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-500">رقم الطلب</div>
                  <div className="mt-1 font-bold text-slate-900 text-sm truncate">{selectedOrder.id}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-500">الحالة</div>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${STATUS_META[String(selectedOrder.status).toUpperCase()]?.cls || ''}`}>
                      {STATUS_META[String(selectedOrder.status).toUpperCase()]?.label || selectedOrder.status}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-500">التاريخ</div>
                  <div className="mt-1 font-bold text-slate-900 text-sm">
                    {new Date(selectedOrder.createdAt || selectedOrder.created_at || Date.now()).toLocaleString('ar-EG')}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-500">الإجمالي</div>
                  <div className="mt-1 font-bold text-slate-900 text-sm">ج.م {Number(selectedOrder.total || 0).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">المنتجات</div>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((it: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 flex-row-reverse">
                      <div className="text-right">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
