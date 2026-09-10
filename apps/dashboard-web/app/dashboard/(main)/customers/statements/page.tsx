'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScrollText, Loader2, Search, AlertCircle, ChevronLeft, TrendingUp, Users } from 'lucide-react';
import { apiRequest } from '@/lib/auth';

type Customer = { id: string; name?: string; fullName?: string; phone?: string };
type OrderRow = { id: string; status: string; total: number; createdAt?: string; customerId?: string; customer?: { id?: string; name?: string } };

export default function StatementsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const shop = await apiRequest('/shops/me');
      const sid = shop?.id;
      const custs = sid ? await apiRequest(`/customers/shop/${sid}`) : [];
      setCustomers(Array.isArray(custs) ? custs : []);
      try {
        const ords = await apiRequest('/orders/me');
        setOrders(Array.isArray(ords) ? ords : []);
      } catch { setOrders([]); }
    } catch {
      setError('تعذر تحميل العملاء — تأكد أن السيرفر شغال وحاول تاني.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const purchasesByCustomer = useMemo(() => {
    const map = new Map<string, { count: number; total: number; orders: OrderRow[] }>();
    for (const o of orders) {
      const cid = o.customerId || o.customer?.id;
      if (!cid) continue;
      const entry = map.get(cid) || { count: 0, total: 0, orders: [] };
      entry.count += 1;
      entry.total += Number(o.total ?? 0);
      entry.orders.push(o);
      map.set(cid, entry);
    }
    return map;
  }, [orders]);

  const rows = useMemo(() => customers.map((c) => ({
    customer: c,
    ...(purchasesByCustomer.get(c.id) || { count: 0, total: 0, orders: [] }),
  })).filter((r) => !search || (r.customer.name || r.customer.fullName || '').toLowerCase().includes(search.toLowerCase())), [customers, purchasesByCustomer, search]);

  const totalAll = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <ScrollText size={22} className="text-cyan-600" />
          كشوف الحساب
        </h1>
        <p className="text-xs font-bold text-slate-400 mt-1">مشتريات كل عميل من عندك — اختار عميل وشوف كشف حسابه بالتفصيل</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={16} className="text-red-500" />
          <span className="text-xs font-bold text-red-600">{error}</span>
        </div>
      )}

      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-slate-900 mb-4 transition-colors">
            <ChevronLeft size={14} />
            رجوع لكل العملاء
          </button>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900">{selected.name || selected.fullName || 'عميل'}</h2>
                <p className="text-[11px] font-bold text-slate-400">{selected.phone || ''}</p>
              </div>
              <div className="text-left">
                <div className="text-lg font-black text-slate-900">ج.م {(purchasesByCustomer.get(selected.id)?.total || 0).toLocaleString()}</div>
                <div className="text-[10px] font-bold text-slate-400">إجمالي المشتريات · {purchasesByCustomer.get(selected.id)?.count || 0} عملية</div>
              </div>
            </div>
            <div className="max-h-[55vh] overflow-y-auto">
              <table className="w-full text-right">
                <thead className="sticky top-0 bg-slate-50/80 backdrop-blur">
                  <tr className="text-[10px] font-black text-slate-400">
                    <th className="px-4 py-3">العملية</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3">المبلغ</th>
                    <th className="px-4 py-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {(purchasesByCustomer.get(selected.id)?.orders || []).map((o) => (
                    <tr key={o.id} className="border-t border-slate-50">
                      <td className="px-4 py-3 text-xs font-black text-slate-900">{String(o.id).slice(0, 8)}</td>
                      <td className="px-4 py-3 text-[10px] font-black text-slate-500">{o.status}</td>
                      <td className="px-4 py-3 text-xs font-black text-slate-900">ج.م {Number(o.total ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-[11px] font-bold text-slate-400">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('ar-EG') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <Users size={16} className="text-cyan-600 mb-2" />
              <div className="text-lg font-black text-slate-900">{customers.length}</div>
              <div className="text-[10px] font-bold text-slate-400">إجمالي العملاء</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <TrendingUp size={16} className="text-emerald-600 mb-2" />
              <div className="text-lg font-black text-slate-900">ج.م {totalAll.toLocaleString()}</div>
              <div className="text-[10px] font-bold text-slate-400">إجمالي مشتريات العملاء</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-50">
              <div className="relative max-w-xs">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن عميل..."
                  className="w-full bg-slate-50 rounded-xl py-2 pr-9 pl-3 text-xs font-bold outline-none focus:ring-2 focus:ring-[#00E5FF]/30" />
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-slate-300" /></div>
            ) : rows.length === 0 ? (
              <div className="text-center py-16">
                <ScrollText size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">لا يوجد عملاء بعد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400">
                      <th className="px-4 py-3">العميل</th>
                      <th className="px-4 py-3">عدد العمليات</th>
                      <th className="px-4 py-3">إجمالي المشتريات</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.customer.id} onClick={() => setSelected(r.customer)}
                        className="border-t border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors">
                        <td className="px-4 py-3 text-xs font-black text-slate-900">{r.customer.name || r.customer.fullName || 'عميل'}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-600">{r.count}</td>
                        <td className="px-4 py-3 text-xs font-black text-slate-900">ج.م {r.total.toLocaleString()}</td>
                        <td className="px-4 py-3"><ChevronLeft size={14} className="text-slate-300" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
