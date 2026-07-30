import React, { useState, useEffect, useCallback } from 'react';
import { Activity, TrendingUp, TrendingDown, Loader2, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

const CashflowPage: React.FC<Props> = ({ shopId, shop }) => {
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

  const inflows = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const outflows = orders.length * 200;
  const netCashflow = inflows - outflows;

  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const month = new Date(); month.setMonth(month.getMonth() - (5 - i));
    const monthOrders = orders.filter(o => { const d = new Date(o.createdAt || ''); return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear(); });
    const inflow = monthOrders.reduce((s, o) => s + Number(o.total || 0), 0);
    return { month: month.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short' }), inflow, outflow: monthOrders.length * 200 };
  });

  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.inflow, d.outflow)), 1);

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'التدفق النقدي' : 'Cash Flow'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تتبع التدفقات النقدية الداخلة والخارجة' : 'Track cash inflows and outflows'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'التدفقات الداخلة' : 'Inflows', value: `${t('business.reports.currency')} ${inflows.toLocaleString()}`, color: 'bg-green-50 text-green-600', icon: <TrendingUp size={20} /> },
          { label: isArabic ? 'التدفقات الخارجة' : 'Outflows', value: `${t('business.reports.currency')} ${outflows.toLocaleString()}`, color: 'bg-red-50 text-red-600', icon: <TrendingDown size={20} /> },
          { label: isArabic ? 'صافي التدفق' : 'Net Cashflow', value: `${t('business.reports.currency')} ${netCashflow.toLocaleString()}`, color: netCashflow >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600', icon: <Activity size={20} /> },
          { label: isArabic ? 'الرصيد النقدي' : 'Cash Balance', value: `${t('business.reports.currency')} ${netCashflow.toLocaleString()}`, color: 'bg-blue-50 text-blue-600', icon: <Wallet size={20} /> },
        ].map((s, i) => (
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
          <h4 className="font-black mb-4">{isArabic ? 'التدفق النقدي - آخر 6 أشهر' : 'Cash Flow - Last 6 Months'}</h4>
          <div className="flex items-end justify-between gap-2 h-48">
            {monthlyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1 h-40">
                  <div className="w-1/2 rounded-t-lg bg-green-400" style={{ height: `${(d.inflow / maxVal) * 100}%` }} title={`In: ${d.inflow}`} />
                  <div className="w-1/2 rounded-t-lg bg-red-400" style={{ height: `${(d.outflow / maxVal) * 100}%` }} title={`Out: ${d.outflow}`} />
                </div>
                <p className="text-xs font-bold text-slate-500">{d.month}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-green-400" /> {isArabic ? 'داخل' : 'Inflow'}</span>
            <span className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded bg-red-400" /> {isArabic ? 'خارج' : 'Outflow'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashflowPage;
