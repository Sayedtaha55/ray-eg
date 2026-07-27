import { backendGet, backendPost } from '../httpClient';

export type AppItem = {
  id: string;
  key: string;
  name: string;
  description?: string;
  version: string;
  permissions?: any;
  hooks?: any;
  createdAt?: string;
  updatedAt?: string;
};

export type ShopAppItem = {
  id: string;
  shopId: string;
  appId: string;
  status: 'INSTALLED' | 'UNINSTALLED';
  isActive: boolean;
  settings?: any;
  installedAt: string;
  updatedAt: string;
  app?: AppItem;
};

export async function listAppsViaBackend(): Promise<AppItem[]> {
  return await backendGet<AppItem[]>('/api/v1/apps');
}

export async function listMyAppsViaBackend(): Promise<ShopAppItem[]> {
  return await backendGet<ShopAppItem[]>('/api/v1/apps/me');
}

export async function installAppViaBackend(key: string): Promise<ShopAppItem> {
  return await backendPost<ShopAppItem>(`/api/v1/apps/${encodeURIComponent(key)}/install`, {});
}

export async function uninstallAppViaBackend(key: string): Promise<ShopAppItem> {
  return await backendPost<ShopAppItem>(`/api/v1/apps/${encodeURIComponent(key)}/uninstall`, {});
}

export async function enableAppViaBackend(key: string): Promise<ShopAppItem> {
  return await backendPost<ShopAppItem>(`/api/v1/apps/${encodeURIComponent(key)}/enable`, {});
}

export async function disableAppViaBackend(key: string): Promise<ShopAppItem> {
  return await backendPost<ShopAppItem>(`/api/v1/apps/${encodeURIComponent(key)}/disable`, {});
}
