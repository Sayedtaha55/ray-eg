const warmupLoaders = [
  () => import('@/components/pages/public/MapPage'),
  () => import('@/components/pages/public/ShopProfile'),
  () => import('@/components/pages/public/ProductPage'),
];

export const warmupRouteChunks = () => {
  warmupLoaders.forEach((load) => {
    void load();
  });
};

export const shouldWarmupRoutes = () => {
  try {
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
      deviceMemory?: number;
    };
    if (nav.connection?.saveData) return false;
    const effectiveType = String(nav.connection?.effectiveType || '').toLowerCase();
    if (effectiveType.includes('2g') || effectiveType === '3g' || effectiveType === 'slow-2g') return false;
    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) return false;
    return true;
  } catch {
    return false;
  }
};
