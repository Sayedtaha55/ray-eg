import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

type FilterType = 'pending' | 'completed' | 'expired' | 'all';

const normalizeStatus = (status: any): 'pending' | 'completed' | 'expired' => {
  const s = String(status || '').trim().toUpperCase();
  if (s === 'COMPLETED') return 'completed';
  if (s === 'CANCELLED' || s === 'CANCELED' || s === 'EXPIRED') return 'expired';
  return 'pending';
};

export default function ReservationsScreen() {
  const { shop } = useAuth();
  const { t } = useAppPreferences();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>('pending');

  const load = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const res = await ApiService.getReservations(String(shop.id));
      setReservations(Array.isArray(res) ? res : []);
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { load(); }, [load]);

  const handleUpdateStatus = useCallback(async (id: string, status: string) => {
    try {
      await ApiService.updateReservationStatus(id, status);
      setReservations((prev) => prev.map((r) => (String(r?.id) === id ? { ...r, status } : r)));
    } catch {
      Alert.alert(t('common.error'), t('common.retry'));
    }
  }, []);

  const pendingCount = useMemo(() => reservations.filter((r) => normalizeStatus(r.status) === 'pending').length, [reservations]);
  const completedCount = useMemo(() => reservations.filter((r) => normalizeStatus(r.status) === 'completed').length, [reservations]);
  const expiredCount = useMemo(() => reservations.filter((r) => normalizeStatus(r.status) === 'expired').length, [reservations]);

  const filtered = useMemo(() => {
    if (filter === 'all') return reservations;
    return reservations.filter((r) => normalizeStatus(r.status) === filter);
  }, [reservations, filter]);

  const emptyText = useMemo(() => {
    if (filter === 'pending') return t('reservations.noNewReservations');
    if (filter === 'completed') return t('reservations.noCompletedReservations');
    if (filter === 'expired') return t('reservations.noRejectedReservations');
    return t('reservations.noReservations');
  }, [filter]);

  const FILTER_OPTIONS: Array<{ key: FilterType; labelKey: string; count: number; activeColor: string }> = [
    { key: 'pending', labelKey: 'reservations.newReservations', count: pendingCount, activeColor: '#F59E0B' },
    { key: 'completed', labelKey: 'reservations.completedReservations', count: completedCount, activeColor: '#22C55E' },
    { key: 'expired', labelKey: 'reservations.rejectedReservations', count: expiredCount, activeColor: '#EF4444' },
    { key: 'all', labelKey: 'reservations.all', count: reservations.length, activeColor: '#0F172A' },
  ];

  const renderItem = ({ item }: { item: any }) => {
    const normalized = normalizeStatus(item.status);
    const imgSrc = String(item?.itemImage || item?.item_image || '').trim();
    const price = Number(item?.itemPrice || item?.item_price || 0);
    const timeStr = (() => {
      try {
        const d = new Date(item?.createdAt || item?.created_at || '');
        if (isNaN(d.getTime())) return '';
        return d.toLocaleString();
      } catch { return ''; }
    })();

    return (
      <View style={s.resCard}>
        <View style={s.resTop}>
          {/* Image */}
          <View style={s.resImgWrap}>
            {imgSrc ? (
              <View style={s.resImgPlaceholder}>
                <Ionicons name="image-outline" size={20} color="#94A3B8" />
              </View>
            ) : (
              <View style={s.resImgPlaceholder}>
                <Ionicons name="calendar-outline" size={20} color="#CBD5E1" />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={s.resInfo}>
            <Text style={s.resItemName} numberOfLines={1}>{String(item?.itemName || item?.item_name || '')}</Text>
            <View style={s.resMetaRow}>
              <Ionicons name="person-outline" size={12} color="#64748B" />
              <Text style={s.resMetaText}>{String(item?.customerName || '')}</Text>
            </View>
            {item?.customerPhone ? (
              <View style={s.resMetaRow}>
                <Ionicons name="call-outline" size={12} color="#94A3B8" />
                <Text style={s.resMetaSub}>{String(item.customerPhone)}</Text>
              </View>
            ) : null}
            {timeStr ? (
              <View style={s.resMetaRow}>
                <Ionicons name="time-outline" size={11} color="#00E5FF" />
                <Text style={s.resTimeText}>{timeStr}</Text>
              </View>
            ) : null}
          </View>

          {/* Amount */}
          <View style={s.resAmountCol}>
            <Text style={s.resAmountLabel}>{t('reservations.amountDue')}</Text>
            <Text style={s.resAmountValue}>{t('reservations.currency')} {price.toLocaleString()}</Text>
          </View>
        </View>

        {/* Actions or Status */}
        {normalized === 'pending' ? (
          <View style={s.resActions}>
            <TouchableOpacity style={s.receivedBtn} onPress={() => handleUpdateStatus(String(item.id), 'completed')}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
              <Text style={s.receivedBtnText}>{t('reservations.received')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={() => handleUpdateStatus(String(item.id), 'expired')}>
              <Text style={s.cancelBtnText}>{t('reservations.cancelReservation')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.resStatusRow}>
            {normalized === 'completed' ? (
              <View style={s.statusBadgeGreen}>
                <Text style={s.statusBadgeGreenText}>{t('reservations.received')}</Text>
              </View>
            ) : (
              <View style={s.statusBadgeRed}>
                <Text style={s.statusBadgeRedText}>{t('reservations.cancelled')}</Text>
              </View>
            )}
          </View>
        )}
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

      {/* Header — same as web */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>{t('reservations.title')}</Text>
          <Text style={s.headerSub}>{t('reservations.autoAddNote')}</Text>
        </View>
        <View style={s.headerBadges}>
          <View style={s.badgePending}>
            <Text style={s.badgePendingText}>{pendingCount} {t('reservations.pending')}</Text>
          </View>
          <View style={s.badgeCompleted}>
            <Text style={s.badgeCompletedText}>{completedCount} {t('reservations.completed')}</Text>
          </View>
          <View style={s.badgeExpired}>
            <Text style={s.badgeExpiredText}>{expiredCount} {t('reservations.rejected')}</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs — same as web */}
      <View style={s.filterRow}>
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setFilter(opt.key)}
            style={[s.filterTab, filter === opt.key && { backgroundColor: opt.activeColor }]}
          >
            <Text style={[s.filterTabText, filter === opt.key && s.filterTabTextActive]}>
              {t(opt.labelKey)} ({opt.count})
            </Text>
          </TouchableOpacity>
        ))}
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
              <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
              <Text style={s.emptyText}>{emptyText}</Text>
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
    gap: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  headerSub: { fontSize: 12, fontWeight: '900', color: '#94A3B8', marginTop: 4 },
  headerBadges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  badgePending: { backgroundColor: '#FFFBEB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgePendingText: { fontSize: 11, fontWeight: '900', color: '#F59E0B', textTransform: 'uppercase' },
  badgeCompleted: { backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeCompletedText: { fontSize: 11, fontWeight: '900', color: '#22C55E', textTransform: 'uppercase' },
  badgeExpired: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeExpiredText: { fontSize: 11, fontWeight: '900', color: '#EF4444', textTransform: 'uppercase' },

  // Filter Tabs
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  filterTabText: { fontSize: 11, fontWeight: '900', color: '#94A3B8' },
  filterTabTextActive: { color: '#fff' },

  // Reservation Card
  resCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    gap: 12,
  },
  resTop: { flexDirection: 'row', gap: 12 },
  resImgWrap: { width: 64, height: 64, borderRadius: 20, overflow: 'hidden' },
  resImgPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resInfo: { flex: 1, gap: 3 },
  resItemName: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  resMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resMetaText: { fontSize: 12, fontWeight: '900', color: '#64748B' },
  resMetaSub: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  resTimeText: { fontSize: 10, fontWeight: '900', color: '#00E5FF', textTransform: 'uppercase' },

  resAmountCol: { alignItems: 'flex-end', justifyContent: 'center' },
  resAmountLabel: { fontSize: 9, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  resAmountValue: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 2 },

  // Actions
  resActions: { flexDirection: 'row', gap: 8 },
  receivedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: '#22C55E',
    borderRadius: 16,
  },
  receivedBtnText: { fontSize: 12, fontWeight: '900', color: '#fff' },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 12, fontWeight: '900', color: '#EF4444' },

  // Status badges
  resStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadgeGreen: { backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusBadgeGreenText: { fontSize: 11, fontWeight: '900', color: '#22C55E' },
  statusBadgeRed: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusBadgeRedText: { fontSize: 11, fontWeight: '900', color: '#EF4444' },

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
  emptyText: { fontSize: 16, fontWeight: '900', color: '#CBD5E1' },
});
