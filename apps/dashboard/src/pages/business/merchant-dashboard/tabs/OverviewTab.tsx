import React, { useEffect, useMemo, useState } from 'react';
import { Bell, DollarSign, Eye, ShoppingCart, TrendingUp, Users, Repeat, AlertTriangle, Crown, Megaphone, Tag, Plus, Settings } from 'lucide-react';
import ActivityItem from '../components/ActivityItem';
import StatCard from '../components/StatCard';
import { useTranslation } from 'react-i18next';
import { getShopActivityVocabulary } from '@/utils/businessActivityVocabulary';
import { ApiService } from '@/services/api.service';

type Props = {
  shop: any;
  analytics: any;
  notifications: any[];
  onViewAllNotifications?: () => void;
  onNavigate?: (tab: string) => void;
};

const OverviewTab: React.FC<Props> = ({ shop, analytics, notifications, onViewAllNotifications, onNavigate }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const activityVocab = getShopActivityVocabulary(shop, i18n.language);
  const [recharts, setRecharts] = useState<any>(null);
  const [customerStats, setCustomerStats] = useState<any>(null);

  useEffect(() => {
    if (!shop?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await ApiService.getCustomerAnalytics(shop.id);
        if (!cancelled) setCustomerStats(data);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [shop?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('recharts');
        if (cancelled) return;
        setRecharts(mod);
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const R = recharts;

  const safeAnalytics = analytics || {};
  const salesCountToday = safeAnalytics.salesCountToday ?? 0;
  const revenueToday = safeAnalytics.revenueToday ?? 0;
  const totalOrders = safeAnalytics.totalOrders ?? 0;
  const totalRevenue = safeAnalytics.totalRevenue ?? 0;
  const chartData = Array.isArray(safeAnalytics.chartData) ? safeAnalytics.chartData : [];

  const normalizedChartData = useMemo(() => {
    return chartData.map((item: any) => {
      const raw = String(item.name || item.label || item.date || '');
      let name = raw;
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        name = `${d.getDate()}/${d.getMonth() + 1}`;
      } else {
        const m = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (m) {
          const dd = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
          name = `${dd.getDate()}/${dd.getMonth() + 1}`;
        }
      }
      return { ...item, name };
    });
  }, [chartData]);

  const showSalesAnalytics = useMemo(() => {
    const layoutConfig = (shop?.layoutConfig && typeof shop.layoutConfig === 'object') ? shop.layoutConfig : undefined;
    const enabledRaw = layoutConfig?.enabledModules;
    if (!Array.isArray(enabledRaw)) return false;

    const enabled = new Set(
      (enabledRaw || [])
        .map((x: any) =>
          String(
            x?.id ??
            x?.moduleId ??
            x?.module_id ??
            x?.key ??
            x ??
            ''
          )
            .trim()
            .toLowerCase()
        )
        .filter(Boolean)
    );
    return enabled.has('sales');
  }, [shop]);

  const chartBody = useMemo(() => {
    if (!R) return null;
    const { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = R;
    return (
      <ResponsiveContainer width="100%" height={450} minWidth={300} minHeight={400}>
        <AreaChart data={normalizedChartData}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} interval={0} angle={-35} textAnchor="end" height={50} />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              borderRadius: '24px',
              border: 'none',
              boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
              direction: isArabic ? 'rtl' : 'ltr',
              padding: '20px',
            }}
          />
          <Area type="monotone" dataKey="sales" stroke="#00E5FF" strokeWidth={6} fillOpacity={1} fill="url(#colorSales)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }, [R, chartData, isArabic]);

  const customerCards = useMemo(() => {
    if (!customerStats) return null;
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-10">
        <div className="bg-white p-4 sm:p-6 md:p-10 rounded-[1.8rem] sm:rounded-[2.2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm text-right flex flex-col items-end group hover:shadow-xl transition-all cursor-pointer" onClick={() => onNavigate?.('customers')}>
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl mb-5 sm:mb-6 md:mb-8 bg-blue-50 text-blue-600 group-hover:rotate-6 transition-transform">
            <Users size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </div>
          <span className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">إجمالي العملاء</span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-900">{customerStats.totalCustomers || 0}</span>
          {customerStats.newCustomersThisMonth > 0 && (
            <span className="text-[10px] font-bold text-green-500 mt-2">+{customerStats.newCustomersThisMonth} جديد هذا الشهر</span>
          )}
        </div>

        <div className="bg-white p-4 sm:p-6 md:p-10 rounded-[1.8rem] sm:rounded-[2.2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm text-right flex flex-col items-end group hover:shadow-xl transition-all cursor-pointer" onClick={() => onNavigate?.('customers')}>
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl mb-5 sm:mb-6 md:mb-8 bg-green-50 text-green-600 group-hover:rotate-6 transition-transform">
            <Repeat size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </div>
          <span className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">نسبة العائدين</span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-900">{customerStats.retentionRate || 0}%</span>
          <span className="text-[10px] font-bold text-slate-400 mt-2">{customerStats.returningCustomers || 0} عميل عائد</span>
        </div>

        <div className="bg-white p-4 sm:p-6 md:p-10 rounded-[1.8rem] sm:rounded-[2.2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm text-right flex flex-col items-end group hover:shadow-xl transition-all cursor-pointer" onClick={() => onNavigate?.('customers')}>
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl mb-5 sm:mb-6 md:mb-8 bg-amber-50 text-amber-600 group-hover:rotate-6 transition-transform">
            <AlertTriangle size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </div>
          <span className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">معرضون للتوقف</span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-900">{customerStats.atRiskCustomers?.length || 0}</span>
          <span className="text-[10px] font-bold text-slate-400 mt-2">{customerStats.churnedCustomers?.length || 0} توقفوا</span>
        </div>

        <div className="bg-white p-4 sm:p-6 md:p-10 rounded-[1.8rem] sm:rounded-[2.2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm text-right flex flex-col items-end group hover:shadow-xl transition-all cursor-pointer" onClick={() => onNavigate?.('customers')}>
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl mb-5 sm:mb-6 md:mb-8 bg-purple-50 text-purple-600 group-hover:rotate-6 transition-transform">
            <TrendingUp size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </div>
          <span className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">متوسط الزيارات</span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-900">{customerStats.avgVisitsPerCustomer || 0}</span>
          <span className="text-[10px] font-bold text-slate-400 mt-2">زيارة لكل عميل</span>
        </div>
      </div>
    );
  }, [customerStats, onNavigate]);

  const quickActions = useMemo(() => {
    const actions = [
      { id: 'promotions', label: 'إنشاء عرض', icon: <Tag size={18} />, color: 'from-purple-500 to-pink-500' },
      { id: 'products', label: 'إضافة منتج', icon: <Plus size={18} />, color: 'from-blue-500 to-cyan-500' },
      { id: 'customers', label: 'إرسال عرض ترويجي', icon: <Megaphone size={18} />, color: 'from-green-500 to-emerald-500' },
      { id: 'settings', label: 'الإعدادات', icon: <Settings size={18} />, color: 'from-slate-600 to-slate-800' },
    ];
    return (
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-[2.75rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-4 sm:mb-6 text-right">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {actions.map((a) => (
            <button
              key={a.id}
              onClick={() => onNavigate?.(a.id)}
              className={`flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl bg-gradient-to-br ${a.color} text-white font-bold text-xs sm:text-sm hover:scale-105 transition-transform shadow-sm`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      </div>
    );
  }, [onNavigate]);

  return (
    <div className="space-y-6 sm:space-y-10 md:space-y-12">
      {/* Quick Actions */}
      {quickActions}

      {/* Original Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-10">
        <StatCard label={t('business.overview.followers')} value={shop.followers?.toLocaleString() || '0'} icon={<Users size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />} color="cyan" />
        <StatCard label={t('business.overview.shopVisits')} value={shop.visitors?.toLocaleString() || '0'} icon={<Eye size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />} color="cyan" />
        {showSalesAnalytics ? (
          <>
            <StatCard label={activityVocab.salesTabLabel} value={`${salesCountToday}`} icon={<ShoppingCart size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />} color="slate" />
            <StatCard label={t('business.overview.todayRevenue')} value={`${t('business.overview.currency')} ${revenueToday}`} icon={<DollarSign size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />} color="cyan" />
          </>
        ) : null}
      </div>

      {/* Customer Analytics Cards */}
      {customerCards}

      {showSalesAnalytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 md:gap-10">
          <div className="bg-white p-4 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[2.75rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10 flex-row-reverse">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">{`${activityVocab.salesTabLabel} والإيرادات`}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{`إجمالي ${activityVocab.salesTabLabel}`}</div>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 text-right">{Number(totalOrders || 0).toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('business.overview.totalRevenue')}</div>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 text-right">{t('business.overview.currency')} {Number(totalRevenue || 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right mb-3">{t('business.overview.dailySalesTable')}</div>
              <div className="rounded-3xl border border-slate-100 overflow-hidden">
                <div className="grid grid-cols-2 bg-slate-50 px-4 py-3 text-[11px] font-black text-slate-500">
                  <div className="text-right">{t('business.overview.day')}</div>
                  <div className="text-right">{t('business.overview.revenue')}</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {(Array.isArray(chartData) ? chartData : []).map((row: any, idx: number) => (
                    <div key={`${String(row?.name || '')}:${idx}`} className="grid grid-cols-2 px-4 py-3">
                      <div className="text-right font-black text-slate-700 text-sm">{String(row?.name || '')}</div>
                      <div className="text-right font-black text-slate-900 text-sm">{t('business.overview.currency')} {Number(row?.sales || 0).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 md:gap-10">
              {showSalesAnalytics ? (
                <div className="bg-white p-4 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[2.75rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6 sm:mb-10 md:mb-12 flex-row-reverse">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">{t('business.overview.salesRadar')}</h3>
                    <div className="flex items-center gap-2 text-green-500 font-black text-xs sm:text-sm px-3 sm:px-4 py-1 bg-green-50 rounded-full">
                      <TrendingUp size={16} /> {t('business.overview.steadyGrowth')}
                    </div>
                  </div>
                  <div className="h-[450px] w-full min-w-[300px] min-h-[400px]">
                    {chartBody}
                  </div>
                </div>
              ) : null}

              <div className="bg-white p-4 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[2.75rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10 flex-row-reverse">
                  <h3 className="text-2xl font-black text-slate-900">{t('business.overview.latestAlerts')}</h3>
                  <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center text-[#00E5FF]">
                    <Bell size={20} />
                  </div>
                </div>
                <div className="space-y-6 sm:space-y-8">
                  {notifications.length === 0 ? (
                    <div className="py-16 sm:py-20 md:py-24 text-center text-slate-200">
                      <Bell size={40} className="mx-auto mb-4 opacity-10 sm:w-12 sm:h-12" />
                      <p className="font-bold">{t('business.overview.noRecentActivity')}</p>
                    </div>
                  ) : (
                    notifications.map((n) => <ActivityItem key={n.id} n={n} />)
                  )}
                </div>
                <button
                  type="button"
                  onClick={onViewAllNotifications}
                  className="w-full mt-8 sm:mt-10 py-4 sm:py-5 bg-slate-50 text-slate-500 font-black text-xs rounded-2xl hover:bg-slate-100 transition-all"
                >
                  {t('business.overview.viewAllNotifications')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 md:gap-10">
          <div className="bg-white p-4 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[2.75rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10 flex-row-reverse">
              <h3 className="text-2xl font-black text-slate-900">{t('business.overview.latestAlerts')}</h3>
              <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center text-[#00E5FF]">
                <Bell size={20} />
              </div>
            </div>
            <div className="space-y-6 sm:space-y-8">
              {notifications.length === 0 ? (
                <div className="py-16 sm:py-20 md:py-24 text-center text-slate-200">
                  <Bell size={40} className="mx-auto mb-4 opacity-10 sm:w-12 sm:h-12" />
                  <p className="font-bold">{t('business.overview.noRecentActivity')}</p>
                </div>
              ) : (
                notifications.map((n) => <ActivityItem key={n.id} n={n} />)
              )}
            </div>
            <button
              type="button"
              onClick={onViewAllNotifications}
              className="w-full mt-8 sm:mt-10 py-4 sm:py-5 bg-slate-50 text-slate-500 font-black text-xs rounded-2xl hover:bg-slate-100 transition-all"
            >
              {t('business.overview.viewAllNotifications')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
