## 2025-05-15 - Elimination of Zero-DB Cache Hit Anti-Pattern
**Learning:** I discovered that the `ShopPublicQueryService.getShopBySlug` method was suffering from a "Zero-DB Cache Hit" anti-pattern. Even when data was found in Redis, the service was performing two additional database queries to fetch hotspot metadata for product filtering. This significantly reduced the benefits of caching.
**Action:** When implementing caching, ensure that the cached object is "ready-to-use". Move expensive filtering or join logic to the cache-miss path (pre-filtering) and implement eager invalidation on the mutation side (e.g., in `ShopImageMapService`) to maintain consistency.

## 2025-05-16 - Coordinated eager invalidation for Zero-DB Cache Hits
**Learning:** Achieving a "Zero-DB Cache Hit" for filtered lists (like products filtered by hotspot visibility) requires moving filtering logic to the cache-miss path. This makes the cache entry state-dependent on other entities. To maintain consistency, broad pattern-based invalidation (e.g., redis.invalidatePattern('products:*')) must be triggered from the modifying service (ShopImageMapService) whenever the filtering criteria (hotspots) change.
**Action:** When caching pre-filtered or transformed data, identify all "upstream" triggers that affect the transformation logic and implement eager invalidation on those mutation paths.
