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
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { ApiService } from '@/services/api';
import { isDashboardTabVisible } from '@/utils/merchantDashboard';

type ScreenType = 'reservations' | 'invoice' | 'pos' | 'promotions' | 'customers' | 'reports' | 'gallery' | 'chats' | 'shared-products';

const SCREEN_TITLE_KEYS: Record<string, string> = {
  reservations: 'more.reservations',
  invoice: 'more.invoice',
  pos: 'more.smartPos',
  promotions: 'more.promotions',
  customers: 'more.customers',
  reports: 'more.reports',
  gallery: 'more.gallery',
  chats: 'more.chats',
  'shared-products': 'more.sharedProducts',
};

const SCREEN_ICONS: Record<string, string> = {
  reservations: 'calendar-outline',
  invoice: 'document-text-outline',
  pos: 'phone-portrait-outline',
  promotions: 'megaphone-outline',
  customers: 'people-outline',
  reports: 'bar-chart-outline',
  gallery: 'camera-outline',
  chats: 'chatbubble-ellipses-outline',
  'shared-products': 'layers-outline',
};

export default function MoreScreen() {
  const { screen } = useLocalSearchParams<{ screen: string }>();
  const { shop } = useAuth();
  const { t } = useAppPreferences();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const gateIds = new Set<ScreenType>([
    'reservations',
    'invoice',
    'pos',
    'promotions',
    'customers',
    'reports',
    'gallery',
  ]);

  const isAllowed = !gateIds.has(screen as ScreenType) || isDashboardTabVisible(shop, String(screen || ''));

  const titleKey = SCREEN_TITLE_KEYS[screen || ''] || 'more.title';
  const icon = SCREEN_ICONS[screen || ''] || 'ellipsis-horizontal-outline';

  useEffect(() => {
    if (!shop?.id) return;
    if (!screen) return;
    if (isAllowed) return;
    Alert.alert(t('common.error'), t('more.moduleNotEnabled'));
    router.replace('/(tabs)/more');
  }, [shop?.id, screen, isAllowed, router]);

  const loadData = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!isAllowed) {
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
    } catch { Alert.alert(t('common.error'), t('common.error')); }
  };

  const handleDeleteOffer = (id: string) => {
    Alert.alert(t('common.delete'), t('common.confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.deleteOffer(id);
            setData(prev => prev.filter(o => String(o.id) !== id));
          } catch { Alert.alert(t('common.error'), t('common.error')); }
        },
      },
    ]);
  };

  const renderReservations = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.customerName || t('more.customers')}</Text>
        <View style={[styles.statusBadge, { backgroundColor: (item.status === 'completed' ? '#22C55E' : item.status === 'cancelled' ? '#EF4444' : '#F59E0B') + '18' }]}>
          <Text style={[styles.statusText, { color: item.status === 'completed' ? '#22C55E' : item.status === 'cancelled' ? '#EF4444' : '#F59E0B' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.cardSub}>{item.itemName || item.item_name || ''}</Text>
      <Text style={styles.cardDetail}>E£{Number(item.itemPrice ?? item.item_price ?? 0).toLocaleString()}</Text>
      {item.status !== 'completed' && item.status !== 'cancelled' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleReservationStatus(String(item.id), 'completed')}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#22C55E" />
            <Text style={styles.actionBtnTextGreen}>{t('reservations.complete')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleReservationStatus(String(item.id), 'cancelled')}>
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
            <Text style={styles.actionBtnTextRed}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderPromotions = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title || item.name || t('more.promotions')}</Text>
        <TouchableOpacity onPress={() => handleDeleteOffer(String(item.id))}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardSub}>{item.description || ''}</Text>
      {item.discount && <Text style={styles.cardDetail}>{item.discount}% {t('promotions.off')}</Text>}
    </View>
  );

  const renderCustomers = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="person-circle-outline" size={28} color="#94A3B8" />
        <View style={styles.customerInfo}>
          <Text style={styles.cardTitle}>{item.name || item.customerName || t('more.customers')}</Text>
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
        <Text style={styles.cardTitle}>{t('more.invoice')} #{String(item?.id || '').slice(-6)}</Text>
        <Text style={styles.cardDetail}>{t('more.total')}: E£{Number(item?.total || item?.amount || 0).toLocaleString()}</Text>
      </View>
      <Text style={styles.cardSub}>{item?.customerName || item?.customer_name || t('more.customers')}</Text>
      <Text style={styles.metaText}>{t('more.createdAt')}: {new Date(item?.createdAt || item?.created_at || Date.now()).toLocaleString('ar-EG')}</Text>
    </View>
  );

  const renderSharedProducts = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item?.name || t('products.title')}</Text>
        <Text style={styles.cardDetail}>E£{Number(item?.price || 0).toLocaleString()}</Text>
      </View>
      <Text style={styles.cardSub}>{item?.category?.name || item?.category || t('products.title')}</Text>
      <Text style={styles.metaText}>{t('products.stock')}: {item?.stock ?? 0}</Text>
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
        <Stack.Screen options={{ headerShown: true, title: t(titleKey) }} />
        <View style={styles.center}><ActivityIndicator size="large" color="#00E5FF" /></View>
      </>
    );
  }

  // Special placeholder screens
  if (screen === 'pos') {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: t('more.smartPos') }} />
        <View style={styles.placeholder}>
          <Ionicons name="phone-portrait-outline" size={48} color="#CBD5E1" />
          <Text style={styles.placeholderTitle}>{t('more.smartPos')}</Text>
          <Text style={styles.placeholderSub}>{t('more.posDescription')}</Text>
        </View>
      </>
    );
  }

  if (screen === 'chats') {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: t('more.chats') }} />
        <View style={styles.placeholder}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color="#CBD5E1" />
          <Text style={styles.placeholderTitle}>{t('more.chats')}</Text>
          <Text style={styles.placeholderSub}>{t('more.chatsDescription')}</Text>
        </View>
      </>
    );
  }

  if (screen === 'reports' && data.length === 1) {
    const r = data[0];
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: t('more.reports') }} />
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="bag-check-outline" size={22} color="#00E5FF" />
              <Text style={styles.statValue}>{r.orders?.length ?? 0}</Text>
              <Text style={styles.statLabel}>{t('reports.totalOrders')}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cash-outline" size={22} color="#22C55E" />
              <Text style={styles.statValue}>E£{Number(r.analytics?.totalRevenue ?? 0).toLocaleString()}</Text>
              <Text style={styles.statLabel}>{t('reports.revenue')}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar-outline" size={22} color="#F59E0B" />
              <Text style={styles.statValue}>{r.reservations?.length ?? 0}</Text>
              <Text style={styles.statLabel}>{t('more.reservations')}</Text>
            </View>
          </View>
        </ScrollView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t(titleKey) }} />
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
              <Ionicons name={icon as any} size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>{t('common.noData')}</Text>
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
