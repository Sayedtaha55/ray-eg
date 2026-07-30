import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Search, Loader2, Bell, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

const LowStockAlertsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [threshold, setThreshold] = useState(10);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getProducts(shopId);
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      setProducts(data.map((p: any) => ({
        id: String(p.id), name: p.name || '---', sku: p.sku || '---',
        stock: Number(p.stock || p.quantity || 0),
        reorderPoint: Number(p.reorderPoint || threshold),
        category: p.category || '---',
      })));
    } catch { setProducts([]); } finally { setLoading(false); }
  }, [shopId, threshold]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const lowStock = products.filter(p => p.stock <= p.reorderPoint);
  const outOfStock = products.filter(p => p.stock === 0);
  const filtered = lowStock.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'تنبيهات النفاد' : 'Low Stock Alerts'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'المنتجات التي على وشك النفاد' : 'Products running low on stock'}</p></div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400">{isArabic ? 'حد التنبيه' : 'Alert threshold'}</label>
          <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'منتجات منخفضة' : 'Low Stock', value: lowStock.length, color: 'bg-amber-50 text-amber-600', icon: <AlertTriangle size={20} /> },
          { label: isArabic ? 'نفد المخزون' : 'Out of Stock', value: outOfStock.length, color: 'bg-red-50 text-red-600', icon: <Package size={20} /> },
          { label: isArabic ? 'إجمالي المنتجات' : 'Total Products', value: products.length, color: 'bg-blue-50 text-blue-600', icon: <Package size={20} /> },
          { label: isArabic ? 'نسبة النفاد' : 'Stock-out Rate', value: `${products.length ? Math.round((outOfStock.length / products.length) * 100) : 0}%`, color: 'bg-purple-50 text-purple-600', icon: <Bell size={20} /> },
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
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center"><Package size={64} className="mx-auto mb-4 text-green-200" /><p className="font-black text-xl text-green-300">{isArabic ? 'كل المنتجات متوفرة' : 'All products in stock'}</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border ${p.stock === 0 ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  {p.stock === 0 ? <Package size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div><p className="font-bold text-sm">{p.name}</p><p className="text-xs text-slate-400">SKU: {p.sku} · {p.category}</p></div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>{p.stock}</p>
                <p className="text-xs text-slate-400">{isArabic ? 'حد إعادة الطلب' : 'Reorder at'}: {p.reorderPoint}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockAlertsPage;
