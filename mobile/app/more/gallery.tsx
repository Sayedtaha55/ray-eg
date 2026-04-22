import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
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

export default function GalleryScreen() {
  const { shop } = useAuth();
  const { t } = useAppPreferences();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [images, setImages] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const result = await ApiService.getShopGallery(String(shop.id));
      setImages(Array.isArray(result) ? result : []);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item }: { item: any }) => {
    const uri = String(item?.imageUrl || item?.image_url || item?.thumbUrl || '').trim();
    return (
      <View style={s.cell}>
        {uri ? (
          <Image source={{ uri }} style={s.img} resizeMode="cover" />
        ) : (
          <View style={s.placeholder}>
            <Ionicons name="image-outline" size={20} color="#CBD5E1" />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={s.center}>
        <Stack.Screen options={{ title: t('more.gallery') }} />
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: t('more.gallery') }} />

      {/* Header — same as web */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>{t('gallery.title')}</Text>
          <Text style={s.headerSub}>{images.length} {t('gallery.photos')}</Text>
        </View>
        <TouchableOpacity style={s.addBtn}>
          <Ionicons name="camera-outline" size={16} color="#fff" />
          <Text style={s.addBtnText}>{t('gallery.addPhotos')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={images}
        keyExtractor={(item) => String(item?.id || Math.random())}
        renderItem={renderItem}
        numColumns={3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00E5FF" />}
        contentContainerStyle={images.length === 0 ? s.emptyList : { padding: 10 }}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <View style={s.emptyDashed}>
              <Ionicons name="camera-outline" size={48} color="#CBD5E1" />
              <Text style={s.emptyText}>{t('gallery.noPhotos')}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  headerSub: { fontSize: 12, fontWeight: '900', color: '#94A3B8', marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  addBtnText: { fontSize: 12, fontWeight: '900', color: '#fff' },

  // Grid
  cell: { flex: 1 / 3, aspectRatio: 1, padding: 4 },
  img: { width: '100%', height: '100%', borderRadius: 16, backgroundColor: '#F1F5F9' },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

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
