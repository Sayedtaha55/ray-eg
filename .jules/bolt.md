# Bolt's Performance Journal

## 2025-05-15 - [React List Optimization]
**Learning:** Using `React.memo` on child components in a list is only effective if the props passed to them (especially event handlers) have stable references. Otherwise, it can even slightly decrease performance due to the overhead of shallow comparison that always returns false.
**Action:** Always pair `React.memo` for list items with `useCallback` for event handlers in the parent component and `useMemo` for derived data like filtered lists or sets of IDs.

## 2025-05-15 - [Animation Performance]
**Learning:** Staggered animations in Framer Motion using index-based delays can lead to poor UX and performance issues for long lists (e.g., waiting 5s for the 50th item).
**Action:** Always cap the maximum animation delay for list items (e.g., `Math.min(index * 0.1, 0.5)`) to maintain a snappy feel while preserving the staggered effect for the initial viewport.

## 2026-03-04 - [O(1) Favorites Lookup Optimization]
**Learning:** Redundant `localStorage` access and `JSON.parse` calls within the React render loop (especially in lists like ProductCard) can cause significant UI stuttering (jank) on low-end devices due to synchronous I/O.
**Action:** Always use an in-memory cache (like a `Set`) for frequently accessed `localStorage` data and provide an O(1) lookup method (`isFavorite(id)`) to bypass expensive serialization/deserialization.
