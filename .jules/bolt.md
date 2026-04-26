## 2025-05-22 - [Zero-DB Cache Hit Anti-Pattern]
**Learning:** Partially trusting a cache hit while still performing secondary database lookups for dynamic filtering (e.g., hotspot product filtering) negates the benefit of caching for the most frequent public-facing queries.
**Action:** Always include filtered state in the cached object and ensure eager invalidation in the services that modify the source data (e.g., ShopImageMapService).
