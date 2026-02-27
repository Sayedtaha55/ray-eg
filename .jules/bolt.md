# Bolt's Performance Journal

## 2025-05-15 - [React List Optimization]
**Learning:** Using `React.memo` on child components in a list is only effective if the props passed to them (especially event handlers) have stable references. Otherwise, it can even slightly decrease performance due to the overhead of shallow comparison that always returns false.
**Action:** Always pair `React.memo` for list items with `useCallback` for event handlers in the parent component and `useMemo` for derived data like filtered lists or sets of IDs.

## 2025-05-15 - [Animation Performance]
**Learning:** Staggered animations in Framer Motion using index-based delays can lead to poor UX and performance issues for long lists (e.g., waiting 5s for the 50th item).
**Action:** Always cap the maximum animation delay for list items (e.g., `Math.min(index * 0.1, 0.5)`) to maintain a snappy feel while preserving the staggered effect for the initial viewport.

## 2025-05-15 - [Redundant JSON.parse/localStorage Optimization]
**Learning:** Frequent calls to `RayDB.getFavorites` (which performs synchronous `localStorage.getItem` and `JSON.parse`) during component rendering or list processing can block the main thread, especially on low-end devices with many items.
**Action:** Implement a simple module-level variable to cache the result of the first `localStorage` read for frequently accessed, small data structures like favorite IDs.

## 2025-05-15 - [Image Variant Optimization]
**Learning:** Rendering full-sized images in list views (like `ProductCard`) consumes excessive bandwidth and GPU memory, leading to scroll jank.
**Action:** Always use the `getOptimizedImageUrl` utility with the appropriate variant (e.g., 'md' for cards, 'thumb' for carts) to leverage server-side or CDN-level image resizing.
