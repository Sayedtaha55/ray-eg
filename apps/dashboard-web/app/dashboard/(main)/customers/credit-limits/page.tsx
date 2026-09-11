'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PiggyBank, Loader2, AlertTriangle, ShieldAlert, Save } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { readLocalRecord, writeLocalRecord } from '@/lib/localStore';

type Customer = { id: string; name?: string; fullName?: string };
type OrderRow = { id: string; total: number; customerId?: string; customer?: { id?: string } };

export default function CreditLimitsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const shop = await apiRequest('/shops/me');
      const sid = shop?.id;
      const custs = sid ? await apiRequest(`/customers/shop/${sid}`) : [];
      setCustomers(Array.isArray(custs) ? custs : []);
      try {
        const ords = await apiRequest('/orders/me');
        setOrders(Array.isArray(ords) ? ords : []);
      } catch { setOrders([]); }
    } catch { /* keep empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    setLimits(readLocalRecord<{ limits: Record<string, string> }>('credit-limits').limits || {});
  }, [load]);

  const usageByCustomer = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      const cid = o.customerId || o.customer?.id;
      if (cid) map.set(cid, (map.get(cid) || 0) + Number(o.total ?? 0));
    }
    return map;
  }, [orders]);

  const saveLimits = () => {
    setSaving(true);
    writeLocalRecord('credit-limits', { limits });
    setTimeout(() => setSaving(false), 400);
  };

  const rows = customers.map((c) => ({
    customer: c,
    usage: usageByCustomer.get(c.id) || 0,
    limit: Number(limits[c.id] || 0),
  })).filter((r) => r.limit > 0 || r.usage > 0);

  const exceeded = rows.filter((r) => r.limit > 0 && r.usage > r.limit);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <PiggyBank size={22} className="text-cyan-600" />
            حدود الائتمان
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1">حدد سقف البيع بالأجل لكل عميل — بيتحذر لو عدّى حدّه</p>
        </div>
        <button onClick={saveLimits} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-colors">
          <Save size={14} />
          {saving ? 'تم الحفظ ✓' : 'حفظ الحدود'}
        </button>
      </div>

      {exceeded.length > 0 && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-red-600">
            {exceeded.length} عميل تعدّوا حد الائتمان: {exceeded.map((r) => r.customer.name || r.customer.fullName).join('، ')}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-slate-300" /></div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <PiggyBank size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">لا يوجد عملاء بعد</p>
            <p className="text-[11px] font-bold text-slate-300 mt-1">حدد حدود الائتمان بعد ما يبدأ عملاؤك في الشراء</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400">
                  <th className="px-4 py-3">العميل</th>
                  <th className="px-4 py-3">المستخدم حالياً</th>
                  <th className="px-4 py-3">حد الائتمان (ج.م)</th>
                  <th className="px-4 py-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const over = r.limit > 0 && r.usage > r.limit;
                  const pct = r.limit > 0 ? Math.min(100, Math.round((r.usage / r.limit) * 100)) : 0;
                  return (
                    <tr key={r.customer.id} className="border-t border-slate-50">
                      <td className="px-4 py-3 text-xs font-black text-slate-900">{r.customer.name || r.customer.fullName || 'عميل'}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-black text-slate-900 mb-1">ج.م {r.usage.toLocaleString()}</div>
                        {r.limit > 0 && (
                          <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${over ? 'bg-red-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={limits[r.customer.id] ?? ''}
                          onChange={(e) => setLimits({ ...limits, [r.customer.id]: e.target.value })}
                          placeholder="بدون حد"
                          className="w-28 bg-slate-50 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {r.limit === 0 ? (
                          <span className="text-[10px] font-black text-slate-400">—</span>
                        ) : over ? (
                          <span className="text-[10px] font-black px-2 py-1 rounded-md bg-red-50 text-red-600 flex items-center gap-1 w-fit">
                            <AlertTriangle size={11} /> تعدّى الحد
                          </span>
                        ) : pct > 75 ? (
                          <span className="text-[10px] font-black px-2 py-1 rounded-md bg-amber-50 text-amber-700">قريب من الحد</span>
                        ) : (
                          <span className="text-[10px] font-black px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">منتظم</span>
                        )}
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
