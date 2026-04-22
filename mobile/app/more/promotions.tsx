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
  const [offers, setOffers] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const result = await ApiService.getOffers();
      const filtered = (result || []).filter((o: any) => String(o?.shopId || o?.shop_id) === String(shop.id));
      setOffers(Array.isArray(filtered) ? filtered : []);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { load(); }, [load]);

  const handleStopOffer = useCallback((id: string) => {
    Alert.alert(t('promotions.stopOffer'), t('common.confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('promotions.stopOffer'),
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.deleteOffer(id);
            setOffers((prev) => prev.filter((x) => String(x?.id) !== id));
          } catch {
            Alert.alert(t('common.error'), t('common.retry'));
          }
        },
      },
    ]);
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const discount = Number(item?.discount || 0);
    const oldPrice = Number(item?.oldPrice || item?.old_price || 0);
    const newPrice = Number(item?.newPrice || item?.new_price || 0);
    const imgSrc = String(item?.imageUrl || item?.image_url || '').trim();

    return (
      <View style={s.offerCard}>
        {/* Image area with discount badge */}
        <View style={s.offerImgWrap}>
          {imgSrc ? (
            <View style={s.offerImgPlaceholder}>
              <Ionicons name="image-outline" size={28} color="#94A3B8" />
            </View>
          ) : (
            <View style={s.offerImgPlaceholder}>
              <Ionicons name="pricetag-outline" size={28} color="#CBD5E1" />
            </View>
          )}
          {discount > 0 && (
            <View style={s.discountBadge}>
              <Text style={s.discountBadgeText}>-{discount}%</Text>
            </View>
          )}
        </View>

        {/* Title + Prices */}
        <View style={s.offerInfo}>
          <Text style={s.offerTitle} numberOfLines={1}>{String(item?.title || item?.name || '')}</Text>
          <View style={s.priceRow}>
            {oldPrice > 0 && (
              <Text style={s.oldPrice}>{t('promotions.currency')} {oldPrice.toLocaleString()}</Text>
            )}
            {newPrice > 0 && (
              <Text style={s.newPrice}>{t('promotions.currency')} {newPrice.toLocaleString()}</Text>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={s.offerActions}>
          <TouchableOpacity style={s.editBtn}>
            <Text style={s.editBtnText}>{t('promotions.editDesign')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.stopBtn} onPress={() => handleStopOffer(String(item?.id))}>
            <Text style={s.stopBtnText}>{t('promotions.stopOffer')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

      {/* Header — same as web */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{t('promotions.title')}</Text>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.createBtn}>
            <Ionicons name="pricetag-outline" size={16} color="#fff" />
            <Text style={s.createBtnText}>{t('promotions.createNewOffer')}</Text>
          </TouchableOpacity>
          <View style={s.activeBadge}>
            <Text style={s.activeBadgeText}>{offers.length} {t('promotions.activeOffers')}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={offers}
        keyExtractor={(item) => String(item?.id || Math.random())}
        renderItem={renderItem}
        numColumns={1}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00E5FF" />}
        contentContainerStyle={offers.length === 0 ? s.emptyList : { padding: 16, gap: 16 }}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <View style={s.emptyDashed}>
              <Ionicons name="megaphone-outline" size={48} color="#CBD5E1" />
              <Text style={s.emptyText}>{t('promotions.noActiveOffers')}</Text>
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  createBtnText: { fontSize: 12, fontWeight: '900', color: '#fff' },
  activeBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '900', color: '#BD00FF', textTransform: 'uppercase' },

  // Offer Card
  offerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    gap: 14,
  },
  offerImgWrap: {
    position: 'relative',
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  offerImgPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#BD00FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#BD00FF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  discountBadgeText: { fontSize: 13, fontWeight: '900', color: '#fff' },

  offerInfo: { gap: 4 },
  offerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  oldPrice: { fontSize: 14, fontWeight: '700', color: '#CBD5E1', textDecorationLine: 'line-through' },
  newPrice: { fontSize: 22, fontWeight: '900', color: '#BD00FF' },

  // Actions
  offerActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    alignItems: 'center',
  },
  editBtnText: { fontSize: 12, fontWeight: '900', color: '#94A3B8' },
  stopBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    alignItems: 'center',
  },
  stopBtnText: { fontSize: 12, fontWeight: '900', color: '#EF4444' },

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
