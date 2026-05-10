## 2025-05-15 - Elimination of Zero-DB Cache Hit Anti-Pattern
**Learning:** I discovered that the `ShopPublicQueryService.getShopBySlug` method was suffering from a "Zero-DB Cache Hit" anti-pattern. Even when data was found in Redis, the service was performing two additional database queries to fetch hotspot metadata for product filtering. This significantly reduced the benefits of caching.
**Action:** When implementing caching, ensure that the cached object is "ready-to-use". Move expensive filtering or join logic to the cache-miss path (pre-filtering) and implement eager invalidation on the mutation side (e.g., in `ShopImageMapService`) to maintain consistency.

## 2026-05-10 - Centralization of Device Capability Profiling
**Learning:** I noticed that multiple components in the `ShopProfile` directory were redundantly calculating device capabilities (Mobile, CPU cores, RAM) to decide whether to disable animations or reduce batch sizes. In `ProductCard`, which can be rendered many times, this `useMemo` and regex execution was adding unnecessary overhead.
**Action:** Centralize static device hardware checks into a module-level constant (e.g., `IS_LOW_END_DEVICE`). This ensures the profiling logic runs exactly once per session/module load, rather than per component instance, reducing CPU churn on mount for large lists.
