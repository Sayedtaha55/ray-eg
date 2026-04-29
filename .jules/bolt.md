## 2025-04-29 - Zero-DB Cache Hit Optimization
**Learning:** The 'Zero-DB Cache Hit Anti-Pattern' occurred in ShopPublicQueryService where a Redis cache hit still triggered redundant database queries to filter products based on image-map hotspots.
**Action:** Move all dynamic filtering logic upstream of the caching call and implement eager cache invalidation in modification services (like ShopImageMapService) to ensure the cache remains the source of truth, eliminating DB queries on the hot path.

## 2025-04-29 - Parallelizing Independent Prisma Queries
**Learning:** Sequential await calls for independent Prisma findMany operations increase endpoint latency linearly.
**Action:** Use Promise.all or Promise.allSettled to parallelize independent database lookups, especially for filtering metadata (hotspot IDs, label keys), to minimize response time on cache misses.
