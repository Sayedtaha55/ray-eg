## 2026-06-01 - Optimized product visibility and cache performance
**Learning:** Post-fetch filtering of database results breaks pagination and forces unnecessary roundtrips to the DB even on cache hits. Prisma's relation filters (`none`, `some`) and `notIn` operator can be used to push visibility logic into the database, ensuring that cached results are final and correct.
**Action:** Always aim for the "Zero-DB Cache Hit" pattern by applying all visibility and filtering rules within the database query before caching the result.

**Learning:** broad Redis wildcard invalidations (e.g., `products:*`) can cause platform-wide cache thrashing when a single resource changes.
**Action:** Use more specific invalidation patterns (e.g., `products:shop:*${sid}*`) to limit the scope of cache invalidation to relevant resources.
