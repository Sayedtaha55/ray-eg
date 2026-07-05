
## 2026-07-05 - Zero-DB Cache Hit for Product Lists
**Learning:** Product lists were being cached unfiltered, requiring database lookups on EVERY request (even cache hits) to apply visibility rules against hotspots. This defeated the purpose of caching for these lists.
**Action:** Always filter public data against visibility rules BEFORE caching in the backend to enable true Zero-DB cache hits.

## 2026-07-05 - Prisma Schema Validation Blockers
**Learning:** Prisma client generation (post-install) can fail silently or block tests/typechecks if the schema has validation errors like duplicate field mappings.
**Action:** Fix schema errors immediately when encountered (e.g., P1012) to ensure dependencies like @prisma/client are correctly updated.
