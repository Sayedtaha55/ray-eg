## 2026-07-12 - Parallelization and Zero-DB Cache Hits
**Learning:** In `ProductService`, fetching core data and visibility metadata (hotspots) sequentially was a significant bottleneck. Implementing the "Zero-DB Cache Hit" pattern by filtering visibility *before* caching ensures that cache hits require no further database lookups. Parallelizing independent queries with `Promise.all` reduced latency for cache misses.
**Action:** Always consider the order of caching vs filtering to minimize database work on cache hits. Parallelize independent I/O whenever possible.
