## 2026-07-08 - [ProductService Cache Leak & Latency]
**Learning:** Product listing methods cached raw DB results before visibility filtering, causing data leakage on cache hits and requiring redundant DB lookups. Sequential await calls on cache misses increased p99 latency.
**Action:** Use "Zero-DB Cache Hit" pattern (filter before caching) and parallelize all independent I/O with Promise.all.

## 2026-07-08 - [Prisma Schema Mapping Collision]
**Learning:** Duplicate @map("max_attempts") on both 'attempts' and 'maxAttempts' in AiJob model blocks Prisma client generation.
**Action:** Remove explicit @map from the simple counter field ('attempts') to resolve collision.
