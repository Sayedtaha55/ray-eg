'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Eye, Users, Clock, TrendingUp, TrendingDown, Globe, Smartphone, Monitor, Loader2, Search, RefreshCw, Download, Filter, ChevronDown, Info, Target, BookOpen, Zap, Link2, ChevronRight, Lightbulb, XCircle, Calendar, MapPin, Activity, BarChart3, Mail } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type VisitorData = {
  id: string;
  date: string;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  trafficSource: 'direct' | 'organic' | 'referral' | 'social' | 'email';
  device: 'desktop' | 'mobile' | 'tablet';
  location?: string;
};

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  direct: { label: 'مباشر', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Globe size={12} /> },
  organic: { label: 'عضوي', color: 'text-green-600', bg: 'bg-green-100', icon: <Activity size={12} /> },
  referral: { label: 'إحالة', color: 'text-purple-600', bg: 'bg-purple-100', icon: <Link2 size={12} /> },
  social: { label: 'تواصل اجتماعي', color: 'text-cyan-600', bg: 'bg-cyan-100', icon: <Users size={12} /> },
  email: { label: 'بريد إلكتروني', color: 'text-amber-600', bg: 'bg-amber-100', icon: <Mail size={12} /> },
};

const DEVICE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  desktop: { label: 'كمبيوتر', color: 'text-slate-600', bg: 'bg-slate-100', icon: <Monitor size={12} /> },
  mobile: { label: 'جوال', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Smartphone size={12} /> },
  tablet: { label: 'تابلت', color: 'text-purple-600', bg: 'bg-purple-100', icon: <Activity size={12} /> },
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

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filterSource, setFilterSource] = useState('all');
  const [filterDevice, setFilterDevice] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [guideOpen, setGuideOpen] = useState(false);

  const { shop } = useShop();

  const loadVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      
      // TODO: Replace with actual API call
      // const data = await apiRequest(`/analytics/visitors/shop/${sid}`);
      // setVisitors(Array.isArray(data) ? data : []);
      setVisitors([]);
    } catch { setVisitors([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadVisitors(); }, [loadVisitors]);

  const filteredAndSorted = useMemo(() => {
    let result = visitors.filter(v => 
      v.date.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    if (filterSource !== 'all') {
      result = result.filter(v => v.trafficSource === filterSource);
    }

    if (filterDevice !== 'all') {
      result = result.filter(v => v.device === filterDevice);
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'visitors') {
        comparison = a.uniqueVisitors - b.uniqueVisitors;
      } else if (sortBy === 'pageViews') {
        comparison = a.pageViews - b.pageViews;
      } else if (sortBy === 'bounceRate') {
        comparison = a.bounceRate - b.bounceRate;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [visitors, debouncedSearch, filterSource, filterDevice, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportCSV = () => {
    const headers = ['Date', 'Unique Visitors', 'Page Views', 'Bounce Rate', 'Avg Session Duration', 'Traffic Source', 'Device', 'Location'];
    const rows = filteredAndSorted.map(v => [
      v.date,
      v.uniqueVisitors,
      v.pageViews,
      `${v.bounceRate}%`,
      `${v.avgSessionDuration}s`,
      v.trafficSource,
      v.device,
      v.location || '-'
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'visitors.csv';
    link.click();
  };

  const stats = useMemo(() => {
    const totalVisitors = visitors.reduce((s, v) => s + v.uniqueVisitors, 0);
    const totalPageViews = visitors.reduce((s, v) => s + v.pageViews, 0);
    const avgBounceRate = visitors.length > 0 ? visitors.reduce((s, v) => s + v.bounceRate, 0) / visitors.length : 0;
    const avgSessionDuration = visitors.length > 0 ? visitors.reduce((s, v) => s + v.avgSessionDuration, 0) / visitors.length : 0;
    return [
      { label: 'إجمالي الزوار', value: totalVisitors.toLocaleString(), bg: 'bg-blue-50', color: 'text-blue-600' },
      { label: 'إجمالي المشاهدات', value: totalPageViews.toLocaleString(), bg: 'bg-purple-50', color: 'text-purple-600' },
      { label: 'متوسط معدل الارتداد', value: `${avgBounceRate.toFixed(1)}%`, bg: 'bg-amber-50', color: 'text-amber-600' },
      { label: 'متوسط مدة الجلسة', value: `${Math.round(avgSessionDuration)}دقيقة`, bg: 'bg-cyan-50', color: 'text-cyan-600' },
    ];
  }, [visitors]);

  const sourceCounts = useMemo(() => 
    Object.keys(SOURCE_CONFIG).map(key => ({
      key,
      count: visitors.filter(v => v.trafficSource === key).length,
      ...SOURCE_CONFIG[key]
    })), [visitors]
  );

  const deviceCounts = useMemo(() => 
    Object.keys(DEVICE_CONFIG).map(key => ({
      key,
      count: visitors.filter(v => v.device === key).length,
      ...DEVICE_CONFIG[key]
    })), [visitors]
  );

  const visitorsGuide: AnalyticsGuideData = {
    purpose: 'تتبع زيارات المتجر بالتفصيل مع تحليل مصادر الزوار، الأجهزة المستخدمة، وسلوك التصفح.',
    whenToUse: 'استخدم هذه الصفحة لتحليل حركة الزوار، فهم مصادر الزيارات، وتحسين تجربة المستخدم.',
    whatsInside: [
      'إحصائيات الزوار اليومية',
      'مصادر الزيارات (مباشر، عضوي، إحالة، اجتماعي)',
      'الأجهزة المستخدمة (كمبيوتر، جوال، تابلت)',
      'معدل الارتداد ومدة الجلسة',
      'تصفية وبحث متقدم',
      'تصدير التقارير'
    ],
    steps: [
      { title: 'راجع الإحصائيات', description: 'اطلع على إحصائيات الزوار الرئيسية' },
      { title: 'حلل المصادر', description: 'افهم مصادر الزيارات المختلفة' },
      { title: 'تحليل الأجهزة', description: 'راقب الأجهزة المستخدمة للوصول' },
      { title: 'حسّن الأداء', description: 'راقب معدل الارتداد ومدة الجلسة' }
    ],
    bestPractices: [
      'راجع الإحصائيات يومياً',
      'ركز على مصادر الزيارات المهمة',
      'حسّن تجربة المستخدم',
      'قلل معدل الارتداد'
    ],
    tips: [
      'معدل الارتداد المنخفض يعني أداء أفضل',
      'الزوار من الجوال في زيادة',
      'استخدم الفلاتر للوصول السريع'
    ],
    shortcuts: [
      'استخدم مفتاح Enter للبحث السريع',
      'اضغط F5 لتحديث البيانات'
    ],
    relatedLinks: [
      { label: 'التحليلات', onClick: () => window.location.href = '/dashboard/analytics' },
      { label: 'المؤشرات', onClick: () => window.location.href = '/dashboard/analytics/kpi' },
      { label: 'الرسوم البيانية', onClick: () => window.location.href = '/dashboard/analytics/charts' }
    ]
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Eye size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الزوار</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">تحليل زيارات المتجر</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all">
          <Download size={16} />
          <span>تصدير CSV</span>
        </button>
        <button onClick={loadVisitors} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sourceCounts.map(s => (
          <button 
            key={s.key} 
            onClick={() => setFilterSource(filterSource === s.key ? 'all' : s.key)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filterSource === s.key ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200 bg-white'
            }`}
          >
            <div className={`flex items-center justify-center gap-1 mb-1 ${s.color}`}>
              {s.icon}
              <span className="text-xs font-bold">{s.label}</span>
            </div>
            <div className="text-lg font-black text-slate-900">{s.count}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {deviceCounts.map(d => (
          <button 
            key={d.key} 
            onClick={() => setFilterDevice(filterDevice === d.key ? 'all' : d.key)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filterDevice === d.key ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200 bg-white'
            }`}
          >
            <div className={`flex items-center justify-center gap-1 mb-1 ${d.color}`}>
              {d.icon}
              <span className="text-xs font-bold">{d.label}</span>
            </div>
            <div className="text-lg font-black text-slate-900">{d.count}</div>
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
          <option value="date">التاريخ</option>
          <option value="visitors">الزوار</option>
          <option value="pageViews">المشاهدات</option>
          <option value="bounceRate">معدل الارتداد</option>
        </select>
      </div>

      <div className="relative">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن تاريخ..."
          className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Eye size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد بيانات زوار</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {paginatedData.map((visitor) => (
              <div key={visitor.id} className="p-4 hover:bg-slate-50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Calendar size={20} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-900">{new Date(visitor.date).toLocaleDateString('ar-EG')}</div>
                      {visitor.location && (
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin size={12} />
                          {visitor.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      SOURCE_CONFIG[visitor.trafficSource].bg
                    } ${SOURCE_CONFIG[visitor.trafficSource].color}`}>
                      {SOURCE_CONFIG[visitor.trafficSource].label}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      DEVICE_CONFIG[visitor.device].bg
                    } ${DEVICE_CONFIG[visitor.device].color}`}>
                      {DEVICE_CONFIG[visitor.device].label}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">زوار فريدون</div>
                    <div className="text-lg font-black text-slate-900">{visitor.uniqueVisitors.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">مشاهدات الصفحة</div>
                    <div className="text-lg font-black text-slate-900">{visitor.pageViews.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">معدل الارتداد</div>
                    <div className={`text-lg font-black ${
                      visitor.bounceRate < 50 ? 'text-green-600' : 
                      visitor.bounceRate < 70 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {visitor.bounceRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">مدة الجلسة</div>
                    <div className="text-lg font-black text-slate-900">{Math.round(visitor.avgSessionDuration)}دقيقة</div>
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
        <InfoDrawer title="الزوار" onClose={() => setGuideOpen(false)}>
          <AnalyticsGuideContent guide={visitorsGuide} />
        </InfoDrawer>
      )}
    </div>
  );
}