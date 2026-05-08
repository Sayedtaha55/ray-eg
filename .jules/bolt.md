## 2025-05-15 - Elimination of Zero-DB Cache Hit Anti-Pattern
**Learning:** I discovered that the `ShopPublicQueryService.getShopBySlug` method was suffering from a "Zero-DB Cache Hit" anti-pattern. Even when data was found in Redis, the service was performing two additional database queries to fetch hotspot metadata for product filtering. This significantly reduced the benefits of caching.
**Action:** When implementing caching, ensure that the cached object is "ready-to-use". Move expensive filtering or join logic to the cache-miss path (pre-filtering) and implement eager invalidation on the mutation side (e.g., in `ShopImageMapService`) to maintain consistency.

## 2026-05-08 - Systemic Zero-DB Cache Hit Optimization
**Learning:** The "Zero-DB Cache Hit" anti-pattern was prevalent across ProductService list methods (listByShop, listAllActive). By caching unfiltered data and filtering on hit, the app was performing redundant DB queries even with a warm cache. Additionally, ProductService.getById was performing hotspot checks serially on cache miss.
**Action:** Always filter dynamic data *before* caching in the public path. Parallelize independent metadata fetches in cache-miss paths using Promise.all to minimize tail latency. Ensure mutations (like ShopImageMap updates) invalidate all dependent list caches.
