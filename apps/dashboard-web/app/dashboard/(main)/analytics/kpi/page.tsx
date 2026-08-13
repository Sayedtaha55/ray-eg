'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Target, TrendingUp, TrendingDown, ShoppingCart, DollarSign, Users, Eye, Activity, Loader2, Search, RefreshCw, Download, Filter, ChevronDown, Info, BookOpen, Zap, Link2, ChevronRight, Lightbulb, XCircle, Calendar, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type KPI = {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  category: 'sales' | 'customers' | 'performance' | 'financial';
  period: string;
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  sales: { label: 'المبيعات', color: 'text-blue-600', bg: 'bg-blue-100', icon: <ShoppingCart size={12} /> },
  customers: { label: 'العملاء', color: 'text-purple-600', bg: 'bg-purple-100', icon: <Users size={12} /> },
  performance: { label: 'الأداء', color: 'text-cyan-600', bg: 'bg-cyan-100', icon: <Activity size={12} /> },
  financial: { label: 'المالية', color: 'text-green-600', bg: 'bg-green-100', icon: <DollarSign size={12} /> },
};

const TREND_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  up: { label: 'زيادة', color: 'text-green-600', bg: 'bg-green-100', icon: <TrendingUp size={12} /> },
  down: { label: 'انخفاض', color: 'text-red-600', bg: 'bg-red-100', icon: <TrendingDown size={12} /> },
  stable: { label: 'ثابت', color: 'text-slate-600', bg: 'bg-slate-100', icon: <Activity size={12} /> },
};

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

export default function KpiPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [guideOpen, setGuideOpen] = useState(false);

  const { shop } = useShop();

  const loadKPIs = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      
      // TODO: Replace with actual API call
      // const data = await apiRequest(`/analytics/kpi/shop/${sid}`);
      // setKpis(Array.isArray(data) ? data : []);
      setKpis([]);
    } catch { setKpis([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadKPIs(); }, [loadKPIs]);

  const filteredAndSorted = useMemo(() => {
    let result = kpis.filter(k => 
      k.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    if (filterCategory !== 'all') {
      result = result.filter(k => k.category === filterCategory);
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'value') {
        comparison = a.value - b.value;
      } else if (sortBy === 'trend') {
        comparison = a.trendValue - b.trendValue;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [kpis, debouncedSearch, filterCategory, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportCSV = () => {
    const headers = ['Name', 'Value', 'Target', 'Unit', 'Trend', 'Trend Value', 'Category', 'Period'];
    const rows = filteredAndSorted.map(k => [
      k.name,
      k.value,
      k.target,
      k.unit,
      k.trend,
      k.trendValue,
      k.category,
      k.period
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'kpi.csv';
    link.click();
  };

  const stats = useMemo(() => {
    const total = kpis.length;
    const achieved = kpis.filter(k => k.value >= k.target).length;
    const upTrend = kpis.filter(k => k.trend === 'up').length;
    return [
      { label: 'إجمالي المؤشرات', value: total, bg: 'bg-blue-50', color: 'text-blue-600' },
      { label: 'محققة', value: achieved, bg: 'bg-green-50', color: 'text-green-600' },
      { label: 'اتجاه إيجابي', value: upTrend, bg: 'bg-cyan-50', color: 'text-cyan-600' },
      { label: 'نسبة الإنجاز', value: total > 0 ? `${Math.round((achieved / total) * 100)}%` : '0%', bg: 'bg-purple-50', color: 'text-purple-600' },
    ];
  }, [kpis]);

  const categoryCounts = useMemo(() => 
    Object.keys(CATEGORY_CONFIG).map(key => ({
      key,
      count: kpis.filter(k => k.category === key).length,
      ...CATEGORY_CONFIG[key]
    })), [kpis]
  );

  const kpiGuide: AnalyticsGuideData = {
    purpose: 'تتبع مؤشرات الأداء الرئيسية (KPIs) للمتجر مع مقارنة الأهداف الفعلية والاتجاهات.',
    whenToUse: 'استخدم هذه الصفحة لمراقبة أداء المتجر، قياس التقدم نحو الأهداف، وتحليل الاتجاهات.',
    whatsInside: [
      'مؤشرات الأداء الرئيسية',
      'مقارنة الأهداف الفعلية',
      'اتجاهات الأداء',
      'تصنيف حسب الفئة',
      'تصفية وبحث متقدم',
      'تصدير التقارير'
    ],
    steps: [
      { title: 'راجع المؤشرات', description: 'اطلع على جميع مؤشرات الأداء وقيمها الحالية' },
      { title: 'قارن بالأهداف', description: 'قارن القيم الفعلية مع الأهداف المحددة' },
      { title: 'حلل الاتجاهات', description: 'راقب اتجاهات الأداء (زيادة، انخفاض، ثبات)' },
      { title: 'استخدم الفلاتر', description: 'استخدم الفلاتر للوصول السريع للمؤشرات المطلوبة' }
    ],
    bestPractices: [
      'راجع المؤشرات بانتظام',
      'ركز على المؤشرات المهمة',
      'قارن مع الفترات السابقة',
      'اتخذ قرارات مبنية على البيانات'
    ],
    tips: [
      'المؤشرات الخضراء تعني تحقيق الهدف',
      'يمكنك ترتيب المؤشرات حسب القيمة أو الاتجاه',
      'استخدم البحث للوصول السريع'
    ],
    shortcuts: [
      'استخدم مفتاح Enter للبحث السريع',
      'اضغط F5 لتحديث البيانات'
    ],
    relatedLinks: [
      { label: 'التحليلات', onClick: () => window.location.href = '/dashboard/analytics' },
      { label: 'الرسوم البيانية', onClick: () => window.location.href = '/dashboard/analytics/charts' },
      { label: 'أداء المبيعات', onClick: () => window.location.href = '/dashboard/analytics/sales-performance' }
    ]
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Target size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">المؤشرات</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">مؤشرات الأداء الرئيسية</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all">
          <Download size={16} />
          <span>تصدير CSV</span>
        </button>
        <button onClick={loadKPIs} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
          <RefreshCw size={16} />
          <span>تحديث</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.bg} ${stat.color}`}>
            <div className="text-xs font-bold mb-1">{stat.label}</div>
            <div className="text-xl font-black">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {categoryCounts.map(c => (
          <button 
            key={c.key} 
            onClick={() => setFilterCategory(filterCategory === c.key ? 'all' : c.key)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filterCategory === c.key ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200 bg-white'
            }`}
          >
            <div className={`flex items-center justify-center gap-1 mb-1 ${c.color}`}>
              {c.icon}
              <span className="text-xs font-bold">{c.label}</span>
            </div>
            <div className="text-lg font-black text-slate-900">{c.count}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-600">ترتيب:</span>
        </div>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
        >
          <option value="name">الاسم</option>
          <option value="value">القيمة</option>
          <option value="trend">الاتجاه</option>
        </select>
      </div>

      <div className="relative">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن مؤشر..."
          className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Target size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد مؤشرات</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {paginatedData.map((kpi) => (
              <div key={kpi.id} className="p-4 hover:bg-slate-50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      kpi.value >= kpi.target ? 'bg-green-50' : 'bg-amber-50'
                    }`}>
                      {kpi.value >= kpi.target ? (
                        <Target size={20} className="text-green-600" />
                      ) : (
                        <Activity size={20} className="text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-900">{kpi.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{kpi.period}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    CATEGORY_CONFIG[kpi.category].bg
                  } ${CATEGORY_CONFIG[kpi.category].color}`}>
                    {CATEGORY_CONFIG[kpi.category].label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">{kpi.value} {kpi.unit}</div>
                      <div className="text-xs text-slate-500">الهدف: {kpi.target} {kpi.unit}</div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                      TREND_CONFIG[kpi.trend].bg
                    } ${TREND_CONFIG[kpi.trend].color}`}>
                      {TREND_CONFIG[kpi.trend].icon}
                      <span>{TREND_CONFIG[kpi.trend].label}</span>
                      <span>{kpi.trendValue > 0 ? '+' : ''}{kpi.trendValue}%</span>
                    </div>
                  </div>
                  
                  <div className="w-32">
                    <div className="text-xs text-slate-500 mb-1">نسبة الإنجاز</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            kpi.value >= kpi.target ? 'bg-green-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        {Math.round((kpi.value / kpi.target) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-semibold">
                صفحة {currentPage} من {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {guideOpen && (
        <InfoDrawer title="المؤشرات" onClose={() => setGuideOpen(false)}>
          <AnalyticsGuideContent guide={kpiGuide} />
        </InfoDrawer>
      )}
    </div>
  );
}