import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Search, Loader2, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

type Variant = { id: string; productName: string; variantName: string; options: string[]; stock: number; price: number; sku?: string };

const VariantsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadVariants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getProducts(shopId);
      const products = Array.isArray(res) ? res : (res as any)?.data || [];
      const vlist: Variant[] = [];
      products.forEach((p: any) => {
        if (p.variants?.length) {
          p.variants.forEach((v: any) => vlist.push({
            id: String(v.id || `${p.id}-${v.name}`),
            productName: p.name || '---',
            variantName: v.name || '---',
            options: v.options || [],
            stock: Number(v.stock || v.quantity || 0),
            price: Number(v.price || p.price || 0),
            sku: v.sku,
          }));
        } else if (p.options?.length) {
          vlist.push({
            id: String(p.id),
            productName: p.name || '---',
            variantName: (isArabic ? 'افتراضي' : 'Default'),
            options: p.options,
            stock: Number(p.stock || p.quantity || 0),
            price: Number(p.price || 0),
            sku: p.sku,
          });
        }
      });
      setVariants(vlist);
    } catch {
      setVariants([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, isArabic]);

  useEffect(() => { loadVariants(); }, [loadVariants]);

  const filtered = variants.filter(v => v.productName.toLowerCase().includes(search.toLowerCase()) || v.variantName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'المتغيرات' : 'Variants'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة متغيرات المنتجات' : 'Manage product variants'}</p></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي المتغيرات' : 'Total Variants', value: variants.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'متوفر' : 'In Stock', value: variants.filter(v => v.stock > 0).length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'نفد' : 'Out of Stock', value: variants.filter(v => v.stock === 0).length, color: 'bg-red-50 text-red-600' },
          { label: isArabic ? 'منتجات بمتغيرات' : 'Products w/ Variants', value: new Set(variants.map(v => v.productName)).size, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Layers size={20} /></div>
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
        <div className="py-20 text-center"><Layers size={64} className="mx-auto mb-4 text-slate-200" /><p className="font-black text-xl text-slate-300">{isArabic ? 'لا توجد متغيرات' : 'No variants'}</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-right border-b border-slate-100">
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المنتج' : 'Product'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المتغير' : 'Variant'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الخيارات' : 'Options'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المخزون' : 'Stock'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'السعر' : 'Price'}</th>
              <th className="pb-3 font-bold text-slate-400">SKU</th>
            </tr></thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 font-bold">{v.productName}</td>
                  <td className="py-3 font-medium">{v.variantName}</td>
                  <td className="py-3"><div className="flex flex-wrap gap-1">{v.options.map((o, i) => <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium">{o}</span>)}</div></td>
                  <td className={`py-3 font-bold ${v.stock === 0 ? 'text-red-500' : v.stock < 5 ? 'text-amber-500' : 'text-green-600'}`}>{v.stock}</td>
                  <td className="py-3 font-bold">{t('business.reports.currency')} {v.price.toLocaleString()}</td>
                  <td className="py-3 text-slate-400 text-xs">{v.sku || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VariantsPage;
