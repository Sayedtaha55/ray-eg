import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import httpClient from '@/services/httpClient';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB' },
  CONFIRMED: { label: 'Confirmed', color: '#3B82F6', bg: '#EFF6FF' },
  PREPARING: { label: 'Preparing', color: '#F97316', bg: '#FFF7ED' },
  READY: { label: 'Ready', color: '#8B5CF6', bg: '#F5F3FF' },
  HANDED_TO_COURIER: { label: 'Handed to Courier', color: '#6366F1', bg: '#EEF2FF' },
  DELIVERED: { label: 'Delivered', color: '#22C55E', bg: '#ECFDF5' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', bg: '#FEF2F2' },
  REFUNDED: { label: 'Refunded', color: '#A855F7', bg: '#FAF5FF' },
};

function getStatusMeta(status: string) {
  const key = String(status || '').toUpperCase();
  return STATUS_META[key] || { label: status || '—', color: '#94A3B8', bg: '#F8FAFC' };
}

function formatItemsSummary(sale: any) {
  const items = Array.isArray(sale?.items) ? sale.items : [];
  if (!items.length) return '—';
  const parts = items.slice(0, 3).map((it: any) => {
    const name = String(it?.product?.name || it?.name || it?.title || '').trim();
    const qty = Number(it?.quantity || it?.qty || 1);
    const qtyText = qty > 1 ? ` ×${qty}` : '';
    const price = Number(it?.price ?? it?.unitPrice ?? 0);
    const priceText = Number.isFinite(price) && price >= 0 ? ` E£${Math.round(price * qty * 100) / 100}` : '';
    return `${name}${qtyText}${priceText}`;
  }).filter(Boolean);
  const more = items.length > 3 ? ` +${items.length - 3}` : '';
  return `${parts.join(' + ')}${more}`;
}

type Channel = 'shop' | 'pos' | 'returns';

function OrderCard({
  sale,
  updatingId,
  onUpdateStatus,
  onOpenDetails,
}: {
  sale: any;
  updatingId: string;
  onUpdateStatus: (id: string, status: string) => void;
  onOpenDetails: (sale: any) => void;
}) {
  const id = String(sale?.id || '').trim();
  const meta = getStatusMeta(sale?.status);
  const status = String(sale?.status || '').toUpperCase();
  const busy = updatingId === id;
  const itemsSummary = formatItemsSummary(sale);
  const isRefunded = status === 'REFUNDED';

  const canAccept = status === 'PENDING';
  const canPreparing = status === 'CONFIRMED';
  const canReady = status === 'PREPARING';
  const canHandToCourier = status === 'READY';
  const canReject = ['PENDING', 'CONFIRMED', 'PREPARING'].includes(status);
  const isFinal = ['DELIVERED', 'CANCELLED'].includes(status);

  const deliveryFee = (() => {
    const fee = sale?.deliveryFee ?? sale?.delivery_fee ?? sale?.shops?.deliveryFee ?? 0;
    return Number.isFinite(Number(fee)) ? `E£${Number(fee)}` : '—';
  })();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.orderCard}>
      {/* Top: items + status */}
      <View style={styles.orderTop}>
        <View style={styles.orderItemsWrap}>
          <Text style={styles.orderItemsText} numberOfLines={2}>{itemsSummary}</Text>
          <Text style={styles.orderDate}>
            {new Date(sale.created_at || sale.createdAt).toLocaleString('ar-EG')}
          </Text>
        </View>
        <View style={styles.orderStatusWrap}>
          {isRefunded ? (
            <View style={[styles.statusBadge, { backgroundColor: '#FAF5FF' }]}>
              <Text style={[styles.statusText, { color: '#A855F7' }]}>Refunded</Text>
            </View>
          ) : null}
          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>
      </View>

      {/* Count + Total */}
      <View style={styles.orderStats}>
        <View style={styles.orderStatBox}>
          <Text style={styles.orderStatLabel}>Items</Text>
          <Text style={styles.orderStatValue}>{sale.items?.length || 0} item</Text>
        </View>
        <View style={styles.orderStatBox}>
          <Text style={styles.orderStatLabel}>Total</Text>
          <Text style={styles.orderStatValue}>E£ {Number(sale.total || 0).toLocaleString()}</Text>
        </View>
      </View>

      {/* Delivery Fee + Actions */}
      <View style={styles.orderActions}>
        <Text style={styles.deliveryFeeText}>Delivery: {deliveryFee}</Text>
        <View style={styles.actionBtns}>
          <TouchableOpacity style={styles.actionCircleBtn} onPress={() => onOpenDetails(sale)}>
            <Ionicons name="eye-outline" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {!isFinal ? (
            <View style={{ position: 'relative' }}>
              <TouchableOpacity
                style={styles.actionCircleBtn}
                onPress={() => setMenuOpen(prev => !prev)}
                disabled={busy}
              >
                {busy ? <ActivityIndicator size={12} color="#94A3B8" /> : <Ionicons name="ellipsis-vertical-outline" size={16} color="#94A3B8" />}
              </TouchableOpacity>

              {menuOpen ? (
                <View style={styles.actionMenu}>
                  {canAccept && <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); onUpdateStatus(id, 'CONFIRMED'); }}><Text style={[styles.menuItemText, { color: '#22C55E' }]}>Accept</Text></TouchableOpacity>}
                  {canPreparing && <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); onUpdateStatus(id, 'PREPARING'); }}><Text style={[styles.menuItemText, { color: '#F97316' }]}>Preparing</Text></TouchableOpacity>}
                  {canReady && <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); onUpdateStatus(id, 'READY'); }}><Text style={[styles.menuItemText, { color: '#3B82F6' }]}>Ready</Text></TouchableOpacity>}
                  {canHandToCourier && <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); onUpdateStatus(id, 'HANDED_TO_COURIER'); }}><Text style={[styles.menuItemText, { color: '#6366F1' }]}>Hand to Courier</Text></TouchableOpacity>}
                  {canReject && <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); onUpdateStatus(id, 'CANCELLED'); }}><Text style={[styles.menuItemText, { color: '#EF4444' }]}>Reject</Text></TouchableOpacity>}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function SalesScreen() {
  const { shop } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [channel, setChannel] = useState<Channel>('shop');
  const [updatingId, setUpdatingId] = useState('');

  const loadOrders = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const now = new Date();
      const from = new Date(now);
      from.setFullYear(from.getFullYear() - 2);
      const list = await ApiService.getAllOrders({
        shopId: shop.id,
        from: from.toISOString(),
        to: now.toISOString(),
      });
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Sales load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await httpClient.patch(`/orders/${id}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => String(o.id) === id ? { ...o, status: newStatus } : o));
    } catch {
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setUpdatingId('');
    }
  };

  const openDetails = (sale: any) => {
    Alert.alert(
      'Order Details',
      `Order #${String(sale.id).slice(-6)}\n\n${formatItemsSummary(sale)}\n\nTotal: E£${Number(sale.total || 0).toLocaleString()}\nStatus: ${getStatusMeta(sale.status).label}\n\nFull details available on web dashboard`,
    );
  };

  const filteredOrders = orders.filter(o => {
    if (channel === 'returns') return String(o.status || '').toUpperCase() === 'REFUNDED';
    if (channel === 'pos') return Boolean(o?.isPosOrder || o?.is_pos_order);
    return !Boolean(o?.isPosOrder || o?.is_pos_order);
  });

  const channels: Array<{ key: Channel; label: string }> = [
    { key: 'shop', label: 'Shop Orders' },
    { key: 'pos', label: 'POS Invoices' },
    { key: 'returns', label: 'Returns' },
  ];

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#00E5FF" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Channel Tabs — same as web */}
      <View style={styles.channelTabs}>
        {channels.map(ch => (
          <TouchableOpacity
            key={ch.key}
            onPress={() => setChannel(ch.key)}
            style={[styles.channelTab, channel === ch.key && styles.channelTabActive]}
          >
            <Text style={[styles.channelTabText, channel === ch.key && styles.channelTabTextActive]}>{ch.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>Sales</Text>
          <Text style={styles.subtitle}>Manage your orders and invoices</Text>
        </View>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <OrderCard
            sale={item}
            updatingId={updatingId}
            onUpdateStatus={updateStatus}
            onOpenDetails={openDetails}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} tintColor="#00E5FF" />}
        contentContainerStyle={filteredOrders.length === 0 ? styles.emptyList : { padding: 16, gap: 10 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="card-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No orders yet</Text>
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

  // Channel Tabs
  channelTabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  channelTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  channelTabActive: { backgroundColor: '#0F172A' },
  channelTabText: { fontSize: 11, fontWeight: '900', color: '#64748B' },
  channelTabTextActive: { color: '#fff' },

  // Title
  titleRow: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginTop: 2 },

  // Order Card
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  orderItemsWrap: { flex: 1 },
  orderItemsText: { fontSize: 14, fontWeight: '900', color: '#0F172A', lineHeight: 18 },
  orderDate: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginTop: 3 },
  orderStatusWrap: { flexDirection: 'row', gap: 4, flexShrink: 0 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },

  // Stats
  orderStats: { flexDirection: 'row', gap: 8, marginTop: 10 },
  orderStatBox: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  orderStatLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  orderStatValue: { fontSize: 13, fontWeight: '900', color: '#0F172A', marginTop: 4 },

  // Actions
  orderActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap' },
  deliveryFeeText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  actionBtns: { flexDirection: 'row', gap: 6 },
  actionCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMenu: {
    position: 'absolute',
    right: 0,
    top: 40,
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 50,
    overflow: 'hidden',
  },
  menuItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  menuItemText: { fontSize: 12, fontWeight: '900' },

  // Empty
  emptyBox: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, paddingTop: 80 },
  emptyText: { fontSize: 16, fontWeight: '800', color: '#94A3B8' },
});
