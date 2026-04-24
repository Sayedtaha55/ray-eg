## 2025-05-15 - [Home Feed Optimization]
**Learning:** Consolidating image rendering into a shared `SmartImage` component ensures consistent lazy loading and use of optimized variants, significantly reducing initial payload and layout shift. Stabilization of callbacks in `HomeFeed` prevents unnecessary re-renders of large sections like `StorefrontShowcaseSection` and `OffersSection` when state changes (e.g., category selection).
**Action:** Always prefer `SmartImage` for all list-based image rendering. Ensure parent callbacks passed to `React.memo` children are stabilized with `useCallback`.
