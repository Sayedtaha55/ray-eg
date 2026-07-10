## 2026-07-10 - [Zero-DB Cache Hits and Query Parallelization in ProductService]
**Learning:** Moving visibility filtering (against image map hotspots) upstream of the Redis cache call enables 'Zero-DB Cache Hits'. This ensures that cached product lists are already correct for public view, eliminating 2-3 redundant database queries on every cache hit. Parallelizing independent queries with Promise.all further reduces latency on cache misses.
**Action:** Always filter sensitive or visibility-dependent data before caching in public-facing listing methods.
