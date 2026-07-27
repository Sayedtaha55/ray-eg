import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, TrendingUp, TrendingDown, Clock, Package, ShoppingCart } from 'lucide-react';

type Props = {
  sales: any[];
  onBack: () => void;
};

type TimeRangeKey = 'today' | 'yesterday' | 'last7days' | 'last30days';

const SUCCESS_STATUSES = new Set(['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED']);

const CashierReportsTab: React.FC<Props> = ({ sales, onBack }) => {
  const { t } = useTranslation();
  const [range, setRange] = useState<TimeRangeKey>('today');
  const [recharts, setRecharts] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('recharts');
        if (cancelled) return;
        setRecharts(mod);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const now = new Date();

  const rangeStart = useMemo(() => {
    const d = new Date(now);
    if (range === 'today') {
      d.setHours(0, 0, 0, 0);
    } else if (range === 'yesterday') {
      d.setDate(d.getDate() - 1);
      d.setHours(0, 0, 0, 0);
    } else if (range === 'last7days') {
      d.setDate(d.getDate() - 7);
      d.setHours(0, 0, 0, 0);
    } else {
      d.setDate(d.getDate() - 30);
      d.setHours(0, 0, 0, 0);
    }
    return d;
  }, [range]);

  const rangeEnd = useMemo(() => {
    if (range === 'yesterday') {
      const d = new Date(rangeStart);
      d.setHours(23, 59, 59, 999);
      return d;
    }
    return new Date(now);
  }, [range, rangeStart]);

  const filteredSales = useMemo(() => {
    return (Array.isArray(sales) ? sales : []).filter((s: any) => {
      const ts = new Date(s.created_at || s.createdAt || 0).getTime();
      return ts >= rangeStart.getTime() && ts <= rangeEnd.getTime() && SUCCESS_STATUSES.has(String(s?.status || '').toUpperCase());
    });
  }, [sales, rangeStart, rangeEnd]);

  // Extract all order items from sales
  const allItems = useMemo(() => {
    const items: Array<{ productId: string; name: string; quantity: number; price: number; createdAt: Date }> = [];
    for (const s of filteredSales) {
      const orderItems = Array.isArray(s?.items) ? s.items : Array.isArray(s?.order_items) ? s.order_items : [];
      const orderDate = new Date(s.created_at || s.createdAt || 0);
      for (const item of orderItems) {
        const productId = String(item.productId || item.product_id || '');
        const productName = String(item?.product?.name || item?.name || `Product ${productId.slice(-4)}`);
        const qty = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        if (productId && qty > 0) {
          items.push({ productId, name: productName, quantity: qty, price, createdAt: orderDate });
        }
      }
    }
    return items;
  }, [filteredSales]);

  // Hourly distribution: orders per hour
  const hourlyData = useMemo(() => {
    const buckets: Record<number, { orders: number; revenue: number }> = {};
    for (let h = 0; h < 24; h++) buckets[h] = { orders: 0, revenue: 0 };

    for (const s of filteredSales) {
      const hour = new Date(s.created_at || s.createdAt || 0).getHours();
      buckets[hour].orders += 1;
      buckets[hour].revenue += Number(s.total || 0);
    }

    return Object.entries(buckets).map(([h, v]) => ({
      hour: Number(h),
      label: `${String(h).padStart(2, '0')}:00`,
      orders: v.orders,
      revenue: Math.round(v.revenue),
    }));
  }, [filteredSales]);

  // Product sales by hour: for each hour, which products sold most
  const productHourlyData = useMemo(() => {
    const productMap: Record<string, { name: string; totalQty: number; totalRevenue: number; hourlyQty: Record<number, number> }> = {};

    for (const item of allItems) {
      const hour = item.createdAt.getHours();
      if (!productMap[item.productId]) {
        productMap[item.productId] = { name: item.name, totalQty: 0, totalRevenue: 0, hourlyQty: {} };
      }
      productMap[item.productId].totalQty += item.quantity;
      productMap[item.productId].totalRevenue += item.price * item.quantity;
      productMap[item.productId].hourlyQty[hour] = (productMap[item.productId].hourlyQty[hour] || 0) + item.quantity;
    }

    const sorted = Object.entries(productMap)
      .map(([pid, data]) => ({
        productId: pid,
        name: data.name,
        totalQty: data.totalQty,
        totalRevenue: Math.round(data.totalRevenue),
        hourlyQty: data.hourlyQty,
      }))
      .sort((a, b) => b.totalQty - a.totalQty);

    return sorted;
  }, [allItems]);

  // Top products
  const topProducts = useMemo(() => productHourlyData.slice(0, 10), [productHourlyData]);

  // Peak hours (sorted by orders desc)
  const sortedHours = useMemo(() => [...hourlyData].sort((a, b) => b.orders - a.orders), [hourlyData]);
  const busyHours = sortedHours.filter((h) => h.orders > 0).slice(0, 3);
  const slowHours = [...sortedHours].reverse().filter((h) => h.orders === 0).slice(0, 3);

  const totalOrders = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const avgOrdersPerHour = totalOrders > 0 ? (totalOrders / 24).toFixed(1) : '0';

  const bestProduct = topProducts[0];
  const slowestProduct = topProducts[topProducts.length - 1];

  const R = recharts;

  const hourlyChart = useMemo(() => {
    if (!R) return null;
    const { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = R;
    return (
      <ResponsiveContainer width="100%" height={300} minWidth={300}>
        <BarChart data={hourlyData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 'bold', fill: '#94a3b8' }} interval={1} angle={-35} textAnchor="end" height={50} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          <Bar dataKey="orders" fill="#00E5FF" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 768 ? 12 : 20} />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [R, hourlyData]);

  const productChart = useMemo(() => {
    if (!R || topProducts.length === 0) return null;
    const { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = R;
    const data = topProducts.map((p) => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
      qty: p.totalQty,
    }));
    return (
      <ResponsiveContainer width="100%" height={300} minWidth={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748b' }} width={80} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          <Bar dataKey="qty" fill="#8B5CF6" radius={[0, 6, 6, 0]} barSize={window.innerWidth < 768 ? 14 : 22} />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [R, topProducts]);

  const rangeOptions: { key: TimeRangeKey; label: string }[] = [
    { key: 'today', label: t('business.reports.today') },
    { key: 'yesterday', label: t('business.reports.yesterday') },
    { key: 'last7days', label: t('business.reports.last7days') },
    { key: 'last30days', label: t('business.reports.last30days') },
  ];

  if (totalOrders === 0) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowRight size={16} className="rotate-180" />
          {t('business.reports.backToReports')}
        </button>
        <div className="bg-white p-6 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-8">
            {rangeOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setRange(opt.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${range === opt.key ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="py-16 md:py-24 text-center text-slate-300 font-bold">{t('business.reports.noData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowRight size={16} className="rotate-180" />
        {t('business.reports.backToReports')}
      </button>

      {/* Header + range selector */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h3 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <ShoppingCart size={22} className="text-cyan-500" />
              {t('business.reports.cashierReports')}
            </h3>
            <p className="text-slate-400 text-xs font-bold mt-1">{t('business.reports.cashierReportsDesc')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {rangeOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setRange(opt.key)}
                className={`px-3 py-2 md:px-4 rounded-xl text-xs font-bold ${range === opt.key ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-7 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart size={16} className="text-cyan-500" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('business.reports.totalOrdersInPeriod')}</p>
          </div>
          <span className="text-2xl font-black">{totalOrders}</span>
        </div>
        <div className="bg-white p-5 md:p-7 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-500" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('business.reports.avgOrdersPerHour')}</p>
          </div>
          <span className="text-2xl font-black">{avgOrdersPerHour}</span>
        </div>
        <div className="bg-white p-5 md:p-7 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-500" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('business.reports.bestSellingProduct')}</p>
          </div>
          <span className="text-sm font-black truncate block">{bestProduct?.name || '—'}</span>
          <span className="text-xs text-slate-400 font-bold">{bestProduct?.totalQty || 0} {t('business.reports.quantity')}</span>
        </div>
        <div className="bg-white p-5 md:p-7 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-orange-500" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('business.reports.slowestSellingProduct')}</p>
          </div>
          <span className="text-sm font-black truncate block">{slowestProduct?.name || '—'}</span>
          <span className="text-xs text-slate-400 font-bold">{slowestProduct?.totalQty || 0} {t('business.reports.quantity')}</span>
        </div>
      </div>

      {/* Hourly distribution chart */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
        <h4 className="text-lg md:text-xl font-black mb-1">{t('business.reports.hourlyDistribution')}</h4>
        <p className="text-slate-400 text-xs font-bold mb-6">{t('business.reports.peakHoursDesc')}</p>
        {hourlyChart}
      </div>

      {/* Busy / slow hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-500" />
            <h4 className="font-black text-sm">{t('business.reports.busyHours')}</h4>
          </div>
          <div className="space-y-2">
            {busyHours.map((h, i) => (
              <div key={h.hour} className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3">
                <span className="font-bold text-sm text-green-800">{h.label}</span>
                <span className="font-black text-sm text-green-600">{h.orders} {t('business.reports.orders')}</span>
              </div>
            ))}
            {busyHours.length === 0 && <p className="text-slate-300 text-xs font-bold py-4 text-center">{t('business.reports.noData')}</p>}
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} className="text-orange-500" />
            <h4 className="font-black text-sm">{t('business.reports.slowHours')}</h4>
          </div>
          <div className="space-y-2">
            {slowHours.map((h, i) => (
              <div key={h.hour} className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3">
                <span className="font-bold text-sm text-orange-800">{h.label}</span>
                <span className="font-black text-sm text-orange-600">{h.orders} {t('business.reports.orders')}</span>
              </div>
            ))}
            {slowHours.length === 0 && <p className="text-slate-300 text-xs font-bold py-4 text-center">{t('business.reports.noData')}</p>}
          </div>
        </div>
      </div>

      {/* Top products chart */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
        <h4 className="text-lg md:text-xl font-black mb-1">{t('business.reports.topProducts')}</h4>
        <p className="text-slate-400 text-xs font-bold mb-6">{t('business.reports.topProductsDesc')}</p>
        {productChart}
      </div>

      {/* Product sales by hour table */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm overflow-x-auto">
        <h4 className="text-lg md:text-xl font-black mb-1">{t('business.reports.productSalesByTime')}</h4>
        <p className="text-slate-400 text-xs font-bold mb-6">{t('business.reports.productSalesByTimeDesc')}</p>
        <table className="w-full text-xs md:text-sm" dir="rtl">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-right py-3 px-2 font-black text-slate-400 uppercase text-[10px]">{t('business.reports.product')}</th>
              <th className="text-center py-3 px-2 font-black text-slate-400 uppercase text-[10px]">{t('business.reports.quantity')}</th>
              <th className="text-center py-3 px-2 font-black text-slate-400 uppercase text-[10px]">{t('business.reports.revenue')}</th>
              {Array.from({ length: 24 }, (_, h) => (
                <th key={h} className="text-center py-3 px-1 font-black text-slate-300 text-[8px] hidden md:table-cell">
                  {String(h).padStart(2, '0')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p) => (
              <tr key={p.productId} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="py-3 px-2 font-bold text-slate-700">{p.name}</td>
                <td className="text-center py-3 px-2 font-black text-cyan-600">{p.totalQty}</td>
                <td className="text-center py-3 px-2 font-bold text-slate-600">{t('business.reports.currency')} {p.totalRevenue.toLocaleString()}</td>
                {Array.from({ length: 24 }, (_, h) => {
                  const qty = p.hourlyQty[h] || 0;
                  return (
                    <td key={h} className="text-center py-3 px-1 hidden md:table-cell">
                      {qty > 0 ? (
                        <span className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                          qty >= 5 ? 'bg-green-100 text-green-700' : qty >= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {qty}
                        </span>
                      ) : (
                        <span className="text-slate-200">·</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashierReportsTab;
