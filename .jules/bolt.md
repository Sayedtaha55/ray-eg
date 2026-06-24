## 2026-06-03 - [Zero-DB Cache Hit Pattern]
**Learning:** In applications where product visibility depends on dynamic metadata (like image map hotspots), caching only the raw database result still requires supplementary queries to filter the data before serving it. By moving the filtering logic upstream of the cache, we achieve true Zero-DB cache hits on the hot path.
**Action:** Always consider if dynamic visibility filters can be applied before caching to eliminate redundant database lookups on every request.

## 2026-06-03 - [Surgical Cache Invalidation]
**Learning:** Aggressive global cache invalidation (e.g., `products:*`) can cause performance degradation in multi-tenant systems. Using more specific patterns (e.g., `products:shop:*"shopId":"${sid}"*`) preserves cache for unrelated entities while ensuring consistency for the target entity.
**Action:** Prefer surgical invalidation patterns over broad wildcards to maintain high cache hit ratios across the system.
