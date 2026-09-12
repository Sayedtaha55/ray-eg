'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { RefreshCw, PackageX, AlertTriangle, PackageSearch, Boxes, Package } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';

/* تقارير المخزون — منتجات على وشك النفاد من /inventory/low-stock/shop/:id */

type LowStockItem = {
  id: string;
  productName: string;
  category?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  status: 'critical' | 'warning';
  lastRestockDate?: string;
};

const LOCALE = 'ar-EG-u-nu-latn';
const fmtNum = (n: number) => (Number.isFinite(n) ? n : 0).toLocaleString(LOCALE, { maximumFractionDigits: 0 });

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' }); }
  catch { return '—'; }
};

export default function InventoryReportsPage() {
  const { shop } = useShop();
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const shopId = shop?.id;
    if (!shopId) return;
    setRefreshing(true);
    setError('');
    try {
      const res = await apiRequest(`/inventory/low-stock/shop/${shopId}`);
      setItems(Array.isArray(res) ? res : res?.data || []);
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل تقرير المخزون');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((it) => (it.productName || '').toLowerCase().includes(q) || (it.category || '').toLowerCase().includes(q));
  }, [items, search]);

  const critical = items.filter((it) => it.status === 'critical').length;
  const warning = items.length - critical;

  const kpis = [
    { label: 'خطر — قابل للنفاد', value: critical, icon: <AlertTriangle size={14} />, tone: 'text-red-600' },
    { label: 'تحذير — قرّب للحد الأدنى', value: warning, icon: <PackageX size={14} />, tone: 'text-amber-600' },
    { label: 'إجمالي المحتاج تعبئة', value: items.length, icon: <Boxes size={14} />, tone: 'text-slate-700' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px] mx-auto">

      {/* ===== Header ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">تقارير المخزون</h1>
          <p className="text-xs text-slate-400 mt-1">المنتجات اللي مخزونها وصل للحد الأدنى — رتّب طلب التوريد قبل ما تفقدها</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={refreshing || !shop?.id}
          className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
          title="تحديث"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-800">{error}</div>
      )}

      {/* ===== KPIs ===== */}
      <div className="grid grid-cols-3 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
            <div className={`flex items-center gap-1.5 mb-1 ${k.tone}`}>{k.icon}<span className="text-[11px] font-semibold text-slate-400">{k.label}</span></div>
            {loading ? (
              <div className="h-7 w-16 bg-slate-100 rounded-md animate-pulse" />
            ) : (
              <div className="text-[22px] font-extrabold text-slate-900 tabular-nums">{fmtNum(k.value)}</div>
            )}
          </div>
        ))}
      </div>

      {/* ===== Table ===== */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <PackageSearch size={15} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">منتجات تحتاج إعادة تعبئة</h3>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded px-2 py-0.5 tabular-nums mr-auto">{fmtNum(filtered.length)}</span>
        </div>

        {!loading && items.length > 0 && (
          <div className="px-4 pt-3 pb-1">
            <div className="relative max-w-xs">
              <input
                type="text"
                placeholder="بحث في المنتجات…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 px-3 rounded-full border border-slate-200 text-xs font-semibold outline-none focus:border-slate-400"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-5 space-y-2"><div className="h-9 bg-slate-100 rounded-lg animate-pulse" /><div className="h-9 bg-slate-100 rounded-lg animate-pulse" /><div className="h-9 bg-slate-100 rounded-lg animate-pulse" /></div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center">
            <Package size={26} className="mx-auto mb-2 text-emerald-300" />
            <p className="text-sm font-bold text-emerald-700">المخزون في حالة جيدة ✓</p>
            <p className="text-xs text-slate-400 mt-1">مفيش منتجات تحت الحد الأدنى حاليًا — هننبّهك أول ما حاجة تقرب تخلص</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-400 font-semibold">لا نتائج مطابقة للبحث</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[720px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">المنتج</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">الفئة</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">المتاح</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">حد الأدنى</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">نقطة الطلب</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">آخر توريد</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => {
                  const isCritical = it.status === 'critical';
                  return (
                    <tr key={it.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-xs font-bold text-slate-800 max-w-[200px] truncate">{it.productName || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{it.category || '—'}</td>
                      <td className={`px-4 py-3 text-xs font-extrabold tabular-nums ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>{fmtNum(it.currentStock)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">{fmtNum(it.minStock)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">{fmtNum(it.reorderPoint)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{fmtDate(it.lastRestockDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${isCritical ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {isCritical ? 'خطر' : 'تحذير'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
