## 2026-07-04 - [Zero-DB Cache Hit Pattern in ProductService]
**Learning:** Moving visibility filtering (against image map hotspots and label keys) BEFORE caching in `ProductService.listByShop` and `listAllActive` significantly reduces database load. On cache hits, database queries for these lists dropped from 3 to 0.

**Action:** Always filter sensitive or visibility-dependent data upstream of the cache call, and ensure that the cache invalidation logic is updated to handle changes in these dependencies (e.g., image map updates).

## 2026-07-04 - [Correct Redis Invalidation for JSON-Serialized Keys]
**Learning:** When using JSON-serialized objects in Redis keys (via `getListCacheKey`), invalidation patterns like `products:shop:*"shopId":"${sid}"*` can fail if the JSON property order or spacing differs. Using a simpler wildcard like `products:shop:*${sid}*` is more robust for targeting all paginated variations of a shop's product list.

**Action:** Use broad enough wildcards for JSON-based keys to ensure all variations (pagination, sorting) are purged on updates.
