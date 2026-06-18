## 2026-06-18 - [Centralized Device Capability Profiling]
**Learning:** Hardware-specific optimizations (like `hardwareConcurrency` and `deviceMemory`) are often repeated across components, leading to maintenance overhead and potential inconsistencies. Centralizing these checks into a utility with module-level caching improves both code quality and runtime performance.
**Action:** Always check if a centralized `isLowEndDevice` utility exists before implementing local hardware checks.

## 2026-06-18 - [React.memo and Callback Stability]
**Learning:** `React.memo` is only effective if the props passed to the component have stable references. In `HomeFeed.tsx`, anonymous functions passed to `StorefrontShowcaseSection` and `OffersSection` were causing unnecessary re-renders despite `React.memo`.
**Action:** Use `useCallback` for all event handlers passed to memoized child components to ensure reference stability.
