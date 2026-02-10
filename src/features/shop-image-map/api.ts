import { ApiService } from '@/services/api.service';
import type { ActiveShopImageMapResponse } from './types';

export async function getActiveShopImageMap(slug: string): Promise<ActiveShopImageMapResponse> {
  return await (ApiService as any).getActiveShopImageMap(slug);
}

export async function listShopImageMapsForManage(shopId: string): Promise<any[]> {
  return await (ApiService as any).listShopImageMapsForManage(shopId);
}

export async function createShopImageMap(shopId: string, payload: any): Promise<any> {
  return await (ApiService as any).createShopImageMap(shopId, payload);
}

export async function activateShopImageMap(shopId: string, mapId: string): Promise<any> {
  return await (ApiService as any).activateShopImageMap(shopId, mapId);
}

export async function saveShopImageMapLayout(shopId: string, mapId: string, payload: any): Promise<any> {
  return await (ApiService as any).saveShopImageMapLayout(shopId, mapId, payload);
}

export async function analyzeShopImageMap(shopId: string, payload: { imageUrl: string; language?: string }): Promise<any> {
  return await (ApiService as any).analyzeShopImageMap(shopId, payload);
}
