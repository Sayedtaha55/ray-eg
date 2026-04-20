## 2025-05-15 - Zero-DB Cache Hit Optimization
**Learning:** Performing database queries (like fetching hotspots for filtering) inside a Redis cache-hit path in `ShopPublicQueryService` prevents a true "Zero-DB" response and increases latency.
**Action:** Move all product filtering and data augmentation logic upstream of the `redis.cacheShop` call. Implement reactive cache invalidation in `ShopImageMapService` to maintain consistency when hotspots change.
