'use client';

import { useState, useEffect } from 'react';
import { Truck, Loader2, MapPin, Phone, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

export default function AdminDeliveryPage() {
  const t = useT();
  const { dir } = useLocale();
  const [orders, setOrders] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, couriersData] = await Promise.all([
        clientFetch<any>('/v1/orders/admin?status=pending,preparing,ready,out_for_delivery&limit=100'),
        clientFetch<any>('/v1/couriers?limit=50'),
      ]);
      setOrders(Array.isArray(ordersData?.items) ? ordersData.items : Array.isArray(ordersData) ? ordersData : []);
      setCouriers(Array.isArray(couriersData) ? couriersData : []);
    } catch {
      setOrders([]);
      setCouriers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const assignCourier = async (orderId: string, courierId: string) => {
    try {
      await clientFetch<any>(`/v1/orders/${orderId}/assign-courier`, {
        method: 'PATCH',
        body: JSON.stringify({ courierId }),
      });
      loadData();
    } catch {}
  };

  const statusIcon = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'delivered') return <CheckCircle2 size={16} className="text-green-400" />;
    if (s === 'cancelled') return <XCircle size={16} className="text-red-400" />;
    if (s === 'out_for_delivery') return <Truck size={16} className="text-blue-400" />;
    return <AlertCircle size={16} className="text-amber-400" />;
  };

  const statusLabel = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'pending') return t('admin.delivery.pending', 'معلّق');
    if (s === 'preparing') return t('admin.delivery.preparing', 'قيد التحضير');
    if (s === 'ready') return t('admin.delivery.ready', 'جاهز');
    if (s === 'out_for_delivery') return t('admin.delivery.outForDelivery', 'في الطريق');
    if (s === 'delivered') return t('admin.delivery.delivered', 'تم التوصيل');
    if (s === 'cancelled') return t('admin.delivery.cancelled', 'ملغي');
    return status;
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => String(o?.status || '').toLowerCase() === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl"><Truck size={24} /></div>
          <div>
            <h2 className="text-3xl font-black text-white">{t('admin.delivery.title', 'إدارة التوصيل')}</h2>
            <p className="text-slate-500 text-sm font-bold">{t('admin.delivery.subtitle', 'تتبع الطلبات وتعيين المندوبين')}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'preparing', 'ready', 'out_for_delivery'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${filter === s ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}
            >
              {s === 'all' ? t('admin.delivery.allOrders', 'الكل') : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Couriers summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {couriers.slice(0, 4).map((c: any) => (
          <div key={String(c?.id)} className="bg-slate-900 border border-white/5 p-5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center shrink-0"><Truck size={18} /></div>
            <div className="min-w-0">
              <p className="font-black text-white text-sm truncate">{c?.name || c?.user?.name || '—'}</p>
              <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Phone size={10} /> {c?.phone || c?.user?.phone || '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-[3.5rem] p-24 text-center">
          <Truck size={48} className="mx-auto text-slate-700 mb-6" />
          <p className="text-slate-500 font-bold text-xl">{t('admin.delivery.noOrders', 'لا توجد طلبات')}</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="divide-y divide-white/5">
            {filteredOrders.map((order: any) => (
              <div key={String(order?.id)} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {statusIcon(order.status)}
                    <span className="text-slate-200 font-black text-sm">#{String(order?.operationId || order?.id || '').slice(0, 8)}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-white/5 text-slate-400">{statusLabel(order.status)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {order?.shop?.name || order?.shopName || '—'}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {order?.createdAt ? new Date(order.createdAt).toLocaleString('ar-EG') : '—'}</span>
                  </div>
                </div>
                {!order?.courierId && (
                  <select
                    onChange={(e) => assignCourier(String(order.id), e.target.value)}
                    className="px-4 py-2 rounded-2xl text-xs font-black bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10"
                    defaultValue=""
                  >
                    <option value="" disabled>{t('admin.delivery.assignCourier', 'تعيين مندوب')}</option>
                    {couriers.map((c: any) => (
                      <option key={String(c?.id)} value={String(c?.id)}>{c?.name || c?.user?.name || String(c?.id)}</option>
                    ))}
                  </select>
                )}
                {order?.courier && (
                  <span className="text-xs font-bold text-green-400 flex items-center gap-1"><Truck size={12} /> {order.courier.name || order.courier.user?.name || '—'}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
