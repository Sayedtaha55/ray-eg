import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, Search, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

const StocktakePage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getProducts(shopId);
      const products = Array.isArray(res) ? res : (res as any)?.data || [];
      setItems(products.map((p: any) => ({
        id: String(p.id), name: p.name || '---', sku: p.sku || '---',
        systemStock: Number(p.stock || p.quantity || 0),
        countedStock: Number(p.stock || p.quantity || 0),
        variance: 0, status: 'matched',
      })));
    } catch { setItems([]); } finally { setLoading(false); }
  }, [shopId]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const updateCount = (id: string, count: number) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const variance = count - it.systemStock;
      return { ...it, countedStock: count, variance, status: variance === 0 ? 'matched' : variance > 0 ? 'surplus' : 'shortage' };
    }));
  };

  const filtered = items.filter(it => it.name.toLowerCase().includes(search.toLowerCase()) || it.sku.toLowerCase().includes(search.toLowerCase()));
  const matched = items.filter(i => i.status === 'matched').length;
  const shortages = items.filter(i => i.status === 'shortage').length;
  const surpluses = items.filter(i => i.status === 'surplus').length;

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الجرد' : 'Stocktake'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'جرد المخزون ومطابقة الكميات' : 'Inventory counting and reconciliation'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الأصناف' : 'Total Items', value: items.length, color: 'bg-blue-50 text-blue-600', icon: <ClipboardCheck size={20} /> },
          { label: isArabic ? 'مطابق' : 'Matched', value: matched, color: 'bg-green-50 text-green-600', icon: <CheckCircle2 size={20} /> },
          { label: isArabic ? 'نقص' : 'Shortages', value: shortages, color: 'bg-red-50 text-red-600', icon: <XCircle size={20} /> },
          { label: isArabic ? 'زيادة' : 'Surplus', value: surpluses, color: 'bg-amber-50 text-amber-600', icon: <AlertTriangle size={20} /> },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
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
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-right border-b border-slate-100">
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المنتج' : 'Product'}</th>
              <th className="pb-3 font-bold text-slate-400">SKU</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'مخزون النظام' : 'System Stock'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'العد الفعلي' : 'Counted'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الفرق' : 'Variance'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الحالة' : 'Status'}</th>
            </tr></thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 font-bold">{it.name}</td>
                  <td className="py-3 text-slate-400 text-xs">{it.sku}</td>
                  <td className="py-3 text-slate-500">{it.systemStock}</td>
                  <td className="py-3"><input type="number" value={it.countedStock} onChange={e => updateCount(it.id, Number(e.target.value))} className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-sm" /></td>
                  <td className={`py-3 font-bold ${it.variance === 0 ? 'text-slate-400' : it.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>{it.variance > 0 ? '+' : ''}{it.variance}</td>
                  <td className="py-3">{it.status === 'matched' ? <span className="px-2 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-600">{isArabic ? 'مطابق' : 'Matched'}</span> : it.status === 'shortage' ? <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-600">{isArabic ? 'نقص' : 'Shortage'}</span> : <span className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-600">{isArabic ? 'زيادة' : 'Surplus'}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StocktakePage;
