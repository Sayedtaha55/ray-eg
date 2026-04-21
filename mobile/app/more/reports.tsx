import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { ApiService } from '@/services/api';

export default function ReportsScreen() {
  const { shop } = useAuth();
  const { t } = useAppPreferences();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<{ orders: any[]; analytics: any; reservations: any[] } | null>(null);

  const range = useMemo(() => {
    const now = new Date();
    const from = new Date(now);
    from.setFullYear(from.getFullYear() - 2);
    return { from: from.toISOString(), to: now.toISOString() };
  }, []);

  const load = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const [orders, analytics, reservations] = await Promise.all([
        ApiService.getAllOrders({ shopId: String(shop.id), from: range.from, to: range.to }),
        ApiService.getShopAnalytics(String(shop.id), { from: range.from, to: range.to }),
        ApiService.getReservations(String(shop.id)),
      ]);
      setData({
        orders: Array.isArray(orders) ? orders : [],
        analytics,
        reservations: Array.isArray(reservations) ? reservations : [],
      });
    } catch {
      setData({ orders: [], analytics: null, reservations: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id, range.from, range.to]);

  useEffect(() => {
    load();
  }, [load]);

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

      <View style={s.statsGrid}>
        <View style={s.statCard}>
          <Ionicons name="bag-check-outline" size={22} color="#00E5FF" />
          <Text style={s.statValue}>{data?.orders?.length ?? 0}</Text>
          <Text style={s.statLabel}>{t('reports.totalOrders') || 'Total Orders'}</Text>
        </View>

        <View style={s.statCard}>
          <Ionicons name="cash-outline" size={22} color="#22C55E" />
          <Text style={s.statValue}>E£{Number((data?.analytics as any)?.totalRevenue ?? 0).toLocaleString()}</Text>
          <Text style={s.statLabel}>{t('reports.revenue') || 'Revenue'}</Text>
        </View>

        <View style={s.statCard}>
          <Ionicons name="calendar-outline" size={22} color="#F59E0B" />
          <Text style={s.statValue}>{data?.reservations?.length ?? 0}</Text>
          <Text style={s.statLabel}>{t('more.reservations')}</Text>
        </View>
      </View>

      {(data?.orders?.length ?? 0) === 0 && Number((data?.analytics as any)?.totalRevenue ?? 0) === 0 ? (
        <View style={s.emptyBox}>
          <Ionicons name="bar-chart-outline" size={52} color="#CBD5E1" />
          <Text style={s.emptyText}>{t('common.noData')}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 24 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47.5%', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 14, gap: 8 },
  statValue: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  statLabel: { fontSize: 12, fontWeight: '800', color: '#64748B' },

  emptyBox: { marginTop: 16, alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 24 },
  emptyText: { fontSize: 14, fontWeight: '800', color: '#64748B' },
});
