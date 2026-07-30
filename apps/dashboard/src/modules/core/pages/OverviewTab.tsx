import React, { useEffect, useMemo, useState } from 'react';
import { Bell, DollarSign, Eye, ShoppingCart, TrendingUp, Users, Repeat, AlertTriangle, Crown, Megaphone, Tag, Plus, Settings, Package, CreditCard, FileText, Calendar, Wallet, BarChart3, Sparkles } from 'lucide-react';
import ActivityItem from '../../../modules/shared/components/ActivityItem';
import StatCard from '../../../modules/shared/components/StatCard';
import { useTranslation } from 'react-i18next';
import { getShopActivityVocabulary } from '@/utils/businessActivityVocabulary';
import { ApiService } from '@/services/api.service';
import { useModuleConfig } from '../../../hooks/useModuleConfig';
import type { ModuleId } from '../../../config/modules';

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
  const moduleConfig = useModuleConfig(shop);
  const enabledModuleSet = useMemo(() => new Set<ModuleId>(moduleConfig.moduleIds), [moduleConfig.moduleIds]);
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
    if (moduleConfig.isModuleDriven) {
      return enabledModuleSet.has('sales');
    }
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
  }, [shop, moduleConfig, enabledModuleSet]);

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end group hover:shadow-md transition-all cursor-pointer" onClick={() => onNavigate?.('customers')}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-xl mb-4 bg-blue-50 text-blue-600">
            <Users size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </div>
          <span className="text-slate-500 font-semibold text-xs mb-1">إجمالي العملاء</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{customerStats.totalCustomers || 0}</span>
          {customerStats.newCustomersThisMonth > 0 && (
            <span className="text-xs font-medium text-green-600 mt-2">+{customerStats.newCustomersThisMonth} جديد هذا الشهر</span>
          )}
        </div>

        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end group hover:shadow-md transition-all cursor-pointer" onClick={() => onNavigate?.('customers')}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-xl mb-4 bg-green-50 text-green-600">
            <Repeat size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </div>
          <span className="text-slate-500 font-semibold text-xs mb-1">نسبة العائدين</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{customerStats.retentionRate || 0}%</span>
          <span className="text-xs font-medium text-slate-400 mt-2">{customerStats.returningCustomers || 0} عميل عائد</span>
        </div>

        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end group hover:shadow-md transition-all cursor-pointer" onClick={() => onNavigate?.('customers')}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-xl mb-4 bg-amber-50 text-amber-600">
            <AlertTriangle size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </div>
          <span className="text-slate-500 font-semibold text-xs mb-1">معرضون للتوقف</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{customerStats.atRiskCustomers?.length || 0}</span>
          <span className="text-xs font-medium text-slate-400 mt-2">{customerStats.churnedCustomers?.length || 0} توقفوا</span>
        </div>

        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end group hover:shadow-md transition-all cursor-pointer" onClick={() => onNavigate?.('customers')}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-xl mb-4 bg-purple-50 text-purple-600">
            <TrendingUp size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </div>
          <span className="text-slate-500 font-semibold text-xs mb-1">متوسط الزيارات</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{customerStats.avgVisitsPerCustomer || 0}</span>
          <span className="text-xs font-medium text-slate-400 mt-2">زيارة لكل عميل</span>
        </div>
      </div>
    );
  }, [customerStats, onNavigate]);

  const quickActions = useMemo(() => {
    const actions: Array<{ id: string; label: string; icon: React.ReactNode; color: string }> = [];

    if (enabledModuleSet.has('marketing')) {
      actions.push({ id: 'promotions', label: isArabic ? 'إنشاء عرض' : 'Create Offer', icon: <Tag size={18} />, color: 'from-purple-500 to-pink-500' });
    }
    if (enabledModuleSet.has('inventory')) {
      actions.push({ id: 'products', label: isArabic ? 'إضافة منتج' : 'Add Product', icon: <Plus size={18} />, color: 'from-blue-500 to-cyan-500' });
    }
    if (enabledModuleSet.has('crm') || enabledModuleSet.has('marketing')) {
      actions.push({ id: 'customers', label: isArabic ? 'إرسال عرض ترويجي' : 'Send Promo', icon: <Megaphone size={18} />, color: 'from-green-500 to-emerald-500' });
    }
    if (enabledModuleSet.has('bookings')) {
      actions.push({ id: 'reservations', label: isArabic ? 'الحجوزات' : 'Bookings', icon: <Calendar size={18} />, color: 'from-cyan-500 to-blue-500' });
    }
    if (enabledModuleSet.has('finance')) {
      actions.push({ id: 'invoice', label: isArabic ? 'الفواتير' : 'Invoices', icon: <FileText size={18} />, color: 'from-violet-500 to-purple-500' });
    }
    actions.push({ id: 'settings', label: isArabic ? 'الإعدادات' : 'Settings', icon: <Settings size={18} />, color: 'from-slate-600 to-slate-800' });

    return (
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 text-right">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {actions.map((a) => (
            <button
              key={a.id}
              onClick={() => onNavigate?.(a.id)}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg bg-gradient-to-br ${a.color} text-white font-medium text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-sm`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      </div>
    );
  }, [onNavigate, enabledModuleSet, isArabic]);

  return (
    <div className="space-y-6 sm:space-y-10 md:space-y-12">
      {/* Quick Actions */}
      {quickActions}

      {/* Original Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard label={t('business.overview.followers')} value={shop.followers?.toLocaleString() || '0'} icon={<Users size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />} color="cyan" />
        <StatCard label={t('business.overview.shopVisits')} value={shop.visitors?.toLocaleString() || '0'} icon={<Eye size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />} color="cyan" />
        {showSalesAnalytics ? (
          <>
            <StatCard label={activityVocab.salesTabLabel} value={`${salesCountToday}`} icon={<ShoppingCart size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />} color="slate" />
            <StatCard label={t('business.overview.todayRevenue')} value={`${t('business.overview.currency')} ${revenueToday}`} icon={<DollarSign size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />} color="cyan" />
          </>
        ) : null}
        {enabledModuleSet.has('bookings') && !showSalesAnalytics ? (
          <>
            <StatCard label={isArabic ? 'الحجوزات اليوم' : 'Bookings Today'} value={`${safeAnalytics.reservationsToday ?? safeAnalytics.bookingsToday ?? 0}`} icon={<Calendar size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />} color="cyan" />
            <StatCard label={isArabic ? 'إجمالي الحجوزات' : 'Total Bookings'} value={`${safeAnalytics.totalReservations ?? safeAnalytics.totalBookings ?? 0}`} icon={<Calendar size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />} color="slate" />
          </>
        ) : null}
      </div>

      {/* Customer Analytics Cards — only if CRM module is enabled */}
      {enabledModuleSet.has('crm') && customerCards}

      {showSalesAnalytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6 flex-row-reverse">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">{`${activityVocab.salesTabLabel} والإيرادات`}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 text-right">{`إجمالي ${activityVocab.salesTabLabel}`}</div>
                <div className="mt-2 text-lg sm:text-xl font-bold text-slate-900 text-right">{Number(totalOrders || 0).toLocaleString()}</div>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 text-right">{t('business.overview.totalRevenue')}</div>
                <div className="mt-2 text-lg sm:text-xl font-bold text-slate-900 text-right">{t('business.overview.currency')} {Number(totalRevenue || 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-slate-500 text-right mb-3">{t('business.overview.dailySalesTable')}</div>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-2 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                  <div className="text-right">{t('business.overview.day')}</div>
                  <div className="text-right">{t('business.overview.revenue')}</div>
                </div>
                <div className="divide-y divide-slate-200">
                  {(Array.isArray(chartData) ? chartData : []).map((row: any, idx: number) => (
                    <div key={`${String(row?.name || '')}:${idx}`} className="grid grid-cols-2 px-3 py-2">
                      <div className="text-right font-semibold text-slate-700 text-sm">{String(row?.name || '')}</div>
                      <div className="text-right font-semibold text-slate-900 text-sm">{t('business.overview.currency')} {Number(row?.sales || 0).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {showSalesAnalytics ? (
                <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4 sm:mb-6 flex-row-reverse">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">{t('business.overview.salesRadar')}</h3>
                    <div className="flex items-center gap-2 text-green-600 font-semibold text-xs sm:text-sm px-3 py-1 bg-green-50 rounded-full">
                      <TrendingUp size={16} /> {t('business.overview.steadyGrowth')}
                    </div>
                  </div>
                  <div className="h-[350px] sm:h-[400px] w-full min-w-[300px] min-h-[300px]">
                    {chartBody}
                  </div>
                </div>
              ) : null}

              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-row-reverse">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">{t('business.overview.latestAlerts')}</h3>
                  <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600">
                    <Bell size={18} />
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {notifications.length === 0 ? (
                    <div className="py-12 sm:py-16 text-center text-slate-300">
                      <Bell size={32} className="mx-auto mb-3 opacity-50" />
                      <p className="font-semibold">{t('business.overview.noRecentActivity')}</p>
                    </div>
                  ) : (
                    notifications.map((n) => <ActivityItem key={n.id} n={n} />)
                  )}
                </div>
                <button
                  type="button"
                  onClick={onViewAllNotifications}
                  className="w-full mt-6 sm:mt-8 py-3 sm:py-4 bg-slate-50 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-100 transition-all"
                >
                  {t('business.overview.viewAllNotifications')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6 flex-row-reverse">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">{t('business.overview.latestAlerts')}</h3>
              <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600">
                <Bell size={18} />
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6">
              {notifications.length === 0 ? (
                <div className="py-12 sm:py-16 text-center text-slate-300">
                  <Bell size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="font-semibold">{t('business.overview.noRecentActivity')}</p>
                </div>
              ) : (
                notifications.map((n) => <ActivityItem key={n.id} n={n} />)
              )}
            </div>
            <button
              type="button"
              onClick={onViewAllNotifications}
              className="w-full mt-6 sm:mt-8 py-3 sm:py-4 bg-slate-50 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-100 transition-all"
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
