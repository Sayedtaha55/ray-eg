# Bolt's Performance Journal

## 2025-05-15 - [React List Optimization]
**Learning:** Using `React.memo` on child components in a list is only effective if the props passed to them (especially event handlers) have stable references. Otherwise, it can even slightly decrease performance due to the overhead of shallow comparison that always returns false.
**Action:** Always pair `React.memo` for list items with `useCallback` for event handlers in the parent component and `useMemo` for derived data like filtered lists or sets of IDs.

## 2025-05-15 - [Animation Performance]
**Learning:** Staggered animations in Framer Motion using index-based delays can lead to poor UX and performance issues for long lists (e.g., waiting 5s for the 50th item).
**Action:** Always cap the maximum animation delay for list items (e.g., `Math.min(index * 0.1, 0.5)`) to maintain a snappy feel while preserving the staggered effect for the initial viewport.

## 2026-04-16 - [Zero-DB Cache Hit Path]
**Learning:** High-traffic read paths (like shop profiles) can still be bottlenecked by "cheap" database queries (e.g., hotspot filtering) even when the main object is cached. Moving this filtering logic upstream to the write path (or before caching) allows for a true zero-database-query response.
**Action:** When caching complex objects, ensure all mandatory filtering and normalization are performed *before* storage. Implement rigorous cache invalidation in all services that modify the dependent data.
