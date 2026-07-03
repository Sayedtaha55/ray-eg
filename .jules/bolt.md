## 2026-07-03 - [Prisma Schema Bottleneck & Zero-DB Cache Hit Pattern]
**Learning:** Prisma schema validation errors (P1012) in AiJob (duplicate maxAttempts) and Shop (missing @unique on ownerId) block Prisma client generation, which in turn halts all system-wide checks and performance verification. Furthermore, caching unfiltered data while performing visibility checks on every request is a major performance anti-pattern that creates redundant DB queries on cache hits.

**Action:** Always fix core infrastructure blockers (like Prisma schema) first to enable reliable testing. Implement the 'Zero-DB Cache Hit' pattern by applying all visibility and security filters BEFORE caching the result, ensuring that a cache hit requires zero subsequent database lookups.
