# Bolt's Performance Journal

## 2025-05-15 - [React List Optimization]
**Learning:** Using `React.memo` on child components in a list is only effective if the props passed to them (especially event handlers) have stable references. Otherwise, it can even slightly decrease performance due to the overhead of shallow comparison that always returns false.
**Action:** Always pair `React.memo` for list items with `useCallback` for event handlers in the parent component and `useMemo` for derived data like filtered lists or sets of IDs.

## 2025-05-15 - [Animation Performance]
**Learning:** Staggered animations in Framer Motion using index-based delays can lead to poor UX and performance issues for long lists (e.g., waiting 5s for the 50th item).
**Action:** Always cap the maximum animation delay for list items (e.g., `Math.min(index * 0.1, 0.5)`) to maintain a snappy feel while preserving the staggered effect for the initial viewport.

## 2025-05-16 - [Backend Cache Strategy: Pre-filtering]
**Learning:** Caching raw database results and filtering them on every request is a hidden bottleneck, especially when the filtering logic itself requires additional database queries (e.g., checking image-map hotspots for product visibility). This can turn an O(0) DB query cache hit into an O(N) DB query operation.
**Action:** Always cache the *final* pre-filtered result intended for the user. Implement robust cross-service cache invalidation (e.g., invalidating shop/product caches when image maps are updated) to ensure data consistency.
