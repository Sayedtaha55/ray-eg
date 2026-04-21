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
  Modal,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { ApiService } from '@/services/api';
import httpClient from '@/services/httpClient';
import { useFocusEffect } from '@react-navigation/native';

function ProductRow({
  product,
  onToggle,
  onDelete,
  togglingId,
  t,
}: {
  product: any;
  onToggle: (p: any) => void;
  onDelete: (id: string) => void;
  togglingId: string;
  t: any;
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
        <Text style={styles.productCategory}>{catName || t('products.noCategory')}</Text>
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
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EFF6FF' }]} onPress={() => Alert.alert(t('products.editProduct'), t('products.editProduct'))}>
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
  const { t } = useAppPreferences();
  const { width } = useWindowDimensions();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const isRestaurant = String(shop?.category || '').toUpperCase() === 'RESTAURANT';
  const pageTitle = isRestaurant ? t('products.menuTitle') : t('products.title');

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
  useFocusEffect(
    useCallback(() => {
      loadProducts();
      return () => {};
    }, [loadProducts]),
  );

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
    Alert.alert(t('products.deleteProduct'), t('products.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.deleteProduct(id);
            setProducts(prev => prev.filter(p => String(p.id) !== id));
          } catch { Alert.alert(t('common.error'), t('products.deleteFailed')); }
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
      t={t}
    />
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#00E5FF" /></View>;
  }

  const compact = width < 375;

  const submitAddProduct = async () => {
    const shopId = String(shop?.id || '').trim();
    const trimmedName = String(name || '').trim();
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (!shopId) {
      Alert.alert(t('common.error'), 'No shop found');
      return;
    }
    if (!trimmedName) {
      Alert.alert(t('common.error'), t('products.colName'));
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      Alert.alert(t('common.error'), t('products.colPrice'));
      return;
    }

    setAddLoading(true);
    try {
      const created = await ApiService.addProduct({
        shopId,
        name: trimmedName,
        price: parsedPrice,
        stock: Number.isFinite(parsedStock) && parsedStock >= 0 ? parsedStock : 0,
        category: String(category || '').trim() || undefined,
        description: String(description || '').trim() || undefined,
      });
      setProducts((prev) => [created, ...prev]);
      setAddOpen(false);
      setName('');
      setPrice('');
      setStock('0');
      setCategory('');
      setDescription('');
    } catch (e: any) {
      Alert.alert(t('common.error'), String(e?.message || 'Could not add product'));
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header — same as web */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{pageTitle}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddOpen(true)}
        >
          <Ionicons name="add-outline" size={18} color="#fff" />
          <Text style={styles.addBtnText}>{t('products.addNewItem')}</Text>
        </TouchableOpacity>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <View style={styles.tableHeaderImg} />
        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>{t('products.colName')}</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>{t('products.colPrice')}</Text>
        <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>{t('products.colStock')}</Text>
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
            <Text style={styles.emptyText}>{t('products.noProducts')}</Text>
            <Text style={styles.emptySubtext}>{t('products.addNewItem')}</Text>
          </View>
        }
      />

      <Modal visible={addOpen} animationType="slide" transparent onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('products.addNewItem')}</Text>
              <TouchableOpacity onPress={() => setAddOpen(false)}>
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput value={name} onChangeText={setName} placeholder={t('products.colName')} placeholderTextColor="#94A3B8" style={[styles.modalInput, compact && { fontSize: 13 }]} />
              <TextInput value={price} onChangeText={setPrice} placeholder={t('products.colPrice')} placeholderTextColor="#94A3B8" style={[styles.modalInput, compact && { fontSize: 13 }]} keyboardType="decimal-pad" />
              <TextInput value={stock} onChangeText={setStock} placeholder={t('products.colStock')} placeholderTextColor="#94A3B8" style={[styles.modalInput, compact && { fontSize: 13 }]} keyboardType="number-pad" />
              <TextInput value={category} onChangeText={setCategory} placeholder={t('products.noCategory')} placeholderTextColor="#94A3B8" style={[styles.modalInput, compact && { fontSize: 13 }]} />
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Description"
                placeholderTextColor="#94A3B8"
                style={[styles.modalInput, styles.modalInputArea, compact && { fontSize: 13 }]}
                multiline
              />
            </View>
            <TouchableOpacity style={styles.modalSaveBtn} disabled={addLoading} onPress={submitAddProduct}>
              {addLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.modalSaveText}>{t('common.save')}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  modalBody: { gap: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  modalInputArea: { minHeight: 90, textAlignVertical: 'top' },
  modalSaveBtn: {
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  modalSaveText: { color: '#fff', fontSize: 14, fontWeight: '900' },
});
