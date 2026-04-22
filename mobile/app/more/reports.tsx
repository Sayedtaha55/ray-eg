import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { ApiService } from '@/services/api';

type RangeType = '30d' | '6m' | '12m';

const SUCCESSFUL_STATUSES = new Set(['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED']);

function isSuccessful(s: any) {
  return SUCCESSFUL_STATUSES.has(String(s?.status || '').toUpperCase());
}

function isReservationCompleted(r: any) {
  const st = String(r?.status || '').trim().toUpperCase();
  return st === 'COMPLETED' || st === 'COMPLETEDRESERVATION';
}

function pctChange(cur: number, prev: number) {
  if (!prev) return cur ? 100 : 0;
  return ((cur - prev) / prev) * 100;
}

export default function ReportsScreen() {
  const { shop } = useAuth();
  const { t } = useAppPreferences();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [range, setRange] = useState<RangeType>('6m');

  const load = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const now = new Date();
      const from = new Date(now);
      from.setFullYear(from.getFullYear() - 2);
      const [ordersData, analyticsData, reservationsData] = await Promise.all([
        ApiService.getAllOrders({ shopId: String(shop.id), from: from.toISOString(), to: now.toISOString() }),
        ApiService.getShopAnalytics(String(shop.id), { from: from.toISOString(), to: now.toISOString() }),
        ApiService.getReservations(String(shop.id)),
      ]);
      setSales(Array.isArray(ordersData) ? ordersData : []);
      setAnalytics(analyticsData);
      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
    } catch {
      setSales([]);
      setAnalytics(null);
      setReservations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const start = new Date(now);
  if (range === '30d') start.setDate(start.getDate() - 30);
  else if (range === '12m') start.setFullYear(start.getFullYear() - 1);
  else start.setMonth(start.getMonth() - 6);

  const salesInRange = useMemo(() =>
    sales.filter((s: any) => {
      const ts = new Date(s.created_at || s.createdAt || 0).getTime();
      return ts >= start.getTime() && ts <= now.getTime() && isSuccessful(s);
    }),
    [sales, start]
  );

  const reservationsInRange = useMemo(() =>
    reservations.filter((r: any) => {
      const ts = new Date(r.created_at || r.createdAt || 0).getTime();
      return ts >= start.getTime() && ts <= now.getTime() && isReservationCompleted(r);
    }),
    [reservations, start]
  );

  const totalRevenue = useMemo(() =>
    salesInRange.reduce((sum: number, s: any) => sum + Number(s.total || 0), 0) +
    reservationsInRange.reduce((sum: number, r: any) => sum + Number(r.itemPrice || r.item_price || 0), 0),
    [salesInRange, reservationsInRange]
  );

  const totalOrders = salesInRange.length + reservationsInRange.length;
  const avgBasket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const visitors = Number(analytics?.visitorsCount ?? analytics?.visitors ?? 0);
  const conversion = visitors > 0 ? (totalOrders / visitors) * 100 : 0;

  // Previous period for growth
  const prevEnd = new Date(start);
  const prevStart = new Date(start);
  if (range === '30d') prevStart.setDate(prevStart.getDate() - 30);
  else if (range === '12m') prevStart.setFullYear(prevStart.getFullYear() - 1);
  else prevStart.setMonth(prevStart.getMonth() - 6);

  const prevSales = sales.filter((s: any) => {
    const ts = new Date(s.created_at || s.createdAt || 0).getTime();
    return ts >= prevStart.getTime() && ts < prevEnd.getTime() && isSuccessful(s);
  });
  const prevReservations = reservations.filter((r: any) => {
    const ts = new Date(r.created_at || r.createdAt || 0).getTime();
    return ts >= prevStart.getTime() && ts < prevEnd.getTime() && isReservationCompleted(r);
  });
  const prevRevenue = prevSales.reduce((sum: number, s: any) => sum + Number(s.total || 0), 0) +
    prevReservations.reduce((sum: number, r: any) => sum + Number(r.itemPrice || r.item_price || 0), 0);
  const prevOrders = prevSales.length + prevReservations.length;
  const prevAvgBasket = prevOrders > 0 ? prevRevenue / prevOrders : 0;
  const prevConversion = visitors > 0 ? (prevOrders / visitors) * 100 : 0;

  const avgBasketGrowth = pctChange(avgBasket, prevAvgBasket);
  const conversionGrowth = pctChange(conversion, prevConversion);
  const revenueGrowth = pctChange(totalRevenue, prevRevenue);

  // Monthly buckets for bar chart
  const monthlyData = useMemo(() => {
    if (range === '30d') return [];
    const rangeMonths = range === '12m' ? 12 : 6;
    const buckets: Record<string, number> = {};
    const mStart = new Date(now);
    mStart.setDate(1);
    mStart.setHours(0, 0, 0, 0);
    mStart.setMonth(mStart.getMonth() - (rangeMonths - 1));

    for (let i = 0; i < rangeMonths; i++) {
      const d = new Date(mStart);
      d.setMonth(mStart.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = 0;
    }

    for (const s of salesInRange) {
      const dt = new Date(s.created_at || s.createdAt || 0);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (typeof buckets[key] === 'number') buckets[key] += Number(s.total || 0);
    }
    for (const r of reservationsInRange) {
      const dt = new Date(r.created_at || r.createdAt || 0);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (typeof buckets[key] === 'number') buckets[key] += Number(r.itemPrice || r.item_price || 0);
    }

    return Object.keys(buckets).sort().map((key) => {
      const m = Number(key.split('-')[1]);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return { name: monthNames[m - 1], revenue: Math.round(buckets[key] || 0) };
    });
  }, [range, salesInRange, reservationsInRange]);

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue), 1);

  const RANGE_OPTIONS: Array<{ key: RangeType; labelKey: string }> = [
    { key: '30d', labelKey: 'reports.30days' },
    { key: '6m', labelKey: 'reports.6months' },
    { key: '12m', labelKey: 'reports.12months' },
  ];

  const SummaryCard = ({ label, value, growth }: { label: string; value: string; growth: number }) => {
    const sign = growth > 0 ? '+' : '';
    const text = `${sign}${Math.round(growth)}%`;
    const isPositive = growth >= 0;
    return (
      <View style={s.summaryCard}>
        <Text style={s.summaryLabel}>{label}</Text>
        <View style={s.summaryRow}>
          <Text style={s.summaryValue}>{value}</Text>
          <View style={[s.growthBadge, { backgroundColor: isPositive ? '#ECFDF5' : '#FEF2F2' }]}>
            <Text style={[s.growthText, { color: isPositive ? '#22C55E' : '#EF4444' }]}>{text}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={s.center}>
        <Stack.Screen options={{ title: t('more.reports') }} />
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00E5FF" />}
    >
      <Stack.Screen options={{ title: t('more.reports') }} />

      {/* Revenue Chart Card — same as web */}
      <View style={s.chartCard}>
        <View style={s.chartHeader}>
          <Text style={s.chartTitle}>{t('reports.monthlyRevenuePerformance')}</Text>
          <View style={s.rangeRow}>
            {RANGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setRange(opt.key)}
                style={[s.rangeBtn, range === opt.key && s.rangeBtnActive]}
              >
                <Text style={[s.rangeBtnText, range === opt.key && s.rangeBtnTextActive]}>{t(opt.labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {range === '30d' ? (
          <View style={s.chartPlaceholder}>
            <Text style={s.chartPlaceholderText}>{t('reports.selectRangeForChart')}</Text>
          </View>
        ) : monthlyData.length > 0 ? (
          <View style={s.barChart}>
            {monthlyData.map((d, idx) => {
              const height = Math.max(8, (d.revenue / maxRevenue) * 140);
              return (
                <View key={idx} style={s.barCol}>
                  <View style={[s.bar, { height }]} />
                  <Text style={s.barLabel} numberOfLines={1}>{d.name}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={s.chartPlaceholder}>
            <Ionicons name="bar-chart-outline" size={40} color="#CBD5E1" />
            <Text style={s.chartPlaceholderText}>{t('reports.noReports')}</Text>
          </View>
        )}
      </View>

      {/* Summary Cards — same as web */}
      <View style={s.summaryGrid}>
        <SummaryCard
          label={t('reports.avgBasketValue')}
          value={`${t('reports.currency')} ${Math.round(avgBasket).toLocaleString()}`}
          growth={avgBasketGrowth}
        />
        <SummaryCard
          label={t('reports.conversionRate')}
          value={`${conversion.toFixed(1)}%`}
          growth={conversionGrowth}
        />
        <SummaryCard
          label={t('reports.periodRevenue')}
          value={`${t('reports.currency')} ${Math.round(totalRevenue).toLocaleString()}`}
          growth={revenueGrowth}
        />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingBottom: 40, gap: 16 },

  // Chart Card
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 20,
    gap: 16,
  },
  chartHeader: { gap: 12 },
  chartTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  rangeRow: { flexDirection: 'row', gap: 6 },
  rangeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  rangeBtnActive: { backgroundColor: '#0F172A' },
  rangeBtnText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  rangeBtnTextActive: { color: '#fff' },

  // Bar Chart
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 160, paddingHorizontal: 4 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  bar: { width: '80%', backgroundColor: '#00E5FF', borderRadius: 8, minHeight: 8 },
  barLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8' },

  chartPlaceholder: { minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 8 },
  chartPlaceholderText: { fontSize: 14, fontWeight: '800', color: '#CBD5E1' },

  // Summary Grid
  summaryGrid: { gap: 12 },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 20,
  },
  summaryLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  summaryValue: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  growthBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  growthText: { fontSize: 11, fontWeight: '900' },
});
