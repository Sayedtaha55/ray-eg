# Bolt's Performance Journal

## 2025-05-15 - [React List Optimization]
**Learning:** Using `React.memo` on child components in a list is only effective if the props passed to them (especially event handlers) have stable references. Otherwise, it can even slightly decrease performance due to the overhead of shallow comparison that always returns false.
**Action:** Always pair `React.memo` for list items with `useCallback` for event handlers in the parent component and `useMemo` for derived data like filtered lists or sets of IDs.

## 2025-05-15 - [Animation Performance]
**Learning:** Staggered animations in Framer Motion using index-based delays can lead to poor UX and performance issues for long lists (e.g., waiting 5s for the 50th item).
**Action:** Always cap the maximum animation delay for list items (e.g., `Math.min(index * 0.1, 0.5)`) to maintain a snappy feel while preserving the staggered effect for the initial viewport.

## 2025-05-22 - [Synchronous Storage & I/O Optimization]
**Learning:** Synchronous calls to `localStorage.getItem` and `JSON.parse` within component state initializers or render loops (like in `ProductCard`) can cause significant frame drops in large lists. In multi-tab applications, using the `storage` event is essential for keeping an in-memory cache synchronized without sacrificing performance.
**Action:** Always wrap synchronous browser storage access in a module-level cache and provide O(1) lookup methods (like using `Set`) when the data is frequently used for filtering or conditional rendering in lists.
