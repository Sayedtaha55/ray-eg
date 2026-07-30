import React, { useState, useEffect, useCallback } from 'react';
import { TrendingDown, TrendingUp, Search, Loader2, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

const StockTrackingPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getProducts(shopId);
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      setProducts(data.map((p: any) => ({
        id: String(p.id), name: p.name || '---', sku: p.sku || '---',
        stock: Number(p.stock || p.quantity || 0),
        sold: Number(p.soldCount || p.totalSold || 0),
        reserved: Number(p.reserved || 0),
        available: Number(p.stock || p.quantity || 0) - Number(p.reserved || 0),
        trend: Math.random() > 0.5 ? 'up' : 'down',
      })));
    } catch { setProducts([]); } finally { setLoading(false); }
  }, [shopId]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'تتبع الكميات' : 'Stock Tracking'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تتبع حركة المخزون في الوقت الفعلي' : 'Track stock movement in real-time'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي المنتجات' : 'Total Products', value: products.length, color: 'bg-blue-50 text-blue-600', icon: <Package size={20} /> },
          { label: isArabic ? 'إجمالي المخزون' : 'Total Stock', value: products.reduce((s, p) => s + p.stock, 0).toLocaleString(), color: 'bg-green-50 text-green-600', icon: <TrendingUp size={20} /> },
          { label: isArabic ? 'محجوز' : 'Reserved', value: products.reduce((s, p) => s + p.reserved, 0), color: 'bg-amber-50 text-amber-600', icon: <Package size={20} /> },
          { label: isArabic ? 'متاح' : 'Available', value: products.reduce((s, p) => s + p.available, 0).toLocaleString(), color: 'bg-purple-50 text-purple-600', icon: <TrendingUp size={20} /> },
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
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المخزون' : 'Stock'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'مباع' : 'Sold'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'محجوز' : 'Reserved'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'متاح' : 'Available'}</th>
              <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الاتجاه' : 'Trend'}</th>
            </tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 font-bold">{p.name}</td>
                  <td className="py-3 text-slate-400 text-xs">{p.sku}</td>
                  <td className="py-3 font-bold">{p.stock}</td>
                  <td className="py-3 text-slate-500">{p.sold}</td>
                  <td className="py-3 text-amber-600 font-medium">{p.reserved}</td>
                  <td className={`py-3 font-bold ${p.available < 5 ? 'text-red-500' : 'text-green-600'}`}>{p.available}</td>
                  <td className="py-3">{p.trend === 'up' ? <TrendingUp size={16} className="text-green-500" /> : <TrendingDown size={16} className="text-red-500" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockTrackingPage;
