import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import httpClient from '@/services/httpClient';

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: 'home-outline' },
  { id: 'account', label: 'Account', icon: 'person-outline' },
  { id: 'security', label: 'Security', icon: 'shield-outline' },
  { id: 'store', label: 'Store Settings', icon: 'storefront-outline' },
  { id: 'modules', label: 'Modules', icon: 'extensions-outline' },
  { id: 'payments', label: 'Payments', icon: 'card-outline' },
  { id: 'receipt_theme', label: 'Receipt Theme', icon: 'receipt-outline' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
];

export default function SettingsSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const { shop, refreshShop } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const currentSection = section || 'overview';

  const handleSave = async (payload: Record<string, any>) => {
    if (!shop?.id) return;
    setSaving(true);
    try {
      await httpClient.patch(`/shops/${shop.id}`, payload);
      await refreshShop();
      Alert.alert('Saved', 'Settings updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const renderOverview = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Store Overview</Text>
      <View style={styles.infoCard}>
        <InfoRow label="Shop Name" value={shop?.name} />
        <InfoRow label="Category" value={shop?.category} />
        <InfoRow label="City" value={shop?.city} />
        <InfoRow label="Phone" value={shop?.phone} />
        <InfoRow label="Status" value={shop?.status} />
      </View>
    </View>
  );

  const renderAccount = () => {
    const [name, setName] = useState(shop?.name || '');
    const [phone, setPhone] = useState(shop?.phone || '');
    return (
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.formCard}>
          <FormField label="Shop Name" value={name} onChange={setName} />
          <FormField label="Phone" value={phone} onChange={setPhone} keyboardType="phone-pad" />
          <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave({ name, phone })} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStore = () => {
    const [address, setAddress] = useState(shop?.addressDetailed || shop?.address_detailed || '');
    const [description, setDescription] = useState(shop?.description || '');
    const [city, setCity] = useState(shop?.city || '');
    return (
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>Store Settings</Text>
        <View style={styles.formCard}>
          <FormField label="City" value={city} onChange={setCity} />
          <FormField label="Address" value={address} onChange={setAddress} />
          <FormField label="Description" value={description} onChange={setDescription} multiline />
          <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave({ city, addressDetailed: address, description })} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSecurity = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Security</Text>
      <View style={styles.infoCard}>
        <Text style={styles.placeholderText}>Password change and two-factor authentication settings will be available here.</Text>
      </View>
    </View>
  );

  const renderModules = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Modules & Upgrades</Text>
      <View style={styles.infoCard}>
        <Text style={styles.placeholderText}>Enable or disable dashboard modules for your shop. Available on web dashboard for full configuration.</Text>
      </View>
    </View>
  );

  const renderPayments = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Payment Settings</Text>
      <View style={styles.infoCard}>
        <Text style={styles.placeholderText}>Payment method configuration available on web dashboard.</Text>
      </View>
    </View>
  );

  const renderReceiptTheme = () => {
    const [shopName, setShopName] = useState(shop?.name || '');
    const [receiptPhone, setReceiptPhone] = useState(shop?.phone || '');
    const [footerNote, setFooterNote] = useState('');
    return (
      <View style={styles.sectionContent}>
        <Text style={styles.sectionTitle}>Receipt Theme</Text>
        <View style={styles.formCard}>
          <FormField label="Receipt Shop Name" value={shopName} onChange={setShopName} />
          <FormField label="Receipt Phone" value={receiptPhone} onChange={setReceiptPhone} keyboardType="phone-pad" />
          <FormField label="Footer Note" value={footerNote} onChange={setFooterNote} />
          <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave({ receiptShopName: shopName, receiptPhone, receiptFooterNote: footerNote })} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Receipt Theme'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderNotifications = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>Notification Settings</Text>
      <View style={styles.infoCard}>
        <Text style={styles.placeholderText}>Notification sound and push notification preferences. Available on web dashboard for full configuration.</Text>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'overview': return renderOverview();
      case 'account': return renderAccount();
      case 'security': return renderSecurity();
      case 'store': return renderStore();
      case 'modules': return renderModules();
      case 'payments': return renderPayments();
      case 'receipt_theme': return renderReceiptTheme();
      case 'notifications': return renderNotifications();
      default: return renderOverview();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: SECTIONS.find(s => s.id === currentSection)?.label || 'Settings' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Section Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionNav}>
          {SECTIONS.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.sectionTab, currentSection === s.id && styles.sectionTabActive]}
              onPress={() => router.replace(`/settings/${s.id}`)}
            >
              <Ionicons name={s.icon as any} size={16} color={currentSection === s.id ? '#00E5FF' : '#94A3B8'} />
              <Text style={[styles.sectionTabText, currentSection === s.id && styles.sectionTabTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {renderContent()}
      </ScrollView>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

function FormField({ label, value, onChange, multiline, keyboardType }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  keyboardType?: any;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={[styles.formInput, multiline && styles.formInputMultiline]}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholderTextColor="#CBD5E1"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingBottom: 40 },
  sectionNav: { marginBottom: 16, marginHorizontal: -4 },
  sectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  sectionTabActive: { borderColor: '#00E5FF', backgroundColor: '#00E5FF08' },
  sectionTabText: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  sectionTabTextActive: { color: '#00E5FF' },
  sectionContent: { gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  formField: { gap: 6 },
  formLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  formInputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { fontSize: 15, fontWeight: '900', color: '#fff' },
  placeholderText: { fontSize: 14, fontWeight: '600', color: '#94A3B8', lineHeight: 22 },
});
