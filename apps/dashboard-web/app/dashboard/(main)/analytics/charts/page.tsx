'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, ShoppingCart, DollarSign, Users, Activity, Loader2, Search, RefreshCw, Download, Filter, ChevronDown, Info, Target, BookOpen, Zap, Link2, ChevronRight, Lightbulb, XCircle, Calendar, CalendarDays } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type ChartData = {
  id: string;
  name: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  category: 'sales' | 'customers' | 'products' | 'revenue';
  period: string;
  data: Array<{ label: string; value: number }>;
  description?: string;
};

const CHART_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  bar: { label: 'أعمدة', color: 'text-blue-600', bg: 'bg-blue-100', icon: <BarChart3 size={12} /> },
  line: { label: 'خطي', color: 'text-purple-600', bg: 'bg-purple-100', icon: <LineChart size={12} /> },
  pie: { label: 'دائري', color: 'text-cyan-600', bg: 'bg-cyan-100', icon: <PieChart size={12} /> },
  area: { label: 'منطقة', color: 'text-green-600', bg: 'bg-green-100', icon: <Activity size={12} /> },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  sales: { label: 'المبيعات', color: 'text-blue-600', bg: 'bg-blue-100', icon: <ShoppingCart size={12} /> },
  customers: { label: 'العملاء', color: 'text-purple-600', bg: 'bg-purple-100', icon: <Users size={12} /> },
  products: { label: 'المنتجات', color: 'text-amber-600', bg: 'bg-amber-100', icon: <Activity size={12} /> },
  revenue: { label: 'الإيرادات', color: 'text-green-600', bg: 'bg-green-100', icon: <DollarSign size={12} /> },
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

export default function ChartsPage() {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [guideOpen, setGuideOpen] = useState(false);

  const { shop } = useShop();

  const loadCharts = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      
      // TODO: Replace with actual API call
      // const data = await apiRequest(`/analytics/charts/shop/${sid}`);
      // setCharts(Array.isArray(data) ? data : []);
      setCharts([]);
    } catch { setCharts([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCharts(); }, [loadCharts]);

  const filteredAndSorted = useMemo(() => {
    let result = charts.filter(c => 
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    if (filterType !== 'all') {
      result = result.filter(c => c.type === filterType);
    }

    if (filterCategory !== 'all') {
      result = result.filter(c => c.category === filterCategory);
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'period') {
        comparison = a.period.localeCompare(b.period);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [charts, debouncedSearch, filterType, filterCategory, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportCSV = () => {
    const headers = ['Name', 'Type', 'Category', 'Period', 'Data Points'];
    const rows = filteredAndSorted.map(c => [
      c.name,
      c.type,
      c.category,
      c.period,
      c.data.length
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'charts.csv';
    link.click();
  };

  const stats = useMemo(() => {
    const total = charts.length;
    const barCharts = charts.filter(c => c.type === 'bar').length;
    const lineCharts = charts.filter(c => c.type === 'line').length;
    return [
      { label: 'إجمالي الرسوم', value: total, bg: 'bg-blue-50', color: 'text-blue-600' },
      { label: 'أعمدة', value: barCharts, bg: 'bg-purple-50', color: 'text-purple-600' },
      { label: 'خطية', value: lineCharts, bg: 'bg-cyan-50', color: 'text-cyan-600' },
      { label: 'دائرية', value: charts.filter(c => c.type === 'pie').length, bg: 'bg-green-50', color: 'text-green-600' },
    ];
  }, [charts]);

  const typeCounts = useMemo(() => 
    Object.keys(CHART_TYPE_CONFIG).map(key => ({
      key,
      count: charts.filter(c => c.type === key).length,
      ...CHART_TYPE_CONFIG[key]
    })), [charts]
  );

  const categoryCounts = useMemo(() => 
    Object.keys(CATEGORY_CONFIG).map(key => ({
      key,
      count: charts.filter(c => c.category === key).length,
      ...CATEGORY_CONFIG[key]
    })), [charts]
  );

  const chartsGuide: AnalyticsGuideData = {
    purpose: 'عرض جميع الرسوم البيانية للمتجر بأنواع مختلفة (أعمدة، خطية، دائرية، منطقة) لتسهيل تحليل البيانات.',
    whenToUse: 'استخدم هذه الصفحة لعرض جميع الرسوم البيانية المتاحة، مقارنة الأنواع المختلفة، وتحليل البيانات بصري مرئي.',
    whatsInside: [
      'رسوم بيانية تفاعلية',
      'أنواع مختلفة (أعمدة، خطية، دائرية، منطقة)',
      'تصنيف حسب الفئة',
      'تصفية وبحث متقدم',
      'تصدير البيانات'
    ],
    steps: [
      { title: 'اختر النوع', description: 'استخدم فلاتر الأنواع للوصول للرسوم المطلوبة' },
      { title: 'اختر الفئة', description: 'استخدم فلاتر الفئات للوصول للرسوم حسب التصنيف' },
      { title: 'اعرض الرسم', description: 'اضغط على أي رسم لعرض التفاصيل الكاملة' },
      { title: 'حلل البيانات', description: 'استخدم الرسوم لتحليل الاتجاهات والأنماط' }
    ],
    bestPractices: [
      'استخدم النوع المناسب للبيانات',
      'قارن بين الفترات المختلفة',
      'ركز على الرسوم المهمة',
      'صدر البيانات للتحليل الخارجي'
    ],
    tips: [
      'الرسوم تفاعلية - يمكنك التفاعل معها',
      'يمكنك تصفية حسب النوع والفئة',
      'استخدم البحث للوصول السريع'
    ],
    shortcuts: [
      'استخدم مفتاح Enter للبحث السريع',
      'اضغط F5 لتحديث البيانات'
    ],
    relatedLinks: [
      { label: 'التحليلات', onClick: () => window.location.href = '/dashboard/analytics' },
      { label: 'المؤشرات', onClick: () => window.location.href = '/dashboard/analytics/kpi' },
      { label: 'أداء المبيعات', onClick: () => window.location.href = '/dashboard/analytics/sales-performance' }
    ]
  };

  const renderChartPreview = (chart: ChartData) => {
    const maxValue = Math.max(...chart.data.map(d => d.value), 1);
    
    if (chart.type === 'bar') {
      return (
        <div className="flex items-end gap-1 h-24">
          {chart.data.slice(0, 7).map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full rounded-t bg-gradient-to-t from-slate-700 to-slate-900 hover:from-[#00E5FF] hover:to-[#00B8D9] transition-all"
                style={{ height: `${Math.max((d.value / maxValue) * 100, 5)}%` }}
              />
              <span className="text-[8px] text-slate-400 truncate w-full text-center">{d.label}</span>
            </div>
          ))}
        </div>
      );
    } else if (chart.type === 'line') {
      return (
        <div className="relative h-24">
          <svg className="w-full h-full" viewBox="0 0 100 50">
            <polyline
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2"
              points={chart.data.slice(0, 7).map((d, i) => `${i * 15},${50 - (d.value / maxValue) * 40}`).join(' ')}
            />
            {chart.data.slice(0, 7).map((d, i) => (
              <circle key={i} cx={i * 15} cy={50 - (d.value / maxValue) * 40} r="2" fill="#00E5FF" />
            ))}
          </svg>
        </div>
      );
    } else if (chart.type === 'pie') {
      return (
        <div className="flex items-center justify-center h-24">
          <div className="w-20 h-20 rounded-full border-4 border-slate-200 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-400">{chart.data.length}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative h-24">
          <svg className="w-full h-full" viewBox="0 0 100 50">
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <polygon
              fill="url(#areaGradient)"
              stroke="#00E5FF"
              strokeWidth="1"
              points={`0,50 ${chart.data.slice(0, 7).map((d, i) => `${i * 15},${50 - (d.value / maxValue) * 40}`).join(' ')} 100,50`}
            />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <BarChart3 size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الرسوم البيانية</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">عرض جميع الرسوم البيانية</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all">
          <Download size={16} />
          <span>تصدير CSV</span>
        </button>
        <button onClick={loadCharts} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
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
        {typeCounts.map(t => (
          <button 
            key={t.key} 
            onClick={() => setFilterType(filterType === t.key ? 'all' : t.key)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filterType === t.key ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200 bg-white'
            }`}
          >
            <div className={`flex items-center justify-center gap-1 mb-1 ${t.color}`}>
              {t.icon}
              <span className="text-xs font-bold">{t.label}</span>
            </div>
            <div className="text-lg font-black text-slate-900">{t.count}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-600">الفئة:</span>
        </div>
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
        >
          <option value="all">الكل</option>
          {Object.keys(CATEGORY_CONFIG).map(key => (
            <option key={key} value={key}>{CATEGORY_CONFIG[key].label}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 mr-4">
          <ChevronDown size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-600">ترتيب:</span>
        </div>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
        >
          <option value="name">الاسم</option>
          <option value="period">الفترة</option>
        </select>
      </div>

      <div className="relative">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن رسم بياني..."
          className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BarChart3 size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد رسوم بيانية</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedData.map((chart) => (
            <div key={chart.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${CHART_TYPE_CONFIG[chart.type].bg} ${CHART_TYPE_CONFIG[chart.type].color}`}>
                    {CHART_TYPE_CONFIG[chart.type].icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{chart.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{chart.period}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                  CATEGORY_CONFIG[chart.category].bg
                } ${CATEGORY_CONFIG[chart.category].color}`}>
                  {CATEGORY_CONFIG[chart.category].label}
                </span>
              </div>
              
              <div className="mb-3">
                {renderChartPreview(chart)}
              </div>
              
              {chart.description && (
                <p className="text-xs text-slate-500 mt-2">{chart.description}</p>
              )}
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">{chart.data.length} نقطة بيانات</span>
                <button className="text-xs text-slate-600 hover:text-slate-900 font-semibold">عرض التفاصيل</button>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {guideOpen && (
        <InfoDrawer title="الرسوم البيانية" onClose={() => setGuideOpen(false)}>
          <AnalyticsGuideContent guide={chartsGuide} />
        </InfoDrawer>
      )}
    </div>
  );
}