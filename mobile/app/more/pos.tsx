import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

type CartLine = {
  lineId: string;
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
};

export default function PosScreen() {
  const { shop } = useAuth();
  const { t } = useAppPreferences();

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [processing, setProcessing] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      return;
    }
    try {
      const list = await ApiService.getProductsForManage(String(shop.id));
      setProducts(Array.isArray(list) ? list : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shop?.id]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => String(p?.name || '').toLowerCase().includes(q));
  }, [products, query]);

  const subtotal = useMemo(() => cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0), [cart]);

  const addToCart = useCallback((p: any) => {
    const id = String(p?.id || '').trim();
    if (!id) return;
    const name = String(p?.name || '').trim();
    const unitPrice = Number(p?.price || 0);

    setCart((prev) => {
      const found = prev.find((x) => x.productId === id);
      if (found) {
        return prev.map((x) => (x.productId === id ? { ...x, qty: x.qty + 1 } : x));
      }
      return prev.concat([{ lineId: `${id}:${Date.now()}`, productId: id, name, unitPrice, qty: 1 }]);
    });
  }, []);

  const inc = useCallback((productId: string) => {
    setCart((prev) => prev.map((x) => (x.productId === productId ? { ...x, qty: x.qty + 1 } : x)));
  }, []);

  const dec = useCallback((productId: string) => {
    setCart((prev) =>
      prev
        .map((x) => (x.productId === productId ? { ...x, qty: Math.max(0, x.qty - 1) } : x))
        .filter((x) => x.qty > 0),
    );
  }, []);

  const checkout = useCallback(async () => {
    if (!shop?.id) return;
    if (cart.length === 0) return;

    setProcessing(true);
    try {
      await ApiService.placeOrder({
        shopId: String(shop.id),
        items: cart.map((l) => ({ productId: l.productId, quantity: l.qty })),
        total: subtotal,
        paymentMethod: 'COD',
        source: 'pos',
      });
      setCart([]);
      Alert.alert(t('common.success'), t('pos.success'));
    } catch {
      Alert.alert(t('common.error'), t('settings.saveFailed'));
    } finally {
      setProcessing(false);
    }
  }, [cart, shop?.id, subtotal]);

  const renderProduct = ({ item }: { item: any }) => (
    <View style={s.prodRow}>
      <View style={s.prodLeft}>
        <View style={s.prodIcon}>
          <Ionicons name="cube-outline" size={18} color="#0F172A" />
        </View>
        <View style={s.prodMid}>
          <Text style={s.prodName} numberOfLines={1}>{String(item?.name || '')}</Text>
          <Text style={s.prodPrice}>E£{Number(item?.price || 0).toLocaleString()}</Text>
        </View>
      </View>
      <TouchableOpacity style={s.addBtn} onPress={() => addToCart(item)}>
        <Text style={s.addBtnText}>{t('pos.add')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={s.center}>
        <Stack.Screen options={{ title: t('more.smartPos') }} />
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: t('more.smartPos') }} />

      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('pos.searchProducts')}
          placeholderTextColor="#94A3B8"
          style={s.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item?.id || Math.random())}
        renderItem={renderProduct}
        contentContainerStyle={filtered.length === 0 ? s.emptyList : s.list}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Ionicons name="cube-outline" size={52} color="#CBD5E1" />
            <Text style={s.emptyTitle}>{t('pos.emptyProducts')}</Text>
          </View>
        }
      />

      <View style={s.cartBar}>
        <View style={s.cartLeft}>
          <Ionicons name="cart-outline" size={18} color="#0F172A" />
          <Text style={s.cartText}>{t('pos.cart')}: {cart.reduce((s2, x) => s2 + x.qty, 0)}</Text>
        </View>
        <Text style={s.cartTotal}>E£{Number(subtotal).toLocaleString()}</Text>
        <TouchableOpacity style={[s.checkoutBtn, (processing || cart.length === 0) && s.checkoutBtnDisabled]} disabled={processing || cart.length === 0} onPress={checkout}>
          <Text style={s.checkoutText}>{processing ? t('pos.processing') : t('pos.checkout')}</Text>
        </TouchableOpacity>
      </View>

      {/* Simple cart editor */}
      {cart.length > 0 && (
        <View style={s.cartSheet}>
          <Text style={s.cartSheetTitle}>{t('pos.cart')}</Text>
          {cart.map((l) => (
            <View key={l.lineId} style={s.cartLine}>
              <Text style={s.cartLineName} numberOfLines={1}>{l.name}</Text>
              <View style={s.qtyRow}>
                <TouchableOpacity style={s.qtyBtn} onPress={() => dec(l.productId)}>
                  <Ionicons name="remove" size={16} color="#0F172A" />
                </TouchableOpacity>
                <Text style={s.qtyText}>{l.qty}</Text>
                <TouchableOpacity style={s.qtyBtn} onPress={() => inc(l.productId)}>
                  <Ionicons name="add" size={16} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },

  searchWrap: {
    margin: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '700', color: '#0F172A' },

  list: { padding: 16, paddingBottom: 140 },
  prodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  prodLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  prodIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#E0F7FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BFEFFF' },
  prodMid: { flex: 1 },
  prodName: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  prodPrice: { fontSize: 12, fontWeight: '900', color: '#64748B', marginTop: 2 },

  addBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: '#0F172A' },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },

  emptyList: { flexGrow: 1, padding: 16 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 6 },

  cartBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  cartText: { fontSize: 12, fontWeight: '900', color: '#0F172A' },
  cartTotal: { fontSize: 12, fontWeight: '900', color: '#0F172A' },
  checkoutBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: '#00E5FF' },
  checkoutBtnDisabled: { opacity: 0.6 },
  checkoutText: { fontSize: 12, fontWeight: '900', color: '#0F172A' },

  cartSheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 84,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 12,
    gap: 10,
    maxHeight: 260,
  },
  cartSheetTitle: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  cartLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cartLineName: { flex: 1, fontSize: 12, fontWeight: '800', color: '#0F172A' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 34, height: 34, borderRadius: 14, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  qtyText: { width: 26, textAlign: 'center', fontSize: 12, fontWeight: '900', color: '#0F172A' },
});
