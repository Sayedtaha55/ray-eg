## 2025-05-15 - [React.memo Reference Stability]
**Learning:** `React.memo` is ineffective when props include inline arrow functions or non-memoized callbacks from the parent. Even if the child component is memoized, a new function reference on every parent render forces a re-render of the child.
**Action:** Always wrap callbacks passed to `React.memo` components in `useCallback`.

## 2025-05-15 - [Optimized Image Strategy]
**Learning:** Standard `<img>` tags on high-traffic pages like the home feed contribute to high initial payloads and poor LCP. The `SmartImage` component already exists in the codebase but was underutilized in key sections.
**Action:** Audit high-traffic sections and migrate standard `<img>` tags to `SmartImage` with appropriate `optimizeVariant` settings.
