export const CORE_MERCHANT_MODULES = [
  'overview',
  'products',
  'promotions',
  'builder',
  'settings',
] as const;

export type CoreMerchantModuleId = (typeof CORE_MERCHANT_MODULES)[number];
