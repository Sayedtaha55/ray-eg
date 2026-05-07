'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell, DollarSign, Eye, ShoppingCart, TrendingUp, Users,
  Package, CalendarCheck, CreditCard, Megaphone, BarChart3,
  Camera, FileText, Smartphone, Settings, CheckCircle2, Clock,
  AlertTriangle, Palette, LayoutGrid,
} from 'lucide-react';
import ActivityItem from '../ActivityItem';
import StatCard from '../StatCard';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import {
  MerchantDashboardTabId,
  getMerchantDashboardTabsForShop,
} from '@/lib/dashboard/activity-config';

type Props = {
  shop: any;
  analytics: any;
  notifications: any[];
  onViewAllNotifications?: () => void;
  onNavigateToTab?: (tab: MerchantDashboardTabId) => void;
};

const OverviewTab: React.FC<Props> = ({ shop, analytics, notifications, onViewAllNotifications, onNavigateToTab }) => {
  const t = useT();
  const { dir } = useLocale();
  const isArabic = dir === 'rtl';
  const locale = isArabic ? 'ar-EG' : 'en-US';
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

  const enabledModules = useMemo(() => {
    const tabs = getMerchantDashboardTabsForShop(shop);
    return new Set(tabs.map((tab) => tab.id));
  }, [shop]);

  const showSalesAnalytics = enabledModules.has('sales');
  const showProducts = enabledModules.has('products');
  const showReservations = enabledModules.has('reservations');
  const showInvoice = enabledModules.has('invoice');
  const showPromotions = enabledModules.has('promotions');
  const showReports = enabledModules.has('reports');
  const showCustomers = enabledModules.has('customers');
  const showGallery = enabledModules.has('gallery');
  const showPos = enabledModules.has('pos');
  const showDesign = enabledModules.has('design');

  const status = String(shop?.status || '').toLowerCase();
  const isApproved = status === 'approved';
  const isPending = status === 'pending';

  const formatEGP = (v: unknown) => {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return t('overviewSettings.notAvailable', 'غير متاح');
    try { return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(n); }
    catch { return `EGP ${Math.round(n).toLocaleString(locale)}`; }
  };

  const quickActions = useMemo(() => {
    const actions: { id: MerchantDashboardTabId; icon: React.ReactNode; label: string; desc: string; color: string }[] = [];
    if (showProducts) actions.push({ id: 'products', icon: <Package size={22} />, label: t('business.dashboardTabs.products', 'المنتجات'), desc: t('business.onboarding.moduleExplanations.products', 'إضافة وتعديل المنتجات'), color: 'bg-purple-50 text-[#BD00FF]' });
    if (showReservations) actions.push({ id: 'reservations', icon: <CalendarCheck size={22} />, label: t('business.dashboardTabs.reservations', 'الحجوزات'), desc: t('business.onboarding.moduleExplanations.reservations', 'حجز المنتج لمدة 24 ساعة'), color: 'bg-amber-50 text-amber-600' });
    if (showSalesAnalytics) actions.push({ id: 'sales', icon: <CreditCard size={22} />, label: t('business.dashboardTabs.sales', 'المبيعات'), desc: t('business.onboarding.moduleExplanations.sales', 'إدارة الطلبات والمبيعات'), color: 'bg-emerald-50 text-emerald-600' });
    if (showInvoice) actions.push({ id: 'invoice', icon: <FileText size={22} />, label: t('business.dashboardTabs.invoice', 'الفاتورة'), desc: t('business.onboarding.moduleExplanations.invoice', 'فاتورة مرنة'), color: 'bg-blue-50 text-blue-600' });
    if (showPromotions) actions.push({ id: 'promotions', icon: <Megaphone size={22} />, label: t('business.dashboardTabs.promotions', 'العروض'), desc: t('business.onboarding.moduleExplanations.promotions', 'إنشاء عروض وكوبونات'), color: 'bg-pink-50 text-pink-600' });
    if (showReports) actions.push({ id: 'reports', icon: <BarChart3 size={22} />, label: t('business.dashboardTabs.reports', 'التقارير'), desc: t('business.onboarding.moduleExplanations.reports', 'تقارير وتحليلات'), color: 'bg-cyan-50 text-cyan-600' });
    if (showCustomers) actions.push({ id: 'customers', icon: <Users size={22} />, label: t('business.dashboardTabs.customers', 'العملاء'), desc: t('business.onboarding.moduleExplanations.customers', 'إدارة العملاء'), color: 'bg-indigo-50 text-indigo-600' });
    if (showGallery) actions.push({ id: 'gallery', icon: <Camera size={22} />, label: t('business.activities.gallery', 'المعرض'), desc: t('business.onboarding.moduleExplanations.gallery', 'عرض صور للمنتجات'), color: 'bg-orange-50 text-orange-600' });
    if (showPos) actions.push({ id: 'pos', icon: <Smartphone size={22} />, label: t('business.activities.pos', 'نقطة البيع'), desc: t('business.onboarding.moduleExplanations.pos', 'نقطة بيع لإدارة عمليات البيع'), color: 'bg-slate-100 text-slate-700' });
    if (showDesign) actions.push({ id: 'design', icon: <Palette size={22} />, label: t('business.dashboardTabs.design', 'التصميم'), desc: t('business.onboarding.moduleExplanations.builder', 'تخصيص شكل الصفحة'), color: 'bg-violet-50 text-violet-600' });
    actions.push({ id: 'settings', icon: <Settings size={22} />, label: t('business.dashboardTabs.settings', 'الإعدادات'), desc: t('business.onboarding.moduleExplanations.settings', 'إعدادات الحساب والمحل'), color: 'bg-slate-100 text-slate-600' });
    return actions;
  }, [showProducts, showReservations, showSalesAnalytics, showInvoice, showPromotions, showReports, showCustomers, showGallery, showPos, showDesign, t]);

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
              borderRadius: '24px', border: 'none',
              boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
              direction: isArabic ? 'rtl' : 'ltr', padding: '20px',
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

      {/* ── Account Status Card ─────────────────────── */}
      <div className="bg-white p-4 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.75rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6 flex-row-reverse">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t('overviewSettings.dashboard', 'لوحة التحكم')}</h3>
          <div className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 ${isApproved ? 'bg-green-50 text-green-600' : isPending ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            {isApproved ? <CheckCircle2 size={14} /> : isPending ? <Clock size={14} /> : <AlertTriangle size={14} />}
            {isApproved ? t('overviewSettings.active', 'نشط') : isPending ? t('overviewSettings.underReview', 'قيد المراجعة') : t('overviewSettings.unknown', 'غير معروف')}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('overviewSettings.accountStatus', 'حالة الحساب')}</div>
            <div className="mt-2 text-lg font-black text-slate-900 text-right">
              {isApproved ? t('overviewSettings.active', 'نشط') : isPending ? t('overviewSettings.underReview', 'قيد المراجعة') : t('overviewSettings.unknown', 'غير معروف')}
            </div>
          </div>
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('overviewSettings.paymentStatus', 'حالة الدفع')}</div>
            <div className="mt-2 text-lg font-black text-slate-900 text-right">
              {Boolean(String(shop?.paymentConfig?.merchantId || '').trim()) ? t('overviewSettings.enabled', 'مفعل') : t('overviewSettings.notEnabled', 'غير مفعل')}
            </div>
          </div>
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('overviewSettings.upcomingDues', 'المستحقات القادمة')}</div>
            <div className="mt-2 text-lg font-black text-slate-900 text-right">
              {formatEGP(shop?.nextDueAmount ?? shop?.next_due_amount ?? 0)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────── */}
      <div className="bg-white p-4 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.75rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6 flex-row-reverse">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t('business.onboarding.optionalButtonsTitle', 'الأزرار الإضافية')}</h3>
          <LayoutGrid size={20} className="text-slate-400" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigateToTab?.(action.id)}
              className="flex flex-col items-center gap-3 p-4 sm:p-6 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all group"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <span className="font-black text-xs sm:text-sm text-slate-900 text-center leading-tight">{action.label}</span>
              <span className="text-[10px] text-slate-400 font-bold text-center leading-tight line-clamp-2 hidden sm:block">{action.desc}</span>
            </button>
          ))}
        </div>
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
