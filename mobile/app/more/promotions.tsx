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

export default function PromotionsScreen() {
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
      const offers = await ApiService.getOffers();
      const filtered = (offers || []).filter((o: any) => String(o?.shopId || o?.shop_id) === String(shop.id));
      setData(Array.isArray(filtered) ? filtered : []);
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

  const del = useCallback((id: string) => {
    Alert.alert(t('common.delete'), t('common.confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.deleteOffer(id);
            setData((prev) => prev.filter((x) => String(x?.id) !== id));
          } catch {
            Alert.alert(t('common.error'), t('settings.saveFailed'));
          }
        },
      },
    ]);
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.cardTitle} numberOfLines={1}>{String(item?.title || item?.name || t('more.promotions'))}</Text>
        <TouchableOpacity onPress={() => del(String(item?.id))}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <Text style={s.cardSub}>{String(item?.description || '')}</Text>
      {item?.discount ? (
        <Text style={s.cardDetail}>{Number(item.discount)}% {t('promotions.off') || 'OFF'}</Text>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <View style={s.center}>
        <Stack.Screen options={{ title: t('more.promotions') }} />
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: t('more.promotions') }} />
      <FlatList
        data={data}
        keyExtractor={(item) => String(item?.id || Math.random())}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00E5FF" />}
        contentContainerStyle={data.length === 0 ? s.emptyList : { padding: 16 }}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Ionicons name="megaphone-outline" size={52} color="#CBD5E1" />
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
  cardDetail: { marginTop: 10, fontSize: 12, fontWeight: '900', color: '#A855F7' },

  emptyList: { flexGrow: 1, padding: 16 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { fontSize: 14, fontWeight: '800', color: '#64748B' },
});
