import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { ApiService } from '@/services/api';

export default function CustomersScreen() {
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
      const res = await ApiService.getCustomers(String(shop.id));
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

  const renderItem = ({ item }: { item: any }) => (
    <View style={s.card}>
      <View style={s.row}>
        <Ionicons name="person-circle-outline" size={32} color="#94A3B8" />
        <View style={s.mid}>
          <Text style={s.title} numberOfLines={1}>{String(item?.name || item?.customerName || t('more.customers'))}</Text>
          <Text style={s.sub} numberOfLines={1}>{String(item?.phone || item?.email || '')}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={s.center}>
        <Stack.Screen options={{ title: t('more.customers') }} />
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: t('more.customers') }} />
      <FlatList
        data={data}
        keyExtractor={(item) => String(item?.id || Math.random())}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00E5FF" />}
        contentContainerStyle={data.length === 0 ? s.emptyList : { padding: 16 }}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Ionicons name="people-outline" size={52} color="#CBD5E1" />
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mid: { flex: 1 },
  title: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  sub: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#64748B' },

  emptyList: { flexGrow: 1, padding: 16 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: 14, fontWeight: '800', color: '#64748B' },
});
