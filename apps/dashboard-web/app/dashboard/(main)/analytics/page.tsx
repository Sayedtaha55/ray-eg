'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, ShoppingCart, DollarSign,
  Users, Eye, Activity, Loader2, Calendar, Info, Target, BookOpen, Zap, Link2, ChevronRight, Lightbulb, XCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';

/* ============================================================
 * Analytics Guide System
 * ============================================================ */

type GuideStep = {
  title: string;
  description: string;
};

type GuideLink = {
  label: string;
  onClick?: () => void;
};

type AnalyticsGuideData = {
  purpose: string;
  whenToUse: string;
  whatsInside: string[];
  steps: GuideStep[];
  bestPractices: string[];
  tips: string[];
  shortcuts: string[];
  relatedLinks?: GuideLink[];
};

const GuideSectionBlock: React.FC<{
  icon: any;
  iconColor: string;
  iconBg: string;
  heading: string;
  children: React.ReactNode;
}> = ({ icon: Icon, iconColor, iconBg, heading, children }) => (
  <div className="rounded-xl border border-slate-100 p-4 bg-white">
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${iconBg} ${iconColor} shrink-0`}>
        <Icon size={16} />
      </div>
      <h4 className="font-bold text-slate-900 text-sm">{heading}</h4>
    </div>
    {children}
  </div>
);

const AnalyticsGuideContent: React.FC<{ guide: AnalyticsGuideData }> = ({ guide }) => (
  <div className="space-y-4">
    <GuideSectionBlock icon={Target} iconColor="text-blue-600" iconBg="bg-blue-50" heading="وظيفة الصفحة / Page Purpose">
      <p className="text-slate-600 text-sm leading-relaxed">{guide.purpose}</p>
    </GuideSectionBlock>

    <GuideSectionBlock icon={Calendar} iconColor="text-amber-600" iconBg="bg-amber-50" heading="متى تستخدمها / When to Use">
      <p className="text-slate-600 text-sm leading-relaxed">{guide.whenToUse}</p>
    </GuideSectionBlock>

    <GuideSectionBlock icon={BookOpen} iconColor="text-purple-600" iconBg="bg-purple-50" heading="ماذا ستجد داخلها / What's Inside">
      <ul className="space-y-1.5">
        {guide.whatsInside.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
            <ChevronRight size={14} className="text-slate-300 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </GuideSectionBlock>

    {guide.steps.length > 0 && (
      <GuideSectionBlock icon={Zap} iconColor="text-cyan-600" iconBg="bg-cyan-50" heading="خطوات الاستخدام / How to Use">
        <ol className="space-y-2">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold shrink-0">{i + 1}</span>
              <div>
                <div className="font-semibold text-slate-900">{step.title}</div>
                <div className="text-slate-500">{step.description}</div>
              </div>
            </li>
          ))}
        </ol>
      </GuideSectionBlock>
    )}

    {guide.bestPractices.length > 0 && (
      <GuideSectionBlock icon={Target} iconColor="text-green-600" iconBg="bg-green-50" heading="أفضل الممارسات / Best Practices">
        <ul className="space-y-1.5">
          {guide.bestPractices.map((practice, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
              <TrendingUp size={14} className="text-green-500 mt-0.5 shrink-0" />
              {practice}
            </li>
          ))}
        </ul>
      </GuideSectionBlock>
    )}

    {guide.tips.length > 0 && (
      <GuideSectionBlock icon={Lightbulb} iconColor="text-amber-600" iconBg="bg-amber-50" heading="نصائح / Tips">
        <ul className="space-y-1.5">
          {guide.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
              <Zap size={14} className="text-amber-500 mt-0.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </GuideSectionBlock>
    )}

    {guide.shortcuts.length > 0 && (
      <GuideSectionBlock icon={Link2} iconColor="text-indigo-600" iconBg="bg-indigo-50" heading="اختصارات / Shortcuts">
        <ul className="space-y-1.5">
          {guide.shortcuts.map((shortcut, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
              <ChevronRight size={14} className="text-indigo-400 mt-0.5 shrink-0" />
              {shortcut}
            </li>
          ))}
        </ul>
      </GuideSectionBlock>
    )}

    {guide.relatedLinks && guide.relatedLinks.length > 0 && (
      <GuideSectionBlock icon={Link2} iconColor="text-slate-600" iconBg="bg-slate-100" heading="روابط ذات صلة / Related Links">
        <div className="flex flex-wrap gap-2">
          {guide.relatedLinks.map((link, i) => (
            <button
              key={i}
              onClick={link.onClick}
              className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-all"
            >
              {link.label}
            </button>
          ))}
        </div>
      </GuideSectionBlock>
    )}
  </div>
);

const InfoDrawer: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex" onClick={onClose}>
    <div className="absolute inset-0 bg-black/40 animate-[fadeIn_0.15s_ease-out]" />
    <div
      className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Info size={20} className="text-slate-400" />
          {title}
        </h3>
        <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
          <XCircle size={20} />
        </button>
      </div>
      <div className="px-6 py-5 space-y-5 text-sm text-slate-600 leading-relaxed">{children}</div>
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-3">
        <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors">
          حسناً
        </button>
      </div>
    </div>
  </div>
);

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [customerStats, setCustomerStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<'7d' | '30d' | '6m' | '12m'>('30d');
  const [guideOpen, setGuideOpen] = useState(false);

  const analyticsGuide: AnalyticsGuideData = {
    purpose: 'لوحة تحليلية شاملة لتتبع أداء المتجر والمبيعات والعملاء مع رسوم بيانية تفاعلية.',
    whenToUse: 'استخدم هذه الصفحة يومياً لمتابعة أداء المتجر، تحليل المبيعات، واتخاذ قرارات مبنية على البيانات.',
    whatsInside: [
      'إحصائيات المبيعات الرئيسية',
      'رسوم بيانية تفاعلية',
      'تحليل أداء الطلبات',
      'إحصائيات العملاء',
      'تصفية حسب الفترة الزمنية',
      'مقارنات الأداء'
    ],
    steps: [
      { title: 'اختر الفترة', description: 'حدد الفترة الزمنية لعرض التحليلات (7 أيام، 30 يوم، 6 أشهر، سنة)' },
      { title: 'راجع الإحصائيات', description: 'اطلع على إجمالي الطلبات والإيرادات ومتوسط الطلب' },
      { title: 'حلل الرسوم البيانية', description: 'دراسة الرسوم البيانية لفهم الاتجاهات والأنماط' },
      { title: 'قارن الأداء', description: 'قارن بين الفترات المختلفة لقياس التقدم' }
    ],
    bestPractices: [
      'راجع التحليلات يومياً أو أسبوعياً',
      'قارن بين الفترات المختلفة',
      'ركز على المؤشرات الرئيسية',
      'استخدم البيانات لاتخاذ قرارات'
    ],
    tips: [
      'الرسوم البيانية تفاعلية - مرر عليها للتفاصيل',
      'يمكنك تصفية البيانات حسب الفترة',
      'الألوان المختلفة تشير إلى مؤشرات مختلفة'
    ],
    shortcuts: [
      'اضغط على الأزرار لتغيير الفترة الزمنية',
      'استخدم F5 لتحديث البيانات'
    ],
    relatedLinks: [
      { label: 'المؤشرات', onClick: () => window.location.href = '/dashboard/analytics/kpi' },
      { label: 'الرسوم البيانية', onClick: () => window.location.href = '/dashboard/analytics/charts' },
      { label: 'أداء المبيعات', onClick: () => window.location.href = '/dashboard/analytics/sales-performance' },
      { label: 'الزوار', onClick: () => window.location.href = '/dashboard/analytics/visitors' }
    ]
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const shopData = await apiRequest('/shops/me');
        const sid = shopData?.id;
        if (!sid) {
          setError('لم يتم العثور على المتجر');
          setLoading(false);
          return;
        }
        const [analyticsRes, ordersRes, customerRes] = await Promise.allSettled([
          apiRequest(`/analytics/shop/${sid}`),
          apiRequest('/orders/me'),
          apiRequest(`/analytics/shop/${sid}/customer-insights`),
        ]);
        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value || {});
        if (ordersRes.status === 'fulfilled') {
          const list = Array.isArray(ordersRes.value) ? ordersRes.value : (ordersRes.value?.orders || []);
          setOrders(Array.isArray(list) ? list : []);
        }
        if (customerRes.status === 'fulfilled') setCustomerStats(customerRes.value);
      } catch (err: any) {
        setError(err?.message || 'فشل تحميل التحليلات');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const orderStats = useMemo(() => {
    const total = orders.length;
    const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    const delivered = orders.filter((o) => String(o.status).toUpperCase() === 'DELIVERED').length;
    const cancelled = orders.filter((o) => String(o.status).toUpperCase() === 'CANCELLED').length;
    const avgOrder = total > 0 ? revenue / total : 0;
    return { total, revenue, delivered, cancelled, avgOrder };
  }, [orders]);

  const chartData = useMemo(() => {
    const chart = analytics?.chartData;
    if (Array.isArray(chart) && chart.length > 0) return chart;
    if (orders.length === 0) return [];
    const byDate: Record<string, number> = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt || o.created_at || Date.now());
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      byDate[key] = (byDate[key] || 0) + Number(o.total || 0);
    });
    return Object.entries(byDate)
      .sort((a, b) => {
        const [am, ad] = a[0].split('/').map(Number);
        const [bm, bd] = b[0].split('/').map(Number);
        return am === bm ? ad - bd : am - bm;
      })
      .slice(-12)
      .map(([name, sales]) => ({ name, sales }));
  }, [analytics, orders]);

  const maxChart = Math.max(...chartData.map((d: any) => Number(d.sales || 0)), 1);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <BarChart3 size={24} className="text-[#00E5FF]" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">التحليلات</h1>
              <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
                <Info size={18} />
              </button>
            </div>
            <p className="text-sm font-bold text-slate-400 mt-1">تقارير الأداء والمبيعات</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[
            { id: '7d', label: '7 أيام' },
            { id: '30d', label: '30 يوم' },
            { id: '6m', label: '6 أشهر' },
            { id: '12m', label: 'سنة' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                range === r.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-right">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 bg-blue-50 text-blue-600">
                <ShoppingCart size={20} />
              </div>
              <span className="text-slate-500 font-semibold text-xs mb-1">إجمالي الطلبات</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900">{orderStats.total}</span>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 bg-green-50 text-green-600">
                <DollarSign size={20} />
              </div>
              <span className="text-slate-500 font-semibold text-xs mb-1">إجمالي الإيرادات</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900">ج.م {orderStats.revenue.toLocaleString()}</span>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 bg-cyan-50 text-cyan-600">
                <TrendingUp size={20} />
              </div>
              <span className="text-slate-500 font-semibold text-xs mb-1">متوسط الطلب</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900">ج.م {Math.round(orderStats.avgOrder).toLocaleString()}</span>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 bg-purple-50 text-purple-600">
                <Users size={20} />
              </div>
              <span className="text-slate-500 font-semibold text-xs mb-1">العملاء</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900">{customerStats?.totalCustomers || analytics?.totalCustomers || 0}</span>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6 flex-row-reverse">
              <Activity size={18} className="text-slate-400" />
              <h2 className="font-bold text-slate-900 text-sm">مبيعات يومية</h2>
            </div>
            {chartData.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold text-sm">لا توجد بيانات كافية</div>
            ) : (
              <div className="flex items-end gap-2 h-40 sm:h-48">
                {chartData.map((d: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-slate-800 to-slate-900 transition-all hover:from-[#00E5FF] hover:to-[#00B8D9]"
                      style={{ height: `${Math.max((Number(d.sales || 0) / maxChart) * 100, 3)}%` }}
                      title={`${d.name}: ج.م ${Number(d.sales || 0).toLocaleString()}`}
                    />
                    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{d.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 text-right">
              <div className="flex items-center gap-2 mb-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <span className="font-bold text-slate-900 text-sm">طلبات مكتملة</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{orderStats.delivered}</div>
              <div className="text-xs text-slate-500 mt-1">
                {orderStats.total > 0 ? `${Math.round((orderStats.delivered / orderStats.total) * 100)}%` : '0%'} من الإجمالي
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 text-right">
              <div className="flex items-center gap-2 mb-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <TrendingDown size={16} />
                </div>
                <span className="font-bold text-slate-900 text-sm">طلبات ملغاة</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{orderStats.cancelled}</div>
              <div className="text-xs text-slate-500 mt-1">
                {orderStats.total > 0 ? `${Math.round((orderStats.cancelled / orderStats.total) * 100)}%` : '0%'} من الإجمالي
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 text-right">
              <div className="flex items-center gap-2 mb-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Eye size={16} />
                </div>
                <span className="font-bold text-slate-900 text-sm">زوار المتجر</span>
              </div>
              <div className="text-2xl font-black text-slate-900">{analytics?.visitors || 0}</div>
              <div className="text-xs text-slate-500 mt-1">إجمالي الزوار</div>
            </div>
          </div>
        </>
      )}

      {guideOpen && (
        <InfoDrawer title="التحليلات" onClose={() => setGuideOpen(false)}>
          <AnalyticsGuideContent guide={analyticsGuide} />
        </InfoDrawer>
      )}
    </div>
  );
}
