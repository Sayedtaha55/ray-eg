export const CORE_MERCHANT_MODULES = [
  'overview',
  'notifications',
  'products',
  'promotions',
  'expenses',
  'marketing',
  'builder',
  'apps',
  'settings',
] as const;

export type CoreMerchantModuleId = (typeof CORE_MERCHANT_MODULES)[number];
