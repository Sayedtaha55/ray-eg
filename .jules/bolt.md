## 2026-07-17 - Product Filtering Caching Patterns
**Learning:** Parallelizing visibility queries and using "Zero-DB Cache Hits" (filtering lists against image hotspot metadata before caching to Redis) significantly reduces database query load.
**Action:** When caching database results that must be filtered against separate dynamic metadata tables, retrieve all metadata upfront concurrently, perform filtration in memory, and cache only the finalized lists, avoiding secondary queries on cache hits.
