import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { ApiService } from '@/services/api';

export default function GalleryScreen() {
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
      const images = await ApiService.getShopGallery(String(shop.id));
      setData(Array.isArray(images) ? images : []);
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

  const renderItem = ({ item }: { item: any }) => {
    const uri = String(item?.imageUrl || item?.image_url || '');
    return (
      <View style={s.cell}>
        {uri ? <Image source={{ uri }} style={s.img} resizeMode="cover" /> : <View style={s.placeholder} />}
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
      <FlatList
        data={data}
        keyExtractor={(item) => String(item?.id || Math.random())}
        renderItem={renderItem}
        numColumns={3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00E5FF" />}
        contentContainerStyle={data.length === 0 ? s.empty : { padding: 10 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },

  cell: { flex: 1 / 3, aspectRatio: 1, padding: 6 },
  img: { width: '100%', height: '100%', borderRadius: 14, backgroundColor: '#F1F5F9' },
  placeholder: { width: '100%', height: '100%', borderRadius: 14, backgroundColor: '#F1F5F9' },
  empty: { flexGrow: 1, padding: 16 },
});
