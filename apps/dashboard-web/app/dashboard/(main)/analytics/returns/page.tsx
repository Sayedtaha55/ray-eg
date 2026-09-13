'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  Undo2,
  AlertTriangle,
  PackageSearch,
  Store,
  ScanBarcode,
  FileText,
  Search,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';

/* تقارير المرتجعات — كل مرتجعات المتجر من الموقع والكاشير والفواتير */

type ReturnRow = {
  orderId: string;
  orderShortId: string;
  source: string;
  returnCreatedAt?: string | Date;
  totalAmount: number;
  reason?: string | null;
  itemCount: number;
};

const LOCALE = 'ar-EG-u-nu-latn';
const fmtNum = (n: number) =>
  (Number.isFinite(n) ? n : 0).toLocaleString(LOCALE, { maximumFractionDigits: 0 });
const fmtMoney = (n: number) =>
  (Number.isFinite(n) ? n : 0).toLocaleString(LOCALE, { maximumFractionDigits: 2 });

const fmtDate = (iso?: string | Date) => {
  if (!iso) return '—';
  try {
    return new Date(iso as any).toLocaleDateString(LOCALE, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const sourceLabel = (source?: string) => {
  const s = String(source || '').toLowerCase();
  if (s === 'pos') return 'الكاشير';
  if (s === 'manual') return 'فاتورة يدوية';
  return 'الموقع';
};

export default function ReturnsReportsPage() {
  const { shop } = useShop();
  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // بحث مُؤجَّل (debounce) على رقم الطلب
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    const shopId = shop?.id;
    if (!shopId) return;
    setRefreshing(true);
    setError('');
    try {
      const res = await apiRequest(`/shops/${shopId}/orders`);
      const orders = Array.isArray(res) ? res : res?.orders || [];
      const list = Array.isArray(orders) ? orders : [];
      setTotalOrders(list.length);

      const returnedOrders = list.filter((o: any) =>
        ['RETURNED', 'REFUNDED'].includes(String(o?.status || '').toUpperCase())
      );

      const out: ReturnRow[] = [];
      for (const order of returnedOrders) {
        const orderId = String(order?.id || '').trim();
        if (!orderId) continue;
        const source = String(order?.source || '').toLowerCase();
        const orderDate = order?.created_at || order?.createdAt;
        try {
          const listRes = await apiRequest(`/shops/${shopId}/orders/${orderId}/returns`);
          const returnsList = Array.isArray(listRes) ? listRes : listRes?.returns || [];
          if (Array.isArray(returnsList) && returnsList.length > 0) {
            for (const r of returnsList) {
              out.push({
                orderId,
                orderShortId: orderId.slice(0, 8).toUpperCase(),
                source,
                returnCreatedAt: r?.createdAt || orderDate,
                totalAmount: Number(r?.totalAmount || 0) || 0,
                reason: r?.reason ?? null,
                itemCount: Array.isArray(r?.items) ? r.items.length : 0,
              });
            }
            continue;
          }
        } catch {
          /* مفيش سجلات مرتجع للطلب — نرجّع بصف احتياطي */
        }
        // مرتجع كامل (تحديث الحالة) بدون سجل مرتجع تفصيلي
        out.push({
          orderId,
          orderShortId: orderId.slice(0, 8).toUpperCase(),
          source,
          returnCreatedAt: orderDate,
          totalAmount: Number(order?.total || 0) || 0,
          reason: null,
          itemCount: Array.isArray(order?.items) ? order.items.length : 0,
        });
      }

      out.sort((a, b) => {
        const ta = a.returnCreatedAt ? new Date(a.returnCreatedAt as any).getTime() : 0;
        const tb = b.returnCreatedAt ? new Date(b.returnCreatedAt as any).getTime() : 0;
        return tb - ta;
      });
      setRows(out);
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل تقرير المرتجعات');
      setRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    return rows.filter(
      (r) =>
        r.orderId.toLowerCase().includes(search) || r.orderShortId.toLowerCase().includes(search)
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const count = rows.length;
    const totalReturnedAmount = rows.reduce((s, r) => s + Number(r.totalAmount || 0), 0);
    const rate = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
    return { count, totalReturnedAmount, rate };
  }, [rows, totalOrders]);

  const sourceBreakdown = useMemo(() => {
    const buildFor = (match: (s: string) => boolean) => {
      const items = rows.filter((r) => match(r.source));
      return {
        count: items.length,
        total: items.reduce((s, r) => s + Number(r.totalAmount || 0), 0),
      };
    };
    return [
      {
        key: 'website',
        label: 'الموقع',
        icon: <Store size={14} />,
        ...buildFor((s) => s !== 'pos' && s !== 'manual'),
      },
      {
        key: 'pos',
        label: 'الكاشير',
        icon: <ScanBarcode size={14} />,
        ...buildFor((s) => s === 'pos'),
      },
      {
        key: 'manual',
        label: 'فاتورة يدوية',
        icon: <FileText size={14} />,
        ...buildFor((s) => s === 'manual'),
      },
    ];
  }, [rows]);

  const kpis = [
    { label: 'عدد المرتجعات', value: fmtNum(stats.count) },
    { label: 'إجمالي المبالغ المسترجعة (ج.م)', value: fmtMoney(stats.totalReturnedAmount) },
    { label: 'نسبة المرتجعات', value: `${fmtNum(Math.round(stats.rate * 10) / 10)}%` },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-[1400px] mx-auto">
      {/* ===== Header ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">تقارير المرتجعات</h1>
          <p className="text-xs text-slate-400 mt-1">
            كل مرتجعات المتجر من الموقع والكاشير والفواتير في تقرير واحد
          </p>
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
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-800">
          {error}
        </div>
      )}

      {/* ===== KPIs ===== */}
      <div className="grid grid-cols-3 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-1.5 mb-1 text-orange-600">
              <Undo2 size={14} />
              <span className="text-[11px] font-semibold text-slate-400">{k.label}</span>
            </div>
            {loading ? (
              <div className="h-7 w-16 bg-slate-100 rounded-md animate-pulse" />
            ) : (
              <div className="text-[22px] font-extrabold text-slate-900 tabular-nums">
                {k.value}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== Breakdown by source ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {sourceBreakdown.map((s) => (
          <div key={s.key} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-slate-500">
              {s.icon}
              <span className="text-[11px] font-bold">{s.label}</span>
              <span className="mr-auto text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded px-2 py-0.5 tabular-nums">
                {fmtNum(s.count)} مرتجع
              </span>
            </div>
            {loading ? (
              <div className="mt-2 h-6 w-20 bg-slate-100 rounded-md animate-pulse" />
            ) : (
              <div className="mt-2 text-lg font-extrabold text-slate-900 tabular-nums">
                ج.م {fmtMoney(s.total)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== Table ===== */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <PackageSearch size={15} className="text-orange-600" />
          <h3 className="text-sm font-bold text-slate-800">سجل المرتجعات</h3>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded px-2 py-0.5 tabular-nums mr-auto">
            {fmtNum(filtered.length)}
          </span>
        </div>

        {!loading && rows.length > 0 && (
          <div className="px-4 pt-3 pb-1">
            <div className="relative max-w-xs">
              <Search
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="بحث برقم الطلب…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-9 pr-9 pl-3 rounded-full border border-slate-200 text-xs font-semibold outline-none focus:border-slate-400"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-5 space-y-2">
            <div className="h-9 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-9 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-9 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-14 text-center">
            <Undo2 size={26} className="mx-auto mb-2 text-emerald-300" />
            <p className="text-sm font-bold text-emerald-700">مفيش مرتجعات — كده كويس 👍</p>
            <p className="text-xs text-slate-400 mt-1">
              كل الطلبات ماشية تمام، أول ما يحصل مرتجع هيظهر هنا فورًا
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-400 font-semibold">
            لا نتائج مطابقة للبحث
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[720px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">الطلب</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">المصدر</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">التاريخ</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">عدد الأصناف</th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">
                    المبلغ المسترجع
                  </th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500">السبب</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={`${r.orderId}-${i}`}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs font-extrabold text-slate-800 tabular-nums">
                      #{r.orderShortId}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 rounded px-2 py-0.5 whitespace-nowrap">
                        {sourceLabel(r.source)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {fmtDate(r.returnCreatedAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">
                      {fmtNum(r.itemCount)}
                    </td>
                    <td className="px-4 py-3 text-xs font-extrabold text-orange-600 tabular-nums">
                      ج.م {fmtMoney(r.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[220px] truncate">
                      {r.reason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
