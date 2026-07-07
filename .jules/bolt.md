## 2026-07-07 - [Architecture] Prisma Schema Validation Blocks System
**Learning:** Prisma schema validation errors (P1012) like duplicate mappings or missing `@unique` constraints on 1:1 relations block Prisma client generation. This in turn causes system-wide failures in TypeScript typechecks and Jest tests because the `@prisma/client` cannot be imported.
**Action:** Always prioritize fixing `prisma/schema.prisma` validation errors before attempting to run tests or typechecks.

## 2026-07-07 - [Optimization] Zero-DB Cache Hit Pattern
**Learning:** In endpoints that require complex visibility filtering (e.g., product lists hidden by image map hotspots), caching raw DB results and filtering on every request is inefficient. It leads to redundant metadata lookups and computation on cache hits.
**Action:** Apply visibility filtering *before* caching the result in Redis. This ensures that cache hits return the final, correct data immediately without any additional database queries or processing.

## 2026-07-07 - [Latency] Parallelizing Independent I/O with Promise.all
**Learning:** Many backend services (e.g., `ProductService`, `ShopPublicQueryService`) perform multiple independent database or cache lookups sequentially. This accumulates latency.
**Action:** Use `Promise.all` to execute independent Prisma queries and metadata fetches in parallel, reducing overall request latency.
