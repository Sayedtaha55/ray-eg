import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '@/i18n';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppPreferencesProvider } from '@/contexts/AppPreferencesContext';
import { bindNotificationTapNavigation } from '@/services/nativePush';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = { initialRouteName: '(tabs)' };

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isReady, isLoggedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    const inAuthGroup = segments[0] === 'login';
    if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isLoggedIn && !inAuthGroup) {
      router.replace('/login');
    }
  }, [isReady, isLoggedIn, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppPreferencesProvider>
          <StatusBar style="dark" backgroundColor="#E0F7FF" />
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <AuthGate>
              <RootLayoutNav />
            </AuthGate>
          </KeyboardAvoidingView>
        </AppPreferencesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const headerStyle = { backgroundColor: '#E0F7FF' };
  const headerTintColor = '#0F172A';
  const headerTitleStyle = { fontWeight: '900' as const, fontSize: 18 };

  useEffect(() => {
    const unbind = bindNotificationTapNavigation((url) => {
      if (url.includes('/business/dashboard')) {
        router.push('/(tabs)');
        return;
      }
      if (url.includes('/notifications')) {
        router.push('/(tabs)/notifications');
      }
    });
    return () => unbind();
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerStyle, headerTintColor, headerTitleStyle }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings/[section]"
          options={{ headerShown: true, title: 'Settings', headerStyle, headerTintColor, headerTitleStyle }}
        />
        <Stack.Screen
          name="more/builder"
          options={{ headerShown: true, title: 'Page Builder', headerStyle, headerTintColor, headerTitleStyle }}
        />
        <Stack.Screen
          name="more/chats/index"
          options={{ headerShown: true, title: 'Chats', headerStyle, headerTintColor, headerTitleStyle }}
        />
        <Stack.Screen
          name="more/chats/[userId]"
          options={{ headerShown: true, title: 'Chat', headerStyle, headerTintColor, headerTitleStyle }}
        />
        <Stack.Screen
          name="more/pos"
          options={{ headerShown: true, title: 'POS', headerStyle, headerTintColor, headerTitleStyle }}
        />
        <Stack.Screen
          name="more/reservations"
          options={{ headerShown: true, title: 'Reservations', headerStyle, headerTintColor, headerTitleStyle }}
        />
        <Stack.Screen
          name="more/promotions"
          options={{ headerShown: true, title: 'Promotions', headerStyle, headerTintColor, headerTitleStyle }}
        />
        <Stack.Screen
          name="more/customers"
          options={{ headerShown: true, title: 'Customers', headerStyle, headerTintColor, headerTitleStyle }}
        />
        <Stack.Screen
          name="more/gallery"
          options={{ headerShown: true, title: 'Gallery', headerStyle, headerTintColor, headerTitleStyle }}
        />
        <Stack.Screen
          name="more/invoice"
          options={{ headerShown: true, title: 'Invoice', headerStyle, headerTintColor, headerTitleStyle }}
        />
        <Stack.Screen
          name="more/reports"
          options={{ headerShown: true, title: 'Reports', headerStyle, headerTintColor, headerTitleStyle }}
        />
        <Stack.Screen
          name="more/shared-products"
          options={{ headerShown: true, title: 'Shared Products', headerStyle, headerTintColor, headerTitleStyle }}
        />
        <Stack.Screen
          name="more/[screen]"
          options={{ headerShown: true, title: '', headerStyle, headerTintColor, headerTitleStyle }}
        />
      </Stack>
    </ThemeProvider>
  );
}
