'use client';

/**
 * التحليلات والتقارير — الصفحة المركزية الوحيدة للتحليلات.
 * كل الأقسام تتغذى من بيانات حقيقية (المالية/المحاسبة/الطلبات/المخزون)
 * وتظهر كأقسام قابلة للفتح برأس يعرض أهم الأرقام حتى وهو مغلق.
 */
import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileBarChart, ChevronDown, ChevronUp, TrendingUp, TrendingDown,
  Wallet, Droplets, RefreshCw, Download, ShoppingCart, Package, Users, Truck,
  CreditCard, Boxes, Building2, Percent, Info,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { INV_PAGE_FONT, InvToolbar, InvToolButton, InvLoading } from '@/components/inventory/InventoryShell';

const fmt = (n: number) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmt2 = (n: number) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type PeriodKey = 'this_month' | 'last_month' | 'quarter' | 'this_year' | 'all';

function periodRange(p: PeriodKey): { from: string; to: string; label: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (dt: Date) => dt.toISOString().split('T')[0];
  switch (p) {
    case 'this_month': return { from: d(new Date(y, m, 1)), to: d(new Date(y, m + 1, 0)), label: 'هذا الشهر' };
    case 'last_month': return { from: d(new Date(y, m - 1, 1)), to: d(new Date(y, m, 0)), label: 'الشهر الماضي' };
    case 'quarter': {
      const q = Math.floor(m / 3) * 3;
      return { from: d(new Date(y, q, 1)), to: d(new Date(y, q + 3, 0)), label: 'هذا الربع' };
    }
    case 'this_year': return { from: d(new Date(y, 0, 1)), to: d(new Date(y, 11, 31)), label: 'هذه السنة' };
    default: return { from: '', to: d(now), label: 'الكل' };
  }
}

function prevRange(p: PeriodKey): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = (dt: Date) => dt.toISOString().split('T')[0];
  switch (p) {
    case 'this_month': return { from: d(new Date(y, m - 1, 1)), to: d(new Date(y, m, 0)) };
    case 'last_month': { const pm = m - 2 < 0 ? 10 : m - 2; return { from: d(new Date(y, pm, 1)), to: d(new Date(y, pm + 1, 0)) }; }
    case 'quarter': {
      const q = Math.floor(m / 3) * 3;
      const pq = q - 3 < 0 ? 9 : q - 3;
      const py = q - 3 < 0 ? y - 1 : y;
      return { from: d(new Date(py, pq, 1)), to: d(new Date(py, pq + 3, 0)) };
    }
    case 'this_year': return { from: d(new Date(y - 1, 0, 1)), to: d(new Date(y - 1, 11, 31)) };
    default: return { from: '', to: '' };
  }
}

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'this_month', label: 'هذا الشهر' },
  { key: 'last_month', label: 'الشهر الماضي' },
  { key: 'quarter', label: 'هذا الربع' },
  { key: 'this_year', label: 'هذه السنة' },
  { key: 'all', label: 'الكل' },
];

/** شريط أفقي بسيط بدون مكتبات رسوم */
function MiniBar({ label, value, max, color = 'bg-slate-900', suffix = '' }: { label: string; value: number; max: number; color?: string; suffix?: string }) {
  const pct = max > 0 ? Math.min((Math.abs(value) / max) * 100, 100) : 0;
  return (
    <div className="px-4 py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-bold text-slate-600 text-xs sm:text-sm truncate">{label}</span>
        <span className="font-mono tabular-nums font-black text-slate-800 text-xs sm:text-sm whitespace-nowrap" dir="ltr">{fmt2(value)}{suffix}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function downloadCSV(name: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}

function ReportsContent() {
  const [period, setPeriod] = useState<PeriodKey>('this_month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [data, setData] = useState<any>({});

  const load = useCallback(async (p: PeriodKey) => {
    setLoading(true);
    setRefreshing(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); setRefreshing(false); return; }
      const cur = periodRange(p);
      const prev = prevRange(p);
      const q = (f: string, t: string) => { const ps = new URLSearchParams(); if (f) ps.set('from', f); if (t) ps.set('to', t); return ps.toString(); };

      const [
        revRes, prevRevRes, expRes, profitRes, cashRes, prevCashRes,
        ordersRes, accInvRes, walletsRes, transRes, agingRes,
        taxRatesRes, taxReturnsRes, productsRes, suppliersRes,
      ] = await Promise.allSettled([
        apiRequest(`/finance/reports/revenue/shop/${sid}?${q(cur.from, cur.to)}`),
        prev.from ? apiRequest(`/finance/reports/revenue/shop/${sid}?${q(prev.from, prev.to)}`).catch(() => null) : Promise.resolve(null),
        apiRequest(`/finance/expenses/shop/${sid}`),
        apiRequest(`/finance/reports/profit/shop/${sid}?${q(cur.from, cur.to)}`).catch(() => null),
        apiRequest(`/finance/reports/cashflow/shop/${sid}?${q(cur.from, cur.to)}`).catch(() => null),
        prev.from ? apiRequest(`/finance/reports/cashflow/shop/${sid}?${q(prev.from, prev.to)}`).catch(() => null) : Promise.resolve(null),
        apiRequest('/orders/me'),
        apiRequest(`/accounting/invoices/shop/${sid}`).catch(() => ({ data: [] })),
        apiRequest(`/finance/wallets/shop/${sid}`).catch(() => ({ data: [] })),
        apiRequest(`/finance/transactions/shop/${sid}`).catch(() => ({ data: [] })),
        apiRequest(`/accounting/aging/shop/${sid}`).catch(() => ({ data: [] })),
        apiRequest(`/accounting/tax-rates/shop/${sid}`).catch(() => ({ data: [] })),
        apiRequest(`/accounting/tax-returns/shop/${sid}`).catch(() => ({ data: [] })),
        apiRequest(`/products/manage/by-shop/${sid}?limit=200`).catch(() => ({ data: [] })),
        apiRequest(`/suppliers/shop/${sid}`).catch(() => ({ data: [] })),
      ]);

      const get = (r: PromiseSettledResult<any>, fallback: any = null) => (r.status === 'fulfilled' ? (r.value?.data !== undefined ? r.value.data : r.value) : fallback);
      const list = (r: PromiseSettledResult<any>) => {
        const v = get(r);
        return Array.isArray(v) ? v : (Array.isArray(v?.data) ? v.data : []);
      };

      setData({
        revenue: get(revRes),
        prevRevenue: get(prevRevRes),
        expenses: list(expRes),
        profit: get(profitRes),
        cash: get(cashRes),
        prevCash: get(prevCashRes),
        orders: list(ordersRes),
        accInvoices: list(accInvRes),
        wallets: list(walletsRes),
        transactions: list(transRes),
        aging: list(agingRes),
        taxRates: list(taxRatesRes),
        taxReturns: list(taxReturnsRes),
        products: list(productsRes),
        suppliers: list(suppliersRes),
        range: cur,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(period); }, [period, load]);

  const inPeriod = useCallback((d: string, range?: { from: string; to: string }) => {
    if (!range) return true;
    const day = String(d || '').split('T')[0];
    if (range.from && day < range.from) return false;
    if (range.to && day > range.to) return false;
    return true;
  }, []);

  const range = periodRange(period);
  const revRange = data.range || range;

  // ===== KPIs =====
  const kpis = useMemo(() => {
    const revenue = Number(data.revenue?.total_revenue ?? data.revenue?.net_profit ?? 0) || (data.revenue?.revenue || []).reduce((s: number, l: any) => s + Number(l.amount || 0), 0);
    const prevRevenue = Number(data.prevRevenue?.total_revenue ?? 0) || (data.prevRevenue?.revenue || []).reduce((s: number, l: any) => s + Number(l.amount || 0), 0);
    const expenses = (data.expenses || []).filter((e: any) => inPeriod(e.date, revRange)).reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
    const netProfit = Number(data.profit?.net_profit ?? data.profit?.profit ?? (revenue - expenses));
    const inflow = Number(data.cash?.total_inflow ?? data.cash?.inflow ?? 0);
    const outflow = Number(data.cash?.total_outflow ?? data.cash?.outflow ?? 0);
    const cashNet = inflow || outflow ? inflow - outflow : Number(data.cash?.net_cashflow ?? 0);
    const revGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    return { revenue, prevRevenue, expenses, netProfit, cashNet, revGrowth, inflow, outflow };
  }, [data, inPeriod, revRange]);

  // ===== Sections data =====
  const sections = useMemo(() => {
    const orders: any[] = data.orders || [];
    const inRangeOrders = orders.filter((o: any) => inPeriod(o.created_at || o.createdAt || o.date, revRange));
    const orderTotal = inRangeOrders.reduce((s, o) => s + Number(o.total || o.total_amount || o.grand_total || 0), 0);
    const byPayment = new Map<string, number>();
    inRangeOrders.forEach((o) => {
      const pm = String(o.payment_method || o.paymentMethod || 'غير محدد');
      byPayment.set(pm, (byPayment.get(pm) || 0) + Number(o.total || o.total_amount || o.grand_total || 0));
    });

    const accInv: any[] = data.accInvoices || [];
    const purchases = accInv.filter((i: any) => String(i.invoice_type || i.invoiceType) === 'purchase');
    const purchasesTotal = purchases.reduce((s, i) => s + Number(i.total_amount || i.total || 0), 0);
    const purchasesPaid = purchases.reduce((s, i) => s + Number(i.paid_amount || i.paidAmount || i.paid || 0), 0);
    const bySupplier = new Map<string, number>();
    purchases.forEach((i) => {
      const n = i.entity_name || i.entityName || '—';
      bySupplier.set(n, (bySupplier.get(n) || 0) + Number(i.total_amount || i.total || 0));
    });

    const expenses: any[] = (data.expenses || []).filter((e: any) => inPeriod(e.date, revRange));
    const expByCategory = new Map<string, number>();
    expenses.forEach((e) => {
      const c = e.category || 'غير مصنف';
      expByCategory.set(c, (expByCategory.get(c) || 0) + Number(e.amount || 0));
    });

    const aging: any[] = data.aging || [];
    const customerDues = aging.filter((a: any) => String(a.entity_type || a.entityType || 'customer') === 'customer');
    const vendorDues = aging.filter((a: any) => String(a.entity_type || a.entityType) === 'vendor');
    const totalCustomerDue = (customerDues.length ? customerDues : aging).reduce((s, a) => s + Number(a.total_outstanding ?? a.total ?? a.outstanding ?? 0), 0);
    const totalVendorDue = (vendorDues.length ? vendorDues : []).reduce((s, a) => s + Number(a.total_outstanding ?? a.total ?? a.outstanding ?? 0), 0);
    const agingRowTotal = (a: any) => Number(a.total_outstanding ?? a.total ?? a.outstanding ?? 0);

    const wallets: any[] = data.wallets || [];
    const transactions: any[] = (data.transactions || []).filter((t: any) => inPeriod(t.date, revRange));
    const tIn = transactions.filter((t: any) => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const tOut = transactions.filter((t: any) => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);

    const products: any[] = data.products || [];
    const stockValue = products.reduce((s, p) => s + Number(p.cost ?? p.costPrice ?? p.price ?? 0) * Number(p.stock ?? p.quantity ?? 0), 0);
    const lowStock = products.filter((p) => Number(p.stock ?? 0) > 0 && Number(p.stock ?? 0) <= Number(p.minStock ?? 5)).length;
    const outStock = products.filter((p) => Number(p.stock ?? 0) === 0).length;

    const taxRates: any[] = data.taxRates || [];
    const taxReturns: any[] = data.taxReturns || [];
    const submittedReturns = taxReturns.filter((r) => r.status === 'submitted');
    const netTax = taxReturns.reduce((s, r) => s + Number(r.net_tax || 0), 0);

    const suppliers: any[] = data.suppliers || [];

    return {
      orders: inRangeOrders, orderTotal, byPayment,
      purchases, purchasesTotal, purchasesPaid, bySupplier,
      expenses, expByCategory,
      agingRowTotal, totalCustomerDue, totalVendorDue,
      wallets, tIn, tOut,
      products, stockValue, lowStock, outStock,
      taxRates, taxReturns, submittedReturns, netTax,
      suppliers,
    };
  }, [data, inPeriod, revRange]);

  const SECTION_LIST = [
    { id: 'sales', label: 'المبيعات', icon: ShoppingCart },
    { id: 'purchases', label: 'المشتريات', icon: Package },
    { id: 'expenses', label: 'المصروفات', icon: TrendingDown },
    { id: 'profits', label: 'الأرباح', icon: TrendingUp },
    { id: 'customers', label: 'العملاء', icon: Users },
    { id: 'suppliers', label: 'الموردون', icon: Truck },
    { id: 'cash', label: 'النقدية', icon: CreditCard },
    { id: 'inventory', label: 'المخزون', icon: Boxes },
    { id: 'branches', label: 'الفروع', icon: Building2 },
    { id: 'employees', label: 'الموظفون', icon: Users },
    { id: 'taxes', label: 'الضرائب', icon: Percent },
  ];

  const sectionHeader = (id: string) => {
    switch (id) {
      case 'sales': return [`ج.م ${fmt(sections.orderTotal)}`, `${sections.orders.length} عملية`];
      case 'purchases': return [`ج.م ${fmt(sections.purchasesTotal)}`, `مسدد ج.م ${fmt(sections.purchasesPaid)}`];
      case 'expenses': return [`ج.م ${fmt(kpis.expenses)}`, `${sections.expenses.length} بند`];
      case 'profits': return [`${kpis.netProfit >= 0 ? 'ربح' : 'خسارة'} ج.م ${fmt(Math.abs(kpis.netProfit))}`, 'للفترة'];
      case 'customers': return [`مستحق ج.م ${fmt(sections.totalCustomerDue)}`, 'من كشف الأعمار'];
      case 'suppliers': return [`مستحق ج.م ${fmt(sections.totalVendorDue)}`, `${sections.suppliers.length} مورد`];
      case 'cash': return [`سيولة ج.م ${fmt(sections.wallets.reduce((s: number, w: any) => s + Number(w.balance || 0), 0))}`, `${sections.wallets.length} حساب`];
      case 'inventory': return [`ج.م ${fmt(sections.stockValue)}`, `${sections.lowStock} ناقص / ${sections.outStock} نافد`];
      case 'branches': return ['حسب البيانات', ''];
      case 'employees': return ['حسب الصلاحيات', ''];
      case 'taxes': return [`صافي ج.م ${fmt(sections.netTax)}`, `${sections.submittedReturns.length}/${sections.taxReturns.length} مقدمة`];
      default: return ['', ''];
    }
  };

  const renderSection = (id: string) => {
    const maxOf = (m: Map<string, number>) => Math.max(1, ...Array.from(m.values()));
    switch (id) {
      case 'sales': {
        const pm = sections.byPayment;
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div>
              <h4 className="font-black text-slate-700 text-xs mb-2 px-4">المبيعات حسب طريقة الدفع</h4>
              {pm.size === 0 ? (
                <p className="text-slate-400 text-xs font-bold px-4 py-4">لا مبيعات في الفترة</p>
              ) : (
                [...pm.entries()].map(([k, v]) => <MiniBar key={k} label={k} value={v} max={maxOf(pm)} color="bg-emerald-500" />)
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 h-fit">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">إجمالي المبيعات</div>
                <div className="font-black text-slate-900 text-sm mt-1">ج.م {fmt(sections.orderTotal)}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">عدد العمليات</div>
                <div className="font-black text-slate-900 text-sm mt-1">{sections.orders.length}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">متوسط البيع</div>
                <div className="font-black text-slate-900 text-sm mt-1">ج.م {fmt(sections.orders.length ? sections.orderTotal / sections.orders.length : 0)}</div>
              </div>
            </div>
          </div>
        );
      }
      case 'purchases':
        return (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">إجمالي المشتريات</div>
                <div className="font-black text-slate-900 text-sm mt-1">ج.م {fmt(sections.purchasesTotal)}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">المدفوع</div>
                <div className="font-black text-emerald-700 text-sm mt-1">ج.م {fmt(sections.purchasesPaid)}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">المستحق</div>
                <div className="font-black text-rose-700 text-sm mt-1">ج.م {fmt(Math.max(sections.purchasesTotal - sections.purchasesPaid, 0))}</div>
              </div>
            </div>
            <h4 className="font-black text-slate-700 text-xs mb-2 px-1">أعلى الموردين</h4>
            {sections.bySupplier.size === 0 ? (
              <p className="text-slate-400 text-xs font-bold">لا مشتريات في الفترة — فواتير الشراء تظهر من أوامر الشراء عند الاستلام</p>
            ) : (
              [...sections.bySupplier.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => (
                <MiniBar key={k} label={k} value={v} max={maxOf(sections.bySupplier)} color="bg-amber-500" />
              ))
            )}
          </div>
        );
      case 'expenses': {
        const max = maxOf(sections.expByCategory);
        const prevExpenses = (data.expenses || []).filter((e: any) => !inPeriod(e.date, revRange) && inPeriod(e.date, prevRange(period))).reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
        return (
          <div className="p-4">
            {sections.expByCategory.size === 0 ? (
              <p className="text-slate-400 text-xs font-bold">لا مصروفات في الفترة</p>
            ) : (
              [...sections.expByCategory.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                <MiniBar key={k} label={k} value={v} max={max} color="bg-rose-500" />
              ))
            )}
            {prevExpenses > 0 && (
              <p className="text-[11px] font-bold text-slate-400 mt-3 px-1">
                الفترة السابقة المقارنة: ج.م {fmt2(prevExpenses)} — {kpis.expenses >= prevExpenses ? 'ارتفاع' : 'انخفاض'} {prevExpenses ? Math.abs(((kpis.expenses - prevExpenses) / prevExpenses) * 100).toFixed(1) : 0}%
              </p>
            )}
          </div>
        );
      }
      case 'profits': {
        const margin = kpis.revenue > 0 ? (kpis.netProfit / kpis.revenue) * 100 : 0;
        return (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {[
              { label: 'الإيرادات', v: kpis.revenue, c: 'text-emerald-700' },
              { label: 'المصروفات', v: kpis.expenses, c: 'text-rose-700' },
              { label: 'صافي الربح', v: kpis.netProfit, c: kpis.netProfit >= 0 ? 'text-slate-900' : 'text-rose-700' },
            ].map((x) => (
              <div key={x.label} className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">{x.label}</div>
                <div className={`font-black text-sm mt-1 ${x.c}`}>ج.م {fmt2(x.v)}</div>
              </div>
            ))}
            <div className="bg-slate-900 rounded-xl p-3 text-center col-span-2 lg:col-span-3">
              <div className="text-[11px] font-bold text-slate-300">هامش الربح</div>
              <div className="font-black text-white text-lg mt-1">{margin.toFixed(1)}%</div>
            </div>
          </div>
        );
      }
      case 'customers':
        return (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">إجمالي المديونيات</div>
                <div className="font-black text-rose-700 text-sm mt-1">ج.م {fmt(sections.totalCustomerDue)}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">عملاء عليهم مستحق</div>
                <div className="font-black text-slate-900 text-sm mt-1">{(data.aging || []).filter((a: any) => sections.agingRowTotal(a) > 0).length}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">كشف التفصيل</div>
                <a href="/dashboard/finance/receivables" className="font-black text-sky-700 text-xs mt-1 inline-block hover:underline">العملاء والمدينون →</a>
              </div>
            </div>
            {(data.aging || []).length > 0 && (
              <>
                <h4 className="font-black text-slate-700 text-xs">أعلى الأرصدة المستحقة</h4>
                {[...(data.aging || [])].sort((a: any, b: any) => sections.agingRowTotal(b) - sections.agingRowTotal(a)).slice(0, 5).map((a: any, i: number) => (
                  <MiniBar key={i} label={a.entity_name || a.entityName || '—'} value={sections.agingRowTotal(a)} max={Math.max(1, ...(data.aging || []).map((x: any) => sections.agingRowTotal(x)))} color="bg-rose-500" />
                ))}
              </>
            )}
          </div>
        );
      case 'suppliers':
        return (
          <div className="grid grid-cols-3 gap-3 p-4">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-[11px] font-bold text-slate-400">عدد الموردين</div>
              <div className="font-black text-slate-900 text-sm mt-1">{sections.suppliers.length}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-[11px] font-bold text-slate-400">إجمالي المستحقات</div>
              <div className="font-black text-rose-700 text-sm mt-1">ج.م {fmt(sections.totalVendorDue)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-[11px] font-bold text-slate-400">كشف التفصيل</div>
              <a href="/dashboard/finance/payables" className="font-black text-sky-700 text-xs mt-1 inline-block hover:underline">الموردون والدائنون →</a>
            </div>
          </div>
        );
      case 'cash': {
        const byKind = new Map<string, number>();
        sections.wallets.forEach((w: any) => {
          const name = String(w.name || '');
          let k = 'أخرى';
          if (/بنك|bank/i.test(name)) k = 'بنوك';
          else if (/محفظة|فودافون|انستاباي|wallet|insta/i.test(name)) k = 'محافظ';
          else if (/نقد|صندوق|كاش|cash/i.test(name)) k = 'خزائن';
          byKind.set(k, (byKind.get(k) || 0) + Number(w.balance || 0));
        });
        return (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">إجمالي السيولة</div>
                <div className="font-black text-slate-900 text-sm mt-1">ج.م {fmt(sections.wallets.reduce((s: number, w: any) => s + Number(w.balance || 0), 0))}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">حركة داخل الفترة</div>
                <div className="font-black text-emerald-700 text-sm mt-1">داخل ج.م {fmt(sections.tIn)}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">خارج الفترة</div>
                <div className="font-black text-rose-700 text-sm mt-1">ج.م {fmt(sections.tOut)}</div>
              </div>
            </div>
            <h4 className="font-black text-slate-700 text-xs">الأرصدة حسب النوع</h4>
            {[...byKind.entries()].map(([k, v]) => (
              <MiniBar key={k} label={k} value={v} max={Math.max(1, ...byKind.values())} color="bg-sky-500" />
            ))}
          </div>
        );
      }
      case 'inventory':
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-[11px] font-bold text-slate-400">قيمة المخزون (تكلفة)</div>
              <div className="font-black text-slate-900 text-sm mt-1">ج.م {fmt(sections.stockValue)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-[11px] font-bold text-slate-400">عدد الأصناف</div>
              <div className="font-black text-slate-900 text-sm mt-1">{sections.products.length}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-[11px] font-bold text-slate-400">منخفض المخزون</div>
              <div className="font-black text-amber-700 text-sm mt-1">{sections.lowStock}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-[11px] font-bold text-slate-400">نافد</div>
              <div className="font-black text-rose-700 text-sm mt-1">{sections.outStock}</div>
            </div>
          </div>
        );
      case 'branches':
        return (
          <div className="p-4">
            <p className="text-slate-400 text-xs font-bold">تقارير الفروع تظهر عند تفعيل أكثر من فرع — النظام يعمل حاليًا بفرع واحد موحد.</p>
          </div>
        );
      case 'employees':
        return (
          <div className="p-4">
            <p className="text-slate-400 text-xs font-bold">تقارير الموظفين (المبيعات والتحصيل والأداء) تظهر حسب الصلاحيات عند تفعيل وحدة الموارد البشرية.</p>
          </div>
        );
      case 'taxes': {
        const activeRates = sections.taxRates.filter((r: any) => (r.status || 'active') === 'active');
        return (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">ضرائب نشطة</div>
                <div className="font-black text-slate-900 text-sm mt-1">{activeRates.length}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">إقرارات مُقدَّمة</div>
                <div className="font-black text-slate-900 text-sm mt-1">{sections.submittedReturns.length} / {sections.taxReturns.length}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-[11px] font-bold text-slate-400">صافي الضريبة المستحقة</div>
                <div className={`font-black text-sm mt-1 ${sections.netTax >= 0 ? 'text-rose-700' : 'text-emerald-700'}`}>ج.م {fmt2(sections.netTax)}</div>
              </div>
            </div>
            <a href="/dashboard/finance/taxes" className="text-xs font-black text-sky-700 hover:underline">صفحة الضرائب التفصيلية →</a>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const exportKpis = () => {
    downloadCSV('analytics-summary.csv', ['Metric', 'Value'], [
      ['Revenue', kpis.revenue.toFixed(2)],
      ['Expenses', kpis.expenses.toFixed(2)],
      ['Net Profit', kpis.netProfit.toFixed(2)],
      ['Cash Inflow', kpis.inflow.toFixed(2)],
      ['Cash Outflow', kpis.outflow.toFixed(2)],
      ['Purchases Total', sections.purchasesTotal.toFixed(2)],
      ['Customer Dues', sections.totalCustomerDue.toFixed(2)],
      ['Vendor Dues', sections.totalVendorDue.toFixed(2)],
      ['Stock Value', sections.stockValue.toFixed(2)],
      ['Net Tax', sections.netTax.toFixed(2)],
    ]);
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[#F4F5F7]" style={INV_PAGE_FONT}>
        <InvLoading />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F4F5F7] text-slate-900" style={INV_PAGE_FONT}>
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 py-5 max-w-[1400px] mx-auto flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
            <FileBarChart size={20} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">التحليلات والتقارير</h1>
            <p className="text-xs text-slate-400 mt-0.5">مركز واحد لكل الأرقام — من الفواتير والمدفوعات والمصروفات والمخزون، حسب الفترة</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-4 pb-10 space-y-4">
        {/* فلاتر الفترة */}
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-black text-slate-400 shrink-0">الفترة:</span>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-black transition-colors ${period === p.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {p.label}
            </button>
          ))}
          {['الفرع', 'الموظف', 'طريقة الدفع المتقدم'].map((f) => (
            <span key={f} title="يتاح عند توفر البيانات" className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-300 text-[11px] font-bold whitespace-nowrap border border-dashed border-slate-200">{f}</span>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1.5"><TrendingUp size={13} className="text-emerald-500" /> إجمالي الإيرادات</p>
            <p className="text-lg font-black text-emerald-700">ج.م {fmt(kpis.revenue)}</p>
            {kpis.prevRevenue > 0 && (
              <p className={`text-[11px] font-bold mt-0.5 ${kpis.revGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {kpis.revGrowth >= 0 ? '↑' : '↓'} {Math.abs(kpis.revGrowth).toFixed(1)}% عن الفترة السابقة
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1.5"><TrendingDown size={13} className="text-rose-500" /> إجمالي المصروفات</p>
            <p className="text-lg font-black text-rose-700">ج.م {fmt(kpis.expenses)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1.5"><Wallet size={13} /> صافي الربح</p>
            <p className={`text-lg font-black ${kpis.netProfit >= 0 ? 'text-slate-900' : 'text-rose-700'}`}>ج.م {fmt(kpis.netProfit)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1.5"><Droplets size={13} className="text-cyan-500" /> التدفق النقدي</p>
            <p className={`text-lg font-black ${kpis.cashNet >= 0 ? 'text-cyan-700' : 'text-rose-700'}`}>ج.م {fmt(kpis.cashNet)}</p>
            {(kpis.inflow > 0 || kpis.outflow > 0) && (
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">داخل ج.م {fmt(kpis.inflow)} • خارج ج.م {fmt(kpis.outflow)}</p>
            )}
          </div>
        </div>

        <InvToolbar hint={`الفترة: ${range.from || 'البداية'} → ${range.to}`} >
          <InvToolButton onClick={() => load(period)} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            تحديث
          </InvToolButton>
          <InvToolButton onClick={exportKpis}>
            <Download size={14} />
            تصدير الملخص CSV
          </InvToolButton>
        </InvToolbar>

        {/* أقسام التقارير القابلة للفتح — رأس كل قسم يعرض أهم أرقامه */}
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {SECTION_LIST.map((s) => {
            const [v1, v2] = sectionHeader(s.id);
            const isOpen = open === s.id;
            return (
              <div key={s.id}>
                <button
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-right hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <s.icon size={16} className="text-slate-400" />
                    <span>
                      <span className="block font-black text-slate-800 text-sm">{s.label}</span>
                      {v1 && <span className="block text-[11px] font-bold text-slate-500 mt-0.5">{v1}{v2 ? ` • ${v2}` : ''}</span>}
                    </span>
                  </span>
                  {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/40">
                    {renderSection(s.id)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 flex items-center gap-2">
          <Info size={15} className="text-sky-600" />
          <span className="text-[11px] font-black text-sky-800">
            كل الأرقام هنا من نفس مصدر المالية والمحاسبة — أي فاتورة أو دفعة أو مصروف مرحَّل يظهر هنا تلقائيًا. القوائم التفصيلية في <a href="/dashboard/finance/financial-reports" className="underline">القوائم المالية</a>.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm font-bold text-slate-500">جاري التحميل...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
