## 2026-06-01 - Zero-DB Cache Hit Pattern
**Learning:** Caching raw database results and applying filters (like visibility or relational exclusion) post-cache leads to redundant database queries on every "hit". In this codebase, ProductService was querying hotspot relations even when the main product list was in Redis.
**Action:** Apply all relational and visibility filters BEFORE caching the final result set. Ensure surgical cache invalidation (using patterns) when the underlying exclusion data (e.g., hotspots) changes.
