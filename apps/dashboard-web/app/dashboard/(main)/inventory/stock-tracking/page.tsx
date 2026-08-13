'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingDown, Search, Download, RefreshCw, Info, X,
  ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check,
  Package, AlertTriangle, TrendingUp, Minus, ArrowUp, ArrowDown,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type StockItem = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reserved: number;
  available: number;
  lastMovement: 'in' | 'out' | 'adjustment' | 'none';
  lastMovementQty: number;
  lastMovementDate: string;
  category: string;
};

export default function StockTrackingPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [filterMovement, setFilterMovement] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const data = await apiRequest(`/products/manage/by-shop/${sid}?limit=200`);
      const list = Array.isArray(data) ? data : (data?.products || data?.data || []);
      setItems(list.map((p: any) => {
        const stock = Number(p.stock ?? p.quantity ?? 0);
        const reserved = Number(p.reserved ?? 0);
        return {
          id: String(p.id),
          name: p.name || p.title || '---',
          sku: p.sku || '---',
          stock,
          reserved,
          available: stock - reserved,
          lastMovement: p.lastMovement || 'none',
          lastMovementQty: Number(p.lastMovementQty || 0),
          lastMovementDate: p.lastMovementDate || p.updatedAt || new Date().toISOString(),
          category: p.category?.name || p.categoryName || '---',
        };
      }));
    } catch { setItems([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const filtered = useMemo(() => {
    let result = items.filter(i =>
      i.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      i.sku.includes(debouncedSearch) ||
      i.category.includes(debouncedSearch)
    );
    if (filterMovement !== 'all') {
      result = result.filter(i => i.lastMovement === filterMovement);
    }
    if (filterStock === 'low') {
      result = result.filter(i => i.stock <= 5);
    } else if (filterStock === 'out') {
      result = result.filter(i => i.stock === 0);
    } else if (filterStock === 'in') {
      result = result.filter(i => i.stock > 0);
    }
    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : sortBy === 'stock' ? a.stock : sortBy === 'available' ? a.available : sortBy === 'reserved' ? a.reserved : a.lastMovementDate;
      const bVal = sortBy === 'name' ? b.name : sortBy === 'stock' ? b.stock : sortBy === 'available' ? b.available : sortBy === 'reserved' ? b.reserved : b.lastMovementDate;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [items, debouncedSearch, filterMovement, filterStock, sortBy, sortOrder]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const exportCSV = useCallback(() => {
    const headers = ['Product Name', 'SKU', 'Category', 'Stock', 'Reserved', 'Available', 'Last Movement', 'Last Movement Qty', 'Last Movement Date'];
    const rows = filtered.map(i => [i.name, i.sku, i.category, i.stock, i.reserved, i.available, i.lastMovement, i.lastMovementQty, i.lastMovementDate]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'stock-tracking.csv';
    link.click();
  }, [filtered]);

  const MOVEMENT_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    in: { label: 'وارد', color: 'bg-green-50 text-green-700', icon: <ArrowUp size={12} /> },
    out: { label: 'صادر', color: 'bg-red-50 text-red-700', icon: <ArrowDown size={12} /> },
    adjustment: { label: 'تسوية', color: 'bg-amber-50 text-amber-700', icon: <Minus size={12} /> },
    none: { label: 'لا يوجد', color: 'bg-slate-50 text-slate-500', icon: <Package size={12} /> },
  };

  const stats = useMemo(() => {
    const total = items.length;
    const totalStock = items.reduce((sum, i) => sum + i.stock, 0);
    const totalReserved = items.reduce((sum, i) => sum + i.reserved, 0);
    const totalAvailable = items.reduce((sum, i) => sum + i.available, 0);
    const lowStock = items.filter(i => i.stock > 0 && i.stock <= 5).length;
    const outOfStock = items.filter(i => i.stock === 0).length;
    return [
      { label: 'إجمالي المنتجات', value: total, icon: Package, color: 'bg-blue-50 text-blue-600' },
      { label: 'إجمالي المخزون', value: totalStock.toLocaleString(), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
      { label: 'محجوز', value: totalReserved.toLocaleString(), icon: Minus, color: 'bg-amber-50 text-amber-600' },
      { label: 'متاح', value: totalAvailable.toLocaleString(), icon: Check, color: 'bg-cyan-50 text-cyan-600' },
      { label: 'مخزون منخفض', value: lowStock, icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
      { label: 'نفد المخزون', value: outOfStock, icon: TrendingDown, color: 'bg-red-50 text-red-700' },
    ];
  }, [items]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <TrendingDown size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">تتبع الكميات</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">تتبع حركات المخزون الداخلة والخارجة</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
            <div className={`p-2 rounded-xl ${s.color}`}><s.icon size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black text-slate-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => loadItems()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
            <RefreshCw size={18} /> تحديث
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
            <Download size={18} /> تصدير CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو SKU أو الفئة..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الحركة:</span>
          <select value={filterMovement} onChange={e => setFilterMovement(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="all">الكل</option>
            <option value="in">وارد</option>
            <option value="out">صادر</option>
            <option value="adjustment">تسوية</option>
            <option value="none">لا يوجد</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">المخزون:</span>
          <select value={filterStock} onChange={e => setFilterStock(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="all">الكل</option>
            <option value="in">متوفر</option>
            <option value="low">منخفض</option>
            <option value="out">نفد</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الترتيب:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="name">الاسم</option>
            <option value="stock">المخزون</option>
            <option value="available">المتاح</option>
            <option value="reserved">المحجوز</option>
            <option value="lastMovementDate">آخر حركة</option>
          </select>
        </div>
        <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
          {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <TrendingDown size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد بيانات تتبع حالياً</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="space-y-3 md:hidden">
            {paginated.map((i) => {
              const movementConfig = MOVEMENT_CONFIG[i.lastMovement];
              return (
                <div key={i.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm">{i.name}</div>
                      <div className="text-slate-500 text-xs">{i.sku}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${movementConfig.color}`}>
                      {movementConfig.icon} {movementConfig.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-center p-2 rounded-lg bg-slate-50">
                      <div className="text-xs text-slate-400">المخزون</div>
                      <div className="font-bold text-slate-900 text-sm">{i.stock}</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-amber-50">
                      <div className="text-xs text-slate-400">محجوز</div>
                      <div className="font-bold text-amber-700 text-sm">{i.reserved}</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-green-50">
                      <div className="text-xs text-slate-400">متاح</div>
                      <div className="font-bold text-green-700 text-sm">{i.available}</div>
                    </div>
                  </div>
                  {i.lastMovement !== 'none' && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>آخر حركة: {i.lastMovementQty > 0 ? '+' : ''}{i.lastMovementQty}</span>
                      <span>•</span>
                      <span>{new Date(i.lastMovementDate).toLocaleDateString('ar-EG')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto touch-auto">
            <table className="w-full text-right border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-semibold text-slate-500">المنتج</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">SKU</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الفئة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">المخزون</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">محجوز</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">متاح</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">آخر حركة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الكمية</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((i) => {
                  const movementConfig = MOVEMENT_CONFIG[i.lastMovement];
                  return (
                    <tr key={i.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{i.name}</div>
                      </td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{i.sku}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{i.category}</div></td>
                      <td className="p-4">
                        <div className={`font-bold text-sm ${i.stock === 0 ? 'text-red-600' : i.stock <= 5 ? 'text-amber-600' : 'text-slate-900'}`}>{i.stock}</div>
                      </td>
                      <td className="p-4"><div className="text-amber-700 text-sm font-medium">{i.reserved}</div></td>
                      <td className="p-4"><div className="text-green-700 text-sm font-bold">{i.available}</div></td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit ${movementConfig.color}`}>
                          {movementConfig.icon} {movementConfig.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className={`text-sm font-bold ${i.lastMovementQty > 0 ? 'text-green-600' : i.lastMovementQty < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                          {i.lastMovement !== 'none' ? `${i.lastMovementQty > 0 ? '+' : ''}${i.lastMovementQty}` : '-'}
                        </div>
                      </td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{i.lastMovement !== 'none' ? new Date(i.lastMovementDate).toLocaleDateString('ar-EG') : '-'}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-xs font-bold text-slate-500">
                عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} من {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight size={18} />
                </button>
                <span className="text-xs font-bold text-slate-600 px-3">صفحة {currentPage} من {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Guide Modal */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل تتبع الكميات</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">تتبع حركات المخزون الداخلة والخارجة وسجل التغييرات الكامل.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><TrendingDown size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• سجل كامل لحركات المخزون (دخول/خروج)</li>
                  <li>• تتبع كل تغيير في الكميات مع التاريخ والمستخدم</li>
                  <li>• ربط الحركات بالطلبات وأوامر الشراء</li>
                  <li>• تقارير حركة المخزون حسب المنتج أو الفترة</li>
                  <li>• كشف الفروقات والتسريب في المخزون</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
