import React, { useEffect, useMemo, useState } from 'react';
import {
  Package, TrendingUp, TrendingDown, Download, Search, X, ArrowUpRight, ArrowDownRight,
  Star, ShoppingCart, DollarSign, Eye, Filter, ChevronDown, ChevronUp, Award,
  AlertTriangle, Boxes, RefreshCw, Tag, Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

type Product = {
  id: string;
  name: string;
  nameAr: string;
  sku: string;
  category: string;
  categoryAr: string;
  unitsSold: number;
  revenue: number;
  views: number;
  conversionRate: number;
  avgRating: number;
  stock: number;
  trend: number;
  status: 'star' | 'rising' | 'stable' | 'declining';
};

type SortKey = 'unitsSold' | 'revenue' | 'views' | 'conversionRate' | 'avgRating' | 'trend';

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Wireless Headphones Pro', nameAr: 'سماعات لاسلكية برو', sku: 'WH-001', category: 'Electronics', categoryAr: 'إلكترونيات', unitsSold: 1240, revenue: 124000, views: 18500, conversionRate: 6.7, avgRating: 4.8, stock: 320, trend: 18.4, status: 'star' },
  { id: 'p2', name: 'Smart Watch Series 5', nameAr: 'ساعة ذكية سيريس 5', sku: 'SW-205', category: 'Electronics', categoryAr: 'إلكترونيات', unitsSold: 980, revenue: 147000, views: 14200, conversionRate: 6.9, avgRating: 4.6, stock: 150, trend: 12.1, status: 'star' },
  { id: 'p3', name: 'Organic Cotton T-Shirt', nameAr: 'تيشيرت قطن عضوي', sku: 'TS-310', category: 'Apparel', categoryAr: 'ملابس', unitsSold: 2100, revenue: 42000, views: 31000, conversionRate: 6.8, avgRating: 4.4, stock: 880, trend: 8.7, status: 'rising' },
  { id: 'p4', name: 'Bluetooth Speaker Mini', nameAr: 'مكبر بلوتوث ميني', sku: 'BS-118', category: 'Electronics', categoryAr: 'إلكترونيات', unitsSold: 760, revenue: 38000, views: 9800, conversionRate: 7.8, avgRating: 4.5, stock: 210, trend: 22.3, status: 'rising' },
  { id: 'p5', name: 'Stainless Water Bottle', nameAr: 'زجاجة ماء ستانلس', sku: 'WB-022', category: 'Lifestyle', categoryAr: 'نمط حياة', unitsSold: 1450, revenue: 29000, views: 16800, conversionRate: 8.6, avgRating: 4.7, stock: 540, trend: 5.2, status: 'stable' },
  { id: 'p6', name: 'Leather Wallet Classic', nameAr: 'محفظة جلد كلاسيك', sku: 'LW-450', category: 'Accessories', categoryAr: 'إكسسوارات', unitsSold: 540, revenue: 27000, views: 7200, conversionRate: 7.5, avgRating: 4.3, stock: 95, trend: -4.1, status: 'declining' },
  { id: 'p7', name: 'Yoga Mat Premium', nameAr: 'سجادة يوغا بريميوم', sku: 'YM-077', category: 'Fitness', categoryAr: 'لياقة', unitsSold: 680, revenue: 34000, views: 8900, conversionRate: 7.6, avgRating: 4.6, stock: 180, trend: 14.8, status: 'rising' },
  { id: 'p8', name: 'Desk Lamp LED', nameAr: 'مصباح مكتب LED', sku: 'DL-901', category: 'Home', categoryAr: 'منزل', unitsSold: 420, revenue: 21000, views: 5400, conversionRate: 7.8, avgRating: 4.2, stock: 60, trend: -2.3, status: 'declining' },
];

const STATUS_META: Record<Product['status'], { en: string; ar: string; cls: string; icon: React.ReactNode }> = {
  star: { en: 'Top Seller', ar: 'الأكثر مبيعاً', cls: 'bg-amber-100 text-amber-700', icon: <Star size={12} /> },
  rising: { en: 'Rising', ar: 'صاعد', cls: 'bg-green-100 text-green-700', icon: <TrendingUp size={12} /> },
  stable: { en: 'Stable', ar: 'مستقر', cls: 'bg-blue-100 text-blue-700', icon: <Package size={12} /> },
  declining: { en: 'Declining', ar: 'منخفض', cls: 'bg-red-100 text-red-700', icon: <TrendingDown size={12} /> },
};

const ProductPerformancePage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('revenue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const sid = String(shopId || '').trim();
    if (!sid) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res: any = await ApiService.getProductPerformanceReport(sid, { period: '30d' });
        if (cancelled || !res) return;
        const data = res.data ?? res;
        if (Array.isArray(data?.products)) {
          setProducts(
            data.products.map((p: any) => ({
              id: String(p.id || ''),
              name: String(p.name || ''),
              nameAr: String(p.name_ar || p.nameAr || p.name || ''),
              sku: String(p.sku || ''),
              category: String(p.category || ''),
              categoryAr: String(p.category_ar || p.categoryAr || p.category || ''),
              unitsSold: Number(p.units_sold || p.unitsSold || 0),
              revenue: Number(p.revenue || 0),
              views: Number(p.views || 0),
              conversionRate: Number(p.conversion_rate || p.conversionRate || 0),
              avgRating: Number(p.avg_rating || p.avgRating || 0),
              stock: Number(p.stock || 0),
              trend: Number(p.trend || 0),
              status: (String(p.status || 'stable') as Product['status']),
            })),
          );
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load product performance');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [shopId]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => (isArabic ? p.categoryAr : p.category)));
    return ['all', ...Array.from(set)];
  }, [products, isArabic]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.nameAr.includes(search) || p.sku.toLowerCase().includes(q);
      const matchesCat = categoryFilter === 'all' || (isArabic ? p.categoryAr : p.category) === categoryFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesCat && matchesStatus;
    });
    list = [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [products, search, categoryFilter, statusFilter, sortKey, sortDir, isArabic]);

  const totals = useMemo(() => {
    const units = products.reduce((s, p) => s + p.unitsSold, 0);
    const revenue = products.reduce((s, p) => s + p.revenue, 0);
    const views = products.reduce((s, p) => s + p.views, 0);
    const avgConv = products.reduce((s, p) => s + p.conversionRate, 0) / (products.length || 1);
    return { units, revenue, views, avgConv };
  }, [products]);

  const topByRevenue = useMemo(() => [...filtered].sort((a, b) => b.revenue - a.revenue).slice(0, 5), [filtered]);
  const maxRev = Math.max(...topByRevenue.map((p) => p.revenue), 1);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const refreshData = () => {
    // Simulate refresh — re-shuffle trend slightly
    setProducts((prev) => prev.map((p) => ({ ...p, trend: +(p.trend + (Math.random() * 2 - 1)).toFixed(1) })));
  };

  const stats = [
    { label: isArabic ? 'إجمالي الوحدات المباعة' : 'Total Units Sold', value: totals.units.toLocaleString(), change: '+9.4%', up: true, icon: <Boxes size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: isArabic ? 'إجمالي الإيراد' : 'Total Revenue', value: `${t('business.reports.currency')} ${totals.revenue.toLocaleString()}`, change: '+14.2%', up: true, icon: <DollarSign size={20} />, color: 'bg-green-50 text-green-600' },
    { label: isArabic ? 'إجمالي المشاهدات' : 'Total Views', value: totals.views.toLocaleString(), change: '+6.1%', up: true, icon: <Eye size={20} />, color: 'bg-purple-50 text-purple-600' },
    { label: isArabic ? 'متوسط معدل التحويل' : 'Avg Conv. Rate', value: `${totals.avgConv.toFixed(1)}%`, change: '+0.8%', up: true, icon: <ShoppingCart size={20} />, color: 'bg-amber-50 text-amber-600' },
  ];

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  const columns: { key: SortKey; label: string; labelAr: string }[] = [
    { key: 'unitsSold', label: 'Units Sold', labelAr: 'الوحدات' },
    { key: 'revenue', label: 'Revenue', labelAr: 'الإيراد' },
    { key: 'views', label: 'Views', labelAr: 'المشاهدات' },
    { key: 'conversionRate', label: 'Conv. Rate', labelAr: 'معدل التحويل' },
    { key: 'avgRating', label: 'Rating', labelAr: 'التقييم' },
    { key: 'trend', label: 'Trend', labelAr: 'الاتجاه' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-2">
            <Package size={24} className="text-indigo-600" />
            {isArabic ? 'أداء المنتجات' : 'Product Performance'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">
            {isArabic ? 'تحليل أداء المنتجات والمبيعات' : 'Product sales & performance analysis'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            <Filter size={14} /> {isArabic ? 'فلترة' : 'Filters'}
          </button>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            <RefreshCw size={14} /> {isArabic ? 'تحديث' : 'Refresh'}
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors">
            <Download size={14} /> {isArabic ? 'تصدير' : 'Export'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
      {error && !loading && (
        <div className="flex items-center gap-2 p-4 mb-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${s.up ? 'text-green-600' : 'text-red-600'}`}>
                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{s.change}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400">{s.label}</p>
            <p className="text-lg font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top products bar chart */}
      <div className="p-5 rounded-2xl border border-slate-100 mb-4">
        <h4 className="font-black mb-4 flex items-center gap-2"><Award size={16} /> {isArabic ? 'أعلى المنتجات إيراداً' : 'Top Products by Revenue'}</h4>
        <div className="space-y-2">
          {topByRevenue.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold truncate">{isArabic ? p.nameAr : p.name}</span>
                  <span className="text-xs font-black text-slate-600">{t('business.reports.currency')} {p.revenue.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters bar */}
      {showFilters && (
        <div className="p-4 rounded-2xl border border-slate-100 mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 rtl:right-3 ltr:left-3 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isArabic ? 'بحث بالاسم أو SKU...' : 'Search by name or SKU...'}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'all' ? (isArabic ? 'كل الفئات' : 'All Categories') : c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">{isArabic ? 'كل الحالات' : 'All Statuses'}</option>
            {Object.entries(STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>{isArabic ? v.ar : v.en}</option>
            ))}
          </select>
          <button onClick={resetFilters} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold hover:bg-slate-200">
            <X size={12} /> {isArabic ? 'إعادة تعيين' : 'Reset'}
          </button>
        </div>
      )}

      {/* Products table */}
      <div className="p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-black flex items-center gap-2"><Package size={16} /> {isArabic ? 'كل المنتجات' : 'All Products'} <span className="text-xs text-slate-400 font-bold">({filtered.length})</span></h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right border-b border-slate-100">
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المنتج' : 'Product'}</th>
                {columns.map((c) => (
                  <th key={c.key} className="pb-3 font-bold text-slate-400 cursor-pointer select-none hover:text-slate-700" onClick={() => toggleSort(c.key)}>
                    <span className="inline-flex items-center gap-1">{isArabic ? c.labelAr : c.label}{sortIcon(c.key)}</span>
                  </th>
                ))}
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const st = STATUS_META[p.status];
                return (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><Package size={14} /></span>
                        <div className="min-w-0">
                          <p className="font-bold truncate">{isArabic ? p.nameAr : p.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1"><Tag size={10} /> {p.sku} · {isArabic ? p.categoryAr : p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 font-bold">{p.unitsSold.toLocaleString()}</td>
                    <td className="py-3 text-slate-600 font-bold">{t('business.reports.currency')} {p.revenue.toLocaleString()}</td>
                    <td className="py-3 text-slate-600">{p.views.toLocaleString()}</td>
                    <td className="py-3"><span className="px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">{p.conversionRate.toFixed(1)}%</span></td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-bold">
                        <Star size={12} className="text-amber-400 fill-amber-400" /> {p.avgRating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`flex items-center gap-0.5 text-xs font-bold ${p.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {p.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(p.trend).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${st.cls}`}>
                        {st.icon} {isArabic ? st.ar : st.en}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-sm">
                    <AlertTriangle size={20} className="inline-block mb-1" />
                    <p>{isArabic ? 'لا توجد منتجات مطابقة' : 'No matching products'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductPerformancePage;
