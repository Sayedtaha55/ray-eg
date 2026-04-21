import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { isDashboardTabVisible } from '@/utils/merchantDashboard';

const CYAN = '#00E5FF';
const DARK = '#0F172A';
const GRAY = '#94A3B8';
const LIGHT_BLUE = '#E0F7FF';
const BORDER = '#F1F5F9';

export default function TabLayout() {
  const { shop } = useAuth();
  const router = useRouter();
  const { t } = useAppPreferences();

  const showSales = isDashboardTabVisible(shop, 'sales');
  const showNotifications = isDashboardTabVisible(shop, 'notifications');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: CYAN,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: BORDER,
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 24,
          paddingTop: 10,
          elevation: 12,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerStyle: { backgroundColor: LIGHT_BLUE },
        headerTintColor: DARK,
        headerTitleStyle: { fontWeight: '900', fontSize: 18 },
        headerRightContainerStyle: { paddingRight: 16 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.overview'),
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-up" size={size || 24} color={color} />,
          tabBarBadge: undefined,
          headerTitle: shop?.name || t('tabs.overview'),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settings/overview')}>
              <Ionicons name="settings-outline" size={24} color={DARK} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: t('tabs.products'),
          tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size || 24} color={color} />,
          tabBarBadge: undefined,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          href: showSales ? undefined : null,
          title: t('tabs.sales'),
          tabBarIcon: ({ color, size }) => <Ionicons name="card-outline" size={size || 24} color={color} />,
          tabBarBadge: undefined,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: showNotifications ? undefined : null,
          title: t('tabs.notifications'),
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size || 24} color={color} />,
          tabBarBadge: undefined,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('tabs.more'),
          tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" size={size || 24} color={color} />,
          tabBarBadge: undefined,
        }}
      />
    </Tabs>
  );
}
