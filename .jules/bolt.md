## 2025-05-15 - [Zero-DB Cache Hit Anti-Pattern]
**Learning:** Partially trusting a cache hit but still performing database lookups for dynamic filtering (e.g., image hotspot exclusions) negates cache benefits and adds redundant latency.
**Action:** Include all filtered state in the cached object and use eager invalidation (e.g., in `ShopImageMapService`) to maintain consistency when filter criteria change.
