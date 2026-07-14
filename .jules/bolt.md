## 2026-06-01 - [Zero-DB Cache Hit Pattern]
**Learning:** In applications where results are filtered based on dynamic metadata (e.g., product visibility hotspots), caching the unfiltered results forces a "Database Query on Hit" anti-pattern. Filtering results *before* caching allows for a true Zero-DB cache hit.
**Action:** Always filter data against visibility and access-control metadata before storing in Redis to eliminate redundant database queries on subsequent requests.

## 2026-06-01 - [Parallelizing Visibility Lookups]
**Learning:** Sequential await calls for independent metadata (like linked image map IDs and active hotspot labels) significantly increase latency on cache misses. Parallelizing these with `Promise.all` reduces the total wait time to the slowest individual query.
**Action:** Use `Promise.all` to fetch all independent dependencies concurrently before processing results.
