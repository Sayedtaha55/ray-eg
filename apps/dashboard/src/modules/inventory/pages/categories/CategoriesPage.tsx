import React, { useState, useEffect, useCallback } from 'react';
import { FolderTree, Plus, Search, Trash2, Edit, Loader2, X, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

type Category = { id: string; name: string; nameAr?: string; productCount: number; parent?: string; icon?: string };

const CategoriesPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getProducts(shopId);
      const products = Array.isArray(res) ? res : (res as any)?.data || [];
      const catMap = new Map<string, Category>();
      products.forEach((p: any) => {
        const catName = p.category || (isArabic ? 'غير مصنف' : 'Uncategorized');
        if (!catMap.has(catName)) catMap.set(catName, { id: catName, name: catName, productCount: 0 });
        catMap.get(catName)!.productCount++;
      });
      setCategories(Array.from(catMap.values()));
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, isArabic]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الفئات' : 'Categories'}</h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة فئات المنتجات' : 'Manage product categories'}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors">
          <Plus size={18} /> {isArabic ? 'فئة جديدة' : 'New Category'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الفئات' : 'Total Categories', value: categories.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'المنتجات المصنفة' : 'Categorized Products', value: categories.reduce((s, c) => s + c.productCount, 0), color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'أكبر فئة' : 'Largest Category', value: categories.sort((a, b) => b.productCount - a.productCount)[0]?.name || '---', color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'متوسط المنتجات' : 'Avg Products', value: categories.length ? Math.round(categories.reduce((s, c) => s + c.productCount, 0) / categories.length) : 0, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><FolderTree size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center"><FolderTree size={64} className="mx-auto mb-4 text-slate-200" /><p className="font-black text-xl text-slate-300">{isArabic ? 'لا توجد فئات' : 'No categories'}</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><FolderTree size={20} /></div>
                <div><p className="font-bold text-sm">{c.name}</p><p className="text-xs text-slate-400">{c.productCount} {isArabic ? 'منتج' : 'products'}</p></div>
              </div>
              <div className="flex items-center gap-2"><Edit size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" /><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer" /></div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'فئة جديدة' : 'New Category'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم الفئة' : 'Category name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
