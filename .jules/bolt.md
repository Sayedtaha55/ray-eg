## 2026-06-01 - [Zero-DB Cache Hit Pattern]
**Learning:** Product list caches previously included all products, relying on per-request DB calls to filter out hotspot-linked items. By moving filtering logic upstream and caching the final filtered result, we achieve true Zero-DB cache hits on critical read paths.
**Action:** Always apply visibility and hotspot filters BEFORE caching product lists in Redis.

## 2026-06-01 - [Parallelizing Dependent-looking Queries]
**Learning:** Independent hotspot checks and product fetches were sequential. Even though hotspots depend on shopId, once the product is fetched (or shopId is known), these should be parallelized with Promise.all.
**Action:** Scan for sequential `await` calls that share a common context (like shopId) and parallelize them.
