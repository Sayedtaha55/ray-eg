## 2026-06-01 - Zero-DB Cache Hit Pattern in Multi-tenant Filtering
**Learning:** In systems with complex visibility rules (e.g., hiding products linked to image maps), caching the raw database results leads to redundant metadata queries on every cache hit. By applying all visibility filters BEFORE caching the final result, we achieve a "Zero-DB Cache Hit" where a single Redis GET provides a fully-processed, correct response.
**Action:** Always process and filter multi-tenant or visibility-restricted data upstream of the cache layer to ensure cache hits remain zero-dependency.

## 2026-06-01 - Avoiding Expensive Global Scans in Shared Feeds
**Learning:** Removing a `shopId` requirement from a metadata lookup method to support global feeds can inadvertently trigger full-table scans and cause incorrect cross-shop filtering (e.g., Shop A's hotspot label hiding a product in Shop B).
**Action:** Maintain strict shop-scoped lookups for metadata that influences product visibility, and avoid adding global fallbacks to these methods unless the underlying data structure and performance implications are thoroughly validated for cross-tenant safety.
