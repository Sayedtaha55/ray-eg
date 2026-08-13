import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Eye, ArrowUpRight, ArrowDownRight, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

const OverviewPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState([
    { label: isArabic ? 'الإيرادات' : 'Revenue', value: `${t('business.reports.currency')} 0`, change: '+0%', up: true, icon: <DollarSign size={20} />, color: 'bg-green-50 text-green-600' },
    { label: isArabic ? 'الطلبات' : 'Orders', value: '0', change: '+0%', up: true, icon: <ShoppingCart size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: isArabic ? 'العملاء' : 'Customers', value: '0', change: '+0%', up: true, icon: <Users size={20} />, color: 'bg-purple-50 text-purple-600' },
    { label: isArabic ? 'المشاهدات' : 'Views', value: '0', change: '+0%', up: false, icon: <Eye size={20} />, color: 'bg-amber-50 text-amber-600' },
  ]);
  const [weeklyData, setWeeklyData] = useState([
    { day: isArabic ? 'سبت' : 'Sat', value: 0 },
    { day: isArabic ? 'أحد' : 'Sun', value: 0 },
    { day: isArabic ? 'إثنين' : 'Mon', value: 0 },
    { day: isArabic ? 'ثلاثاء' : 'Tue', value: 0 },
    { day: isArabic ? 'أربعاء' : 'Wed', value: 0 },
    { day: isArabic ? 'خميس' : 'Thu', value: 0 },
    { day: isArabic ? 'جمعة' : 'Fri', value: 0 },
  ]);
  const [topProducts, setTopProducts] = useState([
    { name: isArabic ? 'منتج أ' : 'Product A', sales: 0, revenue: 0 },
    { name: isArabic ? 'منتج ب' : 'Product B', sales: 0, revenue: 0 },
    { name: isArabic ? 'منتج ج' : 'Product C', sales: 0, revenue: 0 },
    { name: isArabic ? 'منتج د' : 'Product D', sales: 0, revenue: 0 },
  ]);

  useEffect(() => {
    const sid = String(shopId || '').trim();
    if (!sid) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res: any = await ApiService.getAnalyticsOverview(sid, { period: '30d' });
        if (cancelled || !res) return;
        const data = res.data ?? res;
        if (Array.isArray(data?.stats) && data.stats.length) {
          const iconMap: Record<string, React.ReactNode> = {
            dollar: <DollarSign size={20} />,
            cart: <ShoppingCart size={20} />,
            users: <Users size={20} />,
            eye: <Eye size={20} />,
          };
          setStats(
            data.stats.map((s: any) => ({
              label: isArabic ? (s.label_ar || s.labelAr || s.label) : s.label,
              value: String(s.value || '0'),
              change: String(s.change || '+0%'),
              up: Boolean(s.up),
              icon: iconMap[s.icon] || <TrendingUp size={20} />,
              color: String(s.color || 'bg-slate-50 text-slate-600'),
            })),
          );
        }
        if (Array.isArray(data?.weekly_data) && data.weekly_data.length) {
          setWeeklyData(
            data.weekly_data.map((w: any) => ({
              day: String(w.day || ''),
              value: Number(w.value || 0),
            })),
          );
        }
        if (Array.isArray(data?.top_products)) {
          setTopProducts(
            data.top_products.map((p: any) => ({
              name: String(p.name || ''),
              sales: Number(p.sales || 0),
              revenue: Number(p.revenue || 0),
            })),
          );
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load overview');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [shopId, isArabic, t]);

  const maxVal = Math.max(...weeklyData.map(d => d.value), 1);

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'نظرة عامة' : 'Analytics Overview'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'ملخص أداء المتجر' : 'Store performance summary'}</p></div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
      {error && !loading && (
        <div className="flex items-center gap-2 p-4 mb-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

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
