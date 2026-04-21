import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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

export default function ReservationsScreen() {
  const { shop } = useAuth();
  const { t } = useAppPreferences();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const res = await ApiService.getReservations(String(shop.id));
      setData(Array.isArray(res) ? res : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = useCallback(async (id: string, status: string) => {
    try {
      await ApiService.updateReservationStatus(id, status);
      setData((prev) => prev.map((r) => (String(r?.id) === id ? { ...r, status } : r)));
    } catch {
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    }
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const status = String(item?.status || '').toLowerCase();
    const badgeColor = status === 'completed' ? '#22C55E' : status === 'cancelled' ? '#EF4444' : '#F59E0B';

    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>{String(item?.customerName || item?.name || t('more.customers'))}</Text>
          <View style={[s.badge, { backgroundColor: badgeColor + '18' }]}>
            <Text style={[s.badgeText, { color: badgeColor }]}>{String(item?.status || '')}</Text>
          </View>
        </View>

        <Text style={s.cardSub}>{String(item?.itemName || item?.item_name || '')}</Text>

        {status !== 'completed' && status !== 'cancelled' ? (
          <View style={s.actions}>
            <TouchableOpacity style={s.actionBtn} onPress={() => setStatus(String(item?.id), 'completed')}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#22C55E" />
              <Text style={s.actionTextGreen}>{t('reservations.complete') || 'Complete'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => setStatus(String(item?.id), 'cancelled')}>
              <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
              <Text style={s.actionTextRed}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={s.center}>
        <Stack.Screen options={{ title: t('more.reservations') }} />
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: t('more.reservations') }} />
      <FlatList
        data={data}
        keyExtractor={(item) => String(item?.id || Math.random())}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00E5FF" />}
        contentContainerStyle={data.length === 0 ? s.emptyList : { padding: 16 }}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Ionicons name="calendar-outline" size={52} color="#CBD5E1" />
            <Text style={s.emptyText}>{t('common.noData')}</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },

  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: '900', color: '#0F172A', flex: 1 },
  cardSub: { marginTop: 6, fontSize: 12, fontWeight: '700', color: '#64748B' },

  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '900' },

  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', flex: 1, justifyContent: 'center' },
  actionTextGreen: { fontSize: 12, fontWeight: '900', color: '#22C55E' },
  actionTextRed: { fontSize: 12, fontWeight: '900', color: '#EF4444' },

  emptyList: { flexGrow: 1, padding: 16 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: 14, fontWeight: '800', color: '#64748B' },
});
