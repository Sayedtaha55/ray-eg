import { Platform } from 'react-native';

const KEYS = {
  ACCESS_TOKEN: 'ray_access_token',
  REFRESH_TOKEN: 'ray_refresh_token',
  USER: 'ray_user',
} as const;

// Platform-aware storage: SecureStore on native, localStorage on web
let SecureStore: typeof import('expo-secure-store') | null = null;

async function getSecureStore() {
  if (!SecureStore) {
    SecureStore = await import('expo-secure-store');
  }
  return SecureStore;
}

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    const ss = await getSecureStore();
    await ss.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    const ss = await getSecureStore();
    return ss.getItemAsync(key);
  }
}

async function deleteItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    const ss = await getSecureStore();
    await ss.deleteItemAsync(key);
  }
}

export async function saveTokens(access: string, refresh?: string) {
  await setItem(KEYS.ACCESS_TOKEN, access);
  if (refresh) await setItem(KEYS.REFRESH_TOKEN, refresh);
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(KEYS.REFRESH_TOKEN);
}

export async function saveUser(user: any) {
  await setItem(KEYS.USER, JSON.stringify(user));
}

export async function getUser<T = any>(): Promise<T | null> {
  const raw = await getItem(KEYS.USER);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function clearSession() {
  await deleteItem(KEYS.ACCESS_TOKEN);
  await deleteItem(KEYS.REFRESH_TOKEN);
  await deleteItem(KEYS.USER);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}
