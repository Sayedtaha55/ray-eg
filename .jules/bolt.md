## 2025-05-15 - [Zero-DB Cache Hit Anti-Pattern]
**Learning:** The application was partially trusting Redis cache hits for shop profiles but still executing 2-3 database queries for hotspot-based product filtering on every request. This "Zero-DB" anti-pattern negated much of the caching benefit.
**Action:** Always include all filtered state in the cached object and shift filtering responsibility to the upstream logic (e.g., ProductService list methods) combined with eager, granular invalidation in the mutation services (e.g., ShopImageMapService).
