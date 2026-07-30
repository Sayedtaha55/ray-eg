import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Clock, TrendingUp, TrendingDown, Package, Wallet, DollarSign, CalendarCheck, XCircle, BarChart3, Users, FileText, Activity, CheckCircle2, Boxes, Repeat, AlertTriangle, Crown, UserCheck } from 'lucide-react';
import { getShopActivityVocabulary } from '@/utils/businessActivityVocabulary';
import { isShopBookingActivity } from '@/components/pages/business/bookings/config';
import { ApiService } from '@/services/api.service';

type Props = { analytics: any; sales: any[]; reservations?: any[]; posEnabled?: boolean; onOpenCashierReports?: () => void; shop?: any };

const EXPENSES_STORAGE_PREFIX = 'shop_expenses_';

const ReportsTab: React.FC<Props> = ({ analytics, sales, reservations, posEnabled, onOpenCashierReports, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const activityVocab = getShopActivityVocabulary(shop, i18n.language);
  const isBookingActivity = isShopBookingActivity(shop);
  const [range, setRange] = useState<'30d' | '6m' | '12m'>('6m');
  const [expenses, setExpenses] = useState<any[]>([]);

  const [recharts, setRecharts] = useState<any>(null);
  const [patientPayments, setPatientPayments] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<any>(null);

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

  useEffect(() => {
    if (!isBookingActivity || !shop?.id) return;
    (async () => {
      try {
        const data = await ApiService.getBookingActivityData(shop.id, 'activityPatientsList');
        if (Array.isArray(data)) {
          const allPayments: any[] = [];
          for (const p of data) {
            for (const pay of (p.payments || [])) {
              allPayments.push({ ...pay, patientName: p.name, patientId: p.id });
            }
          }
          setPatientPayments(allPayments);
        }
      } catch {}
    })();
  }, [isBookingActivity, shop?.id]);

  useEffect(() => {
    if (!isBookingActivity || !shop?.id) return;
    (async () => {
      try {
        const data = await ApiService.getBookingActivityData(shop.id, 'activityInventoryList');
        if (Array.isArray(data)) setInventoryItems(data);
      } catch {}
    })();
  }, [isBookingActivity, shop?.id]);

  useEffect(() => {
    if (!shop?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await ApiService.getCustomerAnalytics(shop.id);
        if (!cancelled) setCustomerAnalytics(data);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [shop?.id]);

  useEffect(() => {
    try {
      const shopId = shop?.id;
      if (!shopId) return;
      const raw = localStorage.getItem(EXPENSES_STORAGE_PREFIX + shopId);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setExpenses(parsed);
      }
    } catch {}
  }, [shop?.id]);

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
  const monthNames = [
    t('business.reports.months.jan'), t('business.reports.months.feb'), t('business.reports.months.mar'),
    t('business.reports.months.apr'), t('business.reports.months.may'), t('business.reports.months.jun'),
    t('business.reports.months.jul'), t('business.reports.months.aug'), t('business.reports.months.sep'),
    t('business.reports.months.oct'), t('business.reports.months.nov'), t('business.reports.months.dec'),
  ];
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

    if (isBookingActivity) {
      for (const pay of patientPayments) {
        const dt = new Date(pay.date || 0);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        if (typeof monthlyBuckets[key] === 'number') {
          monthlyBuckets[key] += Number(pay.amount || 0);
        }
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

  const orderRevenue = salesInRange.reduce((sum: number, s: any) => sum + Number(s.total || 0), 0);
  const reservationRevenue = reservationsInRange.reduce((sum: number, r: any) => sum + Number(r.itemPrice || r.item_price || 0), 0);
  const patientPaymentRevenue = isBookingActivity
    ? patientPayments
        .filter(pay => {
          const ts = new Date(pay.date || 0).getTime();
          return ts >= start.getTime() && ts <= now.getTime();
        })
        .reduce((sum: number, pay: any) => sum + Number(pay.amount || 0), 0)
    : 0;
  const bookingRevenue = isBookingActivity ? patientPaymentRevenue : reservationRevenue;
  const totalRevenue = orderRevenue + bookingRevenue;
  const totalOrders = salesInRange.length + reservationsInRange.length;
  const avgBasket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const completedBookings = safeReservations.filter((r: any) => {
    const st = String(r?.status || '').trim().toUpperCase();
    return st === 'COMPLETED' || st === 'COMPLETEDRESERVATION';
  }).length;
  const cancelledBookings = safeReservations.filter((r: any) => {
    const st = String(r?.status || '').trim().toUpperCase();
    return st === 'CANCELLED' || st === 'CANCELLEDRESERVATION';
  }).length;
  const avgBookingValue = completedBookings > 0 ? bookingRevenue / completedBookings : 0;

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

  const prevReservationRevenue = prevReservations.reduce((sum: number, r: any) => sum + Number(r.itemPrice || r.item_price || 0), 0);
  const prevPatientPaymentRevenue = isBookingActivity
    ? patientPayments
        .filter(pay => {
          const ts = new Date(pay.date || 0).getTime();
          return ts >= prevStart.getTime() && ts < prevEnd.getTime();
        })
        .reduce((sum: number, pay: any) => sum + Number(pay.amount || 0), 0)
    : 0;
  const prevBookingRevenue = isBookingActivity ? prevPatientPaymentRevenue : prevReservationRevenue;
  const prevRevenue = prevSales.reduce((sum: number, s: any) => sum + Number(s.total || 0), 0) + prevBookingRevenue;
  const prevOrders = prevSales.length + prevReservations.length;
  const prevAvgBasket = prevOrders > 0 ? prevRevenue / prevOrders : 0;
  const prevConversion = visitors > 0 ? (prevOrders / visitors) * 100 : 0;

  const pctChange = (cur: number, prev: number) => {
    if (!prev) return cur ? 100 : 0;
    return ((cur - prev) / prev) * 100;
  };

  const expensesInRange = expenses.filter((e: any) => {
    const ts = new Date(e.date).getTime();
    return ts >= start.getTime() && ts <= now.getTime();
  });
  const totalExpenses = expensesInRange.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
  const inventoryValue = isBookingActivity
    ? inventoryItems.reduce((sum: number, i: any) => sum + (Number(i.costPerUnit || 0) * Number(i.quantity || 0)), 0)
    : 0;
  const netProfit = totalRevenue - totalExpenses - inventoryValue;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const prevExpenses = expenses.filter((e: any) => {
    const ts = new Date(e.date).getTime();
    return ts >= prevStart.getTime() && ts < prevEnd.getTime();
  }).reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
  const prevNetProfit = prevRevenue - prevExpenses;
  const expenseGrowth = pctChange(totalExpenses, prevExpenses);
  const profitGrowth = pctChange(netProfit, prevNetProfit);

  const avgBasketGrowth = pctChange(avgBasket, prevAvgBasket);
  const conversionGrowth = pctChange(conversion, prevConversion);
  const revenueGrowth = pctChange(totalRevenue, prevRevenue);

  // Daily trend: last 14 days revenue
  const dailyTrendData = useMemo(() => {
    const buckets: Record<string, number> = {};
    const dStart = new Date(now);
    dStart.setHours(0, 0, 0, 0);
    dStart.setDate(dStart.getDate() - 13);
    for (let i = 0; i < 14; i++) {
      const d = new Date(dStart);
      d.setDate(dStart.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }
    for (const s of salesInRange) {
      const dt = new Date(s.created_at || s.createdAt || 0);
      const key = dt.toISOString().slice(0, 10);
      if (typeof buckets[key] === 'number') buckets[key] += Number(s.total || 0);
    }
    for (const r of reservationsInRange) {
      const dt = new Date(r.created_at || r.createdAt || 0);
      const key = dt.toISOString().slice(0, 10);
      if (typeof buckets[key] === 'number') buckets[key] += Number(r.itemPrice || r.item_price || 0);
    }
    return Object.keys(buckets).sort().map((key) => {
      const d = new Date(key + 'T00:00:00');
      return {
        name: `${d.getDate()}/${d.getMonth() + 1}`,
        revenue: Math.round(buckets[key] || 0),
      };
    });
  }, [salesInRange, reservationsInRange]);

  // Peak hours: hourly distribution across all sales in range
  const peakHoursData = useMemo(() => {
    const buckets: Record<number, number> = {};
    for (let h = 0; h < 24; h++) buckets[h] = 0;
    for (const s of salesInRange) {
      const hour = new Date(s.created_at || s.createdAt || 0).getHours();
      buckets[hour] += 1;
    }
    for (const r of reservationsInRange) {
      const hour = new Date(r.created_at || r.createdAt || 0).getHours();
      buckets[hour] += 1;
    }
    return Object.keys(buckets).map((h) => ({
      hour: Number(h),
      label: `${String(h).padStart(2, '0')}:00`,
      orders: buckets[Number(h)],
    }));
  }, [salesInRange, reservationsInRange]);

  // Top products from order items
  const topProductsData = useMemo(() => {
    const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const s of salesInRange) {
      const items = Array.isArray(s?.items) ? s.items : Array.isArray(s?.order_items) ? s.order_items : [];
      for (const item of items) {
        const pid = String(item.productId || item.product_id || '');
        const name = String(item?.product?.name || item?.name || `Product ${pid.slice(-4)}`);
        const qty = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        if (pid && qty > 0) {
          if (!productMap[pid]) productMap[pid] = { name, qty: 0, revenue: 0 };
          productMap[pid].qty += qty;
          productMap[pid].revenue += price * qty;
        }
      }
    }
    return Object.entries(productMap)
      .map(([pid, d]) => ({ productId: pid, name: d.name, qty: d.qty, revenue: Math.round(d.revenue) }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
  }, [salesInRange]);

  // Booking status distribution
  const bookingStatusData = useMemo(() => {
    if (!isBookingActivity) return [];
    const counts: Record<string, number> = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (const r of safeReservations) {
      const st = String(r?.status || '').toLowerCase().trim();
      if (counts[st] !== undefined) counts[st]++;
    }
    return [
      { name: isArabic ? 'قيد الانتظار' : 'Pending', value: counts.pending, color: '#F59E0B' },
      { name: isArabic ? 'مؤكد' : 'Confirmed', value: counts.confirmed, color: '#10B981' },
      { name: isArabic ? 'مكتمل' : 'Completed', value: counts.completed, color: '#3B82F6' },
      { name: isArabic ? 'ملغي' : 'Cancelled', value: counts.cancelled, color: '#EF4444' },
    ].filter(d => d.value > 0);
  }, [isBookingActivity, safeReservations, isArabic]);

  const bookingStatusChart = useMemo(() => {
    if (!R || bookingStatusData.length === 0) return null;
    const { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } = R;
    return (
      <ResponsiveContainer width="100%" height={300} minWidth={280}>
        <PieChart>
          <Pie data={bookingStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
            {bookingStatusData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }, [R, bookingStatusData]);

  // Booking daily trend (last 14 days)
  const bookingDailyTrend = useMemo(() => {
    if (!isBookingActivity) return [];
    const buckets: Record<string, number> = {};
    const dStart = new Date(now);
    dStart.setHours(0, 0, 0, 0);
    dStart.setDate(dStart.getDate() - 13);
    for (let i = 0; i < 14; i++) {
      const d = new Date(dStart);
      d.setDate(dStart.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }
    for (const r of reservationsInRange) {
      const dt = new Date(r.created_at || r.createdAt || 0);
      const key = dt.toISOString().slice(0, 10);
      if (typeof buckets[key] === 'number') buckets[key] += 1;
    }
    return Object.keys(buckets).sort().map((key) => {
      const d = new Date(key + 'T00:00:00');
      return { name: `${d.getDate()}/${d.getMonth() + 1}`, bookings: buckets[key] };
    });
  }, [isBookingActivity, reservationsInRange]);

  const bookingTrendChart = useMemo(() => {
    if (!R || bookingDailyTrend.length === 0) return null;
    const { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = R;
    return (
      <ResponsiveContainer width="100%" height={280} minWidth={300}>
        <AreaChart data={bookingDailyTrend}>
          <defs>
            <linearGradient id="bookingTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} interval={0} angle={-35} textAnchor="end" height={50} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} allowDecimals={false} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          <Area type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={2} fill="url(#bookingTrendGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }, [R, bookingDailyTrend]);

  const chartBody = useMemo(() => {
    if (!R) return null;
    const { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = R;
    return (
      <ResponsiveContainer width="100%" height={420} minWidth={300} minHeight={300}>
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

  const dailyTrendChart = useMemo(() => {
    if (!R) return null;
    const { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = R;
    return (
      <ResponsiveContainer width="100%" height={280} minWidth={300}>
        <AreaChart data={dailyTrendData}>
          <defs>
            <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} interval={0} angle={-35} textAnchor="end" height={50} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          <Area type="monotone" dataKey="revenue" stroke="#00E5FF" strokeWidth={2} fill="url(#dailyGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }, [R, dailyTrendData]);

  const peakHoursChart = useMemo(() => {
    if (!R) return null;
    const { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = R;
    return (
      <ResponsiveContainer width="100%" height={280} minWidth={300}>
        <BarChart data={peakHoursData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 'bold', fill: '#94a3b8' }} interval={1} angle={-35} textAnchor="end" height={50} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          <Bar dataKey="orders" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 768 ? 10 : 16} />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [R, peakHoursData]);

  const SummaryCard = ({ label, value, growth }: any) => {
    const growthNum = typeof growth === 'number' ? growth : Number(growth || 0);
    const sign = growthNum > 0 ? '+' : '';
    const text = `${sign}${Math.round(growthNum)}${t('business.reports.percent')}`;
    const cls = growthNum >= 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50';
    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 text-right">
        <p className="text-slate-500 font-semibold text-xs mb-2">{label}</p>
        <div className="flex items-end justify-between flex-row-reverse">
          <span className="text-2xl sm:text-3xl font-bold">{value}</span>
          <span className={`${cls} font-semibold text-xs px-3 py-1 rounded-full`}>{text}</span>
        </div>
      </div>
    );
  };

  const revenueVsExpensesData = useMemo(() => {
    if (range === '30d') return [];
    const months: Record<string, { revenue: number; expenses: number }> = {};
    const mStart = new Date(now);
    mStart.setDate(1);
    mStart.setHours(0, 0, 0, 0);
    mStart.setMonth(mStart.getMonth() - (rangeMonths - 1));
    for (let i = 0; i < rangeMonths; i += 1) {
      const d = new Date(mStart);
      d.setMonth(mStart.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { revenue: 0, expenses: 0 };
    }
    for (const s of salesInRange) {
      const dt = new Date(s.created_at || s.createdAt || 0);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) months[key].revenue += Number(s.total || 0);
    }
    for (const r of reservationsInRange) {
      const dt = new Date(r.created_at || r.createdAt || 0);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) months[key].revenue += Number(r.itemPrice || r.item_price || 0);
    }
    if (isBookingActivity) {
      for (const pay of patientPayments) {
        const dt = new Date(pay.date || 0);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        if (months[key]) months[key].revenue += Number(pay.amount || 0);
      }
    }
    for (const e of expensesInRange) {
      const dt = new Date(e.date);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) months[key].expenses += Number(e.amount || 0);
    }
    return Object.keys(months).sort().map((key) => {
      const [, m] = key.split('-');
      const monthIndex = Math.max(0, Math.min(11, Number(m) - 1));
      return {
        name: monthNames[monthIndex],
        revenue: Math.round(months[key].revenue || 0),
        expenses: Math.round(months[key].expenses || 0),
        profit: Math.round((months[key].revenue || 0) - (months[key].expenses || 0)),
      };
    });
  }, [salesInRange, reservationsInRange, expensesInRange, range, rangeMonths, monthNames, isBookingActivity, patientPayments]);

  const revenueVsExpensesChart = useMemo(() => {
    if (!R || revenueVsExpensesData.length === 0) return null;
    const { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } = R;
    return (
      <ResponsiveContainer width="100%" height={350} minWidth={300}>
        <BarChart data={revenueVsExpensesData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
          <Bar dataKey="revenue" fill="#00E5FF" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 768 ? 16 : 28} />
          <Bar dataKey="expenses" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 768 ? 16 : 28} />
          <Bar dataKey="profit" fill="#10B981" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 768 ? 16 : 28} />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [R, revenueVsExpensesData]);

  // Inventory category pie chart data
  const inventoryCategoryData = useMemo(() => {
    if (!isBookingActivity || inventoryItems.length === 0) return [];
    const catMap: Record<string, number> = {};
    for (const i of inventoryItems) {
      const cat = String(i.category || 'other');
      catMap[cat] = (catMap[cat] || 0) + 1;
    }
    const labels: Record<string, { ar: string; en: string; color: string }> = {
      medication: { ar: 'أدوية', en: 'Medication', color: '#8B5CF6' },
      supply: { ar: 'مستلزمات', en: 'Supplies', color: '#06B6D4' },
      equipment: { ar: 'أجهزة', en: 'Equipment', color: '#F43F5E' },
      other: { ar: 'أخرى', en: 'Other', color: '#64748B' },
    };
    return Object.entries(catMap).map(([cat, count]) => ({
      name: isArabic ? labels[cat]?.ar || cat : labels[cat]?.en || cat,
      value: count,
      color: labels[cat]?.color || '#64748B',
    })).filter(d => d.value > 0);
  }, [isBookingActivity, inventoryItems, isArabic]);

  const inventoryCategoryChart = useMemo(() => {
    if (!R || inventoryCategoryData.length === 0) return null;
    const { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } = R;
    return (
      <ResponsiveContainer width="100%" height={300} minWidth={280}>
        <PieChart>
          <Pie data={inventoryCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
            {inventoryCategoryData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }, [R, inventoryCategoryData]);

  /* ═══════════════════════════════════════════════════════════
   * BOOKING REPORTS — للحجوزات (عيادات، صالونات، إلخ)
   * ═══════════════════════════════════════════════════════════ */
  if (isBookingActivity) {
    return (
      <div className="space-y-6 md:space-y-10">
        {/* عنوان + اختيار المدة */}
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-cyan-500" />
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">{isArabic ? 'تقارير وإحصائيات الحجوزات' : 'Booking Reports & Statistics'}</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRange('30d')} className={`px-3 py-2 md:px-4 rounded-lg text-xs font-semibold ${range === '30d' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>{isArabic ? '٣٠ يوم' : '30D'}</button>
              <button onClick={() => setRange('6m')} className={`px-3 py-2 md:px-4 rounded-lg text-xs font-semibold ${range === '6m' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>{isArabic ? '٦ شهور' : '6M'}</button>
              <button onClick={() => setRange('12m')} className={`px-3 py-2 md:px-4 rounded-lg text-xs font-semibold ${range === '12m' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>{isArabic ? '١٢ شهر' : '12M'}</button>
            </div>
          </div>

          {/* ملخص الحجوزات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
              <CalendarCheck className="w-5 h-5 text-cyan-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{safeReservations.length}</div>
              <div className="text-xs font-semibold text-slate-500">{isArabic ? 'إجمالي الحجوزات' : 'Total Bookings'}</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{completedBookings}</div>
              <div className="text-xs font-semibold text-slate-500">{isArabic ? 'مكتملة' : 'Completed'}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <XCircle className="w-5 h-5 text-red-400 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{cancelledBookings}</div>
              <div className="text-xs font-semibold text-slate-500">{isArabic ? 'ملغاة' : 'Cancelled'}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <DollarSign className="w-5 h-5 text-blue-500 mb-2" />
              <div className="text-xl font-bold text-slate-900">{t('business.reports.currency')} {Math.round(avgBookingValue).toLocaleString()}</div>
              <div className="text-xs font-semibold text-slate-500">{isArabic ? 'متوسط قيمة الحجز' : 'Avg Booking Value'}</div>
            </div>
          </div>

          {/* رسم بياني للإيرادات الشهرية من الحجوزات */}
          {range !== '30d' && (
            <div className="w-full min-w-[300px] min-h-[300px] md:min-h-[400px]">
              {chartBody}
            </div>
          )}
        </div>

        {/* توزيع حالات الحجوزات + اتجاه يومي */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h4 className="text-lg font-bold">{isArabic ? 'توزيع حالات الحجوزات' : 'Booking Status Distribution'}</h4>
            </div>
            <p className="text-slate-500 text-xs font-semibold mb-6">{isArabic ? 'نسبة كل حالة من إجمالي الحجوزات' : 'Breakdown of all booking statuses'}</p>
            {bookingStatusChart || (
              <div className="py-12 text-center text-slate-400 font-semibold">{isArabic ? 'لا توجد بيانات' : 'No data available'}</div>
            )}
          </div>
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h4 className="text-lg font-bold">{isArabic ? 'حجوزات آخر ١٤ يوم' : 'Bookings — Last 14 Days'}</h4>
            </div>
            <p className="text-slate-500 text-xs font-semibold mb-6">{isArabic ? 'عدد الحجوزات اليومية' : 'Daily booking count trend'}</p>
            {bookingTrendChart || (
              <div className="py-12 text-center text-slate-300 font-bold">{isArabic ? 'لا توجد بيانات' : 'No data available'}</div>
            )}
          </div>
        </div>

        {/* الملخص المالي */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                <DollarSign size={18} className="text-cyan-600" />
              </div>
              <p className="text-slate-500 font-semibold text-xs">{isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
            </div>
            <span className="text-2xl md:text-3xl font-bold text-slate-900">{t('business.reports.currency')} {Math.round(bookingRevenue).toLocaleString()}</span>
            {revenueGrowth !== 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${revenueGrowth >= 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{Math.round(revenueGrowth)}{t('business.reports.percent')}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{isArabic ? 'مقارنة بالفترة السابقة' : 'vs previous period'}</span>
              </div>
            )}
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Wallet size={18} className="text-red-500" />
              </div>
              <p className="text-slate-500 font-semibold text-xs">{isArabic ? 'إجمالي المصروفات' : 'Total Expenses'}</p>
            </div>
            <span className="text-2xl md:text-3xl font-bold text-slate-900">{t('business.reports.currency')} {Math.round(totalExpenses).toLocaleString()}</span>
          </div>
          {isBookingActivity && inventoryValue > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Package size={18} className="text-violet-500" />
                </div>
                <p className="text-slate-500 font-semibold text-xs">{isArabic ? 'قيمة المخزون' : 'Inventory Value'}</p>
              </div>
              <span className="text-2xl md:text-3xl font-bold text-violet-700">{t('business.reports.currency')} {Math.round(inventoryValue).toLocaleString()}</span>
            </div>
          )}
          <div className={`bg-white p-4 sm:p-6 rounded-xl border shadow-sm ${netProfit >= 0 ? 'border-emerald-200' : 'border-red-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {netProfit >= 0 ? <TrendingUp size={18} className="text-emerald-600" /> : <TrendingDown size={18} className="text-red-500" />}
              </div>
              <p className="text-slate-500 font-semibold text-xs">{isArabic ? 'صافي الربح' : 'Net Profit'}</p>
            </div>
            <span className={`text-2xl md:text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{t('business.reports.currency')} {Math.round(netProfit).toLocaleString()}</span>
            {isBookingActivity && inventoryValue > 0 && (
              <p className="text-xs text-slate-500 font-semibold mt-2">{isArabic ? '(الإيرادات - المصروفات - المخزون)' : '(Revenue - Expenses - Inventory)'}</p>
            )}
          </div>
        </div>

        {/* هامش الربح + معدل الإلغاء + معدل الإكمال */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} className="text-indigo-500" />
              <p className="text-slate-500 font-semibold text-xs">{isArabic ? 'هامش الربح' : 'Profit Margin'}</p>
            </div>
            <span className="text-2xl font-bold">{profitMargin.toFixed(1)}{t('business.reports.percent')}</span>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={16} className="text-red-400" />
              <p className="text-slate-500 font-semibold text-xs">{isArabic ? 'معدل الإلغاء' : 'Cancellation Rate'}</p>
            </div>
            <span className="text-2xl font-bold">{safeReservations.length > 0 ? Math.round((cancelledBookings / safeReservations.length) * 100) : 0}{t('business.reports.percent')}</span>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <p className="text-slate-500 font-semibold text-xs">{isArabic ? 'معدل الإكمال' : 'Completion Rate'}</p>
            </div>
            <span className="text-2xl font-bold">{safeReservations.length > 0 ? Math.round((completedBookings / safeReservations.length) * 100) : 0}{t('business.reports.percent')}</span>
          </div>
        </div>

        {/* الإيرادات مقابل المصروفات */}
        {range !== '30d' && revenueVsExpensesChart && (
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={18} className="text-indigo-500" />
              <h4 className="text-lg font-bold">{isArabic ? 'الإيرادات مقابل المصروفات' : 'Revenue vs Expenses'}</h4>
            </div>
            <p className="text-slate-500 text-xs font-semibold mb-6">{isArabic ? 'مقارنة شهرية بين الإيرادات والمصروفات والربح' : 'Monthly comparison of revenue, expenses, and profit'}</p>
            {revenueVsExpensesChart}
          </div>
        )}

        {/* توزيع المخزون الطبي */}
        {isBookingActivity && inventoryCategoryChart && (
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Boxes size={18} className="text-cyan-600" />
              <h4 className="text-lg font-bold">{isArabic ? 'توزيع المخزون الطبي' : 'Inventory Distribution'}</h4>
            </div>
            <p className="text-slate-500 text-xs font-semibold mb-6">{isArabic ? 'توزيع الأصناف حسب التصنيف' : 'Items breakdown by category'}</p>
            {inventoryCategoryChart}
          </div>
        )}

        {/* Customer Insights */}
        {customerAnalytics && (
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Users size={18} className="text-blue-500" />
              <h4 className="text-lg font-bold">{isArabic ? 'تحليلات العملاء' : 'Customer Insights'}</h4>
            </div>
            <p className="text-slate-500 text-xs font-semibold mb-6">{isArabic ? 'نظرة شاملة على سلوك العملاء' : 'Comprehensive customer behavior overview'}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <Users className="w-5 h-5 text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-slate-900">{customerAnalytics.totalCustomers || 0}</div>
                <div className="text-xs font-semibold text-slate-500">{isArabic ? 'إجمالي العملاء' : 'Total Customers'}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <Repeat className="w-5 h-5 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-slate-900">{customerAnalytics.retentionRate || 0}%</div>
                <div className="text-xs font-semibold text-slate-500">{isArabic ? 'نسبة العائدين' : 'Retention Rate'}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-slate-900">{customerAnalytics.avgVisitsPerCustomer || 0}</div>
                <div className="text-xs font-semibold text-slate-500">{isArabic ? 'متوسط الزيارات' : 'Avg Visits'}</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-600 mb-2" />
                <div className="text-2xl font-bold text-slate-900">{customerAnalytics.atRiskCustomers?.length || 0}</div>
                <div className="text-xs font-semibold text-slate-500">{isArabic ? 'معرضون للتوقف' : 'At Risk'}</div>
              </div>
            </div>

            {customerAnalytics.topCustomers && customerAnalytics.topCustomers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-3">{isArabic ? 'أفضل 5 عملاء' : 'Top 5 Customers'}</p>
                <div className="space-y-2">
                  {customerAnalytics.topCustomers.slice(0, 5).map((c: any, i: number) => (
                    <div key={c.id || i} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Crown size={14} className={i === 0 ? 'text-amber-500' : 'text-slate-400'} />
                        <span className="text-sm font-semibold text-slate-700">{c.name || 'عميل'}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{t('business.reports.currency')} {Number(c.totalSpent || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
   * COMMERCIAL REPORTS — للأنشطة التجارية (متاجر، مطاعم، إلخ)
   * ═══════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 md:space-y-10">
      {/* Monthly revenue chart */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">{t('business.reports.reportsAndStatistics')}</h3>
          <div className="flex gap-2">
            <button onClick={() => setRange('30d')} className={`px-3 py-2 md:px-4 rounded-lg text-xs font-semibold ${range === '30d' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>{t('business.reports.30days')}</button>
            <button onClick={() => setRange('6m')} className={`px-3 py-2 md:px-4 rounded-lg text-xs font-semibold ${range === '6m' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>{t('business.reports.6months')}</button>
            <button onClick={() => setRange('12m')} className={`px-3 py-2 md:px-4 rounded-lg text-xs font-semibold ${range === '12m' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>{t('business.reports.12months')}</button>
          </div>
        </div>

        {range === '30d' ? (
          <div className="py-16 md:py-24 text-center text-slate-400 font-semibold">{t('business.reports.selectRangeForChart')}</div>
        ) : (
          <div className="w-full min-w-[300px] min-h-[300px] md:min-h-[400px]">
            {chartBody}
          </div>
        )}
      </div>

      {/* Financial Summary: Revenue, Expenses, Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
              <DollarSign size={18} className="text-cyan-600" />
            </div>
            <p className="text-slate-500 font-semibold text-xs">{t('business.reports.totalRevenue')}</p>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-slate-900">{t('business.reports.currency')} {Math.round(totalRevenue).toLocaleString()}</span>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${revenueGrowth >= 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}>
              {revenueGrowth >= 0 ? '+' : ''}{Math.round(revenueGrowth)}{t('business.reports.percent')}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{t('business.reports.revenueGrowth')}</span>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Wallet size={18} className="text-red-500" />
            </div>
            <p className="text-slate-500 font-semibold text-xs">{t('business.reports.totalExpenses')}</p>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-slate-900">{t('business.reports.currency')} {Math.round(totalExpenses).toLocaleString()}</span>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${expenseGrowth <= 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}>
              {expenseGrowth >= 0 ? '+' : ''}{Math.round(expenseGrowth)}{t('business.reports.percent')}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{t('business.reports.expenseGrowth')}</span>
          </div>
        </div>
        <div className={`bg-white p-4 sm:p-6 rounded-xl border shadow-sm ${netProfit >= 0 ? 'border-emerald-200' : 'border-red-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              {netProfit >= 0 ? <TrendingUp size={18} className="text-emerald-600" /> : <TrendingDown size={18} className="text-red-500" />}
            </div>
            <p className="text-slate-500 font-semibold text-xs">{t('business.reports.netProfit')}</p>
          </div>
          <span className={`text-2xl md:text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{t('business.reports.currency')} {Math.round(netProfit).toLocaleString()}</span>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${profitGrowth >= 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}>
              {profitGrowth >= 0 ? '+' : ''}{Math.round(profitGrowth)}{t('business.reports.percent')}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{t('business.reports.profitGrowth')}</span>
          </div>
        </div>
      </div>

      {/* Profit margin + booking stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-indigo-500" />
            <p className="text-slate-500 font-semibold text-xs">{t('business.reports.profitMargin')}</p>
          </div>
          <span className="text-2xl font-bold">{profitMargin.toFixed(1)}{t('business.reports.percent')}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck size={16} className="text-emerald-500" />
            <p className="text-slate-500 font-semibold text-xs">{t('business.reports.completedBookings')}</p>
          </div>
          <span className="text-2xl font-bold">{completedBookings}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={16} className="text-red-400" />
            <p className="text-slate-500 font-semibold text-xs">{t('business.reports.cancelledBookings')}</p>
          </div>
          <span className="text-2xl font-bold">{cancelledBookings}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-cyan-500" />
            <p className="text-slate-500 font-semibold text-xs">{t('business.reports.avgBookingValue')}</p>
          </div>
          <span className="text-xl font-bold">{t('business.reports.currency')} {Math.round(avgBookingValue).toLocaleString()}</span>
        </div>
      </div>

      {/* Revenue vs Expenses chart */}
      {range !== '30d' && (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={18} className="text-indigo-500" />
            <h4 className="text-lg font-bold">{t('business.reports.revenueVsExpenses')}</h4>
          </div>
          <p className="text-slate-500 text-xs font-semibold mb-6">{t('business.reports.revenueVsExpensesDesc')}</p>
          {revenueVsExpensesChart || (
            <div className="py-12 text-center text-slate-400 font-semibold">{t('business.reports.noProfitData')}</div>
          )}
        </div>
      )}

      {/* Original summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        <SummaryCard label={t('business.reports.avgBasketValue')} value={`${t('business.reports.currency')} ${Math.round(avgBasket).toLocaleString()}`} growth={avgBasketGrowth} />
        <SummaryCard label={t('business.reports.conversionRate')} value={`${conversion.toFixed(1)}%`} growth={conversionGrowth} />
        <SummaryCard label={t('business.reports.periodRevenue')} value={`${t('business.reports.currency')} ${Math.round(totalRevenue).toLocaleString()}`} growth={revenueGrowth} />
      </div>

      {/* Daily trend + Peak hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-cyan-500" />
            <h4 className="text-lg font-bold">{t('business.reports.dailyTrend')}</h4>
          </div>
          <p className="text-slate-500 text-xs font-semibold mb-6">{t('business.reports.dailyTrendDesc')}</p>
          {dailyTrendChart}
        </div>
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={18} className="text-purple-500" />
            <h4 className="text-lg font-bold">{t('business.reports.peakHours')}</h4>
          </div>
          <p className="text-slate-500 text-xs font-semibold mb-6">{t('business.reports.peakHoursDesc')}</p>
          {peakHoursChart}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Package size={18} className="text-indigo-500" />
          <h4 className="text-lg font-bold">{isArabic ? `أبرز ${activityVocab.productPlural}` : `Top ${activityVocab.productPlural}`}</h4>
        </div>
        <p className="text-slate-500 text-xs font-semibold mb-6">{isArabic ? `أكثر ${activityVocab.productPlural} مبيعاً` : `Best selling ${activityVocab.productPlural}`}</p>
        {topProductsData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-semibold">{t('business.reports.noData')}</div>
        ) : (
          <div className="space-y-3">
            {topProductsData.map((p, i) => {
              const maxQty = topProductsData[0]?.qty || 1;
              const pct = Math.round((p.qty / maxQty) * 100);
              return (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-6 text-center">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-700 truncate">{p.name}</span>
                      <span className="text-xs font-bold text-slate-500 ml-2 shrink-0">{p.qty} {t('business.reports.quantity')}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-cyan-400 to-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 w-20 text-left shrink-0">{t('business.reports.currency')} {p.revenue.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Customer Insights */}
      {customerAnalytics && (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} className="text-blue-500" />
            <h4 className="text-lg font-bold">{isArabic ? 'تحليلات العملاء' : 'Customer Insights'}</h4>
          </div>
          <p className="text-slate-500 text-xs font-semibold mb-6">{isArabic ? 'نظرة شاملة على سلوك العملاء' : 'Comprehensive customer behavior overview'}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <Users className="w-5 h-5 text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{customerAnalytics.totalCustomers || 0}</div>
              <div className="text-xs font-bold text-slate-400">{isArabic ? 'إجمالي العملاء' : 'Total Customers'}</div>
              {customerAnalytics.newCustomersThisMonth > 0 && (
                <div className="text-[10px] font-bold text-green-500 mt-1">+{customerAnalytics.newCustomersThisMonth} {isArabic ? 'جديد هذا الشهر' : 'new this month'}</div>
              )}
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <Repeat className="w-5 h-5 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{customerAnalytics.retentionRate || 0}%</div>
              <div className="text-xs font-semibold text-slate-500">{isArabic ? 'نسبة العائدين' : 'Retention Rate'}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">{customerAnalytics.returningCustomers || 0} {isArabic ? 'عميل عائد' : 'returning'}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{customerAnalytics.avgVisitsPerCustomer || 0}</div>
              <div className="text-xs font-semibold text-slate-500">{isArabic ? 'متوسط الزيارات' : 'Avg Visits'}</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{customerAnalytics.atRiskCustomers?.length || 0}</div>
              <div className="text-xs font-semibold text-slate-500">{isArabic ? 'معرضون للتوقف' : 'At Risk'}</div>
              <div className="text-xs font-semibold text-red-400 mt-1">{customerAnalytics.churnedCustomers?.length || 0} {isArabic ? 'توقفوا' : 'churned'}</div>
            </div>
          </div>

          {customerAnalytics.topCustomers && customerAnalytics.topCustomers.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-3">{isArabic ? 'أفضل 5 عملاء' : 'Top 5 Customers'}</p>
              <div className="space-y-2">
                {customerAnalytics.topCustomers.slice(0, 5).map((c: any, i: number) => (
                  <div key={c.id || i} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Crown size={14} className={i === 0 ? 'text-amber-500' : 'text-slate-400'} />
                      <span className="text-sm font-semibold text-slate-700">{c.name || 'عميل'}</span>
                      <span className="text-xs text-slate-500 font-semibold">({c.orders || 0} {isArabic ? 'طلبات' : 'orders'})</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{t('business.reports.currency')} {Number(c.totalSpent || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cashier reports button - dynamic with POS */}
      {posEnabled && onOpenCashierReports && (
        <div className="bg-gradient-to-l from-cyan-50 to-indigo-50 p-4 sm:p-6 md:p-8 rounded-xl border border-cyan-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <ShoppingCart size={24} className="text-cyan-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">{t('business.reports.cashierReports')}</h4>
                <p className="text-slate-500 text-xs font-semibold">{t('business.reports.cashierReportsDesc')}</p>
              </div>
            </div>
            <button
              onClick={onOpenCashierReports}
              className="px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all shadow-md whitespace-nowrap"
            >
              {t('business.reports.openCashierReports')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
