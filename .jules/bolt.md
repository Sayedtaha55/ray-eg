## 2026-06-23 - Zero-DB Cache Hit Pattern in ProductService

**Learning:** Implementing the "Zero-DB Cache Hit" pattern requires moving all visibility filtering logic (e.g., hiding products linked to image map hotspots) upstream of the cache. Parallelizing these independent database queries on cache misses significantly reduces tail latency.

**Action:** Always fetch hotspot metadata concurrently with product lists and cache the finalized, filtered result to ensure 0-DB-query path on cache hits. Remember to add surgical cache invalidation to the services that modify those filtering criteria.
