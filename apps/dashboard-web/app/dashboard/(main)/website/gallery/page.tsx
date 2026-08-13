'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Image as ImageIcon, Plus, Search, RefreshCw, Filter, ChevronDown, Info, Target, BookOpen, Zap, Link2, ChevronRight, Lightbulb, XCircle, Calendar, Eye, Trash2, Copy, Download, MoreVertical, Grid, List } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type GalleryItem = {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnailUrl?: string;
  size: number;
  width?: number;
  height?: number;
  category?: string;
  tags?: string[];
  createdAt: string;
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  image: { label: 'صورة', color: 'text-blue-600', bg: 'bg-blue-100', icon: <ImageIcon size={12} /> },
  video: { label: 'فيديو', color: 'text-purple-600', bg: 'bg-purple-100', icon: <ImageIcon size={12} /> },
  document: { label: 'مستند', color: 'text-amber-600', bg: 'bg-amber-100', icon: <ImageIcon size={12} /> },
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
              <ImageIcon size={14} className="text-green-500 mt-0.5 shrink-0" />
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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [guideOpen, setGuideOpen] = useState(false);

  const { shop } = useShop();

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      
      // TODO: Replace with actual API call
      // const data = await apiRequest(`/gallery/shop/${sid}`);
      // setItems(Array.isArray(data) ? data : []);
      setItems([]);
    } catch { setItems([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const filteredAndSorted = useMemo(() => {
    let result = items.filter(item => 
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );

    if (filterType !== 'all') {
      result = result.filter(item => item.type === filterType);
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'size') {
        comparison = a.size - b.size;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [items, debouncedSearch, filterType, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    const total = items.length;
    const images = items.filter(i => i.type === 'image').length;
    const videos = items.filter(i => i.type === 'video').length;
    const totalSize = items.reduce((s, i) => s + i.size, 0);
    return [
      { label: 'إجمالي العناصر', value: total, bg: 'bg-blue-50', color: 'text-blue-600' },
      { label: 'صور', value: images, bg: 'bg-purple-50', color: 'text-purple-600' },
      { label: 'فيديو', value: videos, bg: 'bg-green-50', color: 'text-green-600' },
      { label: 'الحجم الكلي', value: formatFileSize(totalSize), bg: 'bg-amber-50', color: 'text-amber-600' },
    ];
  }, [items]);

  const galleryGuide: WebsiteGuideData = {
    purpose: 'معرض الصور والوسائط لموقعك مع إمكانية رفع وتنظيم وعرض الصور والفيديو.',
    whenToUse: 'استخدم هذه الصفحة لعرض وإدارة جميع الصور والوسائط المستخدمة في موقعك.',
    whatsInside: [
      'معرض الصور والفيديو',
      'رفع ملفات جديدة',
      'تنظيم العناصر',
      'بحث وتصفية',
      'عرض شبكي وقائمة'
    ],
    steps: [
      { title: 'ارفع ملف', description: 'ارفع صورة أو فيديو إلى المعرض' },
      { title: 'راجع العنصر', description: 'اطلع على تفاصيل وحجم العنصر' },
      { title: 'نظم العناصر', description: 'استخدم الفلاتر للوصول للعناصر المطلوبة' },
      { title: 'استخدم العنصر', description: 'استخدم العنصر في صفحات موقعك' }
    ],
    bestPractices: [
      'ارفع صور بجودة عالية',
      'راجع حجم الملفات',
      'نظم العناصر في فئات',
      'استخدم العرض الشبكي للمعاينة'
    ],
    tips: [
      'الصور المضغوطة تحسن الأداء',
      'الفيديو يستهلك مساحة كبيرة',
      'يمكنك التبديل بين العرض الشبكي والقائمة'
    ],
    shortcuts: [
      'استخدم مفتاح Enter للبحث السريع',
      'اضغط F5 لتحديث البيانات'
    ],
    relatedLinks: [
      { label: 'مكتبة الوسائط', onClick: () => window.location.href = '/dashboard/website/media' },
      { label: 'القوالب', onClick: () => window.location.href = '/dashboard/website/templates' }
    ]
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <ImageIcon size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">المعرض</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">معرض الصور والوسائط</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all">
          <Plus size={16} />
          <span>رفع ملف</span>
        </button>
        <button onClick={loadItems} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
          <RefreshCw size={16} />
          <span>تحديث</span>
        </button>
        <button 
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all"
        >
          {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
          <span>{viewMode === 'grid' ? 'قائمة' : 'شبكة'}</span>
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

      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-600">النوع:</span>
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
        >
          <option value="all">الكل</option>
          <option value="image">صور</option>
          <option value="video">فيديو</option>
          <option value="document">مستندات</option>
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
          <option value="date">تاريخ الرفع</option>
          <option value="name">الاسم</option>
          <option value="size">الحجم</option>
        </select>
      </div>

      <div className="relative">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن عنصر..."
          className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ImageIcon size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد عناصر</p>
          <button className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all">
            رفع ملف
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {paginatedData.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
              <div className="aspect-square bg-slate-100 relative">
                {item.type === 'image' && item.url ? (
                  <img src={item.thumbnailUrl || item.url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {TYPE_CONFIG[item.type].icon}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-all" title="معاينة">
                    <Eye size={14} className="text-white" />
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-all" title="تحميل">
                    <Download size={14} className="text-white" />
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-red-500/20 backdrop-blur flex items-center justify-center hover:bg-red-500/30 transition-all" title="حذف">
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-slate-600 font-semibold truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                    TYPE_CONFIG[item.type].bg
                  } ${TYPE_CONFIG[item.type].color}`}>
                    {TYPE_CONFIG[item.type].label}
                  </span>
                  <span className="text-xs text-slate-400">{formatFileSize(item.size)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {paginatedData.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {item.type === 'image' && item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      TYPE_CONFIG[item.type].icon
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                        TYPE_CONFIG[item.type].bg
                      } ${TYPE_CONFIG[item.type].color}`}>
                        {TYPE_CONFIG[item.type].label}
                      </span>
                      <span className="text-xs text-slate-400">{formatFileSize(item.size)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معاينة">
                      <Eye size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="تحميل">
                      <Download size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="حذف">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {guideOpen && (
        <InfoDrawer title="المعرض" onClose={() => setGuideOpen(false)}>
          <WebsiteGuideContent guide={galleryGuide} />
        </InfoDrawer>
      )}
    </div>
  );
}