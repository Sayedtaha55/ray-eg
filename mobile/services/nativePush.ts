import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ApiService } from './api';

const PUSH_ENDPOINT_KEY = 'merchant_push_endpoint';
let notificationsBound = false;

async function loadNotificationsModule() {
  try {
    const moduleName = 'expo-notifications';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(moduleName);
  } catch {
    return null;
  }
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'General',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#00E5FF',
  });
}

async function getExpoPushToken() {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return null;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;
  if (!projectId) return null;

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return String(token.data || '').trim() || null;
}

export async function registerNativePushForMerchant(shopId: string) {
  if (!shopId) return false;
  await ensureAndroidChannel();
  const token = await getExpoPushToken();
  if (!token) return false;

  const endpoint = await ApiService.registerMerchantPushSubscription(shopId, token);
  await SecureStore.setItemAsync(PUSH_ENDPOINT_KEY, endpoint);
  return true;
}

export async function unregisterNativePushForMerchant(shopId: string) {
  if (!shopId) return;
  const endpoint = await SecureStore.getItemAsync(PUSH_ENDPOINT_KEY);
  if (!endpoint) return;
  try {
    await ApiService.unregisterMerchantPushSubscription(shopId, endpoint);
  } finally {
    await SecureStore.deleteItemAsync(PUSH_ENDPOINT_KEY);
  }
}

export function bindNotificationTapNavigation(openUrl: (url: string) => void) {
  if (notificationsBound) return () => {};
  let disposed = false;
  let subscription: { remove: () => void } | null = null;
  notificationsBound = true;
  loadNotificationsModule().then((Notifications) => {
    if (!Notifications || disposed) return;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const url = String(response?.notification?.request?.content?.data?.url || '').trim();
      if (url) openUrl(url);
    });
  }).catch(() => {});
  return () => {
    disposed = true;
    if (subscription) subscription.remove();
    notificationsBound = false;
  };
}
