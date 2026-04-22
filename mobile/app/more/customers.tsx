import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const res = await ApiService.getCustomers(String(shop.id));
      setCustomers(Array.isArray(res) ? res : []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.trim().toLowerCase();
    return customers.filter((c) =>
      String(c?.name || '').toLowerCase().includes(term) ||
      String(c?.email || '').toLowerCase().includes(term) ||
      String(c?.phone || '').toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  const renderItem = ({ item }: { item: any }) => {
    const isActive = String(item?.status || 'active').toLowerCase() === 'active';
    const totalSpent = Number(item?.totalSpent || item?.total_spent || 0);
    const orders = Number(item?.orders || 0);
    const lastDate = item?.lastPurchaseDate || item?.last_purchase_date;
    const initial = String(item?.name || 'U').charAt(0).toUpperCase();

    return (
      <View style={s.custCard}>
        <View style={s.custTop}>
          {/* Avatar */}
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>

          {/* Info */}
          <View style={s.custInfo}>
            <Text style={s.custName} numberOfLines={1}>{String(item?.name || t('customers.unnamed'))}</Text>
            <Text style={s.custEmail} numberOfLines={1}>{String(item?.email || t('customers.noEmail'))}</Text>
            {item?.convertedFromReservation ? (
              <View style={s.convertedBadge}>
                <Text style={s.convertedBadgeText}>{t('customers.convertedFromReservation')}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Stats Row */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statLabel}>{t('customers.phone')}</Text>
            <Text style={s.statValue}>{String(item?.phone || '---')}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>{t('customers.totalPurchases')}</Text>
            <Text style={s.statValue}>{t('customers.currency')} {totalSpent.toLocaleString()}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>{t('customers.orderCount')}</Text>
            <Text style={s.statValue}>{orders} {t('customers.orders')}</Text>
          </View>
        </View>

        {/* Last Transaction */}
        {lastDate ? (
          <View style={s.lastRow}>
            <Text style={s.lastLabel}>{t('customers.lastTransaction')}</Text>
            <Text style={s.lastValue}>{new Date(lastDate).toLocaleDateString()}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.promoBtn}>
            <Ionicons name="megaphone-outline" size={14} color="#BD00FF" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.statusBtn, isActive ? s.statusBtnActive : s.statusBtnInactive]}>
            <Ionicons name={isActive ? 'person-remove-outline' : 'person-add-outline'} size={14} color={isActive ? '#EF4444' : '#22C55E'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

      {/* Header — same as web */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{t('customers.database')}</Text>
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={s.searchIcon} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder={t('customers.searchPlaceholder')}
            placeholderTextColor="#94A3B8"
            style={s.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item?.id || Math.random())}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00E5FF" />}
        contentContainerStyle={filtered.length === 0 ? s.emptyList : { padding: 16, gap: 14 }}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <View style={s.emptyDashed}>
              <Ionicons name="people-outline" size={48} color="#CBD5E1" />
              <Text style={s.emptyText}>{searchTerm ? t('customers.noSearchResults') : t('customers.noData')}</Text>
            </View>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' },

  // Header
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Customer Card
  custCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    gap: 12,
  },
  custTop: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#94A3B8' },
  custInfo: { flex: 1, gap: 2 },
  custName: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  custEmail: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  convertedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  convertedBadgeText: { fontSize: 9, fontWeight: '900', color: '#22C55E' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statLabel: { fontSize: 9, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { fontSize: 13, fontWeight: '900', color: '#0F172A', marginTop: 3 },

  // Last Transaction
  lastRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  lastValue: { fontSize: 11, fontWeight: '900', color: '#64748B' },

  // Actions
  actionRow: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  promoBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnActive: { backgroundColor: '#FEF2F2' },
  statusBtnInactive: { backgroundColor: '#ECFDF5' },

  // Empty
  emptyList: { flexGrow: 1, padding: 16 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyDashed: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    borderRadius: 32,
    gap: 8,
  },
  emptyText: { fontSize: 14, fontWeight: '800', color: '#CBD5E1' },
});
