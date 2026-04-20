import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

type MoreItem = { id: string; label: string; icon: React.ReactNode; route: string };

export default function MoreScreen() {
  const router = useRouter();
  const { logout, shop } = useAuth();

  const sections: { title: string; items: MoreItem[] }[] = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'reservations', label: 'Reservations', icon: <Ionicons name="calendar-outline" size={22} color="#F59E0B" />, route: '/more/reservations' },
        { id: 'invoice', label: 'Invoice', icon: <Ionicons name="document-text-outline" size={22} color="#3B82F6" />, route: '/more/invoice' },
        { id: 'pos', label: 'Smart POS', icon: <Ionicons name="phone-portrait-outline" size={22} color="#0F172A" />, route: '/more/pos' },
      ],
    },
    {
      title: 'GROWTH',
      items: [
        { id: 'promotions', label: 'Promotions', icon: <Ionicons name="megaphone-outline" size={22} color="#A855F7" />, route: '/more/promotions' },
        { id: 'customers', label: 'Customers', icon: <Ionicons name="people-outline" size={22} color="#22C55E" />, route: '/more/customers' },
        { id: 'reports', label: 'Reports', icon: <Ionicons name="bar-chart-outline" size={22} color="#00E5FF" />, route: '/more/reports' },
        { id: 'gallery', label: 'Gallery', icon: <Ionicons name="camera-outline" size={22} color="#EC4899" />, route: '/more/gallery' },
      ],
    },
    {
      title: 'SETUP',
      items: [
        { id: 'builder', label: 'Page Builder', icon: <Ionicons name="color-palette-outline" size={22} color="#F97316" />, route: '/more/builder' },
        { id: 'settings', label: 'Settings', icon: <Ionicons name="settings-outline" size={22} color="#64748B" />, route: '/settings/overview' },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
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
          <Text style={styles.shopName}>{shop?.name || 'My Shop'}</Text>
          <Text style={styles.shopCategory}>{shop?.category || 'Merchant'}</Text>
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
        <Text style={styles.logoutText}>Log Out</Text>
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
    backgroundColor: '#F0FDFA',
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
