import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Loader2, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

const RevenuePage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAllOrders({ shopId });
      setOrders(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch { setOrders([]); } finally { setLoading(false); }
  }, [shopId]);

  useEffect(() => { load(); }, [load]);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || o.totalAmount || 0), 0);
  const todayRevenue = orders.filter(o => new Date(o.createdAt || '').toDateString() === new Date().toDateString()).reduce((s, o) => s + Number(o.total || 0), 0);
  const monthRevenue = orders.filter(o => { const d = new Date(o.createdAt || ''); return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear(); }).reduce((s, o) => s + Number(o.total || 0), 0);
  const avgOrder = orders.length ? totalRevenue / orders.length : 0;

  const stats = [
    { label: isArabic ? 'إجمالي الإيرادات' : 'Total Revenue', value: `${t('business.reports.currency')} ${totalRevenue.toLocaleString()}`, color: 'bg-green-50 text-green-600', icon: <DollarSign size={20} /> },
    { label: isArabic ? 'إيرادات اليوم' : 'Today Revenue', value: `${t('business.reports.currency')} ${todayRevenue.toLocaleString()}`, color: 'bg-blue-50 text-blue-600', icon: <TrendingUp size={20} /> },
    { label: isArabic ? 'إيرادات الشهر' : 'Month Revenue', value: `${t('business.reports.currency')} ${monthRevenue.toLocaleString()}`, color: 'bg-purple-50 text-purple-600', icon: <Calendar size={20} /> },
    { label: isArabic ? 'متوسط الطلب' : 'Avg Order', value: `${t('business.reports.currency')} ${avgOrder.toFixed(0)}`, color: 'bg-amber-50 text-amber-600', icon: <DollarSign size={20} /> },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الإيرادات' : 'Revenue'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تتبع جميع الإيرادات' : 'Track all revenue streams'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
      ) : (
        <div className="space-y-2">
          {orders.slice(0, 10).map((o, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50">
              <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-green-50 text-green-600"><TrendingUp size={16} /></div><div><p className="font-bold text-sm">{o.orderNumber || `#${o.id}`}</p><p className="text-xs text-slate-400">{o.customerName || '---'}</p></div></div>
              <p className="font-black text-green-600">+{t('business.reports.currency')} {Number(o.total || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RevenuePage;
