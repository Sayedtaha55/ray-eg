import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

const OverviewPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const stats = [
    { label: isArabic ? 'الإيرادات' : 'Revenue', value: `${t('business.reports.currency')} 45,200`, change: '+12.5%', up: true, icon: <DollarSign size={20} />, color: 'bg-green-50 text-green-600' },
    { label: isArabic ? 'الطلبات' : 'Orders', value: '1,240', change: '+8.2%', up: true, icon: <ShoppingCart size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: isArabic ? 'العملاء' : 'Customers', value: '856', change: '+5.1%', up: true, icon: <Users size={20} />, color: 'bg-purple-50 text-purple-600' },
    { label: isArabic ? 'المشاهدات' : 'Views', value: '12,500', change: '-2.3%', up: false, icon: <Eye size={20} />, color: 'bg-amber-50 text-amber-600' },
  ];

  const weeklyData = [
    { day: isArabic ? 'سبت' : 'Sat', value: 65 },
    { day: isArabic ? 'أحد' : 'Sun', value: 80 },
    { day: isArabic ? 'إثنين' : 'Mon', value: 45 },
    { day: isArabic ? 'ثلاثاء' : 'Tue', value: 90 },
    { day: isArabic ? 'أربعاء' : 'Wed', value: 70 },
    { day: isArabic ? 'خميس' : 'Thu', value: 95 },
    { day: isArabic ? 'جمعة' : 'Fri', value: 55 },
  ];
  const maxVal = Math.max(...weeklyData.map(d => d.value));

  const topProducts = [
    { name: isArabic ? 'منتج أ' : 'Product A', sales: 320, revenue: 9600 },
    { name: isArabic ? 'منتج ب' : 'Product B', sales: 280, revenue: 8400 },
    { name: isArabic ? 'منتج ج' : 'Product C', sales: 195, revenue: 5850 },
    { name: isArabic ? 'منتج د' : 'Product D', sales: 150, revenue: 4500 },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'نظرة عامة' : 'Analytics Overview'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'ملخص أداء المتجر' : 'Store performance summary'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${s.up ? 'text-green-600' : 'text-red-600'}`}>{s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{s.change}</span>
            </div>
            <p className="text-xs font-bold text-slate-400">{s.label}</p>
            <p className="text-lg font-black">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-slate-100">
          <h4 className="font-black mb-4 flex items-center gap-2"><TrendingUp size={16} /> {isArabic ? 'المبيعات الأسبوعية' : 'Weekly Sales'}</h4>
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-400 to-blue-600 transition-all hover:from-blue-500 hover:to-blue-700" style={{ height: `${(d.value / maxVal) * 100}%` }} />
                <span className="text-xs text-slate-400 font-bold">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-100">
          <h4 className="font-black mb-4 flex items-center gap-2"><ShoppingCart size={16} /> {isArabic ? 'أفضل المنتجات' : 'Top Products'}</h4>
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">{i + 1}</span>
                  <span className="font-bold text-sm">{p.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{p.sales} {isArabic ? 'مبيع' : 'sold'}</p>
                  <p className="text-xs text-slate-400">{t('business.reports.currency')} {p.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
