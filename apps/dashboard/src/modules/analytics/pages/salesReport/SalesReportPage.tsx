import React, { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

const SalesReportPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const monthlyData = [
    { period: isArabic ? 'يناير' : 'Jan', sales: 32000, orders: 890, avg: 36 },
    { period: isArabic ? 'فبراير' : 'Feb', sales: 38000, orders: 1020, avg: 37 },
    { period: isArabic ? 'مارس' : 'Mar', sales: 35000, orders: 950, avg: 37 },
    { period: isArabic ? 'أبريل' : 'Apr', sales: 42000, orders: 1150, avg: 36.5 },
    { period: isArabic ? 'مايو' : 'May', sales: 45000, orders: 1240, avg: 36.3 },
    { period: isArabic ? 'يونيو' : 'Jun', sales: 41000, orders: 1100, avg: 37.3 },
    { period: isArabic ? 'يوليو' : 'Jul', sales: 45200, orders: 1240, avg: 36.5 },
  ];

  const maxSales = Math.max(...monthlyData.map(d => d.sales));
  const totalSales = monthlyData.reduce((s, d) => s + d.sales, 0);
  const totalOrders = monthlyData.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'تقرير المبيعات' : 'Sales Report'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تحليل تفصيلي للمبيعات' : 'Detailed sales analysis'}</p></div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100">
            {(['daily', 'weekly', 'monthly'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{isArabic ? p === 'daily' ? 'يومي' : p === 'weekly' ? 'أسبوعي' : 'شهري' : p === 'daily' ? 'Daily' : p === 'weekly' ? 'Weekly' : 'Monthly'}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"><Download size={14} /> {isArabic ? 'تصدير' : 'Export'}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي المبيعات' : 'Total Sales', value: `${t('business.reports.currency')} ${totalSales.toLocaleString()}`, color: 'bg-green-50 text-green-600', change: '+12.5%', up: true },
          { label: isArabic ? 'إجمالي الطلبات' : 'Total Orders', value: totalOrders.toLocaleString(), color: 'bg-blue-50 text-blue-600', change: '+8.2%', up: true },
          { label: isArabic ? 'متوسط الطلب' : 'Avg Order', value: `${t('business.reports.currency')} ${Math.round(totalSales / totalOrders)}`, color: 'bg-purple-50 text-purple-600', change: '+2.1%', up: true },
          { label: isArabic ? 'معدل الإرجاع' : 'Return Rate', value: '3.2%', color: 'bg-amber-50 text-amber-600', change: '-0.5%', up: true },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-2"><div className={`p-2 rounded-xl ${s.color}`}><DollarSign size={20} /></div><span className={`text-xs font-bold flex items-center gap-0.5 ${s.up ? 'text-green-600' : 'text-red-600'}`}>{s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{s.change}</span></div>
            <p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl border border-slate-100 mb-4">
        <h4 className="font-black mb-4 flex items-center gap-2"><BarChart3 size={16} /> {isArabic ? 'المبيعات الشهرية' : 'Monthly Sales'}</h4>
        <div className="flex items-end justify-between gap-2 h-48">
          {monthlyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-slate-500">{(d.sales / 1000).toFixed(0)}k</span>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-green-400 to-green-600 transition-all hover:from-green-500 hover:to-green-700" style={{ height: `${(d.sales / maxSales) * 100}%` }} />
              <span className="text-xs text-slate-400 font-bold">{d.period}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-right border-b border-slate-100">
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الفترة' : 'Period'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المبيعات' : 'Sales'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الطلبات' : 'Orders'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'متوسط الطلب' : 'Avg Order'}</th>
          </tr></thead>
          <tbody>
            {monthlyData.map((d, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="py-3 font-bold">{d.period}</td>
                <td className="py-3 text-slate-600">{t('business.reports.currency')} {d.sales.toLocaleString()}</td>
                <td className="py-3 text-slate-600">{d.orders.toLocaleString()}</td>
                <td className="py-3 text-slate-600">{t('business.reports.currency')} {d.avg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReportPage;
