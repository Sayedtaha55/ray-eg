# Bolt's Performance Journal

## 2025-05-15 - [React List Optimization]
**Learning:** Using `React.memo` on child components in a list is only effective if the props passed to them (especially event handlers) have stable references. Otherwise, it can even slightly decrease performance due to the overhead of shallow comparison that always returns false.
**Action:** Always pair `React.memo` for list items with `useCallback` for event handlers in the parent component and `useMemo` for derived data like filtered lists or sets of IDs.

## 2025-05-15 - [Animation Performance]
**Learning:** Staggered animations in Framer Motion using index-based delays can lead to poor UX and performance issues for long lists (e.g., waiting 5s for the 50th item).
**Action:** Always cap the maximum animation delay for list items (e.g., `Math.min(index * 0.1, 0.5)`) to maintain a snappy feel while preserving the staggered effect for the initial viewport.

## 2025-05-22 - [Data Layer Caching]
**Learning:** In multi-vendor marketplaces with many small components (like `ProductCard`), repeated synchronous I/O and parsing (e.g., `localStorage.getItem` + `JSON.parse`) in the render loop or `useState` initializers can lead to significant frame drops and input lag as the list grows.
**Action:** Use a `Set`-based in-memory cache for frequently accessed flat data (like favorite IDs) to provide O(1) lookups and eliminate redundant parsing. Synchronize across tabs using the `storage` event.

## 2025-05-22 - [Hoisting Static Logic]
**Learning:** Logic that depends only on the environment or device (e.g., `isLowEndDevice` via UA regex) should be hoisted to a module-level constant rather than computed in a `useMemo` within a component. This prevents redundant work and memory pressure when hundreds of instances are rendered.
**Action:** Identify environment-specific checks and move them out of the component scope to ensure they are calculated once per session.
