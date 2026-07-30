import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Search, Loader2, Package, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

type OrderStatusItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  items: number;
  total: number;
  date: string;
};

const STATUS_CONFIG: Record<string, { ar: string; en: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100', icon: <Clock size={12} /> },
  confirmed: { ar: 'مؤكد', en: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-100', icon: <CheckCircle2 size={12} /> },
  processing: { ar: 'قيد المعالجة', en: 'Processing', color: 'text-purple-600', bg: 'bg-purple-100', icon: <Package size={12} /> },
  shipped: { ar: 'تم الشحن', en: 'Shipped', color: 'text-indigo-600', bg: 'bg-indigo-100', icon: <Truck size={12} /> },
  delivered: { ar: 'تم التوصيل', en: 'Delivered', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle2 size={12} /> },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle size={12} /> },
  returned: { ar: 'مرتجع', en: 'Returned', color: 'text-orange-600', bg: 'bg-orange-100', icon: <ClipboardList size={12} /> },
};

const OrderStatusPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [orders, setOrders] = useState<OrderStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAllOrders({ shopId });
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      setOrders(data.map((o: any) => ({
        id: String(o.id),
        orderNumber: o.orderNumber || `#${o.id}`,
        customerName: o.customerName || o.customer?.name || '---',
        status: o.status || o.orderStatus || 'pending',
        items: o.items?.length || 0,
        total: Number(o.total || o.totalAmount || 0),
        date: o.createdAt || new Date().toISOString(),
      })));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = Object.keys(STATUS_CONFIG).map(key => ({
    key,
    count: orders.filter(o => o.status === key).length,
    ...STATUS_CONFIG[key],
  }));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'حالات الطلب' : 'Order Status'}</h3>
        <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تتبع حالة جميع الطلبات' : 'Track status of all orders'}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 mb-6">
        {statusCounts.map((s) => (
          <button key={s.key} onClick={() => setFilterStatus(filterStatus === s.key ? 'all' : s.key)} className={`p-3 rounded-xl border text-center transition-all ${filterStatus === s.key ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}>
            <div className={`flex items-center justify-center gap-1 mb-1 ${s.color}`}>
              {s.icon}
              <span className="text-xs font-bold">{isArabic ? s.ar : s.en}</span>
            </div>
            <p className="text-lg font-black">{s.count}</p>
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث برقم الطلب أو العميل...' : 'Search by order or customer...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <ClipboardList size={64} className="mx-auto mb-4 text-slate-200" />
          <p className="font-black text-xl text-slate-300 mb-2">{isArabic ? 'لا توجد طلبات' : 'No orders found'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right border-b border-slate-100">
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'رقم الطلب' : 'Order #'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'العميل' : 'Customer'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'العناصر' : 'Items'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الإجمالي' : 'Total'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'التاريخ' : 'Date'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const st = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                return (
                  <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 font-bold">{o.orderNumber}</td>
                    <td className="py-3 font-medium">{o.customerName}</td>
                    <td className="py-3 text-slate-500">{o.items}</td>
                    <td className="py-3 font-bold">{t('business.reports.currency')} {o.total.toLocaleString()}</td>
                    <td className="py-3"><span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color} w-fit`}>{st.icon} {isArabic ? st.ar : st.en}</span></td>
                    <td className="py-3 text-slate-500">{new Date(o.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderStatusPage;
