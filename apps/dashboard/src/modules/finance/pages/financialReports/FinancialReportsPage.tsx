import React, { useState, useEffect, useCallback } from 'react';
import { FileBarChart, Download, Loader2, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

const FinancialReportsPage: React.FC<Props> = ({ shopId, shop }) => {
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

  const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const expenses = orders.length * 200;
  const netProfit = revenue - expenses;

  const reports = [
    { id: 'income', name: isArabic ? 'قائمة الدخل' : 'Income Statement', desc: isArabic ? 'الإيرادات والمصروفات وصافي الربح' : 'Revenue, expenses and net profit', icon: <TrendingUp size={24} />, color: 'bg-green-50 text-green-600' },
    { id: 'balance', name: isArabic ? 'الميزانية العمومية' : 'Balance Sheet', desc: isArabic ? 'الأصول والخصوم وحقوق الملكية' : 'Assets, liabilities and equity', icon: <FileBarChart size={24} />, color: 'bg-blue-50 text-blue-600' },
    { id: 'cashflow', name: isArabic ? 'قائمة التدفقات النقدية' : 'Cash Flow Statement', desc: isArabic ? 'التدفقات النقدية الداخلة والخارجة' : 'Cash inflows and outflows', icon: <DollarSign size={24} />, color: 'bg-purple-50 text-purple-600' },
    { id: 'equity', name: isArabic ? 'قائمة التغيرات في حقوق الملكية' : 'Statement of Changes in Equity', desc: isArabic ? 'تغيرات حقوق الملكية' : 'Changes in equity', icon: <TrendingDown size={24} />, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'التقارير المالية' : 'Financial Reports'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إنشاء وتحميل التقارير المالية' : 'Generate and download financial reports'}</p></div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Download size={16} /> {isArabic ? 'تحميل الكل' : 'Download All'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'الإيرادات' : 'Revenue', value: `${t('business.reports.currency')} ${revenue.toLocaleString()}`, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'المصروفات' : 'Expenses', value: `${t('business.reports.currency')} ${expenses.toLocaleString()}`, color: 'bg-red-50 text-red-600' },
          { label: isArabic ? 'صافي الربح' : 'Net Profit', value: `${t('business.reports.currency')} ${netProfit.toLocaleString()}`, color: netProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600' },
          { label: isArabic ? 'هامش الربح' : 'Profit Margin', value: `${revenue ? Math.round((netProfit / revenue) * 100) : 0}%`, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><FileBarChart size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${r.color}`}>{r.icon}</div>
                <div><p className="font-bold text-sm">{r.name}</p><p className="text-xs text-slate-400">{r.desc}</p></div>
              </div>
              <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"><Download size={18} className="text-slate-600" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinancialReportsPage;
