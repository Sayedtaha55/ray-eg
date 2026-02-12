import React, { useEffect, useMemo, useState } from 'react';

type Props = { analytics: any; sales: any[]; reservations?: any[] };

const ReportsTab: React.FC<Props> = ({ analytics, sales, reservations }) => {
  const [range, setRange] = useState<'30d' | '6m' | '12m'>('6m');

  const [recharts, setRecharts] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('recharts');
        if (cancelled) return;
        setRecharts(mod);
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const R = recharts;

  const safeSales = Array.isArray(sales) ? sales : [];
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeAnalytics = analytics || {};

  const successfulStatuses = new Set(['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED']);
  const isSuccessful = (s: any) => successfulStatuses.has(String(s?.status || '').toUpperCase());

  const isReservationCompleted = (r: any) => {
    const st = String(r?.status || '').trim().toUpperCase();
    return st === 'COMPLETED' || st === 'COMPLETEDRESERVATION';
  };

  const now = new Date();
  const start = new Date(now);
  if (range === '30d') {
    start.setDate(start.getDate() - 30);
  } else if (range === '12m') {
    start.setFullYear(start.getFullYear() - 1);
  } else {
    start.setMonth(start.getMonth() - 6);
  }

  const salesInRange = safeSales.filter((s: any) => {
    const ts = new Date(s.created_at || s.createdAt || 0).getTime();
    return ts >= start.getTime() && ts <= now.getTime() && isSuccessful(s);
  });

  const reservationsInRange = safeReservations.filter((r: any) => {
    const ts = new Date(r.created_at || r.createdAt || 0).getTime();
    return ts >= start.getTime() && ts <= now.getTime() && isReservationCompleted(r);
  });

  const rangeMonths = range === '12m' ? 12 : 6;
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const monthlyBuckets: Record<string, number> = {};

  if (range !== '30d') {
    const mStart = new Date(now);
    mStart.setDate(1);
    mStart.setHours(0, 0, 0, 0);
    mStart.setMonth(mStart.getMonth() - (rangeMonths - 1));

    for (let i = 0; i < rangeMonths; i += 1) {
      const d = new Date(mStart);
      d.setMonth(mStart.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyBuckets[key] = 0;
    }

    for (const s of salesInRange) {
      const dt = new Date(s.created_at || s.createdAt || 0);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (typeof monthlyBuckets[key] === 'number') {
        monthlyBuckets[key] += Number(s.total || 0);
      }
    }

    for (const r of reservationsInRange) {
      const dt = new Date(r.created_at || r.createdAt || 0);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (typeof monthlyBuckets[key] === 'number') {
        monthlyBuckets[key] += Number(r.itemPrice || r.item_price || 0);
      }
    }
  }

  const monthlyData = range === '30d'
    ? []
    : Object.keys(monthlyBuckets).sort().map((key) => {
        const [, m] = key.split('-');
        const monthIndex = Math.max(0, Math.min(11, Number(m) - 1));
        return {
          name: monthNames[monthIndex],
          revenue: Math.round(monthlyBuckets[key] || 0),
        };
      });

  const totalRevenue =
    salesInRange.reduce((sum: number, s: any) => sum + Number(s.total || 0), 0) +
    reservationsInRange.reduce((sum: number, r: any) => sum + Number(r.itemPrice || r.item_price || 0), 0);
  const totalOrders = salesInRange.length + reservationsInRange.length;
  const avgBasket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const visitors = Number((safeAnalytics as any).visitorsCount ?? (safeAnalytics as any).visitors ?? 0);
  const conversion = visitors > 0 ? (totalOrders / visitors) * 100 : 0;

  const prevStart = new Date(start);
  const prevEnd = new Date(start);
  if (range === '30d') prevStart.setDate(prevStart.getDate() - 30);
  else if (range === '12m') prevStart.setFullYear(prevStart.getFullYear() - 1);
  else prevStart.setMonth(prevStart.getMonth() - 6);

  const prevSales = safeSales.filter((s: any) => {
    const ts = new Date(s.created_at || s.createdAt || 0).getTime();
    return ts >= prevStart.getTime() && ts < prevEnd.getTime() && isSuccessful(s);
  });

  const prevReservations = safeReservations.filter((r: any) => {
    const ts = new Date(r.created_at || r.createdAt || 0).getTime();
    return ts >= prevStart.getTime() && ts < prevEnd.getTime() && isReservationCompleted(r);
  });

  const prevRevenue =
    prevSales.reduce((sum: number, s: any) => sum + Number(s.total || 0), 0) +
    prevReservations.reduce((sum: number, r: any) => sum + Number(r.itemPrice || r.item_price || 0), 0);
  const prevOrders = prevSales.length + prevReservations.length;
  const prevAvgBasket = prevOrders > 0 ? prevRevenue / prevOrders : 0;
  const prevConversion = visitors > 0 ? (prevOrders / visitors) * 100 : 0;

  const pctChange = (cur: number, prev: number) => {
    if (!prev) return cur ? 100 : 0;
    return ((cur - prev) / prev) * 100;
  };

  const avgBasketGrowth = pctChange(avgBasket, prevAvgBasket);
  const conversionGrowth = pctChange(conversion, prevConversion);
  const revenueGrowth = pctChange(totalRevenue, prevRevenue);

  const chartBody = useMemo(() => {
    if (!R) return null;
    const { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = R;
    return (
      <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
          <Bar dataKey="revenue" fill="#00E5FF" radius={[8, 8, 0, 0]} barSize={window.innerWidth < 768 ? 24 : 40} />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [R, monthlyData]);

  const SummaryCard = ({ label, value, growth }: any) => {
    const growthNum = typeof growth === 'number' ? growth : Number(growth || 0);
    const sign = growthNum > 0 ? '+' : '';
    const text = `${sign}${Math.round(growthNum)}٪`;
    const cls = growthNum >= 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50';
    return (
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-right">
        <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">{label}</p>
        <div className="flex items-end justify-between flex-row-reverse">
          <span className="text-3xl font-black">{value}</span>
          <span className={`${cls} font-bold text-xs px-3 py-1 rounded-full`}>{text}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-12">
          <h3 className="text-2xl md:text-3xl font-black">أداء الإيرادات الشهرية</h3>
          <div className="flex gap-2">
            <button onClick={() => setRange('30d')} className={`px-3 py-2 md:px-4 rounded-xl text-xs font-bold ${range === '30d' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>٣٠ يوم</button>
            <button onClick={() => setRange('6m')} className={`px-3 py-2 md:px-4 rounded-xl text-xs font-bold ${range === '6m' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>٦ شهور</button>
            <button onClick={() => setRange('12m')} className={`px-3 py-2 md:px-4 rounded-xl text-xs font-bold ${range === '12m' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>١٢ شهر</button>
          </div>
        </div>

        {range === '30d' ? (
          <div className="py-16 md:py-24 text-center text-slate-300 font-bold">اختر ٦ شهور أو ١٢ شهر لعرض الرسم الشهري</div>
        ) : (
          <div className="h-[300px] md:h-[450px] w-full min-w-[300px] min-h-[300px] md:min-h-[400px]">
            {chartBody}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        <SummaryCard label="متوسط قيمة السلة" value={`ج.م ${Math.round(avgBasket).toLocaleString('ar-EG')}`} growth={avgBasketGrowth} />
        <SummaryCard label="نسبة التحويل" value={`${conversion.toFixed(1)}٪`} growth={conversionGrowth} />
        <SummaryCard label="إيراد الفترة" value={`ج.م ${Math.round(totalRevenue).toLocaleString('ar-EG')}`} growth={revenueGrowth} />
      </div>
    </div>
  );
};

export default ReportsTab;
