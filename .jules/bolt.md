## 2026-07-09 - [Zero-DB Cache Hit Pattern in ProductService]
**Learning:** Product visibility filtering (based on linked image map hotspots and active labels) was previously performed AFTER the cache check on every request. This not only caused redundant metadata database queries even on cache hits but also allowed potentially hidden products to stay in the cache if the filtering logic changed. By moving the filtering upstream of the `redis.set` call and parallelizing metadata fetches with the primary product query using `Promise.all`, we achieve a "Zero-DB Cache Hit" pattern where cache hits require 0 database queries and are guaranteed to be correctly filtered.

**Action:** Always filter visibility-sensitive data before caching and use `Promise.all` to parallelize independent database lookups during cache misses.

## 2026-07-09 - [Prisma Schema Validation Blocks Client Generation]
**Learning:** Found two blocking errors in `prisma/schema.prisma`: 1) A duplicate mapping where both `attempts` and `maxAttempts` were mapped to `@map("max_attempts")` in the `AiJob` model. 2) A missing `@unique` constraint on `Shop.ownerId` for a 1:1 relation. These errors prevent `prisma generate` from running, which in turn causes `npm install` and all type-checked build steps to fail.

**Action:** Fix schema validation errors immediately as they block the entire development and verification pipeline.
