import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';

type MoreItem = { id: string; label: string; icon: React.ReactNode; route: string };

export default function MoreScreen() {
  const router = useRouter();
  const { logout, shop } = useAuth();
  const { t } = useAppPreferences();

  const sections: { title: string; items: MoreItem[] }[] = [
    {
      title: t('dashboardPages'),
      items: [
        { id: 'overview', label: t('overview'), icon: <Ionicons name="trending-up-outline" size={22} color="#00E5FF" />, route: '/(tabs)' },
        { id: 'products', label: t('products'), icon: <Ionicons name="cube-outline" size={22} color="#22C55E" />, route: '/(tabs)/products' },
        { id: 'sales', label: t('sales'), icon: <Ionicons name="card-outline" size={22} color="#A78BFA" />, route: '/(tabs)/sales' },
        { id: 'notifications', label: t('alerts'), icon: <Ionicons name="notifications-outline" size={22} color="#F59E0B" />, route: '/(tabs)/notifications' },
      ],
    },
    {
      title: t('operations'),
      items: [
        { id: 'reservations', label: t('reservations'), icon: <Ionicons name="calendar-outline" size={22} color="#F59E0B" />, route: '/more/reservations' },
        { id: 'invoice', label: t('invoice'), icon: <Ionicons name="document-text-outline" size={22} color="#3B82F6" />, route: '/more/invoice' },
        { id: 'pos', label: t('smartPos'), icon: <Ionicons name="phone-portrait-outline" size={22} color="#E5E7EB" />, route: '/more/pos' },
      ],
    },
    {
      title: t('growth'),
      items: [
        { id: 'promotions', label: t('promotions'), icon: <Ionicons name="megaphone-outline" size={22} color="#A855F7" />, route: '/more/promotions' },
        { id: 'customers', label: t('customers'), icon: <Ionicons name="people-outline" size={22} color="#22C55E" />, route: '/more/customers' },
        { id: 'reports', label: t('reports'), icon: <Ionicons name="bar-chart-outline" size={22} color="#00E5FF" />, route: '/more/reports' },
        { id: 'gallery', label: t('gallery'), icon: <Ionicons name="camera-outline" size={22} color="#EC4899" />, route: '/more/gallery' },
      ],
    },
    {
      title: t('setup'),
      items: [
        { id: 'builder', label: t('pageBuilder'), icon: <Ionicons name="color-palette-outline" size={22} color="#F97316" />, route: '/more/builder' },
        { id: 'chats', label: t('chats'), icon: <Ionicons name="chatbubble-ellipses-outline" size={22} color="#2DD4BF" />, route: '/more/chats' },
        { id: 'shared-products', label: t('sharedProducts'), icon: <Ionicons name="layers-outline" size={22} color="#38BDF8" />, route: '/more/shared-products' },
        { id: 'settings', label: t('settings'), icon: <Ionicons name="settings-outline" size={22} color="#64748B" />, route: '/settings/overview' },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(t('logoutConfirmTitle'), t('logoutConfirmBody'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logOut'), style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Shop Info */}
      <View style={styles.shopCard}>
        <View style={styles.shopAvatar}>
          <Ionicons name="storefront" size={28} color="#00E5FF" />
        </View>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{shop?.name || t('myShop')}</Text>
          <Text style={styles.shopCategory}>{shop?.category || t('merchant')}</Text>
        </View>
      </View>

      {/* Menu Sections */}
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconWrap}>{item.icon}</View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>{t('logOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingBottom: 40 },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  shopAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#ECFEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopInfo: { flex: 1 },
  shopName: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  shopCategory: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, paddingHorizontal: 4 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '800', color: '#EF4444' },
});
