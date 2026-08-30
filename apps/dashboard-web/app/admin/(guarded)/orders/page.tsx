'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard, Search, Loader2, ShoppingBag, UserPlus, Filter,
  TrendingUp, Package,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { fetchAdminOrders } from '@/lib/api/orders';
import { useToast } from '@/components/settings/ToastProvider';

const asCleanText = (v: any) => {
  const s = typeof v === 'string' ? v : (v == null ? '' : String(v));
  const t = s.trim();
  return t ? t : '';
};

const formatVariantSelectionCompact = (raw: any) => {
  if (!raw || typeof raw !== 'object') return '';
  const kind = asCleanText(raw?.kind).toLowerCase();
  if (kind === 'pack') return asCleanText(raw?.label || raw?.packName);
  if (kind === 'fashion') {
    const color = asCleanText(raw?.colorName || raw?.color || raw?.colorValue);
    const size = asCleanText(raw?.size);
    return [color, size].filter(Boolean).join(' ');
  }
  const size = asCleanText(raw?.sizeLabel || raw?.sizeName || raw?.size);
  const type = asCleanText(raw?.typeLabel || raw?.typeName || raw?.type);
  return [type, size].filter(Boolean).join(' ');
};

const formatAddonsCompactParts = (raw: any): string[] => {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : null);
  if (!Array.isArray(list) || list.length === 0) return [];
  return list.map((a: any) => {
    if (typeof a === 'string') return asCleanText(a);
    if (!a || typeof a !== 'object') return '';
    const name = asCleanText(a?.optionName || a?.name || a?.title || a?.label);
    const size = asCleanText(a?.variantLabel || a?.variant || a?.size || a?.sizeLabel);
    const priceRaw = typeof a?.price === 'number' ? a.price : Number(a?.price ?? NaN);
    const priceText = Number.isFinite(priceRaw) && priceRaw >= 0 ? ` ج.م ${Math.round(priceRaw * 100) / 100}` : '';
    const core = [name, size].filter(Boolean).join(' ');
    return core ? `${core}${priceText}`.trim() : '';
  }).filter(Boolean);
};

const formatOrderItemsFull = (order: any) => {
  const items = Array.isArray(order?.items) ? order.items : [];
  if (items.length === 0) return '';
  const parts = items.map((it: any) => {
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
  return parts.join(' + ');
};

const formatStatus = (status: any) => {
  const s = String(status || '').toUpperCase();
  if (s === 'DELIVERED') return { label: 'تم التوصيل', cls: 'bg-green-500/10 text-green-500' };
  if (s === 'READY') return { label: 'جاهز', cls: 'bg-blue-500/10 text-blue-500' };
  if (s === 'PREPARING') return { label: 'قيد التحضير', cls: 'bg-amber-500/10 text-amber-500' };
  if (s === 'CONFIRMED') return { label: 'مؤكد', cls: 'bg-amber-500/10 text-amber-500' };
  if (s === 'CANCELLED') return { label: 'ملغي', cls: 'bg-red-500/10 text-red-500' };
  return { label: 'قيد المراجعة', cls: 'bg-amber-500/10 text-amber-500' };
};

const parseCodLocation = (notes: any) => {
  try {
    const raw = typeof notes === 'string' ? notes : '';
    const prefix = 'COD_LOCATION:';
    const start = raw.indexOf(prefix);
    if (start < 0) return null;
    const after = raw.slice(start + prefix.length);
    const nl = after.search(/\r?\n/);
    const json = (nl === -1 ? after : after.slice(0, nl)).trim();
    if (!json) return null;
    const parsed = JSON.parse(json);
    const lat = Number(parsed?.coords?.lat);
    const lng = Number(parsed?.coords?.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng, note: parsed?.note, address: parsed?.address };
  } catch { return null; }
};

const getDeliveryFeeFromNotes = (notes: any): number | null => {
  const raw = typeof notes === 'string' ? notes : '';
  if (!raw) return null;
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const feeLine = lines.find((l) => l.toUpperCase().startsWith('DELIVERY_FEE:'));
  if (!feeLine) return null;
  const value = feeLine.split(':').slice(1).join(':').trim();
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { orders } = await fetchAdminOrders({ limit: 200 });
        setOrders(Array.isArray(orders) ? orders : []);
      } catch { setOrders([]); }
      finally { setLoading(false); }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    const loadCouriers = async () => {
      try {
        const data = await apiRequest('/couriers');
        setCouriers(Array.isArray(data) ? data : []);
      } catch { setCouriers([]); }
    };
    loadCouriers();
  }, []);

  const editDeliveryFee = async (order: any) => {
    const current = getDeliveryFeeFromNotes(order?.notes);
    const raw = window.prompt('رسوم التوصيل (ج.م):', current != null ? String(current) : '');
    if (raw == null) return;
    const fee = Number(String(raw).trim());
    if (Number.isNaN(fee) || fee < 0) return;
    try {
      const updated = await apiRequest(`/orders/${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ deliveryFee: fee }),
      });
      setOrders((prev) => prev.map((o) => (String(o.id) === String(updated?.id) ? { ...o, ...updated } : o)));
      toast({ title: 'تم تحديث رسوم التوصيل', variant: 'success' });
    } catch {
      toast({ title: 'فشل تحديث الرسوم', variant: 'destructive' });
    }
  };

  const assignCourier = async (order: any) => {
    if (!couriers.length) {
      window.alert('لا يوجد مندوبون. أنشئ مندوباً من صفحة التوصيل.');
      return;
    }
    const current = order?.courier?.id ? String(order.courier.id) : '';
    const options = couriers.map((c) => `${c.id}::${c.name || c.email || c.phone || c.id}`).join('\n');
    const raw = window.prompt(`اختر مندوب:\n${options}`, current);
    if (!raw) return;
    const courierId = String(raw).split('::')[0].trim();
    if (!courierId) return;
    try {
      const updated = await apiRequest(`/orders/${order.id}/courier`, {
        method: 'PATCH',
        body: JSON.stringify({ courierId }),
      });
      setOrders((prev) => prev.map((o) => (String(o.id) === String(updated?.id) ? { ...o, ...updated } : o)));
      toast({ title: 'تم تعيين المندوب', variant: 'success' });
    } catch (e: any) {
      toast({ title: e?.message || 'فشل تعيين المندوب', variant: 'destructive' });
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = !searchTerm ||
        String(order?.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(order?.shop?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || String(order?.status || '').toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const paginatedOrders = filteredOrders.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const stats = useMemo(() => ({
    total: orders.length,
    revenue: orders.reduce((s, o) => s + Number(o?.total || 0), 0),
    delivered: orders.filter((o) => String(o?.status || '').toUpperCase() === 'DELIVERED').length,
    pending: orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(String(o?.status || '').toUpperCase())).length,
  }), [orders]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">إدارة العمليات</h2>
            <p className="text-slate-500 text-sm font-bold">عرض وإدارة جميع الطلبات على المنصة</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto">
          {[
            ['إجمالي الطلبات', stats.total, 'text-white', ShoppingBag],
            ['الإيرادات', `${stats.revenue.toLocaleString()} ج.م`, 'text-[#00E5FF]', TrendingUp],
            ['تم التوصيل', stats.delivered, 'text-green-400', Package],
            ['قيد التنفيذ', stats.pending, 'text-amber-400', Filter],
          ].map(([label, val, color, Icon]: any) => (
            <div key={label} className="rounded-2xl bg-slate-900/70 border border-white/5 px-4 py-3 text-center">
              <Icon size={16} className={`mx-auto mb-1 ${color}`} />
              <div className="text-slate-500 text-[10px] font-black">{label}</div>
              <div className={`mt-1 text-lg font-black ${color}`}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden">
        <div className="flex flex-col md:flex-row gap-3 p-6 border-b border-white/5">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm"
              placeholder="ابحث برقم العملية أو اسم المتجر..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-4 py-3 bg-slate-900 border border-white/5 rounded-xl text-white text-sm font-bold outline-none focus:border-[#00E5FF]/50"
          >
            <option value="all">كل الحالات</option>
            <option value="PENDING">قيد المراجعة</option>
            <option value="CONFIRMED">مؤكد</option>
            <option value="PREPARING">قيد التحضير</option>
            <option value="READY">جاهز</option>
            <option value="DELIVERED">تم التوصيل</option>
            <option value="CANCELLED">ملغي</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#00E5FF]" />
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">رقم العملية</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">التاريخ</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">المنتجات</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">المبلغ</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">التوصيل</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">الدفع</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">الموقع</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">المندوب</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => {
                    const meta = formatStatus(order.status);
                    const itemsText = formatOrderItemsFull(order);
                    const fee = getDeliveryFeeFromNotes(order.notes);
                    const loc = parseCodLocation(order.notes);
                    return (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-6 font-black text-white">#{String(order.id || '').slice(0, 8)}</td>
                        <td className="p-6 text-slate-500 text-sm">
                          {order?.createdAt ? new Date(order.createdAt).toLocaleString('ar-EG') : '-'}
                        </td>
                        <td className="p-6 text-slate-200 font-black text-xs max-w-[420px]">
                          <div className="whitespace-normal break-words" title={itemsText || ''}>
                            {itemsText || '-'}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="text-[#00E5FF] font-black">ج.م {Number(order?.total || 0).toLocaleString()}</span>
                        </td>
                        <td className="p-6">
                          <button
                            onClick={() => editDeliveryFee(order)}
                            className="text-slate-200 font-black text-xs hover:text-[#00E5FF] transition-colors"
                          >
                            {fee == null ? 'تحديد' : `${fee} ج.م`}
                          </button>
                        </td>
                        <td className="p-6">
                          <span className="text-slate-200 font-black text-xs">
                            {String(order?.paymentMethod || order?.payment_method || '-')}
                          </span>
                        </td>
                        <td className="p-6">
                          {loc ? (
                            <a
                              href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#00E5FF] font-black text-xs hover:underline"
                            >
                              فتح الخريطة
                            </a>
                          ) : (
                            <span className="text-slate-500 text-xs font-bold">-</span>
                          )}
                        </td>
                        <td className="p-6">
                          <button
                            onClick={() => assignCourier(order)}
                            className="inline-flex items-center gap-2 text-slate-200 font-black text-xs hover:text-[#00E5FF] transition-colors"
                          >
                            <UserPlus size={14} />
                            {order?.courier?.name || 'تعيين'}
                          </button>
                        </td>
                        <td className="p-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-3 p-3">
              {paginatedOrders.map((order) => {
                const meta = formatStatus(order.status);
                const fee = getDeliveryFeeFromNotes(order.notes);
                const loc = parseCodLocation(order.notes);
                const itemsText = formatOrderItemsFull(order);
                return (
                  <div key={order.id} className="bg-slate-800/50 border border-white/5 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-black text-sm">#{String(order.id || '').slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {order?.createdAt ? new Date(order.createdAt).toLocaleString('ar-EG') : '-'}
                    </div>
                    {itemsText && (
                      <div className="text-xs text-slate-200 font-black whitespace-normal break-words">{itemsText}</div>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">المبلغ:</span>
                        <span className="text-[#00E5FF] font-black">ج.م {Number(order?.total || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">الرسوم:</span>
                        <button onClick={() => editDeliveryFee(order)} className="text-slate-200 font-black hover:text-[#00E5FF]">
                          {fee == null ? 'تحديد' : `${fee} ج.م`}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">الدفع:</span>
                        <span className="text-slate-200 font-black">{String(order?.paymentMethod || order?.payment_method || '-')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">المندوب:</span>
                        <button onClick={() => assignCourier(order)} className="inline-flex items-center gap-1 text-slate-200 font-black hover:text-[#00E5FF]">
                          <UserPlus size={10} />
                          {order?.courier?.name || 'تعيين'}
                        </button>
                      </div>
                    </div>
                    {loc && (
                      <a
                        href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00E5FF] font-black hover:underline text-xs block"
                      >
                        فتح الخريطة
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <span className="text-slate-500 text-xs font-bold">
              صفحة {page + 1} من {totalPages} ({filteredOrders.length} طلب)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-200 text-xs font-black disabled:opacity-40"
              >
                السابق
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-200 text-xs font-black disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
