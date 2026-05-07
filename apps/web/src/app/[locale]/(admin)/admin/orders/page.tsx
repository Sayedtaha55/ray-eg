'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Search, Loader2, UserPlus, ExternalLink } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { adminGetOrders, adminUpdateOrder, adminAssignCourier, adminGetCouriers } from '@/lib/api/admin';

const formatStatus = (status: string, t: (key: string, fb?: string) => string) => {
  const s = String(status || '').toUpperCase();
  if (s === 'DELIVERED') return { label: t('admin.orders.statusDelivered', 'تم التوصيل'), cls: 'bg-green-500/10 text-green-500' };
  if (s === 'READY') return { label: t('admin.orders.statusReady', 'جاهز'), cls: 'bg-blue-500/10 text-blue-500' };
  if (s === 'PREPARING') return { label: t('admin.orders.statusPreparing', 'قيد التحضير'), cls: 'bg-amber-500/10 text-amber-500' };
  if (s === 'CONFIRMED') return { label: t('admin.orders.statusConfirmed', 'مؤكد'), cls: 'bg-amber-500/10 text-amber-500' };
  if (s === 'CANCELLED') return { label: t('admin.orders.statusCancelled', 'ملغي'), cls: 'bg-red-500/10 text-red-500' };
  return { label: t('admin.orders.statusReviewing', 'قيد المراجعة'), cls: 'bg-amber-500/10 text-amber-500' };
};

export default function AdminOrdersPage() {
  const t = useT();
  const { dir } = useLocale();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [couriers, setCouriers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [o, c] = await Promise.all([adminGetOrders(), adminGetCouriers()]);
        setOrders(Array.isArray(o) ? o : []);
        setCouriers(Array.isArray(c) ? c : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const assignCourier = async (order: any) => {
    if (!couriers.length) {
      alert(t('admin.orders.noCouriersAlert', 'لا يوجد مندوبين'));
      return;
    }
    const options = couriers.map((c) => `${c.id}::${c.name || c.email || c.phone || c.id}`).join('\n');
    const raw = prompt(`${t('admin.orders.selectCourierPrompt', 'اختر مندوب:')}\n${options}`, order?.courier?.id || '');
    if (!raw) return;
    const courierId = String(raw).split('::')[0].trim();
    if (!courierId) return;
    try {
      const updated = await adminAssignCourier(String(order.id), courierId);
      setOrders((prev) => prev.map((o) => (String(o.id) === String(updated?.id) ? { ...o, ...updated } : o)));
    } catch (e: any) {
      alert(e?.message || t('admin.orders.assignFailed', 'فشل تعيين المندوب'));
    }
  };

  const filteredOrders = searchTerm
    ? orders.filter((o) =>
        String(o.id || '').includes(searchTerm) ||
        String(o.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : orders;

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" /></div>;
  }

  return (
    <div className="space-y-8" dir={dir}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">{t('admin.orders.title', 'الطلبات')}</h2>
            <p className="text-slate-500 text-sm font-bold">{t('admin.orders.subtitle', 'إدارة طلبات المنصة')}</p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm"
            placeholder={t('admin.orders.searchPlaceholder', 'ابحث برقم العملية...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.orders.table.operationId', 'رقم العملية')}</th>
                <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.orders.table.date', 'التاريخ')}</th>
                <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.orders.table.amount', 'المبلغ')}</th>
                <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.orders.table.payment', 'الدفع')}</th>
                <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.orders.table.courier', 'المندوب')}</th>
                <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.orders.table.status', 'الحالة')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const meta = formatStatus(order.status, t);
                return (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 font-black text-white">#{String(order.id || '').slice(0, 8)}</td>
                    <td className="p-6 text-slate-500 text-sm">
                      {order.created_at ? new Date(order.created_at).toLocaleString('ar-EG') : '-'}
                    </td>
                    <td className="p-6">
                      <span className="text-[#00E5FF] font-black">
                        {t('admin.orders.egp', 'ج.م')} {Number(order.total || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-6 text-slate-200 font-black text-xs">
                      {String(order.paymentMethod || order.payment_method || '-')}
                    </td>
                    <td className="p-6">
                      <button
                        onClick={() => assignCourier(order)}
                        className="inline-flex items-center gap-2 text-slate-200 font-black text-xs hover:text-[#00E5FF] transition-colors"
                      >
                        <UserPlus size={14} />
                        {order?.courier?.name || order?.courier?.email || t('admin.orders.assign', 'تعيين')}
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

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3 p-3">
          {filteredOrders.map((order) => {
            const meta = formatStatus(order.status, t);
            return (
              <div key={order.id} className="bg-slate-800/50 border border-white/5 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-black text-sm">#{String(order.id || '').slice(0, 8)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${meta.cls}`}>{meta.label}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {order.created_at ? new Date(order.created_at).toLocaleString('ar-EG') : '-'}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('admin.orders.amount', 'المبلغ')}:</span>
                    <span className="text-[#00E5FF] font-black">{t('admin.orders.egp', 'ج.م')} {Number(order.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('admin.orders.payment', 'الدفع')}:</span>
                    <span className="text-slate-200 font-black">{String(order.paymentMethod || order.payment_method || '-')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('admin.orders.courier', 'المندوب')}:</span>
                    <button onClick={() => assignCourier(order)} className="inline-flex items-center gap-1 text-slate-200 font-black hover:text-[#00E5FF] transition-colors">
                      <UserPlus size={10} />
                      {order?.courier?.name || t('admin.orders.assign', 'تعيين')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 text-slate-500 font-bold">{t('admin.orders.noOrders', 'لا توجد طلبات')}</div>
        )}
      </div>
    </div>
  );
}
