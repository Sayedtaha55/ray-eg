/**
 * Feature gating utility based on installed apps.
 *
 * Usage:
 *   import { shopHasApp } from '@/utils/shopApps';
 *   if (shopHasApp(shop, 'whatsapp-button')) { ... }
 */

const APP_KEY_WHATSAPP = 'whatsapp-button';
const APP_KEY_VOICE_ORDERING = 'voice-ordering';

function getInstalledAppKeys(shop: any): string[] {
  if (!shop) return [];
  const keys = (shop as any)?.installedAppKeys;
  if (Array.isArray(keys)) return keys.map((k: any) => String(k || '').trim()).filter(Boolean);
  return [];
}

export function shopHasApp(shop: any, appKey: string): boolean {
  const keys = getInstalledAppKeys(shop);
  return keys.includes(appKey);
}

export function shopHasWhatsApp(shop: any): boolean {
  return shopHasApp(shop, APP_KEY_WHATSAPP);
}

export function shopHasVoiceOrdering(shop: any): boolean {
  return shopHasApp(shop, APP_KEY_VOICE_ORDERING);
}
