import React, { useEffect, useMemo, useState } from 'react';
import { Bell, DollarSign, Eye, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import ActivityItem from '../components/ActivityItem';
import StatCard from '../components/StatCard';
import { useTranslation } from 'react-i18next';

type Props = {
  shop: any;
  analytics: any;
  notifications: any[];
  onViewAllNotifications?: () => void;
};

const OverviewTab: React.FC<Props> = ({ shop, analytics, notifications, onViewAllNotifications }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [recharts, setRecharts] = useState<any>(null);

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
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
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

  return (
    <div className="space-y-6 sm:space-y-10 md:space-y-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-10">
        <StatCard label={t('business.overview.followers')} value={shop.followers?.toLocaleString() || '0'} icon={<Users size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />} color="cyan" />
        <StatCard label={t('business.overview.shopVisits')} value={shop.visitors?.toLocaleString() || '0'} icon={<Eye size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />} color="cyan" />
        {showSalesAnalytics ? (
          <>
            <StatCard label={t('business.overview.todaySales')} value={`${salesCountToday}`} icon={<ShoppingCart size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />} color="slate" />
            <StatCard label={t('business.overview.todayRevenue')} value={`${t('business.overview.currency')} ${revenueToday}`} icon={<DollarSign size={22} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />} color="cyan" />
          </>
        ) : null}
      </div>

      {showSalesAnalytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 md:gap-10">
          <div className="bg-white p-4 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[2.75rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10 flex-row-reverse">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t('business.overview.ordersAndRevenue')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('business.overview.totalOrders')}</div>
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
