## 2026-06-05 - Zero-DB Cache Hit Pattern for Product Lists
**Learning:** In marketplaces with complex visibility rules (like products hidden when linked to image map hotspots), caching the raw database result and filtering on every request is inefficient. It results in redundant DB queries for metadata on every cache hit.
**Action:** Apply the "Zero-DB Cache Hit" pattern by performing all visibility filtering BEFORE storing the result in Redis. Ensure surgical cache invalidation (e.g., `products:*`) when visibility rules (image maps/hotspots) change.

## 2026-06-05 - Parallelizing Hotspot Visibility Checks
**Learning:** Independent metadata lookups (linked IDs vs active label keys) during product retrieval can be parallelized to minimize latency on cache misses.
**Action:** Use `Promise.all` for independent DB queries that don't depend on each other's results.
