import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Loader2, Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

const ProfitsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes] = await Promise.all([
        ApiService.getAllOrders({ shopId }),
        ApiService.getProducts(shopId),
      ]);
      setOrders(Array.isArray(ordRes) ? ordRes : (ordRes as any)?.data || []);
      setProducts(Array.isArray(prodRes) ? prodRes : (prodRes as any)?.data || []);
    } catch { setOrders([]); setProducts([]); } finally { setLoading(false); }
  }, [shopId]);

  useEffect(() => { load(); }, [load]);

  const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const cogs = orders.reduce((s, o) => {
    const items = o.items || o.orderItems || [];
    return s + items.reduce((cs: number, it: any) => {
      const prod = products.find(p => String(p.id) === String(it.productId || it.id));
      return cs + Number(prod?.cost || prod?.costPrice || 0) * Number(it.quantity || 1);
    }, 0);
  }, 0);
  const grossProfit = revenue - cogs;
  const margin = revenue ? Math.round((grossProfit / revenue) * 100) : 0;

  const stats = [
    { label: isArabic ? 'إجمالي الإيرادات' : 'Total Revenue', value: `${t('business.reports.currency')} ${revenue.toLocaleString()}`, color: 'bg-blue-50 text-blue-600', icon: <DollarSign size={20} /> },
    { label: isArabic ? 'تكلفة البضاعة' : 'COGS', value: `${t('business.reports.currency')} ${cogs.toLocaleString()}`, color: 'bg-red-50 text-red-600', icon: <TrendingDown size={20} /> },
    { label: isArabic ? 'إجمالي الربح' : 'Gross Profit', value: `${t('business.reports.currency')} ${grossProfit.toLocaleString()}`, color: 'bg-green-50 text-green-600', icon: <TrendingUp size={20} /> },
    { label: isArabic ? 'هامش الربح' : 'Profit Margin', value: `${margin}%`, color: 'bg-purple-50 text-purple-600', icon: <Calculator size={20} /> },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الأرباح' : 'Profits'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تحليل الأرباح والهوامش' : 'Profit and margin analysis'}</p></div>

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
        <div className="p-6 rounded-2xl bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black">{isArabic ? 'ملخص الربحية' : 'Profitability Summary'}</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-500">{isArabic ? 'الإيرادات' : 'Revenue'}</span><span className="font-bold text-green-600">+{t('business.reports.currency')} {revenue.toLocaleString()}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-500">{isArabic ? 'تكلفة البضاعة المباعة' : 'Cost of Goods Sold'}</span><span className="font-bold text-red-600">-{t('business.reports.currency')} {cogs.toLocaleString()}</span></div>
            <div className="h-px bg-slate-200" />
            <div className="flex items-center justify-between"><span className="font-black">{isArabic ? 'صافي الربح' : 'Net Profit'}</span><span className="font-black text-lg text-green-600">{t('business.reports.currency')} {grossProfit.toLocaleString()}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitsPage;
