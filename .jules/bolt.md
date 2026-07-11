## 2026-07-11 - [Product Retrieval Path Optimization]
**Learning:** In a marketplace with complex visibility rules (e.g., hiding products linked to image map hotspots), the product retrieval path can suffer from N+1-like latency if visibility metadata is fetched sequentially after the primary product query. Parallelizing these fetches with `Promise.all` and implementing a "Zero-DB Cache Hit" pattern (filtering before caching) significantly reduces latency and eliminates database load on cache hits.

**Action:** Always look for independent metadata queries that can be parallelized with the primary data fetch. Ensure that the cached object is "ready-to-serve" by applying all filters before storing it in Redis.

## 2026-07-11 - [Reverting Out-of-Scope Schema Fixes]
**Learning:** Pre-existing bugs in the Prisma schema (duplicate mappings, missing unique constraints) can block the local development environment (e.g., preventing `prisma generate` or `npm install`). While these must be fixed locally to verify work, they should be excluded from the final PR if they are out of scope for the current mission (performance).

**Action:** Fix schema bugs locally to enable testing/typechecking, but revert them before submission unless the task explicitly permits schema changes.
