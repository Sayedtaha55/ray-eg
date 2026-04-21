import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { ApiService } from '@/services/api';
import { useRouter } from 'expo-router';

type Analytics = {
  salesCountToday?: number;
  revenueToday?: number;
  totalOrders?: number;
  totalRevenue?: number;
  chartData?: Array<{ name: string; sales: number }>;
};

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: color === '#00E5FF' ? '#ECFEFF' : '#F8FAFC' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function ActivityItem({ n }: { n: any }) {
  const isSale = String(n.type || '').toUpperCase().includes('ORDER') || String(n.type || '').toUpperCase() === 'SALE';
  const isReservation = String(n.type || '').toUpperCase().includes('RESERVATION');
  const iconName = isSale ? 'bag-check-outline' : isReservation ? 'calendar-outline' : 'people-outline';
  const iconBg = isSale ? '#ECFDF5' : isReservation ? '#FFFBEB' : '#ECFEFF';
  const iconColor = isSale ? '#22C55E' : isReservation ? '#F59E0B' : '#00E5FF';

  const timeStr = (() => {
    try {
      const d = new Date(n.created_at || n.createdAt || '');
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  })();

  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName as any} size={18} color={iconColor} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle} numberOfLines={1}>{n.title || '—'}</Text>
        <View style={styles.activityTimeRow}>
          <Ionicons name="time-outline" size={11} color="#94A3B8" />
          <Text style={styles.activityTime}>{timeStr}</Text>
        </View>
      </View>
      <Ionicons name="chevron-back-outline" size={14} color="#E2E8F0" />
    </View>
  );
}

export default function OverviewScreen() {
  const { shop } = useAuth();
  const router = useRouter();
  const { t } = useAppPreferences();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const showSalesAnalytics = useMemo(() => {
    const layoutConfig = (shop?.layoutConfig && typeof shop.layoutConfig === 'object') ? shop.layoutConfig : undefined;
    const enabledRaw = layoutConfig?.enabledModules;
    if (!Array.isArray(enabledRaw)) return false;
    const enabled = new Set(
      (enabledRaw || []).map((x: any) => String(x?.id ?? x?.moduleId ?? x?.module_id ?? x?.key ?? x ?? '').trim().toLowerCase()).filter(Boolean)
    );
    return enabled.has('sales');
  }, [shop]);

  const loadData = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const now = new Date();
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      const [analyticsData, notifData] = await Promise.all([
        ApiService.getShopAnalytics(shop.id, {
          from: from.toISOString(),
          to: now.toISOString(),
        }),
        ApiService.getNotifications(shop.id),
      ]);
      setAnalytics(analyticsData);
      setNotifications((notifData || []).slice(0, 5));
    } catch (err) {
      console.error('Overview load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  const safeAnalytics = analytics || {};
  const salesCountToday = safeAnalytics.salesCountToday ?? 0;
  const revenueToday = safeAnalytics.revenueToday ?? 0;
  const totalOrders = safeAnalytics.totalOrders ?? 0;
  const totalRevenue = safeAnalytics.totalRevenue ?? 0;
  const chartData = Array.isArray(safeAnalytics.chartData) ? safeAnalytics.chartData : [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00E5FF" />}
      contentContainerStyle={styles.content}
    >
      {/* Stat Cards Row 1 — same as web */}
      <View style={styles.statsGrid}>
        <StatCard label={t('overview.followers')} value={shop?.followers?.toLocaleString() || '0'} icon="people-outline" color="#00E5FF" />
        <StatCard label={t('overview.visits')} value={shop?.visitors?.toLocaleString() || '0'} icon="eye-outline" color="#00E5FF" />
        {showSalesAnalytics ? (
          <>
            <StatCard label={t('overview.todaySales')} value={`${salesCountToday}`} icon="bag-check-outline" color="#64748B" />
            <StatCard label={t('overview.todayRevenue')} value={`E£ ${revenueToday}`} icon="cash-outline" color="#00E5FF" />
          </>
        ) : null}
      </View>

      {showSalesAnalytics ? (
        <>
          {/* Orders & Revenue Card — same as web */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('overview.orders')} & {t('overview.revenue')}</Text>
            <View style={styles.revenueGrid}>
              <View style={styles.revenueBox}>
                <Text style={styles.revenueLabel}>{t('overview.orders')}</Text>
                <Text style={styles.revenueValue}>{Number(totalOrders || 0).toLocaleString()}</Text>
              </View>
              <View style={styles.revenueBox}>
                <Text style={styles.revenueLabel}>{t('overview.revenue')}</Text>
                <Text style={styles.revenueValue}>E£ {Number(totalRevenue || 0).toLocaleString()}</Text>
              </View>
            </View>

            {/* Daily Sales Table — same as web */}
            {chartData.length > 0 && (
              <View style={styles.tableSection}>
                <Text style={styles.tableTitle}>{t('overview.dailySales')}</Text>
                <View style={styles.tableWrap}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, { flex: 1 }]}>{t('overview.day')}</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Revenue</Text>
                  </View>
                  {chartData.map((row: any, idx: number) => (
                    <View key={`${row?.name || ''}:${idx}`} style={[styles.tableRow, idx === chartData.length - 1 && { borderBottomWidth: 0 }]}>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{String(row?.name || '')}</Text>
                      <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>E£ {Number(row?.sales || 0).toLocaleString()}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Sales Radar Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{t('overview.salesRadar')}</Text>
              <View style={styles.growthBadge}>
                <Ionicons name="trending-up" size={14} color="#22C55E" />
                <Text style={styles.growthText}>Steady Growth</Text>
              </View>
            </View>
            {/* Chart placeholder — native charts need a library like victory-native */}
            <View style={styles.chartPlaceholder}>
              {chartData.length > 0 ? (
                <View style={styles.barChart}>
                  {chartData.slice(0, 7).map((row: any, idx: number) => {
                    const maxSales = Math.max(...chartData.slice(0, 7).map((r: any) => r.sales || 0), 1);
                    const height = Math.max(8, ((row.sales || 0) / maxSales) * 120);
                    return (
                      <View key={idx} style={styles.barCol}>
                        <View style={[styles.bar, { height }]} />
                        <Text style={styles.barLabel} numberOfLines={1}>{String(row.name || '').slice(0, 3)}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.chartEmpty}>No chart data</Text>
              )}
            </View>
          </View>
        </>
      ) : null}

      {/* Latest Alerts Card — same as web */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('overview.latestAlerts')}</Text>
          <View style={styles.alertIconWrap}>
            <Ionicons name="notifications-outline" size={18} color="#00E5FF" />
          </View>
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyAlerts}>
            <Ionicons name="notifications-off-outline" size={40} color="#E2E8F0" />
            <Text style={styles.emptyAlertsText}>{t('overview.noAlerts')}</Text>
          </View>
        ) : (
          <View style={styles.alertsList}>
            {notifications.map((n: any) => (
              <ActivityItem key={n.id} n={n} />
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => router.push('/(tabs)/notifications')}
        >
          <Text style={styles.viewAllBtnText}>{t('overview.viewAll')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },

  // Stat Cards
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 6,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },

  // Revenue Grid
  revenueGrid: { flexDirection: 'row', gap: 10 },
  revenueBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  revenueLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'right' },
  revenueValue: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'right', marginTop: 6 },

  // Table
  tableSection: { marginTop: 20 },
  tableTitle: { fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 },
  tableWrap: { borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 10 },
  tableHeaderCell: { fontSize: 11, fontWeight: '900', color: '#64748B' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tableCell: { fontSize: 13, fontWeight: '900', color: '#0F172A' },

  // Chart
  chartPlaceholder: { minHeight: 160, alignItems: 'center', justifyContent: 'flex-end' },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 140, paddingHorizontal: 4 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  bar: { width: '80%', backgroundColor: '#00E5FF', borderRadius: 8, minHeight: 8 },
  barLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8' },
  chartEmpty: { fontSize: 13, fontWeight: '700', color: '#CBD5E1', paddingVertical: 40 },

  // Growth Badge
  growthBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  growthText: { fontSize: 11, fontWeight: '900', color: '#22C55E' },

  // Alerts
  alertIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ECFEFF', alignItems: 'center', justifyContent: 'center' },
  emptyAlerts: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyAlertsText: { fontSize: 14, fontWeight: '800', color: '#E2E8F0' },
  alertsList: { gap: 16 },

  // Activity Item
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '900', color: '#1E293B', lineHeight: 18 },
  activityTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  activityTime: { fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase' },

  // View All
  viewAllBtn: {
    marginTop: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  viewAllBtnText: { fontSize: 12, fontWeight: '900', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
});
