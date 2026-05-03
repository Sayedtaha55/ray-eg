## 2026-05-03 - [Zero-DB Cache Hit Anti-Pattern]
**Learning:** The application was performing 'Image Map' hotspot database lookups even on Redis cache hits in `getShopBySlug`. This happened because the filtering logic depended on dynamic hotspot state but the cache hit path didn't trust the cached product list to be fully pre-filtered.
**Action:** Shifted all filtering responsibility to the upstream cache-population path and implemented eager, granular invalidation in `ShopImageMapService`. This reduced DB queries from 3 to 0 on cache hits.
