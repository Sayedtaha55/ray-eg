import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';

const CYAN = '#00E5FF';
const DARK = '#0F172A';
const GRAY = '#94A3B8';

export default function TabLayout() {
  const { shop } = useAuth();
  const router = useRouter();
  const { t } = useAppPreferences();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: CYAN,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          backgroundColor: '#111827',
          borderTopColor: '#1F2937',
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: { fontWeight: '900', fontSize: 18 },
        headerRightContainerStyle: { paddingRight: 16 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('overview'),
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-up" size={size || 24} color={color} />,
          headerTitle: shop?.name || t('dashboard'),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settings/overview')}>
              <Ionicons name="settings-outline" size={24} color="#F8FAFC" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: t('products'),
          tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size || 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: t('sales'),
          tabBarIcon: ({ color, size }) => <Ionicons name="card-outline" size={size || 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('alerts'),
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size || 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('more'),
          tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" size={size || 24} color={color} />,
        }}
      />
    </Tabs>
  );
}
