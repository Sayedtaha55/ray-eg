import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import httpClient from '@/services/httpClient';

type NotificationType = 'ALL' | 'NEW_FOLLOWER' | 'NEW_ORDER' | 'NEW_MESSAGE' | 'PAYMENT_RECEIVED' | 'ORDER_STATUS_CHANGED' | 'SHOP_VISIT' | 'LOW_STOCK' | 'OFFER_EXPIRING' | 'REVIEW_RECEIVED' | string;

interface Notification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  NEW_FOLLOWER: { icon: 'person-outline', color: '#3B82F6', bg: '#EFF6FF' },
  NEW_ORDER: { icon: 'bag-check-outline', color: '#22C55E', bg: '#ECFDF5' },
  ORDER_STATUS_CHANGED: { icon: 'cube-outline', color: '#F97316', bg: '#FFF7ED' },
  NEW_MESSAGE: { icon: 'chatbubble-outline', color: '#A855F7', bg: '#FAF5FF' },
  SHOP_VISIT: { icon: 'trending-up-outline', color: '#00E5FF', bg: '#ECFEFF' },
  LOW_STOCK: { icon: 'alert-circle-outline', color: '#EF4444', bg: '#FEF2F2' },
  PAYMENT_RECEIVED: { icon: 'cash-outline', color: '#10B981', bg: '#ECFDF5' },
  REVIEW_RECEIVED: { icon: 'star-outline', color: '#F59E0B', bg: '#FFFBEB' },
  OFFER_EXPIRING: { icon: 'megaphone-outline', color: '#F97316', bg: '#FFF7ED' },
};

function getTypeMeta(type: string, priority: string) {
  if (String(priority || '').toUpperCase() === 'URGENT') return { icon: 'alert-circle-outline', color: '#EF4444', bg: '#FEF2F2' };
  if (String(priority || '').toUpperCase() === 'HIGH') return { icon: 'alert-outline', color: '#F97316', bg: '#FFF7ED' };
  return TYPE_ICONS[type] || { icon: 'notifications-outline', color: '#64748B', bg: '#F8FAFC' };
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const FILTER_OPTIONS: Array<{ value: NotificationType; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'NEW_FOLLOWER', label: 'Followers' },
  { value: 'NEW_ORDER', label: 'Orders' },
  { value: 'NEW_MESSAGE', label: 'Messages' },
  { value: 'PAYMENT_RECEIVED', label: 'Payments' },
];

export default function NotificationsScreen() {
  const { shop } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<NotificationType>('ALL');

  const loadNotifications = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await ApiService.getNotifications(shop.id);
      const normalized = (data || []).map((n: any) => ({
        id: String(n.id),
        title: String(n.title || ''),
        content: String(n.message || n.content || ''),
        type: String(n.type || '') as NotificationType,
        priority: String(n.priority || 'MEDIUM'),
        isRead: Boolean(n.is_read ?? n.isRead),
        createdAt: String(n.created_at || n.createdAt || new Date().toISOString()),
      }));
      setNotifications(normalized);
    } catch (err) {
      console.error('Notifications load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const markAsRead = async (notifId: string) => {
    try {
      await httpClient.patch(`/shops/${shop?.id}/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    if (!shop?.id) return;
    try {
      await ApiService.markNotificationsRead(shop.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = notifications.filter(n => filter === 'ALL' || n.type === filter);

  const getFilterCount = (type: NotificationType) => {
    if (type === 'ALL') return notifications.length;
    return notifications.filter(n => n.type === type).length;
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const meta = getTypeMeta(item.type, item.priority);
    return (
      <View style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}>
        <View style={[styles.notifIconWrap, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]} numberOfLines={1}>
            {item.title || 'Notification'}
          </Text>
          <Text style={styles.notifBody} numberOfLines={2}>{item.content}</Text>
          <View style={styles.notifTimeRow}>
            <Ionicons name="time-outline" size={11} color="#94A3B8" />
            <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
        {!item.isRead && (
          <TouchableOpacity onPress={() => markAsRead(item.id)} style={styles.markReadBtn}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#00E5FF" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#00E5FF" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Header — same as web */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="notifications-outline" size={22} color="#00E5FF" />
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} unread</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills — same as web */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {FILTER_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setFilter(opt.value)}
            style={[styles.filterPill, filter === opt.value && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, filter === opt.value && styles.filterPillTextActive]}>
              {opt.label}
            </Text>
            {getFilterCount(opt.value) > 0 && (
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>{getFilterCount(opt.value)}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotifications(); }} tintColor="#00E5FF" />}
        contentContainerStyle={filteredNotifications.length === 0 ? styles.emptyList : { padding: 16, gap: 10 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>
              {filter === 'ALL' ? 'No notifications' : `No ${FILTER_OPTIONS.find(f => f.value === filter)?.label?.toLowerCase() || ''} notifications`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  emptyList: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  unreadBadge: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  unreadBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  markAllText: { fontSize: 13, fontWeight: '700', color: '#00E5FF' },

  // Filters
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterPillActive: { backgroundColor: '#00E5FF' },
  filterPillText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  filterPillTextActive: { color: '#fff' },
  filterCountBadge: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  filterCountText: { fontSize: 10, fontWeight: '800' },

  // Notification Card
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  notifCardUnread: { borderColor: '#A5F3FC', backgroundColor: '#ECFEFF' },
  notifIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  notifTitleUnread: { fontWeight: '900', color: '#0F172A' },
  notifBody: { fontSize: 13, color: '#475569', marginTop: 3, lineHeight: 18 },
  notifTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  notifTime: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  markReadBtn: { padding: 4 },

  // Empty
  emptyBox: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, paddingTop: 80 },
  emptyText: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
});
