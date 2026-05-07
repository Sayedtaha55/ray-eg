'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bell, DollarSign, Eye, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import ActivityItem from '../components/ActivityItem';
import StatCard from '../components/StatCard';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

type Props = {
  shop: any;
  analytics: any;
  notifications: any[];
  onViewAllNotifications?: () => void;
  onNavigateToTab?: (tab: string) => void;
};

const OverviewTab: React.FC<Props> = ({ shop, analytics, notifications, onViewAllNotifications }) => {
  const t = useT();
  const { dir } = useLocale();
  const isArabic = dir === 'rtl';
  const [recharts, setRecharts] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('recharts');
        if (cancelled) return;
        setRecharts(mod);
      } catch {}
    })();
    return () => { cancelled = true; };
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
        .map((x: any) => String(x?.id ?? x?.moduleId ?? x?.module_id ?? x?.key ?? x ?? '').trim().toLowerCase())
        .filter(Boolean)
    );
    return enabled.has('sales');
  }, [shop]);

  const chartBody = useMemo(() => {
    if (!R) return null;
    const { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = R;
    return (
      <ResponsiveContainer width="100%" height={450}>
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
        <StatCard label={t('business.overview.followers')} value={shop.followers?.toLocaleString() || '0'} icon={<Users size={22} />} color="cyan" />
        <StatCard label={t('business.overview.shopVisits')} value={shop.visitors?.toLocaleString() || '0'} icon={<Eye size={22} />} color="cyan" />
        {showSalesAnalytics ? (
          <>
            <StatCard label={t('business.overview.todaySales')} value={`${salesCountToday}`} icon={<ShoppingCart size={22} />} color="slate" />
            <StatCard label={t('business.overview.todayRevenue')} value={`${t('business.overview.currency')} ${revenueToday}`} icon={<DollarSign size={22} />} color="cyan" />
          </>
        ) : null}
      </div>

      {showSalesAnalytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 md:gap-10">
          <div className="bg-white p-4 sm:p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex justify-end">{t('business.overview.ordersAndRevenue')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase">{t('business.overview.totalOrders')}</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{Number(totalOrders || 0).toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-right">
                <div className="text-[10px] font-black text-slate-400 uppercase">{t('business.overview.totalRevenue')}</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{t('business.overview.currency')} {Number(totalRevenue || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white p-4 sm:p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex justify-end">{t('business.overview.salesRadar')}</h3>
            <div className="h-[450px]">
              {chartBody}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 sm:p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8 flex-row-reverse">
            <h3 className="text-2xl font-black text-slate-900">{t('business.overview.latestAlerts')}</h3>
            <Bell size={24} className="text-[#00E5FF]" />
          </div>
          <div className="space-y-6">
            {notifications.length === 0 ? (
              <div className="py-20 text-center text-slate-200">
                <Bell size={40} className="mx-auto mb-4 opacity-10" />
                <p className="font-bold">{t('business.overview.noRecentActivity')}</p>
              </div>
            ) : (
              notifications.map((n) => <ActivityItem key={n.id} n={n} />)
            )}
          </div>
          <button type="button" onClick={onViewAllNotifications} className="w-full mt-8 py-4 bg-slate-50 text-slate-500 font-black text-xs rounded-2xl">
            {t('business.overview.viewAllNotifications')}
          </button>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
