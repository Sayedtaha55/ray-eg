import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';

type ScreenType = 'reservations' | 'invoice' | 'pos' | 'promotions' | 'customers' | 'reports' | 'gallery' | 'builder' | 'chats' | 'shared-products';

const SCREEN_CONFIG: Record<string, { title: string; icon: string }> = {
  reservations: { title: 'Reservations', icon: 'calendar-outline' },
  invoice: { title: 'Invoice', icon: 'document-text-outline' },
  pos: { title: 'Smart POS', icon: 'phone-portrait-outline' },
  promotions: { title: 'Promotions', icon: 'megaphone-outline' },
  customers: { title: 'Customers', icon: 'people-outline' },
  reports: { title: 'Reports', icon: 'bar-chart-outline' },
  gallery: { title: 'Gallery', icon: 'camera-outline' },
  builder: { title: 'Page Builder', icon: 'color-palette-outline' },
  chats: { title: 'Chats', icon: 'chatbubble-ellipses-outline' },
  'shared-products': { title: 'Shared Products', icon: 'layers-outline' },
};

export default function MoreScreen() {
  const { screen } = useLocalSearchParams<{ screen: string }>();
  const { shop } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const config = SCREEN_CONFIG[screen || ''] || { title: screen || 'More', icon: 'ellipsis-horizontal-outline' };

  const loadData = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      let result: any[] = [];
      switch (screen as ScreenType) {
        case 'reservations':
          result = await ApiService.getReservations(shop.id);
          break;
        case 'promotions': {
          const offers = await ApiService.getOffers();
          result = (offers || []).filter((o: any) => o.shopId === shop.id);
          break;
        }
        case 'customers':
          result = await ApiService.getCustomers(shop.id);
          break;
        case 'gallery': {
          const images = await ApiService.getShopGallery(shop.id);
          result = images || [];
          break;
        }
        case 'invoice':
          result = await ApiService.getInvoices(shop.id);
          break;
        case 'shared-products': {
          const products = await ApiService.getProductsForManage(shop.id);
          result = (products || []).filter((p: any) => Boolean(p?.isShared || p?.is_shared || p?.sharedWith));
          break;
        }
        case 'chats':
          result = [];
          break;
        case 'reports': {
          const now = new Date();
          const from = new Date(now);
          from.setFullYear(from.getFullYear() - 2);
          const [orders, analytics, reservations] = await Promise.all([
            ApiService.getAllOrders({ shopId: shop.id, from: from.toISOString(), to: now.toISOString() }),
            ApiService.getShopAnalytics(shop.id, { from: from.toISOString(), to: now.toISOString() }),
            ApiService.getReservations(shop.id),
          ]);
          result = [{ orders, analytics, reservations }];
          break;
        }
        default:
          result = [];
      }
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(`${screen} load error:`, err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id, screen]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleReservationStatus = async (id: string, status: string) => {
    try {
      await ApiService.updateReservationStatus(id, status);
      setData(prev => prev.map(r => String(r.id) === id ? { ...r, status } : r));
    } catch { Alert.alert('Error', 'Failed to update status'); }
  };

  const handleDeleteOffer = (id: string) => {
    Alert.alert('Delete Offer', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.deleteOffer(id);
            setData(prev => prev.filter(o => String(o.id) !== id));
          } catch { Alert.alert('Error', 'Failed to delete'); }
        },
      },
    ]);
  };

  const renderReservations = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.customerName || 'Customer'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: (item.status === 'completed' ? '#22C55E' : item.status === 'cancelled' ? '#EF4444' : '#F59E0B') + '18' }]}>
          <Text style={[styles.statusText, { color: item.status === 'completed' ? '#22C55E' : item.status === 'cancelled' ? '#EF4444' : '#F59E0B' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.cardSub}>{item.itemName || item.item_name || ''}</Text>
      <Text style={styles.cardDetail}>E£{item.itemPrice ?? item.item_price ?? 0}</Text>
      {item.status !== 'completed' && item.status !== 'cancelled' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleReservationStatus(String(item.id), 'completed')}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#22C55E" />
            <Text style={styles.actionBtnTextGreen}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleReservationStatus(String(item.id), 'cancelled')}>
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
            <Text style={styles.actionBtnTextRed}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderPromotions = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title || item.name || 'Offer'}</Text>
        <TouchableOpacity onPress={() => handleDeleteOffer(String(item.id))}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardSub}>{item.description || ''}</Text>
      {item.discount && <Text style={styles.cardDetail}>{item.discount}% off</Text>}
    </View>
  );

  const renderCustomers = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="person-circle-outline" size={28} color="#94A3B8" />
        <View style={styles.customerInfo}>
          <Text style={styles.cardTitle}>{item.name || item.customerName || 'Customer'}</Text>
          <Text style={styles.cardSub}>{item.phone || item.email || ''}</Text>
        </View>
      </View>
    </View>
  );

  const renderGallery = ({ item }: { item: any }) => (
    <View style={styles.galleryCard}>
      <View style={styles.galleryPlaceholder}>
        <Ionicons name="image-outline" size={32} color="#CBD5E1" />
      </View>
    </View>
  );

  const renderInvoices = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Invoice #{String(item?.id || '').slice(-6)}</Text>
        <Text style={styles.cardDetail}>E£{Number(item?.total || item?.amount || 0).toLocaleString()}</Text>
      </View>
      <Text style={styles.cardSub}>{item?.customerName || item?.customer_name || 'Customer'}</Text>
      <Text style={styles.metaText}>{new Date(item?.createdAt || item?.created_at || Date.now()).toLocaleString('ar-EG')}</Text>
    </View>
  );

  const renderSharedProducts = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item?.name || 'Product'}</Text>
        <Text style={styles.cardDetail}>E£{Number(item?.price || 0).toLocaleString()}</Text>
      </View>
      <Text style={styles.cardSub}>{item?.category?.name || item?.category || 'General'}</Text>
      <Text style={styles.metaText}>Stock: {item?.stock ?? 0}</Text>
    </View>
  );

  const renderGeneric = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title || item.name || item.id || 'Item'}</Text>
      {item.description && <Text style={styles.cardSub}>{item.description}</Text>}
    </View>
  );

  const getRenderer = () => {
    switch (screen as ScreenType) {
      case 'reservations': return renderReservations;
      case 'promotions': return renderPromotions;
      case 'customers': return renderCustomers;
      case 'gallery': return renderGallery;
      case 'invoice': return renderInvoices;
      case 'shared-products': return renderSharedProducts;
      default: return renderGeneric;
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: config.title }} />
        <View style={styles.center}><ActivityIndicator size="large" color="#00E5FF" /></View>
      </>
    );
  }

  // Special placeholder screens
  if (screen === 'pos') {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Smart POS' }} />
        <View style={styles.placeholder}>
          <Ionicons name="phone-portrait-outline" size={48} color="#CBD5E1" />
          <Text style={styles.placeholderTitle}>Smart POS</Text>
          <Text style={styles.placeholderSub}>Full POS experience available on web dashboard</Text>
        </View>
      </>
    );
  }

  if (screen === 'builder') {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Page Builder' }} />
        <View style={styles.placeholder}>
          <Ionicons name="color-palette-outline" size={48} color="#CBD5E1" />
          <Text style={styles.placeholderTitle}>Page Builder</Text>
          <Text style={styles.placeholderSub}>Design your store page on the web dashboard</Text>
        </View>
      </>
    );
  }

  if (screen === 'chats') {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Chats' }} />
        <View style={styles.placeholder}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color="#CBD5E1" />
          <Text style={styles.placeholderTitle}>Chats</Text>
          <Text style={styles.placeholderSub}>Chat management is mirrored from web and will appear here once conversations start.</Text>
        </View>
      </>
    );
  }

  if (screen === 'reports' && data.length === 1) {
    const r = data[0];
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Reports' }} />
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="bag-check-outline" size={22} color="#00E5FF" />
              <Text style={styles.statValue}>{r.orders?.length ?? 0}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cash-outline" size={22} color="#22C55E" />
              <Text style={styles.statValue}>E£{r.analytics?.totalRevenue ?? 0}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar-outline" size={22} color="#F59E0B" />
              <Text style={styles.statValue}>{r.reservations?.length ?? 0}</Text>
              <Text style={styles.statLabel}>Reservations</Text>
            </View>
          </View>
        </ScrollView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: config.title }} />
      <View style={styles.container}>
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id || Math.random())}
          renderItem={getRenderer()}
          numColumns={screen === 'gallery' ? 3 : 1}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#00E5FF" />}
          contentContainerStyle={data.length === 0 ? styles.emptyList : { padding: 16 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name={config.icon as any} size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No {screen} found</Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingBottom: 32 },
  emptyList: { flex: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  cardSub: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginTop: 2 },
  cardDetail: { fontSize: 14, fontWeight: '700', color: '#00E5FF', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtnTextGreen: { fontSize: 12, fontWeight: '700', color: '#22C55E' },
  actionBtnTextRed: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  customerInfo: { flex: 1, marginLeft: 10 },
  galleryCard: { flex: 1, aspectRatio: 1, margin: 4, borderRadius: 12, overflow: 'hidden' },
  galleryPlaceholder: { flex: 1, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA', gap: 8, paddingHorizontal: 32 },
  placeholderTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  placeholderSub: { fontSize: 13, fontWeight: '600', color: '#94A3B8', textAlign: 'center' },
  metaText: { fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 6 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, paddingTop: 80 },
  emptyText: { fontSize: 16, fontWeight: '800', color: '#94A3B8' },
});
