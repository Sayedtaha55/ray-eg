import React, { useState, useEffect, useCallback } from 'react';
import { Barcode, Search, Loader2, Download, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

const BarcodePage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getProducts(shopId);
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      setProducts(data);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, [shopId]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filtered = products.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الباركود' : 'Barcode'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إنشاء وطباعة الباركود للمنتجات' : 'Generate and print barcodes for products'}</p></div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors"><Download size={16} /> {isArabic ? 'تحميل' : 'Download'}</button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Printer size={16} /> {isArabic ? 'طباعة' : 'Print'}</button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث بالاسم أو SKU...' : 'Search by name or SKU...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center"><Barcode size={64} className="mx-auto mb-4 text-slate-200" /><p className="font-black text-xl text-slate-300">{isArabic ? 'لا توجد منتجات' : 'No products'}</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <div key={p.id} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selected.has(String(p.id)) ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`} onClick={() => toggleSelect(String(p.id))}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm truncate flex-1">{p.name || '---'}</p>
                <input type="checkbox" checked={selected.has(String(p.id))} readOnly className="ml-2" />
              </div>
              <p className="text-xs text-slate-400 mb-2">SKU: {p.sku || '---'}</p>
              <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex gap-0.5">{Array.from({ length: 30 }).map((_, i) => <div key={i} className={`w-0.5 ${i % 3 === 0 ? 'h-10' : i % 2 === 0 ? 'h-8' : 'h-6'} bg-slate-900`} />)}</div>
                  <p className="text-xs font-mono font-bold">{p.sku || p.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BarcodePage;
