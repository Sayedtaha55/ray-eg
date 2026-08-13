'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FileText, Plus, Search, RefreshCw, Filter, ChevronDown, Info, Target, BookOpen, Zap, Link2, ChevronRight, Lightbulb, XCircle, Calendar, Eye, Trash2, Copy, Edit, MoreVertical, Home, Menu, ExternalLink, Lock, Unlock } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Page = {
  id: string;
  title: string;
  slug: string;
  type: 'home' | 'about' | 'contact' | 'blog' | 'product' | 'custom';
  status: 'published' | 'draft' | 'archived';
  isHomepage: boolean;
  inMenu: boolean;
  isLocked: boolean;
  lastModified: string;
  createdAt: string;
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  home: { label: 'الرئيسية', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Home size={12} /> },
  about: { label: 'عن الموقع', color: 'text-purple-600', bg: 'bg-purple-100', icon: <FileText size={12} /> },
  contact: { label: 'اتصل بنا', color: 'text-green-600', bg: 'bg-green-100', icon: <FileText size={12} /> },
  blog: { label: 'مدونة', color: 'text-amber-600', bg: 'bg-amber-100', icon: <FileText size={12} /> },
  product: { label: 'منتج', color: 'text-pink-600', bg: 'bg-pink-100', icon: <FileText size={12} /> },
  custom: { label: 'مخصص', color: 'text-slate-600', bg: 'bg-slate-100', icon: <FileText size={12} /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  published: { label: 'منشور', color: 'text-green-600', bg: 'bg-green-100', icon: <Eye size={12} /> },
  draft: { label: 'مسودة', color: 'text-amber-600', bg: 'bg-amber-100', icon: <FileText size={12} /> },
  archived: { label: 'مؤرشف', color: 'text-slate-600', bg: 'bg-slate-100', icon: <XCircle size={12} /> },
};

/* ============================================================
 * Website Guide System
 * ============================================================ */

type GuideStep = {
  title: string;
  description: string;
};

type GuideLink = {
  label: string;
  onClick?: () => void;
};

type WebsiteGuideData = {
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

const WebsiteGuideContent: React.FC<{ guide: WebsiteGuideData }> = ({ guide }) => (
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
              <FileText size={14} className="text-green-500 mt-0.5 shrink-0" />
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

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [guideOpen, setGuideOpen] = useState(false);

  const { shop } = useShop();

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      
      // TODO: Replace with actual API call
      // const data = await apiRequest(`/pages/shop/${sid}`);
      // setPages(Array.isArray(data) ? data : []);
      setPages([]);
    } catch { setPages([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPages(); }, [loadPages]);

  const filteredAndSorted = useMemo(() => {
    let result = pages.filter(page => 
      page.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      page.slug.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    if (filterType !== 'all') {
      result = result.filter(page => page.type === filterType);
    }

    if (filterStatus !== 'all') {
      result = result.filter(page => page.status === filterStatus);
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [pages, debouncedSearch, filterType, filterStatus, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    const total = pages.length;
    const published = pages.filter(p => p.status === 'published').length;
    const inMenu = pages.filter(p => p.inMenu).length;
    return [
      { label: 'إجمالي الصفحات', value: total, bg: 'bg-blue-50', color: 'text-blue-600' },
      { label: 'منشورة', value: published, bg: 'bg-green-50', color: 'text-green-600' },
      { label: 'في القائمة', value: inMenu, bg: 'bg-purple-50', color: 'text-purple-600' },
      { label: 'مسودة', value: pages.filter(p => p.status === 'draft').length, bg: 'bg-amber-50', color: 'text-amber-600' },
    ];
  }, [pages]);

  const typeCounts = useMemo(() => 
    Object.keys(TYPE_CONFIG).map(key => ({
      key,
      count: pages.filter(p => p.type === key).length,
      ...TYPE_CONFIG[key]
    })), [pages]
  );

  const pagesGuide: WebsiteGuideData = {
    purpose: 'إدارة صفحات موقعك مع إنشاء وتحرير ونشر وتنظيم الصفحات.',
    whenToUse: 'استخدم هذه الصفحة لإدارة جميع صفحات موقعك وتعديل المحتوى.',
    whatsInside: [
      'قائمة الصفحات',
      'إنشاء صفحة جديدة',
      'تحرير الصفحات',
      'نشر الصفحات',
      'إدارة القائمة',
      'تصفية وبحث متقدم'
    ],
    steps: [
      { title: 'أنشئ صفحة', description: 'أنشئ صفحة جديدة أو اختر قالباً' },
      { title: 'حرر المحتوى', description: 'عدل محتوى وتصميم الصفحة' },
      { title: 'نشر الصفحة', description: 'انشر الصفحة لجعلها متاحة' },
      { title: 'أضف للقائمة', description: 'أضف الصفحة للقائمة الرئيسية' }
    ],
    bestPractices: [
      'استخدم عناوين واضحة',
      'راجع الصفحة قبل النشر',
      'نظم الصفحات في فئات',
      'استخدم الصفحة الرئيسية بحذر'
    ],
    tips: [
      'الصفحة الرئيسية لا يمكن حذفها',
      'المسودات لا تظهر للجمهور',
      'يمكنك قفل الصفحات المهمة'
    ],
    shortcuts: [
      'استخدم مفتاح Enter للبحث السريع',
      'اضغط F5 لتحديث البيانات'
    ],
    relatedLinks: [
      { label: 'القوالب', onClick: () => window.location.href = '/dashboard/website/templates' },
      { label: 'الثيمات', onClick: () => window.location.href = '/dashboard/website/themes' }
    ]
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <FileText size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الصفحات</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة صفحات الموقع</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all">
          <Plus size={16} />
          <span>صفحة جديدة</span>
        </button>
        <button onClick={loadPages} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
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
          <span className="text-sm font-bold text-slate-600">الحالة:</span>
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
        >
          <option value="all">الكل</option>
          <option value="published">منشور</option>
          <option value="draft">مسودة</option>
          <option value="archived">مؤرشف</option>
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
          <option value="date">تاريخ التعديل</option>
          <option value="title">العنوان</option>
        </select>
      </div>

      <div className="relative">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن صفحة..."
          className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد صفحات</p>
          <button className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all">
            إنشاء صفحة
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {paginatedData.map((page) => (
              <div key={page.id} className="p-4 hover:bg-slate-50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      {TYPE_CONFIG[page.type].icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        {page.title}
                        {page.isHomepage && (
                          <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-600 text-xs font-black">الرئيسية</span>
                        )}
                        {page.isLocked && (
                          <Lock size={12} className="text-slate-400" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">/{page.slug}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    STATUS_CONFIG[page.status].bg
                  } ${STATUS_CONFIG[page.status].color}`}>
                    {STATUS_CONFIG[page.status].label}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">النوع</div>
                    <div className="text-xs font-semibold text-slate-700">{TYPE_CONFIG[page.type].label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">في القائمة</div>
                    <div className="text-xs font-semibold text-slate-700">{page.inMenu ? 'نعم' : 'لا'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">آخر تعديل</div>
                    <div className="text-xs font-semibold text-slate-700">{new Date(page.lastModified).toLocaleDateString('ar-EG')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">تاريخ الإنشاء</div>
                    <div className="text-xs font-semibold text-slate-700">{new Date(page.createdAt).toLocaleDateString('ar-EG')}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="تحرير">
                      <Edit size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="نسخ">
                      <Copy size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="حذف">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all">
                      <Eye size={12} />
                      معاينة
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all">
                      <ExternalLink size={12} />
                      زيارة
                    </button>
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
                  onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
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
        <InfoDrawer title="الصفحات" onClose={() => setGuideOpen(false)}>
          <WebsiteGuideContent guide={pagesGuide} />
        </InfoDrawer>
      )}
    </div>
  );
}