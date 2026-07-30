import React, { useState } from 'react';
import { FileText, Plus, Search, X, Eye, Edit, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Page = { id: string; title: string; slug: string; status: 'published' | 'draft'; updatedAt: string; views: number };

const PagesPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pages, setPages] = useState<Page[]>([
    { id: '1', title: isArabic ? 'الرئيسية' : 'Home', slug: '/', status: 'published', updatedAt: '2026-07-28', views: 5200 },
    { id: '2', title: isArabic ? 'من نحن' : 'About Us', slug: '/about', status: 'published', updatedAt: '2026-07-20', views: 1800 },
    { id: '3', title: isArabic ? 'اتصل بنا' : 'Contact', slug: '/contact', status: 'published', updatedAt: '2026-07-15', views: 950 },
    { id: '4', title: isArabic ? 'الخدمات' : 'Services', slug: '/services', status: 'draft', updatedAt: '2026-07-28', views: 0 },
  ]);

  const filtered = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الصفحات' : 'Pages'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة صفحات الموقع' : 'Manage website pages'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'صفحة جديدة' : 'New Page'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الصفحات' : 'Total Pages', value: pages.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'منشورة' : 'Published', value: pages.filter(p => p.status === 'published').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'مسودة' : 'Draft', value: pages.filter(p => p.status === 'draft').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'إجمالي المشاهدات' : 'Total Views', value: pages.reduce((s, p) => s + p.views, 0).toLocaleString(), color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><FileText size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><FileText size={20} /></div>
              <div>
                <p className="font-bold text-sm">{p.title}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1"><Globe size={10} /> {p.slug} · {new Date(p.updatedAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')} · {p.views.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{p.status === 'published' ? (isArabic ? 'منشور' : 'Published') : (isArabic ? 'مسودة' : 'Draft')}</span>
              <Eye size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
              <Edit size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'صفحة جديدة' : 'New Page'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'عنوان الصفحة' : 'Page title'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'المسار (slug)' : 'Slug'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesPage;
