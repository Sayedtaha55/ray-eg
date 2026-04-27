## 2026-04-27 - Zero-DB Cache Hit Anti-Pattern
**Learning:** A common performance bottleneck was identified where `getShopBySlug` partially trusted the Redis cache but still performed 2 database queries for image hotspots to filter the cached products. This is a "Zero-DB Cache Hit Anti-Pattern".
**Action:** Always include all data needed for filtering within the cached object itself. Move filtering logic upstream (pre-filtering) and use eager, granular invalidation in the service that modifies the filtering criteria (e.g., `ShopImageMapService`). This achieves true 0-DB-query cache hits.
