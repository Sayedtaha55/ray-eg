import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import httpClient from '@/services/httpClient';

function ProductRow({
  product,
  onToggle,
  onDelete,
  togglingId,
}: {
  product: any;
  onToggle: (p: any) => void;
  onDelete: (id: string) => void;
  togglingId: string;
}) {
  const isInactive = product?.isActive === false;
  const isToggling = togglingId === String(product.id);
  const imgSrc = String(product.imageUrl || product.image_url || '').trim();
  const catName = typeof product.category === 'object' ? product.category?.name : product.category;

  return (
    <View style={[styles.productRow, isInactive && styles.productRowInactive]}>
      {/* Image */}
      <View style={styles.productImgWrap}>
        {imgSrc ? (
          <View style={styles.productImgPlaceholder}>
            <Ionicons name="image-outline" size={16} color="#94A3B8" />
          </View>
        ) : (
          <View style={styles.productImgPlaceholder}>
            <Ionicons name="add-outline" size={14} color="#CBD5E1" />
          </View>
        )}
      </View>

      {/* Name + Category */}
      <View style={styles.productNameCol}>
        <Text style={styles.productName} numberOfLines={1}>{product.name || '—'}</Text>
        <Text style={styles.productCategory}>{catName || 'No Category'}</Text>
      </View>

      {/* Price */}
      <Text style={styles.productPrice}>E£ {Number(product.price || 0).toLocaleString()}</Text>

      {/* Stock */}
      <Text style={styles.productStock}>{product.stock ?? 0}</Text>

      {/* Actions */}
      <View style={styles.productActions}>
        <TouchableOpacity
          onPress={() => onToggle(product)}
          disabled={isToggling}
          style={[styles.actionBtn, isInactive ? styles.actionBtnInactive : styles.actionBtnActive]}
        >
          {isToggling ? (
            <ActivityIndicator size={12} color="#64748B" />
          ) : (
            <Ionicons name={isInactive ? 'eye-off-outline' : 'eye-outline'} size={14} color={isInactive ? '#94A3B8' : '#22C55E'} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EFF6FF' }]} onPress={() => Alert.alert('Edit', 'Product editing available on web dashboard')}>
          <Ionicons name="create-outline" size={14} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => onDelete(String(product.id))}>
          <Ionicons name="trash-outline" size={14} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProductsScreen() {
  const { shop } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState('');

  const isRestaurant = String(shop?.category || '').toUpperCase() === 'RESTAURANT';
  const pageTitle = isRestaurant ? 'Menu' : 'Inventory';

  const loadProducts = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const list = await ApiService.getProductsForManage(shop.id);
      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Products load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleToggleActive = async (product: any) => {
    const current = typeof product?.isActive === 'boolean' ? product.isActive : true;
    const next = !current;
    const id = String(product.id);
    setTogglingId(id);
    try {
      const updated = await httpClient.patch(`/products/${id}`, { isActive: next });
      setProducts(prev => prev.map(p => String(p.id) === id ? { ...p, ...(updated.data || updated) } : p));
    } catch {
    } finally {
      setTogglingId('');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Product', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.deleteProduct(id);
            setProducts(prev => prev.filter(p => String(p.id) !== id));
          } catch { Alert.alert('Error', 'Failed to delete'); }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <ProductRow
      product={item}
      onToggle={handleToggleActive}
      onDelete={handleDelete}
      togglingId={togglingId}
    />
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#00E5FF" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Header — same as web */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{pageTitle}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => Alert.alert('Add Product', 'Adding new products is available on the web dashboard')}
        >
          <Ionicons name="add-outline" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add New Item</Text>
        </TouchableOpacity>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <View style={styles.tableHeaderImg} />
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Name</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Price</Text>
        <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>Stock</Text>
        <View style={{ width: 100 }} />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProducts(); }} tintColor="#00E5FF" />}
        contentContainerStyle={products.length === 0 ? styles.emptyList : { paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No products yet</Text>
            <Text style={styles.emptySubtext}>Add your first product from the web dashboard</Text>
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
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addBtnText: { fontSize: 12, fontWeight: '900', color: '#fff' },

  // Table Header
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableHeaderImg: { width: 40, marginRight: 8 },
  tableHeaderCell: { fontSize: 10, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },

  // Product Row
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  productRowInactive: { opacity: 0.6 },
  productImgWrap: { width: 40, height: 40, borderRadius: 12, marginRight: 8, overflow: 'hidden' },
  productImgPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productNameCol: { flex: 2, marginRight: 4 },
  productName: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  productCategory: { fontSize: 10, fontWeight: '800', color: '#94A3B8', marginTop: 1 },
  productPrice: { flex: 1, fontSize: 13, fontWeight: '900', color: '#0F172A' },
  productStock: { flex: 0.5, fontSize: 13, fontWeight: '900', color: '#0F172A' },

  // Actions
  productActions: { flexDirection: 'row', gap: 4, width: 100, justifyContent: 'flex-end' },
  actionBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionBtnActive: { backgroundColor: '#ECFDF5' },
  actionBtnInactive: { backgroundColor: '#F1F5F9' },

  // Empty
  emptyBox: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, paddingTop: 80 },
  emptyText: { fontSize: 16, fontWeight: '800', color: '#94A3B8' },
  emptySubtext: { fontSize: 12, fontWeight: '600', color: '#CBD5E1' },
});
