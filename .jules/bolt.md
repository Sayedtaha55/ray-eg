## 2025-05-15 - Elimination of Zero-DB Cache Hit Anti-Pattern
**Learning:** I discovered that the `ShopPublicQueryService.getShopBySlug` method was suffering from a "Zero-DB Cache Hit" anti-pattern. Even when data was found in Redis, the service was performing two additional database queries to fetch hotspot metadata for product filtering. This significantly reduced the benefits of caching.
**Action:** When implementing caching, ensure that the cached object is "ready-to-use". Move expensive filtering or join logic to the cache-miss path (pre-filtering) and implement eager invalidation on the mutation side (e.g., in `ShopImageMapService`) to maintain consistency.

## 2025-05-20 - Reliability of Hardware APIs for Performance Profiling
**Learning:** I learned that relying solely on `navigator.deviceMemory` or `navigator.hardwareConcurrency` for performance profiling can lead to false positives on browsers like Safari and Firefox where these APIs are either non-standard or restricted. This can cause high-end devices to be incorrectly flagged as low-end.
**Action:** Always combine hardware API checks with a mobile User Agent check to limit the scope of hardware-based degradations, and use sensible fallbacks (defaulting to "high-end") when APIs are missing to ensure a "fail-open" high-quality experience.
